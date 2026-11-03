"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { GalleryPhoto } from "@/lib/gallery-types";
import { MAX_BANNER_BYTES } from "@/lib/banner-validation";
export function GalleryManager({
  storeId,
  slug,
  initial,
}: {
  storeId: string;
  slug: string;
  initial: GalleryPhoto[];
}) {
  const router = useRouter();
  const [images, setImages] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => setImages(initial), [initial]);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const endpoint = `/api/admin/gallery?storeId=${encodeURIComponent(storeId)}`;
  async function remove(image: GalleryPhoto) {
    if (!window.confirm(`Xóa ảnh “${image.alt}” khỏi carousel của cửa hàng?`))
      return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: image.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setImages((current) => current.filter((p) => p.id !== image.id));
      setMessage("Đã xóa ảnh khỏi carousel cửa hàng.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="panel gallery-manager"
      id="gallery-manager"
      aria-labelledby="gallery-manager-title"
    >
      <div className="banner-manager-heading">
        <div>
          <h2 id="gallery-manager-title">Ảnh cửa hàng</h2>
          <p>Carousel ảnh riêng của cửa hàng · {images.length} ảnh</p>
        </div>
        <Link
          className="text-link"
          href={`/stores/${slug}#store-gallery`}
          target="_blank"
        >
          Xem trên website ↗
        </Link>
      </div>
      <p>
        Thêm ảnh không gian, hoạt động hoặc thú cưng tại cửa hàng. Khách chỉ xem
        và chuyển ảnh. Nhận JPG, PNG, WebP tối đa 2 MB/ảnh; gợi ý ảnh ngang 1600
        × 900 px.
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="success-message">
          {message}
        </p>
      )}
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!file) {
            setError("Vui lòng chọn ảnh.");
            return;
          }
          setBusy(true);
          setError("");
          setMessage("");
          try {
            const form = new FormData();
            form.set("image", file);
            form.set("alt", alt);
            const response = await fetch(endpoint, {
              method: "POST",
              body: form,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            setImages((current) => [...current, result.image]);
            setFile(null);
            setAlt("");
            setMessage(
              "Đã thêm ảnh. Tải lại trang cửa hàng để xem carousel mới.",
            );
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy}>
          <div className="gallery-upload-grid">
            <div>
              <label>
                Chọn ảnh từ máy
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
              {file && <small>Đã chọn: {file.name}</small>}
              <label>
                Mô tả ảnh (không bắt buộc)
                <input
                  maxLength={160}
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Ví dụ: Khu vực chăm sóc các bé"
                />
              </label>
              <button className="button" disabled={!file}>
                {busy ? "Đang xử lý…" : "Thêm ảnh vào carousel"}
              </button>
            </div>
            {preview && (
              <img
                className="gallery-upload-preview"
                src={preview}
                alt="Xem trước ảnh sẽ thêm"
              />
            )}
          </div>
        </fieldset>
      </form>
      <div className="gallery-admin-grid">
        {images.map((image) => (
          <article key={image.id}>
            <img src={image.url} alt={image.alt} loading="lazy" />
            <p>{image.alt}</p>
            <button
              className="button outline"
              type="button"
              disabled={busy}
              onClick={() => void remove(image)}
            >
              Xóa ảnh
            </button>
          </article>
        ))}
      </div>
      {!images.length && (
        <p className="muted">
          Chưa có ảnh. Carousel sẽ xuất hiện trên trang cửa hàng sau khi bạn
          thêm ảnh đầu tiên.
        </p>
      )}
    </section>
  );
}
