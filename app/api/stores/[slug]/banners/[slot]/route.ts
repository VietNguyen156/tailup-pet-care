import { db } from "@/lib/db";
import { catalogStoreId } from "@/lib/catalog-scope";
import { errorResponse } from "@/lib/http";
import { readWebsite } from "@/lib/store-website";
import { currentUser } from "@/lib/auth";
import { canManageStore } from "@/lib/permissions";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; slot: string }> },
) {
  try {
    const { slug, slot } = await params;
    if (!/^[0-4]$/.test(slot)) return new Response(null, { status: 404 });
    const store = await db.store.findUnique({
      where: { slug },
      select: {
        id: true,
        isActive: true,
        name: true,
        description: true,
        website: true,
      },
    });
    if (!store?.isActive || (await catalogStoreId(store.id)) === "")
      return new Response(null, { status: 404 });
    const entry = readWebsite(store.website, store).banners.find(
      (b) => b.slot === Number(slot),
    );
    const user = await currentUser();
    if (
      !entry ||
      (!entry.enabled && (!user || !canManageStore(user, store.id)))
    )
      return new Response(null, { status: 404 });
    const banner = await db.storeBanner.findUnique({
      where: { storeId_slot: { storeId: store.id, slot: Number(slot) } },
    });
    if (!banner) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(banner.data), {
      headers: {
        "Content-Type": banner.contentType,
        "Content-Length": String(banner.data.length),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
