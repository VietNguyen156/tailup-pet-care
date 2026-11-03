import Link from "next/link";
import { ArrowRight, PawPrint, Phone, MapPin, Mail, Clock } from "lucide-react";
import type { StoreWebsite } from "@/lib/store-website";
type Store = { name: string; slug: string; address: string; phone: string };
export function StoreAbout({
  website,
  store,
  preview = false,
}: {
  website: StoreWebsite;
  store: Store;
  preview?: boolean;
}) {
  return (
    <section className="container store-about section">
      <div className="store-about-image">
        {website.aboutImage ? (
          <img
            src={website.aboutImage}
            alt={`Không gian và những người bạn tại ${store.name}`}
            loading="lazy"
          />
        ) : (
          <PawPrint size={96} />
        )}
        <span>Chăm chút từ những điều nhỏ nhất.</span>
      </div>
      <div>
        <span className="eyebrow">VỀ CHÚNG MÌNH</span>
        <h2>{website.aboutTitle}</h2>
        <p className="store-prose">
          {preview && website.aboutText.length > 500
            ? website.aboutText.slice(0, 500) + "…"
            : website.aboutText}
        </p>
        <Link
          href={
            preview
              ? `/stores/${store.slug}/about`
              : `/booking?store=${store.slug}`
          }
          className="text-link"
        >
          {preview ? "Tìm hiểu về cửa hàng" : "Hẹn một buổi chăm sóc"}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
export function StoreArticles({
  website,
  slug,
  preview = false,
}: {
  website: StoreWebsite;
  slug: string;
  preview?: boolean;
}) {
  const articles = preview ? website.articles.slice(0, 3) : website.articles;
  return (
    <div
      className={
        preview
          ? "store-article-grid"
          : "store-article-grid store-article-reading"
      }
    >
      {articles.map((article, i) =>
        preview ? (
          <article key={i} className="store-article">
            {article.image ? (
              <img src={article.image} alt={article.title} loading="lazy" />
            ) : (
              <div className="store-article-placeholder">
                <PawPrint size={40} />
              </div>
            )}
            <div>
              <span className="eyebrow">GÓC CỬA HÀNG</span>
              <h3>{article.title}</h3>
              <p>
                {article.body.slice(0, 160)}
                {article.body.length > 160 ? "…" : ""}
              </p>
              <Link
                className="text-link"
                href={`/stores/${slug}/information#article-${i}`}
              >
                Đọc tiếp <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        ) : (
          <article id={`article-${i}`} key={i} className="store-article">
            {article.image && (
              <img src={article.image} alt={article.title} loading="lazy" />
            )}
            <div>
              <h2>{article.title}</h2>
              <p className="store-prose">{article.body}</p>
            </div>
          </article>
        ),
      )}
      {!articles.length && (
        <div className="store-content-empty">
          <PawPrint />
          <h3>Những câu chuyện mới đang được chuẩn bị.</h3>
          <p>Theo dõi cửa hàng để đón đọc thông báo và chia sẻ mới nhất.</p>
        </div>
      )}
    </div>
  );
}
export function StoreContact({
  store,
  website,
}: {
  store: Store;
  website: StoreWebsite;
}) {
  return (
    <section className="container section store-contact-grid">
      <div>
        <span className="eyebrow">MÌNH HẸN NHAU NHÉ?</span>
        <h2>Ghé thăm {store.name}</h2>
        <p>{website.contactIntro}</p>
        <div className="tenant-actions">
          <Link className="button" href={`/booking?store=${store.slug}`}>
            Đặt lịch chăm sóc <ArrowRight size={17} />
          </Link>
          {store.phone && (
            <a className="button outline" href={`tel:${store.phone}`}>
              Gọi cửa hàng
            </a>
          )}
        </div>
      </div>
      <div className="store-contact-card">
        {store.address && (
          <div>
            <MapPin />
            <section>
              <h3>Địa chỉ</h3>
              <p>{store.address}</p>
              <a
                className="text-link"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem đường đi ↗
              </a>
            </section>
          </div>
        )}
        {store.phone && (
          <div>
            <Phone />
            <section>
              <h3>Điện thoại</h3>
              <a href={`tel:${store.phone}`}>{store.phone}</a>
            </section>
          </div>
        )}
        {website.email && (
          <div>
            <Mail />
            <section>
              <h3>Email</h3>
              <a href={`mailto:${website.email}`}>{website.email}</a>
            </section>
          </div>
        )}
        <div>
          <Clock />
          <section>
            <h3>Giờ mở cửa</h3>
            <p className="store-prose">
              {website.hours ||
                "Vui lòng liên hệ cửa hàng để xác nhận giờ mở cửa."}
            </p>
          </section>
        </div>
        {website.facebook && (
          <a
            className="text-link"
            href={website.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            Kết nối với chúng mình ↗
          </a>
        )}
      </div>
    </section>
  );
}
