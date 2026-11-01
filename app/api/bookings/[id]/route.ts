import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { checkOrigin, errorResponse, ApiError, jsonBody } from "@/lib/http";
import { z } from "zod";
import { serializable } from "@/lib/transaction";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    const user = await requireUser();
    const { id } = await params;
    const input = z
      .object({ status: z.enum(["CANCELLED", "CONFIRMED", "COMPLETED"]) })
      .parse(await jsonBody(request));
    const booking = await serializable(async (tx) => {
      const existing = await tx.booking.findUnique({ where: { id } });
      if (!existing) throw new ApiError(404, "Không tìm thấy lịch hẹn.");
      const staff = user.role === "ADMIN" || user.role === "STAFF";
      if (!staff && existing.userId !== user.id)
        throw new ApiError(403, "Bạn không có quyền sửa lịch hẹn.");
      if (!staff && input.status !== "CANCELLED")
        throw new ApiError(403, "Bạn chỉ có thể hủy lịch hẹn.");
      if (["CANCELLED", "COMPLETED"].includes(existing.status))
        throw new ApiError(409, "Lịch hẹn đã kết thúc hoặc đã hủy.");
      if (
        !staff &&
        new Date(
          `${existing.bookingDate.toISOString().slice(0, 10)}T${existing.timeSlot}:00+07:00`,
        ) <= new Date()
      )
        throw new ApiError(400, "Lịch đã bắt đầu, vui lòng liên hệ cửa hàng.");
      if (input.status === "COMPLETED" && existing.status !== "CONFIRMED")
        throw new ApiError(400, "Cần xác nhận lịch trước khi hoàn thành.");
      if (
        input.status === "COMPLETED" &&
        new Date(
          `${existing.bookingDate.toISOString().slice(0, 10)}T${existing.timeSlot}:00+07:00`,
        ) > new Date()
      )
        throw new ApiError(400, "Chưa đến giờ hẹn để hoàn thành.");
      return tx.booking.update({
        where: { id },
        data: { status: input.status },
      });
    });
    return NextResponse.json({ booking });
  } catch (e) {
    return errorResponse(e);
  }
}
