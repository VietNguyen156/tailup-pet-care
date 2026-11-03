import { db } from "./db";
import { hashPassword } from "./password";
import { createStoreSchema } from "./store-validation";
import { sampleProducts, sampleServices } from "./sample-data";
import { z } from "zod";
export async function provisionStore(input: z.infer<typeof createStoreSchema>) {
  const passwordHash = await hashPassword(input.adminPassword);
  return db.$transaction(
    async (tx) => {
      const store = await tx.store.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          phone: input.phone,
          address: input.address,
          admins: {
            create: {
              name: input.adminName,
              email: input.adminEmail,
              passwordHash,
              role: "STORE_ADMIN",
            },
          },
        },
      });
      {
        for (const { id, slug, ...service } of sampleServices)
          await tx.service.create({
            data: {
              ...service,
              storeId: store.id,
              slug: `${store.slug}-${slug}`,
            },
          });
        if (input.withSampleCatalog)
          for (const { id, slug, ...product } of sampleProducts)
            await tx.product.create({
              data: {
                ...product,
                storeId: store.id,
                slug: `${store.slug}-${slug}`,
                images: {
                  create: { url: `/products/${id}.svg`, alt: product.name },
                },
              },
            });
      }
      return store;
    },
    { timeout: 20000 },
  );
}
