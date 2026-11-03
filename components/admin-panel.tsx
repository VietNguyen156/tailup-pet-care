"use client";
import { useState } from "react";
import { CatalogEditor, type CatalogItem } from "./catalog-editor";

import { bookingLabels, orderLabels, money, dateLabel } from "@/lib/utils";
import { StatusAction } from "./status-action";
type Booking = {
  id: string;
  status: string;
  bookingDate: string;
  timeSlot: string;
  user: { name: string; phone: string | null };
  pet: { name: string };
  service: { name: string };
  staff: { name: string } | null;
};
type Order = {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  recipientName: string;
  phone: string;
  address: string;
  items: { productName: string; quantity: number }[];
};
type Product = CatalogItem;
type Service = CatalogItem;
export function AdminPanel({
  bookings,
  orders,
  products,
  services,
}: {
  bookings: Booking[];
  orders: Order[];
  products: Product[];
  services: Service[];
}) {
  const [tab, setTab] = useState("bookings");
  return (
    <section id="catalog-management" style={{ scrollMarginTop: 24 }}>
      <div className="admin-tabs">
        {[
          ["bookings", "Lịch hẹn"],
          ["orders", "Đơn hàng"],
          ["products", "Sản phẩm"],
          ["services", "Dịch vụ"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            className={tab === value ? "selected" : ""}
            onClick={() => {
              setTab(value);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        {tab === "bookings" && (
          <table>
            <thead>
              <tr>
                <th>Khách hàng / thú cưng</th>
                <th>Dịch vụ</th>
                <th>Ngày / giờ</th>
                <th>Nhân viên</th>
                <th>Trạng thái</th>
                <th>Xử lý</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    {b.user.name}
                    <small>
                      {b.user.phone ?? "Chưa có SĐT"} · Bé {b.pet.name}
                    </small>
                  </td>
                  <td>{b.service.name}</td>
                  <td>
                    {dateLabel(b.bookingDate)}
                    <small>{b.timeSlot}</small>
                  </td>
                  <td>{b.staff?.name ?? "Chưa chỉ định"}</td>
                  <td>
                    <span className={`badge ${b.status}`}>
                      {bookingLabels[b.status]}
                    </span>
                  </td>
                  <td>
                    {b.status === "PENDING" && (
                      <StatusAction
                        url={`/api/bookings/${b.id}`}
                        status="CONFIRMED"
                        label="Xác nhận"
                      />
                    )}
                    {b.status === "CONFIRMED" && (
                      <StatusAction
                        url={`/api/bookings/${b.id}`}
                        status="COMPLETED"
                        label="Hoàn thành"
                      />
                    )}
                    {["PENDING", "CONFIRMED"].includes(b.status) && (
                      <StatusAction
                        url={`/api/bookings/${b.id}`}
                        status="CANCELLED"
                        label="Hủy"
                        confirmMessage="Hủy lịch hẹn này?"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "orders" && (
          <table>
            <thead>
              <tr>
                <th>Đơn hàng</th>
                <th>Người nhận</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Xử lý</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    #{o.id.slice(-8).toUpperCase()}
                    <small>
                      {o.paymentStatus === "PAID"
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"}
                    </small>
                  </td>
                  <td>
                    {o.recipientName}
                    <small>{o.phone}</small>
                    <small style={{ maxWidth: 190, whiteSpace: "normal" }}>
                      {o.address}
                    </small>
                  </td>
                  <td>
                    {o.items.map((i, index) => (
                      <small key={index}>
                        {i.productName} × {i.quantity}
                      </small>
                    ))}
                  </td>
                  <td>{money(o.totalAmount)}</td>
                  <td>
                    <span className={`badge ${o.status}`}>
                      {orderLabels[o.status]}
                    </span>
                  </td>
                  <td>
                    {o.status === "PENDING" && (
                      <StatusAction
                        url={`/api/orders/${o.id}`}
                        status="PROCESSING"
                        label="Chuẩn bị"
                      />
                    )}
                    {o.status === "PROCESSING" && (
                      <StatusAction
                        url={`/api/orders/${o.id}`}
                        status="SHIPPED"
                        label="Giao hàng"
                      />
                    )}
                    {o.status === "SHIPPED" && (
                      <StatusAction
                        url={`/api/orders/${o.id}`}
                        status="COMPLETED"
                        label="Hoàn tất / Đã thu COD"
                      />
                    )}
                    {["PENDING", "PROCESSING"].includes(o.status) && (
                      <StatusAction
                        url={`/api/orders/${o.id}`}
                        status="CANCELLED"
                        label="Hủy"
                        confirmMessage="Hủy đơn và hoàn lại tồn kho?"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "products" && (
          <CatalogEditor kind="products" items={products} />
        )}
        {tab === "services" && (
          <CatalogEditor kind="services" items={services} />
        )}
        {((tab === "bookings" && !bookings.length) ||
          (tab === "orders" && !orders.length)) && (
          <p className="admin-empty">
            Chưa có dữ liệu. Đơn mới sẽ xuất hiện tại đây.
          </p>
        )}
      </div>
      <p className="muted small-text mt-6">
        Hiển thị 100 lịch hẹn và 100 đơn hàng gần nhất. Hoàn tất đơn COD đồng
        nghĩa xác nhận đã thu tiền.
      </p>
    </section>
  );
}
