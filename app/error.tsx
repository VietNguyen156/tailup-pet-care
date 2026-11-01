"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="error-page">
      <span className="eyebrow">MỘT CHÚT GIÁN ĐOẠN</span>
      <h1>Chưa tải được dữ liệu.</h1>
      <p>
        Vui lòng thử lại sau. Nếu bạn vừa cài dự án, hãy kiểm tra MySQL,
        DATABASE_URL và chạy migration theo README.
      </p>
      <div className="hero-buttons">
        <button className="button" onClick={reset}>
          Thử lại
        </button>
        <Link className="text-link" href="/">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
