import { NextResponse } from "next/server";
import { z } from "zod";
import { api, ApiError, jsonBody } from "@/lib/http";
import { requireStoreManager } from "@/lib/stores";
import { readBannerForm, readBannerImage } from "@/lib/banner-upload";
import { db } from "@/lib/db";
import { getStoreGallery } from "@/lib/gallery";

async function manager(request: Request) {
  const storeId = z
    .string()
    .min(1)
    .parse(new URL(request.url).searchParams.get("storeId"));
  return requireStoreManager(storeId);
}
export const GET = api(async (request) => {
  const { store } = await manager(request);
  return NextResponse.json(
    { images: await getStoreGallery(store.id, store.slug) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}, false);
export const POST = api(async (request) => {
  const { store } = await manager(request);
  const form = await readBannerForm(request);
  const alt =
    z
      .string()
      .trim()
      .max(160)
      .parse(form.get("alt") ?? "") ||
    `Hình ảnh tại ${store.name}`.slice(0, 160);
  const image = await readBannerImage(form.get("image"));
  if (!image) throw new ApiError(400, "Vui lòng chọn ảnh cửa hàng.");
  const photo = await db.storeGalleryImage.create({
    data: { storeId: store.id, alt, ...image },
    select: { id: true, alt: true },
  });
  return NextResponse.json(
    {
      image: { ...photo, url: `/api/stores/${store.slug}/gallery/${photo.id}` },
    },
    { status: 201 },
  );
});
export const DELETE = api(async (request) => {
  const { store } = await manager(request);
  const { id } = z
    .object({ id: z.string().min(1).max(191) })
    .parse(await jsonBody(request));
  const result = await db.storeGalleryImage.deleteMany({
    where: { id, storeId: store.id },
  });
  if (!result.count)
    throw new ApiError(404, "Không tìm thấy ảnh trong cửa hàng của bạn.");
  return NextResponse.json({ ok: true });
});
