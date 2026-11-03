import { Home } from "@/components/home";
import { getServices, getProducts } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page() {
  const [services, products] = await Promise.all([
    getServices(),
    getProducts(undefined, 4),
  ]);
  return <Home services={services} products={products} />;
}
