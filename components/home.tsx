import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  PawPrint,
  ShieldCheck,
  Heart,
  Clock3,
  Check,
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
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-pill">
              <span /> CHO NHỮNG NGƯỜI BẠN BỐN CHÂN
            </div>
            <h1>
              Chăm chút mỗi ngày.
              <br />
              <em>Thương yêu</em>
              <br />
              thật nhiều.
            </h1>
            <p>
              Từ một buổi spa thư giãn đến món đồ bé thích.
              <br className="desktop-break" /> TailUp ở đây, cùng bạn chăm sóc
              người bạn nhỏ.
            </p>
            <div className="hero-buttons">
              <Link href="/booking" className="button">
                Đặt lịch cho bé <ArrowUpRight size={19} />
              </Link>
              <Link href="/services" className="text-link">
                Khám phá dịch vụ <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-bottom">
              <div className="little-paws">
                <PawPrint />
                <Heart />
                <PawPrint />
              </div>
              <div>
                Vì mỗi bé đều xứng đáng
                <br />
                <strong>được chăm sóc theo cách riêng.</strong>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <span className="hero-scribble">
              a little care,
              <br />a lot of love.
            </span>
            <img
              src="/pawly-friends.svg"
              alt="Minh họa chú chó màu vàng và mèo ngồi cạnh nhau"
              className="hero-pets"
            />
            <div className="floating-note note-top">
              <span>♡</span>
              <div>
                Nhẹ nhàng với bé
                <br />
                <strong>Yên tâm cho bạn</strong>
              </div>
            </div>
            <div className="floating-note note-bottom">
              <PawPrint size={24} />
              <div>
                Hôm nay bé muốn
                <br />
                <strong>được cưng chiều!</strong>
              </div>
            </div>
            <span className="hero-stamp">
              TAILUP CARE CLUB
              <br />
              <PawPrint size={23} /> GOOD DAYS, HAPPY PAWS
            </span>
          </div>
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
      <section className="section container">
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
      <section className="about-section" id="about">
        <div className="container about-grid">
          <div className="about-illustration">
            <div className="about-label">HERE, THEY’RE FAMILY.</div>
            <img
              src="/pawly-cat.svg"
              alt="Chú mèo thư giãn trên chiếc đệm"
              loading="lazy"
            />
            <span className="about-sticker">
              Những điều nhỏ.
              <br />
              <em>Tình yêu lớn.</em>
            </span>
          </div>
          <div className="about-copy">
            <span className="eyebrow">CHÀO BẠN, CHÚNG MÌNH LÀ TAILUP</span>
            <h2>
              Không chỉ là chăm sóc.
              <br />
              Là hiểu điều bé cần.
            </h2>
            <p>
              Có bé thích làm quen thật chậm. Có bé chỉ cần một cái vuốt ve.
              Chúng mình bắt đầu từ những điều nhỏ ấy để mỗi lần ghé TailUp đều
              là một trải nghiệm dễ chịu.
            </p>
            <ul className="check-list">
              <li>
                <Check /> Trao đổi rõ ràng trước mỗi buổi chăm sóc
              </li>
              <li>
                <Check /> Hồ sơ và lịch hẹn của bé, luôn trong tầm tay
              </li>
              <li>
                <Check /> Chọn dịch vụ phù hợp, xem giá trước khi đặt
              </li>
            </ul>
            <Link href="/dashboard/pets" className="button outline">
              Tạo hồ sơ cho bé <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
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
      <section className="container care-banner">
        <div>
          <span className="eyebrow">BẮT ĐẦU TỪ MỘT CUỘC HẸN</span>
          <h2>
            Một ngày thật xinh
            <br />
            đang chờ bé.
          </h2>
          <p>Chọn dịch vụ, chọn giờ. Phần chăm chút để TailUp lo.</p>
          <Link href="/booking" className="button light">
            Đặt lịch ngay <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className="banner-paw">
          <PawPrint />
          <span>
            see you
            <br />
            <em>soon!</em>
          </span>
        </div>
      </section>
    </>
  );
}
