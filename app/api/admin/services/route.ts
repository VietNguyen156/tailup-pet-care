import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { requireResourceManager, requireStoreManager } from "@/lib/stores";
import { db } from "@/lib/db";
import { api, ApiError, jsonBody } from "@/lib/http";
import { serviceCreateSchema } from "@/lib/store-validation";
import { serviceInput } from "@/lib/service-input";
export const PATCH = api(async (request) => {
  const body = await serviceInput(request);
  const { id, ...input } = serviceCreateSchema
    .omit({ storeId: true })
    .partial()
    .extend({ id: z.string().min(1), isActive: z.boolean().optional() })
    .parse(body.input);
  const existing = await db.service.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Không tìm thấy dịch vụ.");
  await requireResourceManager(existing.storeId);
  if (existing.deletedAt)
    throw new ApiError(404, "Dịch vụ đã bị xóa khỏi danh mục.");
  const { process, ...data } = input;
  const result = await db.service.update({
    where: { id, storeId: existing.storeId, deletedAt: null },
    data: {
      ...data,
      ...(body.image
        ? { image: { upsert: { create: body.image, update: body.image } } }
        : {}),
      ...(process !== undefined
        ? {
            process: process
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          }
        : {}),
    },
  });
  return NextResponse.json({ service: result });
});
export const DELETE = api(async (request) => {
  const { id } = z
    .object({ id: z.string().min(1) })
    .parse(await jsonBody(request));
  const existing = await db.service.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Không tìm thấy dịch vụ.");
  await requireResourceManager(existing.storeId);
  await db.service.update({
    where: { id, storeId: existing.storeId },
    data: { deletedAt: new Date(), isActive: false },
  });
  return NextResponse.json({ ok: true });
});
export const POST = api(async (request) => {
  const body = await serviceInput(request);
  const input = serviceCreateSchema.parse(body.input);
  const { store } = await requireStoreManager(input.storeId);
  const service = await db.service.create({
    data: {
      ...input,
      ...(body.image ? { image: { create: body.image } } : {}),
      storeId: store.id,
      slug: `${store.slug}-${randomUUID()}`,
      process: input.process
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    },
  });
  return NextResponse.json({ service }, { status: 201 });
});
