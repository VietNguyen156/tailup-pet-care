import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePlatformAdmin } from "@/lib/stores";
import { db } from "@/lib/db";
import { api, ApiError, jsonBody } from "@/lib/http";
import { hashPassword } from "@/lib/password";
export const POST = api(async (request) => {
  await requirePlatformAdmin();
  const input = z
    .object({
      storeId: z.string(),
      name: z.string().trim().min(2).max(100),
      email: z
        .email()
        .max(191)
        .transform((s) => s.toLowerCase()),
      password: z.string().min(10).max(128),
    })
    .parse(await jsonBody(request));
  if (
    !(await db.store.findUnique({
      where: { id: input.storeId },
      select: { id: true },
    }))
  )
    throw new ApiError(404, "Không tìm thấy cửa hàng.");
  const admin = await db.user.create({
    data: {
      storeId: input.storeId,
      name: input.name,
      email: input.email,
      role: "STORE_ADMIN",
      passwordHash: await hashPassword(input.password),
    },
    select: { id: true, name: true, email: true, storeId: true },
  });
  return NextResponse.json({ admin }, { status: 201 });
});
