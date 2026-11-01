import "server-only";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "./db";
import { ApiError } from "./http";
const COOKIE = "pawly_session";
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const currentUser = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: digest(token) },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, role: true },
      },
    },
  });
  return session && session.expiresAt > new Date() ? session.user : null;
});
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await db.session.create({
    data: { userId, tokenHash: digest(token), expiresAt },
  });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}
export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token)
    await db.session.deleteMany({ where: { tokenHash: digest(token) } });
  jar.delete(COOKIE);
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new ApiError(401, "Vui lòng đăng nhập để tiếp tục.");
  return user;
}
export async function requireStaff() {
  const user = await requireUser();
  if (user.role !== "STAFF" && user.role !== "ADMIN")
    throw new ApiError(403, "Bạn không có quyền truy cập.");
  return user;
}
export async function requirePageUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
