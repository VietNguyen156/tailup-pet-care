import { db } from "./db";
import { sampleServices, sampleProducts, samplePosts } from "./sample-data";
export const previewMode = process.env.PREVIEW_MODE === "true";
export async function getServices() {
  if (previewMode) return sampleServices;
  const rows = await db.service.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });
  return rows.map((s) => ({ ...s, price: Number(s.price) }));
}
export async function getProducts() {
  if (previewMode) return sampleProducts;
  const rows = await db.product.findMany({
    where: { isActive: true },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((p) => ({ ...p, price: Number(p.price) }));
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
