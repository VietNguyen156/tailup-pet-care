"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/client";
import { ServiceImageInput, serviceFormBody } from "./service-image-input";
type Store = {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
};
export function StoreSettings({ store }: { store: Store }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <details className="panel tenant-settings">
      <summary>Thông tin cửa hàng</summary>
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget));
          setBusy(true);
          setError("");
          setMessage("");
          try {
            await request("/api/admin/store", {
              method: "PATCH",
              body: JSON.stringify({ ...data, storeId: store.id }),
            });
            setMessage("Đã cập nhật thông tin cửa hàng.");
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Tên cửa hàng
          <input
            name="name"
            required
            minLength={2}
            maxLength={160}
            defaultValue={store.name}
          />
        </label>
        <label>
          Giới thiệu
          <textarea
            name="description"
            maxLength={3000}
            defaultValue={store.description}
          />
        </label>
        <div className="two-columns">
          <label>
            Địa chỉ
            <input
              name="address"
              required
              minLength={5}
              maxLength={500}
              defaultValue={store.address}
            />
          </label>
          <label>
            Điện thoại
            <input
              name="phone"
              type="tel"
              required
              pattern="0[0-9]{9}"
              defaultValue={store.phone}
            />
          </label>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {message && <p role="status">{message}</p>}
        <button className="button" disabled={busy}>
          {busy ? "Đang lưu…" : "Lưu thông tin"}
        </button>
      </form>
    </details>
  );
}
export function CatalogCreate({
  storeId,
  kind,
}: {
  storeId: string;
  kind: "products" | "services";
}) {
  const router = useRouter();
  const [imageKey, setImageKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  return (
    <details className="panel tenant-settings">
      <summary>
        {kind === "products" ? "Thêm sản phẩm" : "Thêm dịch vụ"}
      </summary>
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
            const payload = {
              ...data,
              storeId,
              price: Number(data.price),
              ...(kind === "products"
                ? { stock: Number(data.stock) }
                : { durationMinutes: Number(data.durationMinutes) }),
            };
            await request(`/api/admin/${kind}`, {
              method: "POST",
              body:
                kind === "services"
                  ? serviceFormBody(payload, data.image)
                  : JSON.stringify(payload),
            });
            form.reset();
            setImageKey((key) => key + 1);
            setMessage("Đã thêm vào danh mục của cửa hàng.");
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
            Tên
            <input name="name" required minLength={2} maxLength={160} />
          </label>
          <label>
            Danh mục
            <input name="category" required maxLength={80} />
          </label>
        </div>
        <label>
          Mô tả
          <textarea
            name="description"
            required
            minLength={5}
            maxLength={5000}
          />
        </label>
        <div className="two-columns">
          <label>
            Giá (VNĐ)
            <input
              name="price"
              type="number"
              required
              min={1000}
              max={999999999}
            />
          </label>
          {kind === "products" ? (
            <label>
              Tồn kho
              <input name="stock" type="number" required min={0} max={100000} />
            </label>
          ) : (
            <label>
              Thời lượng (phút)
              <input
                name="durationMinutes"
                type="number"
                required
                min={15}
                max={240}
              />
            </label>
          )}
        </div>
        {kind === "products" ? (
          <label>
            Link ảnh HTTPS
            <input
              name="imageUrl"
              type="url"
              required
              maxLength={500}
              placeholder="https://..."
            />
          </label>
        ) : (
          <label>
            Các bước chăm sóc (mỗi dòng một bước)
            <textarea name="process" required minLength={3} maxLength={3000} />
          </label>
        )}
        {kind === "services" && <ServiceImageInput key={imageKey} />}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {message && <p role="status">{message}</p>}
        <button className="button" disabled={busy}>
          {busy ? "Đang lưu…" : "Thêm mới"}
        </button>
      </form>
    </details>
  );
}
