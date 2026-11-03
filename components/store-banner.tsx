"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { StoreWebsite } from "@/lib/store-website";
export function StoreBanner({
  banners,
  storeName,
  bookingUrl,
}: {
  banners: StoreWebsite["banners"];
  storeName: string;
  bookingUrl: string;
}) {
  const slides = banners
    .filter((b) => b.enabled && b.image)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const [index, setIndex] = useState(0);
  if (!slides.length) return null;
  const current = index % slides.length,
    slide = slides[current];
  return (
    <section
      className="store-banner"
      aria-roledescription="băng chuyền"
      aria-label="Hình ảnh cửa hàng"
    >
      <img
        key={slide.image}
        src={slide.image}
        alt={slide.title || `Hình ảnh ${storeName}`}
        fetchPriority="high"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/tailup-companions.webp";
        }}
      />
      <div className="store-banner-shade" />
      <div className="container store-banner-copy" aria-live="polite">
        <span className="eyebrow">{storeName} · CÙNG TAILUP CHĂM SÓC BÉ</span>
        <h1>{slide.title || storeName}</h1>
        {slide.description && <p>{slide.description}</p>}
        {slide.buttonText && (
          <Link className="button" href={slide.buttonUrl || bookingUrl}>
            {slide.buttonText} <ArrowRight size={17} />
          </Link>
        )}
      </div>
      {slides.length > 1 && (
        <div className="container store-banner-controls">
          <button
            aria-label="Banner trước"
            onClick={() =>
              setIndex((current + slides.length - 1) % slides.length)
            }
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Xem banner ${i + 1}`}
                aria-pressed={current === i}
                className={current === i ? "selected" : ""}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button
            aria-label="Banner tiếp theo"
            onClick={() => setIndex((current + 1) % slides.length)}
          >
            <ArrowRight size={18} />
          </button>
          <span>
            {current + 1} / {slides.length}
          </span>
        </div>
      )}
    </section>
  );
}
