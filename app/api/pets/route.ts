import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { api, jsonBody } from "@/lib/http";
import { petSchema } from "@/lib/validation";
import { petData } from "@/lib/pet-data";
export const GET = api(async () => {
  const user = await requireUser();
  return NextResponse.json({
    pets: await db.pet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  });
}, false);
export const POST = api(async (request) => {
  const user = await requireUser();
  const input = petSchema.parse(await jsonBody(request));
  const pet = await db.pet.create({
    data: { userId: user.id, ...petData(input) },
  });
  return NextResponse.json({ pet }, { status: 201 });
});
