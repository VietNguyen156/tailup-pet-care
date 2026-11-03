"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, PawPrint, Phone, ShoppingBag } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { accountHome } from "@/lib/permissions";
export const storeLinks = [
  ["", "Trang chủ"],
  ["/about", "Giới thiệu"],
  ["/services", "Dịch vụ"],
  ["/information", "Thông tin"],
  ["/contact", "Liên hệ"],
];
export function StoreNavigation({
  store,
  user,
}: {
  store: { name: string; slug: string; phone: string; id: string };
  user: { name: string; role: string } | null;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const base = `/stores/${store.slug}`;
  return (
    <header className="store-site-header">
      <div className="store-topbar">
        <div className="container">
          <span>Một chút chăm sóc, thật nhiều yêu thương.</span>
          <div>
            {store.phone && (
              <a href={`tel:${store.phone}`}>
                <Phone size={13} />
                {store.phone}
              </a>
            )}
            {user ? (
              <>
                <Link
                  href={
                    user.role === "SUPER_ADMIN"
                      ? `/admin?store=${store.id}`
                      : accountHome(user.role)
                  }
                >
                  {user.role === "CUSTOMER"
                    ? "Tài khoản của tôi"
                    : "Quản trị cửa hàng"}
                </Link>
                <LogoutButton returnTo={base} />
              </>
            ) : (
              <>
                <Link href="/login">Đăng nhập</Link>
                <Link href="/register">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="container store-mainnav">
        <Link href={base} className="store-brand">
          <PawPrint size={32} />
          <span>
            {store.name}
            <small>THÀNH VIÊN TAILUP</small>
          </span>
        </Link>
        <nav
          aria-label="Điều hướng cửa hàng"
          className={open ? "store-menu open" : "store-menu"}
        >
          {storeLinks.map(([suffix, label]) => (
            <Link
              key={suffix}
              href={base + suffix}
              aria-current={path === base + suffix ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="store-nav-actions">
          <Link href="/cart" className="icon-button" aria-label="Giỏ hàng">
            <ShoppingBag size={21} />
          </Link>
          <Link href={`/booking?store=${store.slug}`} className="button">
            Đặt lịch
          </Link>
          <button
            className="icon-button store-menu-toggle"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
