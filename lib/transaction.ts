import { Prisma } from "@prisma/client";
import { db } from "./db";
import { ApiError } from "./http";
export async function serializable<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await db.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 10000,
        timeout: 15000,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        ["P2034", "P2002"].includes(e.code) &&
        attempt < 3
      )
        continue;
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2034"
      )
        throw new ApiError(
          409,
          "Có người vừa cập nhật dữ liệu. Vui lòng thử lại.",
        );
      throw e;
    }
  }
  throw new Error("Transaction failed");
}
