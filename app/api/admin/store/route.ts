import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStoreManager } from "@/lib/stores";
import { storeDetailsSchema } from "@/lib/store-validation";
import { api, jsonBody } from "@/lib/http";
import { db } from "@/lib/db";
export const PATCH = api(async (request) => {
  const { storeId, ...data } = storeDetailsSchema
    .extend({ storeId: z.string() })
    .parse(await jsonBody(request));
  const { store } = await requireStoreManager(storeId);
  return NextResponse.json({
    store: await db.store.update({ where: { id: store.id }, data }),
  });
});
