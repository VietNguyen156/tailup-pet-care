import "server-only";
import { Prisma, type Store } from "@prisma/client";
import { serializable } from "./transaction";
import { readWebsite, type StoreWebsite } from "./store-website";
import { ApiError } from "./http";

// All website writes share one store lock, so editing text cannot revert banners.
export async function changeStoreWebsite(
  storeId: string,
  role: string,
  change: (
    website: StoreWebsite,
    store: Store,
    tx: Prisma.TransactionClient,
  ) => Promise<StoreWebsite>,
) {
  return serializable(async (tx) => {
    await tx.$queryRaw(
      Prisma.sql`SELECT id FROM Store WHERE id = ${storeId} FOR UPDATE`,
    );
    const store = await tx.store.findUnique({ where: { id: storeId } });
    if (!store || (!store.isActive && role !== "SUPER_ADMIN"))
      throw new ApiError(403, "Cửa hàng không hoạt động.");
    const website = await change(readWebsite(store.website, store), store, tx);
    await tx.store.update({ where: { id: storeId }, data: { website } });
    return website;
  });
}
