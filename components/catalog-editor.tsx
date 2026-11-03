"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/client";
import { money } from "@/lib/utils";
import { ServiceImageInput, serviceFormBody } from "./service-image-input";

export type CatalogItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  isActive: boolean;
  stock?: number;
  durationMinutes?: number;
  process?: unknown;
  images?: { url: string }[];
  imageUrl?: string;
};

export function CatalogEditor({
  items,
  kind,
}: {
  items: CatalogItem[];
  kind: "products" | "services";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  async function save(
    id: string,
    method: string,
    data: object = {},
    file?: FormDataEntryValue | null,
  ) {
    setBusy(id);
    setError("");
    setMessage("");
    try {
      await request(`/api/admin/${kind}`, {
        method,
        body:
          kind === "services" && method === "PATCH"
            ? serviceFormBody({ id, ...data }, file)
            : JSON.stringify({ id, ...data }),
      });
      setMessage(
        method === "DELETE"
          ? "Đã xóa khỏi danh mục. Lịch sử giao dịch vẫn được giữ lại."
          : "Đã lưu thay đổi.",
      );
      router.refresh();
      setEditingId(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="catalog-editor">
      <h2>{kind === "products" ? "Quản lý sản phẩm" : "Quản lý dịch vụ"}</h2>
      <p className="muted">
        Danh mục riêng của cửa hàng. Chỉnh sửa dịch vụ mẫu không ảnh hưởng cửa
        hàng khác.
      </p>
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
      {!items.length && (
        <p>Chưa có mục nào. Dùng biểu mẫu thêm phía trên để tạo mới.</p>
      )}
      {items.map((item) => (
        <article className="panel tenant-settings" key={item.id}>
          <div
            className="tenant-actions"
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <div>
              <h3 style={{ margin: "0 0 8px" }}>{item.name}</h3>
              <p className="muted" style={{ margin: 0 }}>
                {money(item.price)} ·{" "}
                {item.isActive ? "Đang hiển thị" : "Đang ẩn"}
              </p>
            </div>
            <button
              type="button"
              className="button outline"
              disabled={!!busy}
              aria-expanded={editingId === item.id}
              aria-controls={`edit-${item.id}`}
              onClick={() => {
                setEditingId(editingId === item.id ? null : item.id);
                setError("");
                setMessage("");
              }}
            >
              {editingId === item.id
                ? "Đóng chỉnh sửa"
                : kind === "products"
                  ? "Sửa sản phẩm"
                  : "Sửa dịch vụ"}
            </button>
          </div>
          {editingId === item.id && (
            <form
              id={`edit-${item.id}`}
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const data: Record<string, unknown> = {
                  name: form.get("name"),
                  description: form.get("description"),
                  category: form.get("category"),
                  price: Number(form.get("price")),
                  isActive: form.has("isActive"),
                };
                if (kind === "products") {
                  data.stock = Number(form.get("stock"));
                  const url = String(form.get("imageUrl") ?? "").trim();
                  if (url && url !== item.images?.[0]?.url) data.imageUrl = url;
                } else {
                  data.durationMinutes = Number(form.get("durationMinutes"));
                  data.process = form.get("process");
                }
                void save(item.id, "PATCH", data, form.get("image"));
              }}
            >
              <fieldset disabled={!!busy}>
                <label>
                  Tên
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={160}
                    defaultValue={item.name}
                  />
                </label>
                <label>
                  Danh mục
                  <input
                    name="category"
                    required
                    maxLength={80}
                    defaultValue={item.category}
                  />
                </label>
                <label>
                  Mô tả
                  <textarea
                    name="description"
                    required
                    minLength={5}
                    maxLength={5000}
                    rows={3}
                    defaultValue={item.description}
                  />
                </label>
                <label>
                  Giá (đ)
                  <input
                    name="price"
                    type="number"
                    required
                    min={1000}
                    max={999999999}
                    defaultValue={item.price}
                  />
                </label>
                {kind === "products" ? (
                  <>
                    <label>
                      Tồn kho
                      <input
                        name="stock"
                        type="number"
                        required
                        min={0}
                        max={100000}
                        defaultValue={item.stock}
                      />
                    </label>
                    <label>
                      Đường dẫn ảnh
                      <input
                        name="imageUrl"
                        maxLength={500}
                        placeholder="https://…"
                        defaultValue={item.images?.[0]?.url}
                      />
                    </label>
                    <small>
                      Giữ ảnh hiện tại hoặc nhập đường dẫn HTTPS mới.
                    </small>
                  </>
                ) : (
                  <>
                    <label>
                      Thời lượng (phút)
                      <input
                        name="durationMinutes"
                        type="number"
                        required
                        min={15}
                        max={240}
                        defaultValue={item.durationMinutes}
                      />
                    </label>
                    <label>
                      Quy trình — mỗi bước một dòng
                      <textarea
                        name="process"
                        required
                        minLength={3}
                        maxLength={3000}
                        rows={4}
                        defaultValue={
                          Array.isArray(item.process)
                            ? item.process.join("\n")
                            : ""
                        }
                      />
                    </label>
                  </>
                )}
                {kind === "services" && (
                  <ServiceImageInput currentUrl={item.imageUrl} />
                )}
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={item.isActive}
                  />
                  Hiển thị cho khách hàng
                </label>
                <div className="tenant-actions">
                  <button className="button" type="submit">
                    {busy === item.id ? "Đang xử lý…" : "Lưu thay đổi"}
                  </button>
                  <button
                    className="button outline"
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setError("");
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    className="button outline"
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Xóa “${item.name}” khỏi danh mục? Lịch sử đơn hàng và lịch hẹn vẫn được giữ lại.`,
                        )
                      )
                        void save(item.id, "DELETE");
                    }}
                  >
                    Xóa khỏi danh mục
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        </article>
      ))}
    </div>
  );
}
