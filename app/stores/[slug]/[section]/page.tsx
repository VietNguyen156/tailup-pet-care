import Link from "next/link";
import { notFound } from "next/navigation";
import { getStorefront } from "@/lib/storefront";
import { getProducts, getServices } from "@/lib/catalog";
import {
  StoreAbout,
  StoreArticles,
  StoreContact,
} from "@/components/store-sections";
import { ProductCard } from "@/components/product-card";
import { ServiceCard } from "@/components/service-card";
const titles: Record<string, string> = {
  about: "Giới thiệu",
  services: "Dịch vụ",
  information: "Thông tin",
  contact: "Liên hệ",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}) {
  const { slug, section } = await params;
  const { store } = await getStorefront(slug);
  return { title: `${titles[section] || "Cửa hàng"} · ${store.name}` };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}) {
  const { slug, section } = await params;
  if (!Object.hasOwn(titles, section)) notFound();
  const { store, website } = await getStorefront(slug);
  const [services, products] =
    section === "services"
      ? await Promise.all([getServices(store.id), getProducts(store.id)])
      : [[], []];
  return (
    <>
      <div className="store-page-heading">
        <div className="container">
          <Link href={`/stores/${slug}`}>{store.name}</Link>
          <span> / {titles[section]}</span>
          <h1>{titles[section]}</h1>
        </div>
      </div>
      {section === "about" && <StoreAbout store={store} website={website} />}
      {section === "contact" && (
        <StoreContact store={store} website={website} />
      )}
      {section === "information" && (
        <section className="container section">
          <p className="store-section-intro">{website.informationIntro}</p>
          <StoreArticles website={website} slug={slug} />
        </section>
      )}
      {section === "services" && (
        <section className="container section">
          <h2>Dịch vụ tại {store.name}</h2>
          <p className="store-section-intro">{website.servicesIntro}</p>
          <div className="services-grid">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
          {!services.length && <p>Cửa hàng chưa mở dịch vụ đặt lịch.</p>}
          <div id="products" className="section">
            <h2>Sản phẩm dành cho bé</h2>
            <div className="products-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {!products.length && (
              <p>Cửa hàng đang chuẩn bị danh mục sản phẩm.</p>
            )}
          </div>
        </section>
      )}
    </>
  );
}
