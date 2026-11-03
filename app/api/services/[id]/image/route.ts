import { db } from "@/lib/db";
import { catalogStoreId } from "@/lib/catalog-scope";
import { errorResponse } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { canManageStore } from "@/lib/permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const service = await db.service.findFirst({
      where: { id, deletedAt: null, store: { isActive: true } },
      select: { storeId: true, isActive: true },
    });
    if (!service || (await catalogStoreId(service.storeId)) === "")
      return new Response(null, { status: 404 });
    if (!service.isActive) {
      const user = await currentUser();
      if (!user || !canManageStore(user, service.storeId))
        return new Response(null, { status: 404 });
    }
    const image = await db.serviceImage.findUnique({
      where: { serviceId: id },
    });
    if (!image) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(image.data), {
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": String(image.data.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
