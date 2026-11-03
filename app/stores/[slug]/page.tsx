import { StorefrontHome } from "@/components/storefront-home";
import { getStorefront } from "@/lib/storefront";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { store } = await getStorefront((await params).slug);
  return { title: store.name, description: store.description };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <StorefrontHome slug={(await params).slug} />;
}
