"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PawPrint,
  CalendarDays,
  Package,
  UserRound,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { request } from "@/lib/client";
export function DashboardShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const path = usePathname(),
    router = useRouter();
  const [error, setError] = useState("");
  const links = [
    { href: "/dashboard", label: "Trang chủ", Icon: LayoutDashboard },
    { href: "/booking", label: "Đặt lịch", Icon: CalendarDays },
    { href: "/dashboard/pets", label: "Hồ sơ thú cưng", Icon: PawPrint },
    {
      href: "/dashboard/bookings",
      label: "Lịch hẹn của tôi",
      Icon: CalendarDays,
    },
    { href: "/dashboard/orders", label: "Đơn hàng của tôi", Icon: Package },
    { href: "/dashboard/profile", label: "Thông tin cá nhân", Icon: UserRound },
  ];
  return (
    <div className="container dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="user-avatar">{user.name.charAt(0)}</div>
        <strong>{user.name}</strong>
        <small>{user.email}</small>
        <nav aria-label="Tài khoản">
          {links.map(({ href, label, Icon }) => (
            <Link
              href={href}
              key={href}
              className={path === href ? "selected" : ""}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          {user.role !== "CUSTOMER" && (
            <Link href="/admin">
              <LayoutDashboard size={18} />
              Quản trị TailUp
            </Link>
          )}
          <button
            onClick={async () => {
              try {
                await request("/api/auth/logout", { method: "POST" });
                router.push("/");
                router.refresh();
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </nav>
        {error && <p className="error">{error}</p>}
      </aside>
      <section className="dashboard-content">{children}</section>
    </div>
  );
}
