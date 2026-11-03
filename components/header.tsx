"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, PawPrint } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { accountHome } from "@/lib/permissions";
import { request } from "@/lib/client";
type User = { name: string; role: string } | null;
export function Header({ user }: { user: User }) {
  const path = usePathname(),
    router = useRouter();
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const { count } = useCart();
  const links = [
    ["/stores", "Cửa hàng"],
    ["/services", "Dịch vụ"],
    ["/#how-it-works", "Cách đặt lịch"],
    ["/#faq", "Câu hỏi thường gặp"],
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
  if (/^\/stores\/[^/]+/.test(path)) return null;
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="logo" aria-label="TailUp, trang chủ">
            <PawPrint size={29} />
            TailUp.
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
          </nav>
          <div className="header-actions">
            {user && <LogoutButton />}
            <Link
              href="/cart"
              className="icon-button cart-link"
              aria-label={`Giỏ hàng, ${count} sản phẩm`}
            >
              <ShoppingBag size={21} />
              {count > 0 && <span>{count}</span>}
            </Link>
            {user ? (
              <Link className="account-link" href={accountHome(user.role)}>
                Chào, {user.name.split(" ").pop()}
              </Link>
            ) : (
              <Link className="account-link" href="/login">
                Đăng nhập
              </Link>
            )}
            <Link
              href={user ? "/booking" : "/register"}
              className="button outline desktop-book"
            >
              {user ? "Đặt lịch" : "Đăng ký"}
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
          <nav className="mobile-nav container" aria-label="Điều hướng di động">
            {links.map(([href, label]) => (
              <Link key={href} onClick={() => setOpen(false)} href={href}>
                {label}
              </Link>
            ))}
            <Link href="/booking" onClick={() => setOpen(false)}>
              Đặt lịch chăm sóc
            </Link>
            <Link
              href={user ? accountHome(user.role) : "/login"}
              onClick={() => setOpen(false)}
            >
              {user ? "Tài khoản của tôi" : "Đăng nhập"}
            </Link>
            {!user && (
              <Link href="/register" onClick={() => setOpen(false)}>
                Đăng ký
              </Link>
            )}
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
