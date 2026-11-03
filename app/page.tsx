import { Home } from "@/components/home";
import { getProducts } from "@/lib/catalog";
import { getStoreDirectory } from "@/lib/store-directory";
export const dynamic = "force-dynamic";
export default async function Page() {
  const [stores, products] = await Promise.all([
    getStoreDirectory(),
    getProducts(undefined, 4),
  ]);
  return <Home stores={stores} products={products} />;
}
