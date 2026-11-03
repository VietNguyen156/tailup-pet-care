import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { api } from "@/lib/http";
import { petSchema } from "@/lib/validation";
import { petData } from "@/lib/pet-data";
import { petInput } from "@/lib/pet-input";
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
  const body = await petInput(request);
  const input = petSchema.parse(body.input);
  const pet = await db.pet.create({
    data: {
      userId: user.id,
      ...petData(input),
      ...(body.image ? { image: { create: body.image } } : {}),
    },
  });
  return NextResponse.json({ pet }, { status: 201 });
});
