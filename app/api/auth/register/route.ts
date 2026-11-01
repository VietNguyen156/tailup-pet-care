import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { api, jsonBody } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
export const POST = api(async (request) => {
  const input = registerSchema.parse(await jsonBody(request));
  await rateLimit(`register:${input.email}`, 5);
  const user = await db.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash: await hashPassword(input.password),
    },
    select: { id: true, name: true, role: true },
  });
  await createSession(user.id);
  return NextResponse.json({ user }, { status: 201 });
});
