import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePlatformAdmin } from "@/lib/stores";
import { createStoreSchema } from "@/lib/store-validation";
import { provisionStore } from "@/lib/store-provisioning";
import { api, jsonBody } from "@/lib/http";
import { db } from "@/lib/db";
export const POST = api(async (request) => {
  await requirePlatformAdmin();
  const input = createStoreSchema.parse(await jsonBody(request));
  return NextResponse.json(
    { store: await provisionStore(input) },
    { status: 201 },
  );
});
export const PATCH = api(async (request) => {
  await requirePlatformAdmin();
  const { id, isActive } = z
    .object({ id: z.string(), isActive: z.boolean() })
    .parse(await jsonBody(request));
  return NextResponse.json({
    store: await db.store.update({ where: { id }, data: { isActive } }),
  });
});
