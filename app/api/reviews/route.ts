import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { api, ApiError, jsonBody } from "@/lib/http";
export const POST = api(async (request) => {
  const user = await requireUser();
  const input = z
    .object({
      serviceId: z.string().optional(),
      productId: z.string().optional(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().trim().min(5).max(2000),
    })
    .refine(
      (d) => Boolean(d.serviceId) !== Boolean(d.productId),
      "Chỉ chọn một dịch vụ hoặc sản phẩm.",
    )
    .parse(await jsonBody(request));
  if (
    input.serviceId &&
    !(await db.booking.findFirst({
      where: {
        userId: user.id,
        serviceId: input.serviceId,
        status: "COMPLETED",
      },
    }))
  )
    throw new ApiError(403, "Bạn cần hoàn thành dịch vụ trước khi đánh giá.");
  if (
    input.productId &&
    !(await db.orderItem.findFirst({
      where: {
        productId: input.productId,
        order: { userId: user.id, status: "COMPLETED" },
      },
    }))
  )
    throw new ApiError(403, "Bạn cần hoàn thành đơn hàng trước khi đánh giá.");
  const review = await db.review.create({
    data: { userId: user.id, ...input },
  });
  return NextResponse.json({ review }, { status: 201 });
});
