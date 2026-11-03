import { Prisma } from "@prisma/client";
import { ApiError } from "./http";
import { serializable } from "./transaction";
import { assertFutureSlot, TIME_SLOTS, type BookingInput } from "./validation";
export const ACTIVE_STATUSES = ["PENDING", "CONFIRMED"] as const;
export async function createBooking(userId: string, input: BookingInput) {
  if (!assertFutureSlot(input.bookingDate, input.timeSlot))
    throw new ApiError(
      400,
      "Vui lòng chọn giờ trong tương lai, tối đa 90 ngày tới.",
    );
  return serializable(async (tx) => {
    const service = await tx.service.findFirst({
      where: {
        id: input.serviceId,
        isActive: true,
        deletedAt: null,
        store: { isActive: true },
      },
    });
    if (!service) throw new ApiError(404, "Dịch vụ không còn hoạt động.");
    // Lock customer to serialize pet creation / overlap checks for their appointments.
    await tx.$queryRaw(
      Prisma.sql`SELECT id FROM User WHERE id = ${userId} FOR UPDATE`,
    );
    if (input.staffId) {
      const staff = await tx.user.findFirst({
        where: {
          id: input.staffId,
          role: "STORE_ADMIN",
          storeId: service.storeId,
        },
      });
      if (!staff) throw new ApiError(400, "Nhân viên không hợp lệ.");
      await tx.$queryRaw(
        Prisma.sql`SELECT id FROM User WHERE id = ${input.staffId} FOR UPDATE`,
      );
    }
    const bookingDate = new Date(`${input.bookingDate}T00:00:00Z`);
    const slot = await tx.appointmentSlot.upsert({
      where: {
        storeId_bookingDate_timeSlot: {
          storeId: service.storeId,
          bookingDate,
          timeSlot: input.timeSlot,
        },
      },
      create: {
        storeId: service.storeId,
        bookingDate,
        timeSlot: input.timeSlot,
      },
      update: {},
    });
    await tx.$queryRaw(
      Prisma.sql`SELECT id FROM AppointmentSlot WHERE id = ${slot.id} FOR UPDATE`,
    );
    const count = await tx.booking.count({
      where: { slotId: slot.id, status: { in: [...ACTIVE_STATUSES] } },
    });
    if (count >= slot.capacity)
      throw new ApiError(409, "Khung giờ này đã đầy, vui lòng chọn giờ khác.");
    const [h, m] = input.timeSlot.split(":").map(Number);
    const startMinutes = h * 60 + m,
      endMinutes = startMinutes + service.durationMinutes;
    if (endMinutes > 18 * 60)
      throw new ApiError(
        400,
        "Dịch vụ kết thúc sau giờ đóng cửa. Vui lòng chọn giờ sớm hơn.",
      );
    const overlap = {
      bookingDate,
      status: { in: [...ACTIVE_STATUSES] },
      startMinutes: { lt: endMinutes },
      endMinutes: { gt: startMinutes },
    };
    if (
      input.staffId &&
      (await tx.booking.findFirst({
        where: { ...overlap, staffId: input.staffId },
      }))
    )
      throw new ApiError(
        409,
        "Nhân viên đã có lịch trong khoảng thời gian này.",
      );
    let petId = input.petId;
    if (petId) {
      if (!(await tx.pet.findFirst({ where: { id: petId, userId } })))
        throw new ApiError(403, "Thú cưng không thuộc tài khoản của bạn.");
      if (await tx.booking.findFirst({ where: { ...overlap, petId } }))
        throw new ApiError(
          409,
          "Bé đã có lịch hẹn trong khoảng thời gian này.",
        );
    } else {
      const pet = await tx.pet.create({
        data: { userId, name: input.newPetName!, type: input.newPetType! },
      });
      petId = pet.id;
    }
    return tx.booking.create({
      data: {
        userId,
        petId,
        storeId: service.storeId,
        serviceId: service.id,
        staffId: input.staffId || null,
        slotId: slot.id,
        bookingDate,
        timeSlot: input.timeSlot,
        startMinutes,
        endMinutes,
        note: input.note,
        price: service.price,
      },
      include: { pet: true, service: true, staff: { select: { name: true } } },
    });
  });
}
export async function availability(
  tx: Prisma.TransactionClient,
  date: string,
  serviceId: string,
  staffId?: string,
) {
  const bookingDate = new Date(`${date}T00:00:00Z`);
  const service = await tx.service.findFirst({
    where: {
      id: serviceId,
      isActive: true,
      deletedAt: null,
      store: { isActive: true },
    },
  });
  if (!service) throw new ApiError(404, "Dịch vụ không tồn tại.");
  if (
    staffId &&
    !(await tx.user.findFirst({
      where: { id: staffId, role: "STORE_ADMIN", storeId: service.storeId },
    }))
  )
    throw new ApiError(400, "Nhân viên không thuộc cửa hàng này.");
  const slots = await tx.appointmentSlot.findMany({
    where: { bookingDate, storeId: service.storeId },
    include: {
      _count: {
        select: {
          bookings: { where: { status: { in: [...ACTIVE_STATUSES] } } },
        },
      },
    },
  });
  const staffBookings = staffId
    ? await tx.booking.findMany({
        where: { bookingDate, staffId, status: { in: [...ACTIVE_STATUSES] } },
        select: { startMinutes: true, endMinutes: true },
      })
    : [];
  return TIME_SLOTS.map((time) => {
    const [h, m] = time.split(":").map(Number);
    const start = h * 60 + m,
      end = start + service.durationMinutes;
    const slot = slots.find((s) => s.timeSlot === time);
    const remaining = (slot?.capacity ?? 3) - (slot?._count.bookings ?? 0);
    return {
      time,
      remaining,
      available:
        assertFutureSlot(date, time) &&
        end <= 1080 &&
        remaining > 0 &&
        !staffBookings.some(
          (b) => b.startMinutes < end && b.endMinutes > start,
        ),
    };
  });
}
