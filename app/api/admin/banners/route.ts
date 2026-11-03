import { NextResponse } from "next/server";
import { z } from "zod";
import { api, ApiError, jsonBody } from "@/lib/http";
import { requireStoreManager } from "@/lib/stores";
import { readWebsite } from "@/lib/store-website";
import { changeStoreWebsite } from "@/lib/store-website-write";
import { bannerFields, MAX_BANNERS } from "@/lib/banner-validation";
import { readBannerForm, readBannerImage } from "@/lib/banner-upload";

const slotSchema = z
  .number()
  .int()
  .min(0)
  .max(MAX_BANNERS - 1);
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
    { banners: readWebsite(store.website, store).banners },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}, false);

async function edit(request: Request, create: boolean) {
  const { store, user } = await manager(request);
  const form = await readBannerForm(request);
  const fields = bannerFields.parse({
    title: form.get("title"),
    description: form.get("description"),
    buttonText: form.get("buttonText"),
    buttonUrl: form.get("buttonUrl"),
    sortOrder: Number(form.get("sortOrder")),
    enabled: z.enum(["true", "false"]).parse(form.get("enabled")) === "true",
  });
  const slot = create
    ? undefined
    : slotSchema.parse(
        Number(
          z
            .string()
            .regex(/^[0-4]$/)
            .parse(form.get("slot")),
        ),
      );
  const image = await readBannerImage(form.get("image"));
  if (create && !image)
    throw new ApiError(400, "Vui lòng tải ảnh cho banner mới.");
  const website = await changeStoreWebsite(
    store.id,
    user.role,
    async (website, store, tx) => {
      const rows = [...website.banners];
      const existing = rows.find((b) => b.slot === slot);
      if (!create && !existing)
        throw new ApiError(
          404,
          "Banner không còn tồn tại. Hãy tải lại danh sách.",
        );
      if (create && rows.length >= MAX_BANNERS)
        throw new ApiError(
          400,
          "Mỗi cửa hàng có tối đa 5 banner. Hãy xóa một banner trước khi thêm mới.",
        );
      const target =
        existing?.slot ??
        Array.from({ length: MAX_BANNERS }, (_, i) => i).find(
          (i) => !rows.some((b) => b.slot === i),
        )!;
      let url = existing?.image ?? "";
      if (image) {
        const uploaded = await tx.storeBanner.upsert({
          where: { storeId_slot: { storeId: store.id, slot: target } },
          create: { storeId: store.id, slot: target, ...image },
          update: image,
        });
        url = `/api/stores/${store.slug}/banners/${target}?v=${uploaded.updatedAt.getTime()}`;
      }
      const others = rows.filter((b) => b.slot !== target);
      others.splice(Math.min(fields.sortOrder, others.length), 0, {
        ...fields,
        slot: target,
        image: url,
      });
      return {
        ...website,
        banners: others.map((b, i) => ({ ...b, sortOrder: i })),
      };
    },
  );
  return NextResponse.json(
    { banners: website.banners },
    { status: create ? 201 : 200 },
  );
}
export const POST = api((request) => edit(request, true));
export const PATCH = api(async (request) => {
  if (request.headers.get("content-type")?.startsWith("multipart/form-data;"))
    return edit(request, false);
  const { store, user } = await manager(request);
  const input = z
    .discriminatedUnion("action", [
      z.object({
        action: z.literal("reorder"),
        slots: z.array(slotSchema).max(MAX_BANNERS),
      }),
      z.object({
        action: z.literal("toggle"),
        slot: slotSchema,
        enabled: z.boolean(),
      }),
    ])
    .parse(await jsonBody(request));
  const website = await changeStoreWebsite(
    store.id,
    user.role,
    async (website) => {
      if (input.action === "reorder") {
        if (
          input.slots.length !== website.banners.length ||
          new Set(input.slots).size !== input.slots.length ||
          input.slots.some(
            (slot) => !website.banners.some((b) => b.slot === slot),
          )
        )
          throw new ApiError(
            409,
            "Danh sách đã thay đổi. Hãy tải lại trước khi sắp xếp.",
          );
        return {
          ...website,
          banners: input.slots.map((slot, index) => ({
            ...website.banners.find((b) => b.slot === slot)!,
            sortOrder: index,
          })),
        };
      }
      if (!website.banners.some((b) => b.slot === input.slot))
        throw new ApiError(404, "Không tìm thấy banner.");
      return {
        ...website,
        banners: website.banners.map((b) =>
          b.slot === input.slot ? { ...b, enabled: input.enabled } : b,
        ),
      };
    },
  );
  return NextResponse.json({ banners: website.banners });
});
export const DELETE = api(async (request) => {
  const { store, user } = await manager(request);
  const { slot } = z
    .object({ slot: slotSchema })
    .parse(await jsonBody(request));
  const website = await changeStoreWebsite(
    store.id,
    user.role,
    async (website, store, tx) => {
      if (!website.banners.some((b) => b.slot === slot))
        throw new ApiError(404, "Không tìm thấy banner.");
      await tx.storeBanner.deleteMany({ where: { storeId: store.id, slot } });
      const prefix = `/api/stores/${store.slug}/banners/${slot}`;
      const usesDeleted = (url: string) => url.split("?")[0] === prefix;
      return {
        ...website,
        banners: website.banners
          .filter((b) => b.slot !== slot)
          .map((b, i) => ({ ...b, sortOrder: i })),
        aboutImage: usesDeleted(website.aboutImage) ? "" : website.aboutImage,
        articles: website.articles.map((a) => ({
          ...a,
          image: usesDeleted(a.image) ? "" : a.image,
        })),
      };
    },
  );
  return NextResponse.json({ banners: website.banners });
});
