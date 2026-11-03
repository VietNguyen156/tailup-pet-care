import Link from "next/link";
import { PawPrint, ArrowUpRight, Heart } from "lucide-react";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Link href="/" className="logo" prefetch={false}>
            <PawPrint />
            TailUp.
          </Link>
          <p>
            Một nơi nhỏ.
            <br />
            Thật nhiều yêu thương.
          </p>
        </div>
        <div>
          <h3>Khám phá TailUp</h3>
          <Link href="/services" prefetch={false}>
            Dịch vụ chăm sóc
          </Link>
          <Link href="/shop" prefetch={false}>
            Đồ dùng cho bé
          </Link>
          <Link href="/journal" prefetch={false}>
            Góc chăm sóc
          </Link>
        </div>
        <div>
          <h3>Dành cho bạn</h3>
          <Link href="/dashboard/pets" prefetch={false}>
            Hồ sơ thú cưng
          </Link>
          <Link href="/dashboard/bookings" prefetch={false}>
            Lịch hẹn của tôi
          </Link>
          <Link href="/dashboard/orders" prefetch={false}>
            Đơn hàng của tôi
          </Link>
        </div>
        <div className="footer-note">
          <span className="eyebrow">MÌNH HẸN NHAU NHÉ?</span>
          <Link href="/booking" prefetch={false}>
            Một buổi chăm sóc
            <br />
            cho người bạn nhỏ <ArrowUpRight />
          </Link>
          <small>Khung giờ đặt lịch: 09:00–18:00 mỗi ngày.</small>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} TailUp. Made with care{" "}
          <Heart size={13} />
        </span>
        <span>Website mẫu · Thông tin dịch vụ và sản phẩm minh họa</span>
      </div>
    </footer>
  );
}
