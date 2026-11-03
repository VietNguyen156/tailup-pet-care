"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUp, ArrowDown, Plus, ImagePlus } from "lucide-react";
import {
  bannerFields,
  MAX_BANNERS,
  MAX_BANNER_BYTES,
  type ManagedBanner,
} from "@/lib/banner-validation";

type Draft = ManagedBanner & { isNew: boolean };
export function BannerManager({
  storeId,
  slug,
  initial,
}: {
  storeId: string;
  slug: string;
  initial: ManagedBanner[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    setItems(initial);
  }, [initial]);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (draft)
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [draft?.slot, draft?.isNew]);
  const endpoint = `/api/admin/banners?storeId=${encodeURIComponent(storeId)}`;
  async function mutate(
    method: string,
    body: FormData | object,
    success: string,
  ) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const form = body instanceof FormData;
      const response = await fetch(endpoint, {
        method,
        headers: form ? undefined : { "Content-Type": "application/json" },
        body: form ? body : JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Không thể lưu banner.");
      setItems(result.banners);
      setMessage(success);
      router.refresh();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  function edit(item?: ManagedBanner) {
    setError("");
    setMessage("");
    setFile(null);
    setDraft(
      item
        ? {
            ...item,
            buttonUrl:
              item.buttonUrl ||
              (item.buttonText ? `/booking?store=${slug}` : ""),
            isNew: false,
          }
        : {
            slot: -1,
            sortOrder: items.length,
            title: "",
            description: "",
            image: "",
            enabled: true,
            buttonText: "Đặt lịch chăm sóc",
            buttonUrl: `/booking?store=${slug}`,
            isNew: true,
          },
    );
  }
  async function move(index: number, direction: number) {
    const slots = items.map((b) => b.slot);
    [slots[index], slots[index + direction]] = [
      slots[index + direction],
      slots[index],
    ];
    await mutate(
      "PATCH",
      { action: "reorder", slots },
      "Đã lưu thứ tự banner.",
    );
  }
  return (
    <section
      className="panel banner-manager"
      id="banner-manager"
      aria-labelledby="banner-manager-title"
    >
      <div className="banner-manager-heading">
        <div>
          <h2 id="banner-manager-title">Quản lý banner</h2>
          <p>
            {items.length}/{MAX_BANNERS} banner · Thay đổi được lưu riêng cho
            cửa hàng này.
          </p>
        </div>
        <button
          className="button"
          disabled={busy || !!draft || items.length >= MAX_BANNERS}
          onClick={() => edit()}
        >
          <Plus size={17} />
          Thêm banner
        </button>
      </div>
      <p>
        Ảnh ngang khuyến nghị <strong>1600 × 700 px</strong>. Nhận JPG, PNG,
        WebP; tối đa <strong>2 MB/ảnh</strong>.{" "}
        <Link className="text-link" href={`/stores/${slug}`} target="_blank">
          Xem trang chủ ↗
        </Link>
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
      <div className="table-wrap">
        <table className="banner-table">
          <thead>
            <tr>
              <th>Thứ tự</th>
              <th>Ảnh / Tiêu đề</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.slot}>
                <td>
                  <strong>{index + 1}</strong>
                  <div className="banner-order-buttons">
                    <button
                      className="icon-button"
                      disabled={busy || !!draft || index === 0}
                      aria-label={`Đưa ${item.title} lên`}
                      onClick={() => void move(index, -1)}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      className="icon-button"
                      disabled={busy || !!draft || index === items.length - 1}
                      aria-label={`Đưa ${item.title} xuống`}
                      onClick={() => void move(index, 1)}
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="banner-table-preview">
                    <img src={item.image} alt={item.title || "Ảnh banner"} />
                    <div>
                      <strong>{item.title || "Banner chưa có tiêu đề"}</strong>
                      <small>{item.description}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <label className="tenant-checkbox">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      disabled={busy || !!draft}
                      onChange={(e) =>
                        void mutate(
                          "PATCH",
                          {
                            action: "toggle",
                            slot: item.slot,
                            enabled: e.target.checked,
                          },
                          "Đã cập nhật trạng thái banner.",
                        )
                      }
                    />
                    {item.enabled ? "Đang bật" : "Đang tắt"}
                  </label>
                </td>
                <td>
                  <div className="banner-row-actions">
                    <button
                      className="button outline"
                      disabled={busy || !!draft}
                      onClick={() => edit(item)}
                    >
                      Sửa
                    </button>
                    <button
                      className="button outline"
                      disabled={busy || !!draft}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Xóa banner “${item.title || "không có tiêu đề"}”? Ảnh tải lên của banner cũng sẽ được xóa. Thao tác này không thể hoàn tác.`,
                          )
                        )
                          void mutate(
                            "DELETE",
                            { slot: item.slot },
                            "Đã xóa banner và ảnh tải lên.",
                          );
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!items.length && (
        <div className="store-content-empty">
          <ImagePlus />
          <h3>Chưa có banner.</h3>
          <p>
            Bấm Thêm banner để tải ảnh đầu tiên. Khi tất cả banner tắt hoặc bị
            xóa, trang chủ sẽ ẩn carousel.
          </p>
        </div>
      )}
      {draft && (
        <form
          ref={formRef}
          className="form-stack banner-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            const parsed = bannerFields.safeParse(draft);
            if (!parsed.success) {
              setError(parsed.error.issues[0].message);
              return;
            }
            if (draft.isNew && !file) {
              setError("Vui lòng chọn ảnh cho banner mới.");
              return;
            }
            const data = new FormData();
            Object.entries(parsed.data).forEach(([key, value]) =>
              data.set(key, String(value)),
            );
            if (!draft.isNew) data.set("slot", String(draft.slot));
            if (file) data.set("image", file);
            if (
              await mutate(
                draft.isNew ? "POST" : "PATCH",
                data,
                "Đã lưu banner. Tải lại trang chủ để xem thay đổi.",
              )
            ) {
              setDraft(null);
              setFile(null);
            }
          }}
        >
          <h3>{draft.isNew ? "Thêm banner mới" : "Chỉnh sửa banner"}</h3>
          <fieldset disabled={busy}>
            <div className="banner-form-grid">
              <div>
                {preview || draft.image ? (
                  <img
                    className="banner-large-preview"
                    src={preview || draft.image}
                    alt="Xem trước ảnh banner"
                  />
                ) : (
                  <div className="banner-placeholder">
                    Chọn ảnh để xem trước
                  </div>
                )}
                <label>
                  {draft.isNew
                    ? "Tải ảnh từ máy"
                    : "Thay ảnh (để trống để giữ ảnh hiện tại)"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      setError("");
                      const next = e.target.files?.[0];
                      e.target.value = "";
                      if (!next) return;
                      setFile(null);
                      if (
                        !["image/jpeg", "image/png", "image/webp"].includes(
                          next.type,
                        )
                      ) {
                        setError("Chỉ nhận ảnh JPG, PNG hoặc WebP.");
                        return;
                      }
                      if (next.size > MAX_BANNER_BYTES) {
                        setError("Ảnh tối đa 2 MB.");
                        return;
                      }
                      setFile(next);
                    }}
                  />
                </label>
                {file && (
                  <small>
                    Đã chọn: {file.name} ({Math.ceil(file.size / 1024)} KB)
                  </small>
                )}
                <small>Ảnh chỉ được tải lên khi bạn bấm Lưu banner.</small>
              </div>
              <div className="form-stack">
                <label>
                  Tiêu đề
                  <input
                    required
                    maxLength={160}
                    value={draft.title}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                  />
                </label>
                <label>
                  Mô tả
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                  />
                </label>
                <label>
                  Nội dung nút
                  <input
                    maxLength={80}
                    value={draft.buttonText}
                    onChange={(e) =>
                      setDraft({ ...draft, buttonText: e.target.value })
                    }
                  />
                </label>
                <label>
                  Đường dẫn khi bấm
                  <input
                    maxLength={1000}
                    placeholder="/stores/ten-cua-hang/services hoặc https://…"
                    value={draft.buttonUrl}
                    onChange={(e) =>
                      setDraft({ ...draft, buttonUrl: e.target.value })
                    }
                  />
                </label>
                <small>
                  Để trống cả nội dung nút và đường dẫn nếu không muốn hiển thị
                  nút.
                </small>
                <label>
                  Thứ tự
                  <select
                    value={draft.sortOrder}
                    onChange={(e) =>
                      setDraft({ ...draft, sortOrder: Number(e.target.value) })
                    }
                  >
                    {Array.from(
                      { length: items.length + (draft.isNew ? 1 : 0) },
                      (_, i) => (
                        <option key={i} value={i}>
                          {i + 1}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label className="tenant-checkbox">
                  <input
                    type="checkbox"
                    checked={draft.enabled}
                    onChange={(e) =>
                      setDraft({ ...draft, enabled: e.target.checked })
                    }
                  />
                  Bật hiển thị trên trang chủ
                </label>
              </div>
            </div>
            <div className="tenant-actions">
              <button className="button" type="submit">
                {busy ? "Đang lưu…" : "Lưu banner"}
              </button>
              <button
                type="button"
                className="button outline"
                onClick={() => {
                  setDraft(null);
                  setFile(null);
                  setError("");
                }}
              >
                Hủy chỉnh sửa
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </section>
  );
}
