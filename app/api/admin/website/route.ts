import { NextResponse } from "next/server";
import { z } from "zod";
import { api, jsonBody } from "@/lib/http";
import { requireStoreManager } from "@/lib/stores";
import { websiteSchema } from "@/lib/store-website";
import { changeStoreWebsite } from "@/lib/store-website-write";

export const PATCH = api(async (request) => {
  const input = z
    .object({
      storeId: z.string().min(1),
      website: websiteSchema.omit({ banners: true }),
    })
    .parse(await jsonBody(request, 384 * 1024));
  const { store, user } = await requireStoreManager(input.storeId);
  await changeStoreWebsite(store.id, user.role, async (current) => ({
    ...input.website,
    banners: current.banners,
  }));
  return NextResponse.json({ ok: true });
});
