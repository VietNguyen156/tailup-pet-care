import { redirect } from "next/navigation";
import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { accountHome } from "@/lib/permissions";
import { db } from "@/lib/db";
import { money } from "@/lib/utils";
import { PlatformStores } from "@/components/platform-stores";
export const dynamic = "force-dynamic";
export const metadata = { title: "Quản trị toàn nền tảng" };
export default async function Page() {
  const user = await requirePageUser();
  if (user.role !== "SUPER_ADMIN") redirect(accountHome(user.role));
  const [
    stores,
    customerCount,
    revenues,
    bookingRevenues,
    customerBookings,
    customerOrders,
  ] = await Promise.all([
    db.store.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        admins: { select: { name: true, email: true } },
        _count: { select: { bookings: true, orders: true } },
      },
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.groupBy({
      by: ["storeId"],
      where: { status: "COMPLETED", paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    db.booking.groupBy({
      by: ["storeId"],
      where: { status: "COMPLETED" },
      _sum: { price: true },
    }),
    db.booking.groupBy({ by: ["storeId", "userId"] }),
    db.order.groupBy({ by: ["storeId", "userId"] }),
  ]);
  const customers = new Map<string, Set<string>>();
  for (const row of [...customerBookings, ...customerOrders]) {
    if (!customers.has(row.storeId)) customers.set(row.storeId, new Set());
    customers.get(row.storeId)!.add(row.userId);
  }
  const rows = stores.map((s) => ({
    ...s,
    customers: customers.get(s.id)?.size ?? 0,
    revenue: Number(
      revenues.find((r) => r.storeId === s.id)?._sum.totalAmount ?? 0,
    ),
    bookingRevenue: Number(
      bookingRevenues.find((r) => r.storeId === s.id)?._sum.price ?? 0,
    ),
  }));
  return (
    <div className="container page-space">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">QUẢN TRỊ TỔNG</span>
          <h1>Toàn cảnh TailUp</h1>
          <p>Quản lý cửa hàng và số liệu trên toàn nền tảng.</p>
        </div>
        <Link className="button outline" href="/dashboard/profile">
          Tài khoản của tôi
        </Link>
      </div>
      <div className="admin-stats">
        <div className="stat-card">
          <span>Cửa hàng hoạt động / tổng</span>
          <strong>
            {stores.filter((s) => s.isActive).length} / {stores.length}
          </strong>
        </div>
        <div className="stat-card">
          <span>Tài khoản khách hàng</span>
          <strong>{customerCount}</strong>
        </div>
        <div className="stat-card">
          <span>Đơn hàng đã thu tiền</span>
          <strong>{money(rows.reduce((n, s) => n + s.revenue, 0))}</strong>
        </div>
        <div className="stat-card">
          <span>Giá trị dịch vụ hoàn thành</span>
          <strong>
            {money(rows.reduce((n, s) => n + s.bookingRevenue, 0))}
          </strong>
        </div>
      </div>
      <p className="muted">
        Số liệu toàn thời gian. Giá trị dịch vụ hoàn thành được thống kê riêng,
        không đồng nghĩa đã thu tiền. Khách dùng nhiều cửa hàng chỉ tính một lần
        trong tổng tài khoản.
      </p>
      <PlatformStores
        stores={rows.map(
          ({
            id,
            name,
            slug,
            isActive,
            admins,
            customers,
            revenue,
            bookingRevenue,
            _count,
          }) => ({
            id,
            name,
            slug,
            isActive,
            admins,
            customers,
            revenue,
            bookingRevenue,
            _count,
          }),
        )}
      />
    </div>
  );
}
