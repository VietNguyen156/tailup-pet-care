import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { verifyPassword, hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { api, ApiError, jsonBody } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
export const POST = api(async (request) => {
  const input = loginSchema.parse(await jsonBody(request));
  await rateLimit(`login:${input.email}`);
  const user = await db.user.findUnique({ where: { email: input.email } });
  const hash =
    user?.passwordHash ??
    (await hashPassword("non-existing-account-placeholder"));
  const valid = await verifyPassword(input.password, hash);
  if (!user || !valid)
    throw new ApiError(401, "Email hoặc mật khẩu chưa chính xác.");
  await createSession(user.id);
  return NextResponse.json({ user: { name: user.name, role: user.role } });
});
