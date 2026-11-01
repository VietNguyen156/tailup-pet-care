import Link from "next/link";
import { Package } from "lucide-react";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateLabel, money, orderLabels } from "@/lib/utils";
import { StatusAction } from "@/components/status-action";
export const metadata = { title: "Đơn hàng của tôi" };
export default async function Page() {
  const user = await requirePageUser();
  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">ĐỒ XINH CHO BÉ</span>
          <h1>Đơn hàng của tôi</h1>
          <p className="muted">
            Những món đồ đang trên đường đến với người bạn nhỏ.
          </p>
        </div>
        <Link className="button" href="/shop">
          Ghé cửa hàng
        </Link>
      </div>
      {orders.length ? (
        orders.map((o) => (
          <article className="list-card" key={o.id}>
            <div className="list-card-head">
              <div>
                <h3>Đơn hàng #{o.id.slice(-8).toUpperCase()}</h3>
                <p>
                  Ngày đặt: {dateLabel(o.createdAt)} · Thanh toán khi nhận hàng
                </p>
              </div>
              <span className={`badge ${o.status}`}>
                {orderLabels[o.status]}
              </span>
            </div>
            <div className="order-items-list">
              {o.items.map((i) => (
                <div key={i.id}>
                  <span>
                    {i.productName} × {i.quantity}
                  </span>
                  <strong>{money(Number(i.unitPrice) * i.quantity)}</strong>
                </div>
              ))}
            </div>
            <p className="order-address">
              Giao đến: {o.recipientName} · {o.phone}
              <br />
              {o.address}
            </p>
            <div className="list-card-bottom">
              <span>
                Tổng cộng <strong>{money(o.totalAmount)}</strong> ·{" "}
                {o.paymentStatus === "PAID"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </span>
              {o.status === "PENDING" && (
                <StatusAction
                  url={`/api/orders/${o.id}`}
                  status="CANCELLED"
                  label="Hủy đơn"
                  confirmMessage="Bạn muốn hủy đơn hàng này?"
                />
              )}
            </div>
          </article>
        ))
      ) : (
        <div className="empty-state panel">
          <Package />
          <h2>Chiếc giỏ đang chờ đồ xinh.</h2>
          <p>Ghé cửa hàng và chọn một món đồ bé thích nhé.</p>
          <Link className="button" href="/shop">
            Khám phá cửa hàng
          </Link>
        </div>
      )}
      <p className="muted small-text mt-6">
        Hiển thị tối đa 100 đơn hàng gần nhất.
      </p>
    </>
  );
}
