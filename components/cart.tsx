"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Trash2, Check, ArrowRight } from "lucide-react";
import { useCart } from "./cart-provider";
import { ProductArt } from "./product-art";
import { money } from "@/lib/utils";
import { request } from "@/lib/client";
import type { ProductView } from "./product-card";
export function Cart({
  products,
  user,
}: {
  products: ProductView[];
  user: { name: string; phone: string | null } | null;
}) {
  const { items, ready, update, clear } = useCart();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [orderId, setOrderId] = useState("");
  const rows = items.map((i) => ({
    item: i,
    product: products.find((p) => p.id === i.productId),
  }));
  const total = rows.reduce(
    (sum, r) => sum + (r.product?.price ?? 0) * r.item.quantity,
    0,
  );
  const unavailable = rows.some(
    (r) => !r.product || r.item.quantity > r.product.stock,
  );
  if (!ready)
    return (
      <div className="loading-block">
        <span className="spinner" />
        Đang mở giỏ hàng…
      </div>
    );
  if (orderId)
    return (
      <div className="booking-success panel">
        <div className="success-icon">
          <Check />
        </div>
        <h2>Món đồ xinh đã được đặt.</h2>
        <p>
          Đơn hàng <strong>#{orderId.slice(-8).toUpperCase()}</strong> đang chờ
          xử lý. Bạn thanh toán khi nhận hàng.
        </p>
        <Link href="/dashboard/orders" className="button">
          Theo dõi đơn hàng <ArrowRight size={17} />
        </Link>
      </div>
    );
  if (!items.length)
    return (
      <div className="empty-state panel">
        <ShoppingBag />
        <h2>Giỏ hàng đang trống.</h2>
        <p>Chọn món đồ nhỏ để mang thêm niềm vui cho bé nhé.</p>
        <Link className="button" href="/shop">
          Ghé cửa hàng
        </Link>
      </div>
    );
  return (
    <div className="cart-layout">
      <div className="cart-items">
        {rows.map(({ item, product }) => (
          <article className="cart-item" key={item.productId}>
            {product && (
              <Link
                href={`/shop/${product.slug}`}
                className={`cart-item-art ${product.color}`}
              >
                <ProductArt id={product.id} />
              </Link>
            )}
            <div className="cart-item-info">
              <h3>{product?.name ?? "Sản phẩm không còn kinh doanh"}</h3>
              <p>
                {product ? money(product.price) : "Vui lòng xóa khỏi giỏ hàng"}
              </p>
              <div className="quantity-control">
                <button
                  disabled={busy}
                  aria-label="Giảm số lượng"
                  onClick={() => update(item.productId, item.quantity - 1)}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  disabled={
                    busy ||
                    !product ||
                    item.quantity >= product.stock ||
                    item.quantity >= 20
                  }
                  aria-label="Tăng số lượng"
                  onClick={() => update(item.productId, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              {product && item.quantity > product.stock && (
                <p className="field-error">Chỉ còn {product.stock} sản phẩm.</p>
              )}
            </div>
            <button
              className="icon-button"
              disabled={busy}
              onClick={() => update(item.productId, 0)}
              aria-label="Xóa sản phẩm khỏi giỏ"
            >
              <Trash2 size={18} />
            </button>
          </article>
        ))}
        <p className="muted small-text">
          Giá và tồn kho sẽ được kiểm tra lại khi xác nhận đơn hàng.
        </p>
      </div>
      <div className="panel cart-summary">
        <h3>Đơn hàng của bạn</h3>
        <div className="cart-summary-row">
          <span>Tạm tính</span>
          <strong>{money(total)}</strong>
        </div>
        <div className="cart-summary-row">
          <span>Phí vận chuyển (bản mẫu)</span>
          <strong>0đ</strong>
        </div>
        <div className="cart-summary-row cart-summary-total">
          <strong>Tổng cộng</strong>
          <strong>{money(total)}</strong>
        </div>
        <form
          className="form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const form = Object.fromEntries(new FormData(e.currentTarget));
            try {
              const result = await request<{ order: { id: string } }>(
                "/api/orders",
                {
                  method: "POST",
                  body: JSON.stringify({
                    ...form,
                    paymentMethod: "COD",
                    items: items.map((i) => ({
                      productId: i.productId,
                      quantity: i.quantity,
                    })),
                  }),
                },
              );
              setOrderId(result.order.id);
              clear();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Người nhận
            <input
              name="recipientName"
              required
              minLength={2}
              maxLength={100}
              defaultValue={user?.name}
            />
          </label>
          <label>
            Số điện thoại
            <input
              name="phone"
              required
              pattern="0[0-9]{9}"
              title="10 chữ số, bắt đầu bằng 0"
              defaultValue={user?.phone ?? ""}
            />
          </label>
          <label>
            Địa chỉ giao hàng
            <textarea
              name="address"
              required
              minLength={10}
              maxLength={500}
              placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
            />
          </label>
          <label>
            Ghi chú (không bắt buộc)
            <input
              name="note"
              maxLength={1000}
              placeholder="Lưu ý khi giao hàng…"
            />
          </label>
          <p className="muted">
            Hình thức thanh toán: tiền mặt khi nhận hàng (COD).
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {unavailable && (
            <p className="error">
              Điều chỉnh sản phẩm hoặc số lượng trước khi đặt hàng.
            </p>
          )}
          {!user && (
            <p className="info">
              <Link href="/login">Đăng nhập</Link> hoặc{" "}
              <Link href="/register">đăng ký</Link> để đặt hàng.
            </p>
          )}
          <button
            className="button full"
            disabled={busy || !user || unavailable}
          >
            {busy ? "Đang tạo đơn…" : "Xác nhận đặt hàng"}
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
