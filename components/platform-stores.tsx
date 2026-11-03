"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/client";
import { money } from "@/lib/utils";
type StoreRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  admins: { name: string; email: string }[];
  customers: number;
  revenue: number;
  bookingRevenue: number;
  _count: { bookings: number; orders: number };
};
export function PlatformStores({ stores }: { stores: StoreRow[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function toggle(store: StoreRow) {
    if (
      !window.confirm(
        store.isActive
          ? `Tạm ngưng ${store.name}? Trang cửa hàng và các giao dịch mới sẽ bị khóa; chủ cửa hàng không thể quản trị cho tới khi mở lại.`
          : `Mở lại ${store.name}?`,
      )
    )
      return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await request("/api/platform/stores", {
        method: "PATCH",
        body: JSON.stringify({ id: store.id, isActive: !store.isActive }),
      });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
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
      <section className="panel tenant-create">
        <h2>Tạo cửa hàng & cấp tài khoản</h2>
        <p>
          Chủ cửa hàng dùng email và mật khẩu dưới đây để đăng nhập. Tài khoản
          chỉ có quyền trong cửa hàng vừa tạo.
        </p>
        <form
          className="form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = Object.fromEntries(new FormData(form));
            setBusy(true);
            setError("");
            setMessage("");
            try {
              await request("/api/platform/stores", {
                method: "POST",
                body: JSON.stringify({
                  ...data,
                  withSampleCatalog: data.withSampleCatalog === "on",
                }),
              });
              form.reset();
              setMessage(
                "Đã tạo cửa hàng và tài khoản chủ cửa hàng. Bạn có thể bàn giao thông tin đăng nhập vừa đặt.",
              );
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="two-columns">
            <label>
              Tên cửa hàng
              <input name="name" required minLength={2} maxLength={160} />
            </label>
            <label>
              Đường dẫn cửa hàng
              <input
                name="slug"
                required
                minLength={2}
                maxLength={80}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                placeholder="pet-house"
              />
              <small>/stores/pet-house — chữ thường không dấu</small>
            </label>
          </div>
          <div className="two-columns">
            <label>
              Địa chỉ
              <input name="address" required minLength={5} maxLength={500} />
            </label>
            <label>
              Số điện thoại
              <input name="phone" type="tel" required pattern="0[0-9]{9}" />
            </label>
          </div>
          <label>
            Giới thiệu
            <textarea name="description" maxLength={3000} />
          </label>
          <div className="two-columns">
            <label>
              Tên chủ cửa hàng
              <input name="adminName" required minLength={2} maxLength={100} />
            </label>
            <label>
              Email đăng nhập
              <input
                name="adminEmail"
                type="email"
                required
                maxLength={191}
                autoComplete="off"
              />
            </label>
          </div>
          <label>
            Mật khẩu cấp cho chủ cửa hàng
            <input
              name="adminPassword"
              type="password"
              required
              minLength={10}
              maxLength={128}
              autoComplete="new-password"
            />
            <small>
              Ít nhất 10 ký tự. Không dùng lại mật khẩu quản trị tổng.
            </small>
          </label>
          <label className="tenant-checkbox">
            <input type="checkbox" name="withSampleCatalog" /> Tạo thêm sản phẩm
            mẫu. Mỗi cửa hàng luôn có bản sao dịch vụ mẫu TailUp để chỉnh sửa
            riêng.
          </label>
          <button className="button" disabled={busy}>
            {busy ? "Đang xử lý…" : "Tạo cửa hàng"}
          </button>
        </form>
      </section>
      <h2>Các cửa hàng trên TailUp</h2>
      <div className="tenant-store-grid">
        {stores.map((store) => (
          <article className="panel" key={store.id}>
            <div className="tenant-card-heading">
              <h3>{store.name}</h3>
              <span className="badge">
                {store.isActive ? "Hoạt động" : "Tạm ngưng"}
              </span>
            </div>
            <p>
              {store.admins.map((a) => `${a.name} · ${a.email}`).join(", ") ||
                "Chưa có chủ cửa hàng"}
            </p>
            <details className="tenant-settings">
              <summary>Cấp thêm tài khoản chủ cửa hàng</summary>
              <form
                className="form-stack"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const data = Object.fromEntries(new FormData(form));
                  setBusy(true);
                  setError("");
                  setMessage("");
                  try {
                    await request("/api/platform/store-admins", {
                      method: "POST",
                      body: JSON.stringify({ ...data, storeId: store.id }),
                    });
                    form.reset();
                    setMessage("Đã cấp tài khoản quản trị cho cửa hàng.");
                    router.refresh();
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <label>
                  Họ tên
                  <input name="name" required minLength={2} maxLength={100} />
                </label>
                <label>
                  Email mới
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={191}
                    autoComplete="off"
                  />
                </label>
                <label>
                  Mật khẩu
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={10}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </label>
                <button className="button" disabled={busy}>
                  Cấp tài khoản
                </button>
              </form>
            </details>
            <dl className="tenant-metrics">
              <div>
                <dt>Khách đã giao dịch</dt>
                <dd>{store.customers}</dd>
              </div>
              <div>
                <dt>Lịch hẹn</dt>
                <dd>{store._count.bookings}</dd>
              </div>
              <div>
                <dt>Đơn hàng</dt>
                <dd>{store._count.orders}</dd>
              </div>
              <div>
                <dt>Đơn hàng đã thu tiền</dt>
                <dd>{money(store.revenue)}</dd>
              </div>
              <div>
                <dt>Giá trị dịch vụ hoàn thành</dt>
                <dd>{money(store.bookingRevenue)}</dd>
              </div>
            </dl>
            <div className="tenant-actions">
              <Link className="button small" href={`/admin?store=${store.id}`}>
                Quản trị cửa hàng
              </Link>
              {store.isActive && (
                <Link className="text-link" href={`/stores/${store.slug}`}>
                  Xem trang cửa hàng
                </Link>
              )}
              <button
                className="button small outline"
                disabled={busy}
                onClick={() => toggle(store)}
              >
                {store.isActive ? "Tạm ngưng" : "Mở lại"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
