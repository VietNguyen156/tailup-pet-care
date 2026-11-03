"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { request } from "@/lib/client";
import { websiteSchema, type StoreWebsite } from "@/lib/store-website";

export function WebsiteEditor({
  storeId,
  slug,
  initial,
}: {
  storeId: string;
  slug: string;
  initial: StoreWebsite;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const set = (key: keyof StoreWebsite, text: string) =>
    setValue((v) => ({ ...v, [key]: text }));
  const field = (
    key: keyof StoreWebsite,
    label: string,
    max: number,
    multiline = false,
  ) => (
    <label key={key}>
      {label}
      {multiline ? (
        <textarea
          rows={5}
          maxLength={max}
          value={String(value[key])}
          onChange={(e) => set(key, e.target.value)}
        />
      ) : (
        <input
          maxLength={max}
          value={String(value[key])}
          onChange={(e) => set(key, e.target.value)}
        />
      )}
    </label>
  );
  return (
    <details
      className="panel tenant-settings website-editor"
      id="website-editor"
    >
      <summary>Nội dung website</summary>
      <p>
        Thay đổi chỉ áp dụng cho website của cửa hàng này.{" "}
        <Link href={`/stores/${slug}`} className="text-link" target="_blank">
          Xem website ↗
        </Link>
      </p>
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setMessage("");
          const parsed = websiteSchema.safeParse(value);
          if (!parsed.success) {
            setError(parsed.error.issues[0].message);
            return;
          }
          setBusy(true);
          try {
            await request("/api/admin/website", {
              method: "PATCH",
              body: JSON.stringify({ storeId, website: parsed.data }),
            });
            setMessage(
              "Đã lưu. Nội dung mới đã hiển thị trên website cửa hàng.",
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
          <details open>
            <summary>Trang chủ</summary>
            <div className="form-stack">
              {field("headline", "Tiêu đề trang chủ", 160)}
              {field("introduction", "Lời giới thiệu ngắn", 1500, true)}
              {field("servicesTitle", "Tiêu đề khối dịch vụ", 160)}
              {field("productsTitle", "Tiêu đề khối sản phẩm", 160)}
              {field("informationTitle", "Tiêu đề khối thông tin", 160)}
              {field("bookingTitle", "Lời mời đặt lịch", 160)}
            </div>
          </details>
          <details>
            <summary>Giới thiệu</summary>
            <div className="form-stack">
              {field("aboutTitle", "Tiêu đề giới thiệu", 160)}
              {field("aboutText", "Nội dung giới thiệu", 8000, true)}
              {field(
                "aboutImage",
                "Đường dẫn ảnh giới thiệu (HTTPS hoặc ảnh banner đã tải lên)",
                1000,
              )}
            </div>
          </details>
          <details>
            <summary>Dịch vụ</summary>
            <div className="form-stack">
              {field("servicesIntro", "Lời giới thiệu dịch vụ", 1500, true)}
              <p>
                Thêm, sửa giá, quy trình và xóa từng dịch vụ tại tab Dịch vụ bên
                dưới.
              </p>
            </div>
          </details>
          <details>
            <summary>Thông tin & bài viết</summary>
            <div className="form-stack">
              {field(
                "informationIntro",
                "Lời giới thiệu trang thông tin",
                1500,
                true,
              )}
              {value.articles.map((article, i) => (
                <div className="panel form-stack" key={i}>
                  <h3>Bài viết {i + 1}</h3>
                  {(
                    [
                      ["title", "Tiêu đề", 160],
                      ["image", "Ảnh HTTPS (không bắt buộc)", 1000],
                      ["body", "Nội dung", 6000],
                    ] as const
                  ).map(([key, label, max]) => (
                    <label key={key}>
                      {label}
                      {key === "body" ? (
                        <textarea
                          rows={6}
                          maxLength={max}
                          value={article[key]}
                          onChange={(e) =>
                            setValue((v) => ({
                              ...v,
                              articles: v.articles.map((a, j) =>
                                j === i ? { ...a, [key]: e.target.value } : a,
                              ),
                            }))
                          }
                        />
                      ) : (
                        <input
                          maxLength={max}
                          value={article[key]}
                          onChange={(e) =>
                            setValue((v) => ({
                              ...v,
                              articles: v.articles.map((a, j) =>
                                j === i ? { ...a, [key]: e.target.value } : a,
                              ),
                            }))
                          }
                        />
                      )}
                    </label>
                  ))}
                  <button
                    type="button"
                    className="text-link"
                    onClick={() =>
                      setValue((v) => ({
                        ...v,
                        articles: v.articles.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    Xóa bài viết
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="button outline"
                disabled={value.articles.length >= 8}
                onClick={() =>
                  setValue((v) => ({
                    ...v,
                    articles: [
                      ...v.articles,
                      { title: "", body: "", image: "" },
                    ],
                  }))
                }
              >
                Thêm bài viết ({value.articles.length}/8)
              </button>
            </div>
          </details>
          <details>
            <summary>Liên hệ & giờ mở cửa</summary>
            <div className="form-stack">
              {field("contactIntro", "Lời nhắn liên hệ", 1500, true)}
              {field("email", "Email liên hệ", 191)}
              {field("hours", "Giờ mở cửa", 500, true)}
              {field(
                "facebook",
                "Đường dẫn Facebook / mạng xã hội (HTTPS)",
                500,
              )}
              <p>
                Tên cửa hàng, địa chỉ và số điện thoại được chỉnh tại mục Thông
                tin cửa hàng phía trên.
              </p>
            </div>
          </details>
        </fieldset>
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
        <button className="button" disabled={busy}>
          {busy ? "Đang lưu…" : "Lưu nội dung website"}
        </button>
      </form>
    </details>
  );
}
