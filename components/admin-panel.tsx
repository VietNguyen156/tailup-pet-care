"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/client";
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
type Product = {
  id: string;
  name: string;
  price: string;
  stock: number;
  isActive: boolean;
};
type Service = {
  id: string;
  name: string;
  price: string;
  durationMinutes: number;
  isActive: boolean;
};
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
  const [tab, setTab] = useState("bookings"),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState("");
  const router = useRouter();
  async function save(url: string, id: string, data: object) {
    setBusy(id);
    setError("");
    setMessage("");
    try {
      await request(url, {
        method: "PATCH",
        body: JSON.stringify({ id, ...data }),
      });
      setMessage("Đã lưu thay đổi.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <div className="admin-tabs">
        {[
          ["bookings", "Lịch hẹn"],
          ["orders", "Đơn hàng"],
          ["products", "Sản phẩm"],
          ["services", "Dịch vụ"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={tab === value ? "selected" : ""}
            onClick={() => {
              setTab(value);
              setError("");
              setMessage("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="success-message" role="status">
          {message}
        </p>
      )}
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
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Giá (VND)</th>
                <th>Tồn kho</th>
                <th>Đang bán</th>
                <th>Lưu</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    <input
                      form={`product-${p.id}`}
                      aria-label={`Giá ${p.name}`}
                      name="price"
                      type="number"
                      required
                      min="1000"
                      max="999999999"
                      defaultValue={p.price}
                    />
                  </td>
                  <td>
                    <input
                      form={`product-${p.id}`}
                      aria-label={`Tồn kho ${p.name}`}
                      name="stock"
                      type="number"
                      required
                      min="0"
                      max="100000"
                      defaultValue={p.stock}
                    />
                  </td>
                  <td>
                    <input
                      form={`product-${p.id}`}
                      aria-label={`Đang bán ${p.name}`}
                      type="checkbox"
                      name="isActive"
                      defaultChecked={p.isActive}
                    />
                  </td>
                  <td>
                    <form
                      id={`product-${p.id}`}
                      onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        void save("/api/admin/products", p.id, {
                          price: Number(data.get("price")),
                          stock: Number(data.get("stock")),
                          isActive: data.has("isActive"),
                        });
                      }}
                    >
                      <button className="button" disabled={busy === p.id}>
                        {busy === p.id ? "Đang lưu…" : "Lưu"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "services" && (
          <table>
            <thead>
              <tr>
                <th>Dịch vụ</th>
                <th>Thời lượng</th>
                <th>Giá (VND)</th>
                <th>Hoạt động</th>
                <th>Lưu</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.durationMinutes} phút</td>
                  <td>
                    <input
                      form={`service-${s.id}`}
                      aria-label={`Giá ${s.name}`}
                      name="price"
                      type="number"
                      required
                      min="1000"
                      max="999999999"
                      defaultValue={s.price}
                    />
                  </td>
                  <td>
                    <input
                      form={`service-${s.id}`}
                      aria-label={`Hoạt động ${s.name}`}
                      name="isActive"
                      type="checkbox"
                      defaultChecked={s.isActive}
                    />
                  </td>
                  <td>
                    <form
                      id={`service-${s.id}`}
                      onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        void save("/api/admin/services", s.id, {
                          price: Number(data.get("price")),
                          isActive: data.has("isActive"),
                        });
                      }}
                    >
                      <button className="button" disabled={busy === s.id}>
                        {busy === s.id ? "Đang lưu…" : "Lưu"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </>
  );
}
