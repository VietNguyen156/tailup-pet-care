import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { api, jsonBody } from "@/lib/http";
import { bookingSchema } from "@/lib/validation";
import { createBooking } from "@/lib/booking";
import { db } from "@/lib/db";
export const POST = api(async (request) => {
  const user = await requireUser();
  const input = bookingSchema.parse(await jsonBody(request));
  const booking = await createBooking(user.id, input);
  return NextResponse.json({ booking }, { status: 201 });
});
export const GET = api(async () => {
  const user = await requireUser();
  return NextResponse.json({
    bookings: await db.booking.findMany({
      where: { userId: user.id },
      include: { service: true, pet: true, staff: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  });
}, false);
