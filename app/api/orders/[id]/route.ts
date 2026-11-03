import { NextResponse } from "next/server";
import { z } from "zod";
import { canManageStore } from "@/lib/permissions";
import { requireUser } from "@/lib/auth";
import { checkOrigin, errorResponse, ApiError, jsonBody } from "@/lib/http";
import { serializable } from "@/lib/transaction";
const transitions: Record<string, string[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    const user = await requireUser();
    const { id } = await params;
    const { status } = z
      .object({
        status: z.enum(["PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"]),
      })
      .parse(await jsonBody(request));
    const order = await serializable(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!existing) throw new ApiError(404, "Không tìm thấy đơn hàng.");
      const staff = canManageStore(user, existing.storeId);
      if (staff && user.role !== "SUPER_ADMIN") {
        const store = await tx.store.findUnique({
          where: { id: existing.storeId },
          select: { isActive: true },
        });
        if (!store?.isActive)
          throw new ApiError(403, "Cửa hàng đang tạm ngưng.");
      }
      if (
        !staff &&
        (existing.userId !== user.id ||
          status !== "CANCELLED" ||
          existing.status !== "PENDING")
      )
        throw new ApiError(
          403,
          "Bạn chỉ có thể hủy đơn của mình khi chờ xử lý.",
        );
      if (!transitions[existing.status].includes(status))
        throw new ApiError(409, "Không thể chuyển sang trạng thái này.");
      if (status === "CANCELLED")
        for (const item of [...existing.items].sort((a, b) =>
          a.productId.localeCompare(b.productId),
        ))
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
      return tx.order.update({
        where: { id },
        data: {
          status,
          paymentStatus:
            status === "COMPLETED" ? "PAID" : existing.paymentStatus,
        },
      });
    });
    return NextResponse.json({ order });
  } catch (e) {
    return errorResponse(e);
  }
}
