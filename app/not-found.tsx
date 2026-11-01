import Link from "next/link";
export default function NotFound() {
  return (
    <div className="error-page">
      <span className="eyebrow">404 / ĐI LẠC MỘT CHÚT</span>
      <h1>Bé tìm trang nào vậy?</h1>
      <p>
        Trang này chưa có hoặc đã được chuyển đi. Mình quay về trang chủ nhé.
      </p>
      <Link className="button" href="/">
        Về trang chủ
      </Link>
    </div>
  );
}
