import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  PawPrint,
  ShieldCheck,
  Heart,
  Clock3,
} from "lucide-react";
import { ServiceCard, type ServiceView } from "./service-card";
import { ProductCard, type ProductView } from "./product-card";
export function Home({
  services,
  products,
}: {
  services: ServiceView[];
  products: ProductView[];
}) {
  return (
    <>
      <section className="reference-hero">
        <div className="container reference-hero-grid">
          <div className="reference-hero-copy">
            <span className="eyebrow">MỘT CHÚT CHĂM SÓC, THẬT NHIỀU YÊU THƯƠNG</span>
            <h1>Chăm chút mỗi ngày,<br /><em>yêu thương trọn vẹn.</em></h1>
            <p>Một lần tắm thơm, một bộ lông gọn gàng. Cùng TailUp chuẩn bị những buổi grooming cho bé — từ chọn dịch vụ, xem giá đến đặt lịch.</p>
            <div className="hero-buttons"><Link href="/booking" className="button">Đặt lịch chăm sóc <ArrowRight size={19} /></Link><Link href="#services" className="text-link">Khám phá dịch vụ <ArrowRight size={18} /></Link></div>
            <div className="reference-hero-note"><PawPrint size={20} /> Cho những người bạn nhỏ, và người thương các bé.</div>
          </div>
          <figure className="reference-hero-image"><img src="/tailup-companions.webp" alt="Chú chó Golden và mèo xám trắng ngồi bên nhau" width={1100} height={1100} fetchPriority="high" /><figcaption><Heart size={23} /><span>Những điều nhỏ bé.<br /><strong>Một tình yêu thật lớn.</strong></span><PawPrint size={24} /></figcaption></figure>
        </div>
      </section>
      <div className="trust-strip">
        <div className="container">
          <span>
            <Heart /> Chăm sóc bằng sự thấu hiểu
          </span>
          <span>
            <ShieldCheck /> Quy trình rõ ràng
          </span>
          <span>
            <Clock3 /> Đặt lịch, chủ động thời gian
          </span>
          <span>
            <PawPrint /> Dành riêng cho từng bé
          </span>
        </div>
      </div>
      <section className="section container" id="services">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MỘT CHÚT CHĂM CHÚT</span>
            <h2>Bé cần gì, có TailUp.</h2>
          </div>
          <Link href="/services" className="text-link">
            Tất cả dịch vụ <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className="services-grid">
          {services.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </div>
      </section>
      <section className="booking-guide container section" id="how-it-works"><span className="eyebrow">DỄ DÀNG TỪ BƯỚC ĐẦU TIÊN</span><h2>Một lịch hẹn, ba bước nhỏ.</h2><ol><li><span>01</span><h3>Thêm hồ sơ của bé</h3><p>Cho chúng mình biết tên, giống và những điều cần lưu ý khi chăm sóc bé.</p></li><li><span>02</span><h3>Chọn dịch vụ & khung giờ</h3><p>Xem trước giá, thời lượng và chọn lịch phù hợp với bạn.</p></li><li><span>03</span><h3>Xác nhận và theo dõi</h3><p>Kiểm tra thông tin và theo dõi trạng thái trong tài khoản của bạn.</p></li></ol></section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MÓN ĐỒ NHỎ, NIỀM VUI TO</span>
            <h2>Bé thích. Bạn yên tâm.</h2>
          </div>
          <Link href="/shop" className="text-link">
            Ghé cửa hàng <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className="products-grid">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <section className="container section faq-section" id="faq"><div><span className="eyebrow">BẠN CÓ THỂ ĐANG BĂN KHOĂN</span><h2>Mình giải đáp nhé.</h2><p>Một vài điều cần biết trước buổi hẹn của bé.</p></div><div><details><summary>Đặt lịch chăm sóc cho bé như thế nào?</summary><p>Đăng nhập, thêm hồ sơ thú cưng, rồi chọn dịch vụ và khung giờ ở trang Đặt lịch. Kiểm tra thông tin trước khi xác nhận.</p></details><details><summary>Tôi có thể xem giá trước khi đặt không?</summary><p>Có. Giá và thời lượng được hiển thị trong danh sách dịch vụ và trong quá trình đặt lịch để bạn cân nhắc trước khi xác nhận.</p></details><details><summary>Tôi xem hoặc hủy lịch hẹn ở đâu?</summary><p>Vào Tài khoản → Lịch hẹn để xem trạng thái. Với lịch đang chờ hoặc đã xác nhận, bạn có thể chọn Hủy lịch.</p></details></div></section>
    </>
  );
}
