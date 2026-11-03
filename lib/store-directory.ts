import "server-only";
import { catalogStoreId } from "./catalog-scope";
import { previewMode } from "./catalog";
import { db } from "./db";

export type StoreDirectoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  servicesHref: string;
};

export async function getStoreDirectory(): Promise<StoreDirectoryItem[]> {
  if (previewMode)
    return [
      {
        id: "store-tailup",
        name: "TailUp",
        slug: "tailup",
        description: "Chọn dịch vụ chăm sóc phù hợp cho người bạn nhỏ.",
        address: "",
        phone: "",
        servicesHref: "/booking?store=tailup",
      },
    ];

  const storeId = await catalogStoreId();
  if (storeId === "") return [];

  const stores = await db.store.findMany({
    where: { isActive: true, ...(storeId ? { id: storeId } : {}) },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      phone: true,
    },
    orderBy: { name: "asc" },
  });

  return stores.map((store) => ({
    ...store,
    servicesHref: `/stores/${store.slug}/services`,
  }));
}
