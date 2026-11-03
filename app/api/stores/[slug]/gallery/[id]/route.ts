import { db } from "@/lib/db";
import { catalogStoreId } from "@/lib/catalog-scope";
import { errorResponse } from "@/lib/http";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  try {
    const { slug, id } = await params;
    const store = await db.store.findUnique({
      where: { slug },
      select: { id: true, isActive: true },
    });
    if (!store?.isActive || (await catalogStoreId(store.id)) === "")
      return new Response(null, { status: 404 });
    const image = await db.storeGalleryImage.findFirst({
      where: { id, storeId: store.id },
      select: { data: true, contentType: true },
    });
    if (!image) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(image.data), {
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": String(image.data.length),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
