"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { GalleryPhoto } from "@/lib/gallery-types";

export function StoreGallery({
  images,
  storeName,
}: {
  images: GalleryPhoto[];
  storeName: string;
}) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setTimeout(() => {
      setIndex((previous) => (previous + 1) % images.length);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [index, images.length]);

  if (!images.length) return null;
  const current = index % images.length,
    photo = images[current];
  const change = (step: number) =>
    setIndex((current + step + images.length) % images.length);
  return (
    <section
      className="container section store-gallery"
      aria-labelledby="store-gallery-title"
      id="store-gallery"
    >
      <div className="store-section-heading">
        <div>
          <span className="eyebrow">NHỮNG KHOẢNH KHẮC TẠI CỬA HÀNG</span>
          <h2 id="store-gallery-title">Một góc {storeName}</h2>
        </div>
      </div>
      <div
        className="store-gallery-stage"
        role="region"
        aria-roledescription="băng chuyền"
        aria-label={`Ảnh của ${storeName}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            change(e.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        <figure>
          <img src={photo.url} alt={photo.alt} loading="eager" />
          <figcaption>{photo.alt}</figcaption>
        </figure>
        {images.length > 1 && (
          <>
            <button
              className="gallery-prev"
              type="button"
              aria-label="Ảnh cửa hàng trước"
              onClick={() => change(-1)}
            >
              <ArrowLeft />
            </button>
            <button
              className="gallery-next"
              type="button"
              aria-label="Ảnh cửa hàng tiếp theo"
              onClick={() => change(1)}
            >
              <ArrowRight />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
