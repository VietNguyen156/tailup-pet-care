import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { requireResourceManager, requireStoreManager } from "@/lib/stores";
import { db } from "@/lib/db";
import { api, ApiError, jsonBody } from "@/lib/http";
import { productCreateSchema } from "@/lib/store-validation";
export const PATCH = api(async (request) => {
  const { id, ...input } = productCreateSchema
    .omit({ storeId: true })
    .partial()
    .extend({ id: z.string().min(1), isActive: z.boolean().optional() })
    .parse(await jsonBody(request));
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Không tìm thấy sản phẩm.");
  await requireResourceManager(existing.storeId);
  if (existing.deletedAt) throw new ApiError(404, "Sản phẩm đã bị xóa khỏi danh mục.");
  const { imageUrl, ...data } = input;
  const result = await db.product.update({
    where: { id, storeId: existing.storeId, deletedAt: null },
    data: {
      ...data,
      ...(imageUrl !== undefined
        ? {
            images: {
              deleteMany: {},
              create: { url: imageUrl, alt: input.name ?? existing.name },
            },
          }
        : {}),
    },
  });
  return NextResponse.json({ product: result });
});
export const DELETE = api(async (request) => {
  const { id } = z
    .object({ id: z.string().min(1) })
    .parse(await jsonBody(request));
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Không tìm thấy sản phẩm.");
  await requireResourceManager(existing.storeId);
  await db.product.update({
    where: { id, storeId: existing.storeId },
    data: { deletedAt: new Date(), isActive: false },
  });
  return NextResponse.json({ ok: true });
});
export const POST = api(async (request) => {
  const input = productCreateSchema.parse(await jsonBody(request));
  const { store } = await requireStoreManager(input.storeId);
  const { imageUrl, ...data } = input;
  const product = await db.product.create({
    data: {
      ...data,
      storeId: store.id,
      slug: `${store.slug}-${randomUUID()}`,
      images: { create: { url: imageUrl, alt: input.name } },
    },
  });
  return NextResponse.json({ product }, { status: 201 });
});
