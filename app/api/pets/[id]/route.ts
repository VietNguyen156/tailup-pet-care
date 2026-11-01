import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { checkOrigin, errorResponse, ApiError, jsonBody } from "@/lib/http";
import { petSchema } from "@/lib/validation";
import { petData } from "@/lib/pet-data";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  try {
    checkOrigin(request);
    const user = await requireUser();
    const { id } = await context.params;
    const input = petSchema.parse(await jsonBody(request));
    const result = await db.pet.updateMany({
      where: { id, userId: user.id },
      data: petData(input),
    });
    if (!result.count) throw new ApiError(404, "Không tìm thấy thú cưng.");
    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    checkOrigin(request);
    const user = await requireUser();
    const { id } = await context.params;
    const pet = await db.pet.findFirst({
      where: { id, userId: user.id },
      include: { _count: { select: { bookings: true } } },
    });
    if (!pet) throw new ApiError(404, "Không tìm thấy thú cưng.");
    if (pet._count.bookings)
      throw new ApiError(
        409,
        "Bé đã có lịch sử đặt lịch, không thể xóa để bảo toàn hồ sơ.",
      );
    await db.pet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse(e);
  }
}
