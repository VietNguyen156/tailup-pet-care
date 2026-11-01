import { db } from "./db";
import { ApiError } from "./http";
import { createHash } from "node:crypto";
export async function rateLimit(rawKey: string, limit = 10) {
  const interval = 15 * 60 * 1000;
  const window = new Date(Math.floor(Date.now() / interval) * interval);
  const key = createHash("sha256")
    .update(`${rawKey}:${window.toISOString()}`)
    .digest("hex");
  const bucket = await db.rateLimit.upsert({
    where: { key },
    create: { key, window, count: 1 },
    update: { count: { increment: 1 } },
  });
  if (bucket.count > limit)
    throw new ApiError(
      429,
      "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 15 phút.",
    );
}
