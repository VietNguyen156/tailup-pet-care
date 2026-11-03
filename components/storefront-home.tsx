import { getStoreGallery } from "@/lib/gallery";
import { StoreGallery } from "./store-gallery";
import Link from "next/link";
import { ArrowRight, Heart, CalendarDays, PawPrint } from "lucide-react";
import { getStorefront } from "@/lib/storefront";
import { getProducts, getServices } from "@/lib/catalog";
import { StoreBanner } from "./store-banner";
import { StoreAbout, StoreArticles, StoreContact } from "./store-sections";
import { ServiceCard } from "./service-card";
import { ProductCard } from "./product-card";
export async function StorefrontHome({ slug }: { slug: string }) {
  const { store, website } = await getStorefront(slug);
  const base = `/stores/${slug}`;
  const [services, products, gallery] = await Promise.all([
    getServices(store.id, 4),
    getProducts(store.id, 4),
    getStoreGallery(store.id, slug),
  ]);
  return (
    <>
      <StoreGallery images={gallery} storeName={store.name} />
      <StoreBanner
        banners={website.banners
          .filter((b) => b.enabled && b.image)
          .sort((a, b) => a.sortOrder - b.sortOrder)}
        storeName={store.name}
        bookingUrl={`/booking?store=${slug}`}
      />
      <div className="store-benefits">
        <div className="container">
          <span>
            <Heart />
            Chăm sóc bằng sự tận tâm
          </span>
          <span>
            <PawPrint />
            Dịch vụ phù hợp với từng bé
          </span>
          <span>
            <CalendarDays />
            Dễ dàng chọn giờ, đặt lịch
          </span>
        </div>
      </div>
      <section className="container store-intro section">
        <span className="eyebrow">CHÀO MỪNG ĐẾN VỚI {store.name}</span>
        <h2>{website.headline}</h2>
        <p>{website.introduction}</p>
      </section>
      <section className="store-service-section">
        <div className="container section">
          <div className="store-section-heading">
            <div>
              <span className="eyebrow">DỊCH VỤ CỦA CHÚNG MÌNH</span>
              <h2>{website.servicesTitle}</h2>
            </div>
            <Link className="text-link" href={`${base}/services`}>
              Tất cả dịch vụ <ArrowRight size={16} />
            </Link>
          </div>
          <p className="store-section-intro">{website.servicesIntro}</p>
          <div className="services-grid">
            {services.slice(0, 4).map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
          {!services.length && (
            <p>Cửa hàng đang chuẩn bị dịch vụ. Hãy liên hệ để được tư vấn.</p>
          )}
        </div>
      </section>
      <StoreAbout store={store} website={website} preview />
      {products.length > 0 && (
        <section className="container section">
          <div className="store-section-heading">
            <div>
              <span className="eyebrow">NHỮNG MÓN ĐỒ CHO BÉ</span>
              <h2>{website.productsTitle}</h2>
            </div>
            <Link className="text-link" href={`${base}/services#products`}>
              Xem sản phẩm <ArrowRight size={16} />
            </Link>
          </div>
          <div className="products-grid">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
      <section className="store-booking-strip">
        <div className="container">
          <div>
            <span className="eyebrow">MỘT CUỘC HẸN NHỎ</span>
            <h2>{website.bookingTitle}</h2>
          </div>
          <Link className="button" href={`/booking?store=${slug}`}>
            Chọn dịch vụ & đặt lịch <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="container section">
        <div className="store-section-heading">
          <div>
            <span className="eyebrow">THÔNG TIN & CHIA SẺ</span>
            <h2>{website.informationTitle}</h2>
          </div>
          <Link className="text-link" href={`${base}/information`}>
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>
        <p>{website.informationIntro}</p>
        <StoreArticles website={website} slug={slug} preview />
      </section>
      <div className="store-contact-section">
        <StoreContact store={store} website={website} />
      </div>
    </>
  );
}
