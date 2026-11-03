import "server-only";
import { db } from "./db";
import type { GalleryPhoto } from "./gallery-types";
export async function getStoreGallery(
  storeId: string,
  slug: string,
): Promise<GalleryPhoto[]> {
  const photos = await db.storeGalleryImage.findMany({
    where: { storeId },
    select: { id: true, alt: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  return photos.map((photo) => ({
    ...photo,
    url: `/api/stores/${slug}/gallery/${photo.id}`,
  }));
}
