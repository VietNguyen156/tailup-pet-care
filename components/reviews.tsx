"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { request } from "@/lib/client";
export function Reviews({
  productId,
  reviews,
}: {
  productId: string;
  reviews: { id: string; name: string; rating: number; comment: string }[];
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <section className="reviews-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">TỪ TRẢI NGHIỆM CỦA BẠN</span>
          <h2>Đánh giá sản phẩm</h2>
        </div>
      </div>
      <div className="two-columns">
        <div>
          {reviews.length ? (
            reviews.map((r) => (
              <article className="review" key={r.id}>
                <strong>{r.name}</strong>
                <span className="review-stars">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
                <p>{r.comment}</p>
              </article>
            ))
          ) : (
            <p className="muted">
              Chưa có đánh giá. Bạn có thể chia sẻ sau khi hoàn thành đơn hàng.
            </p>
          )}
        </div>
        <form
          className="panel form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget,
              data = new FormData(form);
            setBusy(true);
            setError("");
            try {
              await request("/api/reviews", {
                method: "POST",
                body: JSON.stringify({
                  productId,
                  rating: Number(data.get("rating")),
                  comment: data.get("comment"),
                }),
              });
              form.reset();
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h3>
            <Star size={18} /> Chia sẻ cảm nhận
          </h3>
          <label>
            Số sao
            <select name="rating">
              <option value="5">5 — Rất hài lòng</option>
              <option value="4">4 — Hài lòng</option>
              <option value="3">3 — Bình thường</option>
              <option value="2">2 — Chưa hài lòng</option>
              <option value="1">1 — Không hài lòng</option>
            </select>
          </label>
          <label>
            Nhận xét
            <textarea
              name="comment"
              minLength={5}
              maxLength={2000}
              required
              placeholder="Điều bạn và bé thích ở sản phẩm này…"
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Đang gửi…" : "Gửi đánh giá"}
          </button>
        </form>
      </div>
    </section>
  );
}
