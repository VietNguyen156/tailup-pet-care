import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminPanel } from "@/components/admin-panel";
import { money } from "@/lib/utils";
export const dynamic = "force-dynamic";
export const metadata = { title: "Quản trị TailUp" };
export default async function Page() {
  const user = await requirePageUser();
  if (user.role === "CUSTOMER") redirect("/dashboard/pets");
  const [
    bookings,
    orders,
    products,
    services,
    pendingBookings,
    pendingOrders,
    revenue,
    customerCount,
  ] = await Promise.all([
    db.booking.findMany({
      include: {
        user: { select: { name: true, phone: true } },
        pet: { select: { name: true } },
        service: { select: { name: true } },
        staff: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.product.findMany({ orderBy: { name: "asc" } }),
    db.service.findMany({ orderBy: { name: "asc" } }),
    db.booking.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.aggregate({
      where: { status: "COMPLETED", paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
  ]);
  return (
    <div className="container admin-layout">
      <div className="admin-top">
        <div>
          <span className="eyebrow">TAILUP / KHÔNG GIAN QUẢN TRỊ</span>
          <h1>Chào {user.name}.</h1>
          <p>Một góc nhìn cho những việc cần chăm chút hôm nay.</p>
        </div>
        <Link className="button outline" href="/dashboard/pets">
          Tài khoản của tôi
        </Link>
      </div>
      <div className="admin-stats">
        <div className="stat-card">
          <span>Lịch hẹn chờ xác nhận</span>
          <strong>{pendingBookings}</strong>
        </div>
        <div className="stat-card">
          <span>Đơn hàng chờ xử lý</span>
          <strong>{pendingOrders}</strong>
        </div>
        <div className="stat-card">
          <span>Doanh thu đơn đã thu tiền</span>
          <strong style={{ fontSize: 25 }}>
            {money(revenue._sum.totalAmount ?? 0)}
          </strong>
        </div>
        <div className="stat-card">
          <span>Khách hàng</span>
          <strong>{customerCount}</strong>
        </div>
      </div>
      <AdminPanel
        bookings={bookings.map((b) => ({
          id: b.id,
          status: b.status,
          bookingDate: b.bookingDate.toISOString(),
          timeSlot: b.timeSlot,
          user: b.user,
          pet: b.pet,
          service: b.service,
          staff: b.staff,
        }))}
        orders={orders.map((o) => ({
          id: o.id,
          status: o.status,
          paymentStatus: o.paymentStatus,
          totalAmount: o.totalAmount.toString(),
          recipientName: o.recipientName,
          phone: o.phone,
          address: o.address,
          items: o.items.map((i) => ({
            productName: i.productName,
            quantity: i.quantity,
          })),
        }))}
        products={products.map((p) => ({ ...p, price: p.price.toString() }))}
        services={services.map((s) => ({ ...s, price: s.price.toString() }))}
      />
    </div>
  );
}
