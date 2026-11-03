import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { errorResponse } from "@/lib/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const pet = await db.pet.findFirst({
      where: { id, userId: user.id },
      include: { image: true },
    });
    if (!pet?.image) return new Response(null, { status: 404 });

    return new Response(new Uint8Array(pet.image.data), {
      headers: {
        "Content-Type": pet.image.contentType,
        "Content-Length": String(pet.image.data.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
