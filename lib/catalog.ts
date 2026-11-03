import { catalogStoreId } from "./catalog-scope";
import { db } from "./db";
import { sampleServices, sampleProducts, samplePosts } from "./sample-data";
export const previewMode = process.env.PREVIEW_MODE === "true";
const sampleStore = { id: "store-tailup", name: "TailUp", slug: "tailup" };
export async function getServices(storeId?: string, take?: number) {
  storeId = await catalogStoreId(storeId);
  if (storeId === "") return [];
  if (previewMode)
    return storeId && storeId !== sampleStore.id
      ? []
      : sampleServices.slice(0, take).map((s) => ({
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
    ...(take !== undefined ? { take } : {}),
  });
  return rows.map((s) => ({
    ...s,
    price: Number(s.price),
    imageUrl: s.image ? `/api/services/${s.id}/image` : undefined,
  }));
}
export async function getServiceBySlug(slug: string) {
  const storeId = await catalogStoreId();
  if (storeId === "") return null;
  if (previewMode) {
    if (storeId && storeId !== sampleStore.id) return null;
    const service = sampleServices.find((item) => item.slug === slug);
    return service
      ? {
          ...service,
          imageUrl: undefined as string | undefined,
          storeId: sampleStore.id,
          store: sampleStore,
        }
      : null;
  }
  const service = await db.service.findFirst({
    where: {
      slug,
      isActive: true,
      deletedAt: null,
      store: { isActive: true },
      ...(storeId ? { storeId } : {}),
    },
    include: {
      image: { select: { serviceId: true } },
      store: { select: { id: true, name: true, slug: true } },
    },
  });
  return service
    ? {
        ...service,
        price: Number(service.price),
        imageUrl: service.image ? `/api/services/${service.id}/image` : undefined,
      }
    : null;
}
export async function getServiceById(id: string) {
  const storeId = await catalogStoreId();
  if (storeId === "") return null;
  if (previewMode) {
    if (storeId && storeId !== sampleStore.id) return null;
    const service = sampleServices.find((item) => item.id === id);
    return service
      ? {
          ...service,
          imageUrl: undefined as string | undefined,
          storeId: sampleStore.id,
          store: sampleStore,
        }
      : null;
  }
  const service = await db.service.findFirst({
    where: {
      id,
      isActive: true,
      deletedAt: null,
      store: { isActive: true },
      ...(storeId ? { storeId } : {}),
    },
    include: {
      image: { select: { serviceId: true } },
      store: { select: { id: true, name: true, slug: true } },
    },
  });
  return service
    ? {
        ...service,
        price: Number(service.price),
        imageUrl: service.image ? `/api/services/${service.id}/image` : undefined,
      }
    : null;
}
export async function getProducts(storeId?: string, take?: number) {
  storeId = await catalogStoreId(storeId);
  if (storeId === "") return [];
  if (previewMode)
    return storeId && storeId !== sampleStore.id
      ? []
      : sampleProducts.slice(0, take).map((p) => ({
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
    ...(take !== undefined ? { take } : {}),
  });
  return rows.map((p) => ({
    ...p,
    price: Number(p.price),
    imageUrl: p.images[0]?.url,
  }));
}
export async function getProductBySlug(slug: string) {
  const storeId = await catalogStoreId();
  if (storeId === "") return null;
  if (previewMode) {
    if (storeId && storeId !== sampleStore.id) return null;
    const product = sampleProducts.find((item) => item.slug === slug);
    return product
      ? {
          ...product,
          storeId: sampleStore.id,
          store: sampleStore,
          imageUrl: undefined as string | undefined,
        }
      : null;
  }
  const product = await db.product.findFirst({
    where: {
      slug,
      isActive: true,
      deletedAt: null,
      store: { isActive: true },
      ...(storeId ? { storeId } : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      store: { select: { id: true, name: true, slug: true } },
    },
  });
  return product
    ? {
        ...product,
        price: Number(product.price),
        imageUrl: product.images[0]?.url,
      }
    : null;
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
