import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "./db";
import { catalogStoreId } from "./catalog-scope";
import { readWebsite } from "./store-website";
export const getStorefront = cache(async (slug: string) => {
  const store = await db.store.findUnique({ where: { slug } });
  if (!store?.isActive || (await catalogStoreId(store.id)) === "") notFound();
  return { store, website: readWebsite(store.website, store) };
});
