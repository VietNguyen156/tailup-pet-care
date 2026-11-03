import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { api, ApiError } from "@/lib/http";
import { bookingSchema } from "@/lib/validation";
import { createBooking } from "@/lib/booking";
import { db } from "@/lib/db";
import { petInput } from "@/lib/pet-input";
export const POST = api(async (request) => {
  const user = await requireUser();
  const body = await petInput(request);
  const input = bookingSchema.parse(body.input);
  if (body.image && input.petId)
    throw new ApiError(400, "Chỉ có thể thêm ảnh khi tạo thú cưng mới.");
  const booking = await createBooking(user.id, input, body.image);
  return NextResponse.json({ booking }, { status: 201 });
});
export const GET = api(async () => {
  const user = await requireUser();
  return NextResponse.json({
    bookings: await db.booking.findMany({
      where: { userId: user.id },
      include: { service: true, pet: true, staff: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  });
}, false);
