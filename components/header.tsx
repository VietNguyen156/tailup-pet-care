"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, PawPrint, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { request } from "@/lib/client";
type User = { name: string; role: string } | null;
export function Header({ user }: { user: User }) {
  const path = usePathname(),
    router = useRouter();
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const { count } = useCart();
  const links = [
    ["/services", "Dịch vụ"],
    ["/shop", "Cửa hàng"],
    ["/journal", "Góc chăm sóc"],
  ];
  async function logout() {
    try {
      await request("/api/auth/logout", { method: "POST" });
      setOpen(false);
      router.push("/");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <div className="announcement">
        Một chút chăm chút. Một đời thương yêu.{" "}
        <span>Chào mừng bạn đến với TailUp ♡</span>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="logo" aria-label="TailUp, trang chủ">
            <PawPrint fill="currentColor" size={29} />
            TailUp<span>®</span>
          </Link>
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={path.startsWith(href) ? "active" : ""}
              >
                {label}
              </Link>
            ))}
            <Link href="/#about">Về TailUp</Link>
          </nav>
          <div className="header-actions">
            <Link
              href="/cart"
              className="icon-button cart-link"
              aria-label={`Giỏ hàng, ${count} sản phẩm`}
            >
              <ShoppingBag size={21} />
              {count > 0 && <span>{count}</span>}
            </Link>
            {user ? (
              <Link className="account-link" href="/dashboard/pets">
                Chào, {user.name.split(" ").pop()}
              </Link>
            ) : (
              <Link className="account-link" href="/login">
                Đăng nhập
              </Link>
            )}
            <Link href="/booking" className="button small desktop-book">
              Đặt lịch <ArrowUpRight size={16} />
            </Link>
            <button
              className="icon-button menu-toggle"
              onClick={() => setOpen(!open)}
              aria-label="Mở menu"
              aria-expanded={open}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="mobile-nav container">
            {links.map(([href, label]) => (
              <Link key={href} onClick={() => setOpen(false)} href={href}>
                {label}
              </Link>
            ))}
            <Link href="/booking" onClick={() => setOpen(false)}>
              Đặt lịch chăm sóc
            </Link>
            <Link
              href={user ? "/dashboard/pets" : "/login"}
              onClick={() => setOpen(false)}
            >
              {user ? "Tài khoản của tôi" : "Đăng nhập"}
            </Link>
            {user && <button onClick={logout}>Đăng xuất</button>}
          </nav>
        )}
      </header>
      {error && (
        <div className="error container" role="alert">
          {error}
        </div>
      )}
    </>
  );
}
