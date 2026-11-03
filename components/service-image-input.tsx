"use client";
import { useEffect, useState } from "react";

export function serviceFormBody(
  data: object,
  file?: FormDataEntryValue | null,
) {
  const body = new FormData();
  body.set("data", JSON.stringify(data));
  if (file instanceof File && file.size) body.set("image", file);
  return body;
}

export function ServiceImageInput({ currentUrl }: { currentUrl?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <div className="service-image-input">
      <label>
        Ảnh minh họa dịch vụ (tùy chọn)
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            const invalid =
              selected &&
              (!["image/jpeg", "image/png", "image/webp"].includes(
                selected.type,
              ) ||
                selected.size > 2 * 1024 * 1024);
            event.target.setCustomValidity(
              invalid ? "Chọn ảnh JPG, PNG hoặc WebP tối đa 2 MB." : "",
            );
            setError(invalid ? "Chọn ảnh JPG, PNG hoặc WebP tối đa 2 MB." : "");
            setFile(invalid ? null : selected);
          }}
        />
      </label>
      <small>
        JPG, PNG hoặc WebP, tối đa 2 MB. Khuyến nghị ảnh ngang 1200 × 800 px.
      </small>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {(preview || currentUrl) && (
        <img
          src={preview || currentUrl}
          alt="Xem trước ảnh dịch vụ"
          style={{
            width: "100%",
            maxWidth: 360,
            maxHeight: 240,
            objectFit: "contain",
            borderRadius: 8,
          }}
        />
      )}
    </div>
  );
}
