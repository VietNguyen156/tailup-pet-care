import Link from "next/link";
import { PawPrint, Phone, Mail, MapPin, Clock } from "lucide-react";
import { getStorefront } from "@/lib/storefront";
import { currentUser } from "@/lib/auth";
import { StoreNavigation } from "@/components/store-navigation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { store, website } = await getStorefront((await params).slug);
  const user = await currentUser();
  const base = `/stores/${store.slug}`;
  return (
    <div className="store-website">
      <StoreNavigation
        store={{
          id: store.id,
          name: store.name,
          slug: store.slug,
          phone: store.phone,
        }}
        user={user ? { name: user.name, role: user.role } : null}
      />
      {user && (user.role === "SUPER_ADMIN" || user.role === "STORE_ADMIN") && (
        <div className="store-owner-bar container">
          <span>Bạn đang xem website của cửa hàng.</span>
          <Link
            href={`/admin${user.role === "SUPER_ADMIN" ? `?store=${store.id}` : ""}#website-editor`}
          >
            Chỉnh sửa nội dung →
          </Link>
        </div>
      )}
      {children}
      <footer className="store-footer">
        <div className="container store-footer-grid">
          <div>
            <Link href={base} className="store-brand">
              <PawPrint />
              <span>
                {store.name}
                <small>THÀNH VIÊN TAILUP</small>
              </span>
            </Link>
            <p>{website.introduction}</p>
          </div>
          <div>
            <h3>Khám phá</h3>
            <Link href={`${base}/about`}>Giới thiệu</Link>
            <Link href={`${base}/services`}>Dịch vụ chăm sóc</Link>
            <Link href={`${base}/information`}>Thông tin & chia sẻ</Link>
            <Link href={`${base}/contact`}>Liên hệ cửa hàng</Link>
          </div>
          <div>
            <h3>Liên hệ với chúng mình</h3>
            {store.address && (
              <p>
                <MapPin size={16} />
                {store.address}
              </p>
            )}
            {store.phone && (
              <a href={`tel:${store.phone}`}>
                <Phone size={16} />
                {store.phone}
              </a>
            )}
            {website.email && (
              <a href={`mailto:${website.email}`}>
                <Mail size={16} />
                {website.email}
              </a>
            )}
            {website.facebook && (
              <a
                href={website.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                Kết nối với cửa hàng ↗
              </a>
            )}
          </div>
          <div>
            <h3>Giờ mở cửa</h3>
            <p className="store-prose">
              <Clock size={17} />
              {website.hours || "Liên hệ cửa hàng để biết giờ mở cửa."}
            </p>
            <Link className="button" href={`/booking?store=${store.slug}`}>
              Đặt lịch cho bé
            </Link>
          </div>
        </div>
        <div className="container store-footer-bottom">
          <span>
            © {new Date().getFullYear()} {store.name} · Đồng hành cùng TailUp
          </span>
          <Link href="/stores">Khám phá các cửa hàng TailUp</Link>
        </div>
      </footer>
    </div>
  );
}
