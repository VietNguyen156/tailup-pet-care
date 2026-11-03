import { catalogStoreId } from "./catalog-scope";
import { db } from "./db";
import { sampleServices, sampleProducts, samplePosts } from "./sample-data";
export const previewMode = process.env.PREVIEW_MODE === "true";
const sampleStore = { id: "store-tailup", name: "TailUp", slug: "tailup" };
export async function getServices(storeId?: string) {
  storeId = await catalogStoreId(storeId);
  if (storeId === "") return [];
  if (previewMode)
    return storeId && storeId !== sampleStore.id
      ? []
      : sampleServices.map((s) => ({
          ...s,
          imageUrl: undefined as string | undefined,
          storeId: sampleStore.id,
          store: sampleStore,
        }));
  const rows = await db.service.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      store: { isActive: true },
      ...(storeId ? { storeId } : {}),
    },
    include: {
      image: { select: { serviceId: true } },
      store: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { price: "asc" },
  });
  return rows.map((s) => ({
    ...s,
    price: Number(s.price),
    imageUrl: s.image ? `/api/services/${s.id}/image` : undefined,
  }));
}
export async function getProducts(storeId?: string) {
  storeId = await catalogStoreId(storeId);
  if (storeId === "") return [];
  if (previewMode)
    return storeId && storeId !== sampleStore.id
      ? []
      : sampleProducts.map((p) => ({
          ...p,
          storeId: sampleStore.id,
          store: sampleStore,
          imageUrl: undefined as string | undefined,
        }));
  const rows = await db.product.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      store: { isActive: true },
      ...(storeId ? { storeId } : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      store: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((p) => ({
    ...p,
    price: Number(p.price),
    imageUrl: p.images[0]?.url,
  }));
}
export async function getPosts() {
  if (previewMode)
    return samplePosts.map((p) => ({
      ...p,
      createdAt: new Date("2026-01-01"),
      author: { name: "Đội ngũ TailUp" },
    }));
  return db.post.findMany({
    where: { published: true },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}
