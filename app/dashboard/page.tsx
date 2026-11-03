import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  PawPrint,
  Plus,
  Clock3,
  BookOpen,
} from "lucide-react";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookingLabels, dateLabel, petLabel } from "@/lib/utils";
export const metadata = { title: "Trang chủ của bạn" };
export default async function Page() {
  const user = await requirePageUser();
  const [pets, bookings, petCount, bookingCount] = await Promise.all([
    db.pet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    db.booking.findMany({
      where: { userId: user.id },
      include: { pet: true, service: true, store: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    db.pet.count({ where: { userId: user.id } }),
    db.booking.count({
      where: {
        userId: user.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        bookingDate: {
          gte: new Date(
            new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10),
          ),
        },
      },
    }),
  ]);
  return (
    <div className="overview">
      <div className="overview-heading">
        <div>
          <span className="eyebrow">GÓC NHỎ CỦA BẠN VÀ BÉ</span>
          <h1>Xin chào, {user.name}.</h1>
          <p>Cùng chăm chút cho những ngày vui khỏe của bé.</p>
        </div>
        <Link className="text-link" href="/dashboard/profile">
          Tài khoản của tôi <ArrowRight size={16} />
        </Link>
      </div>
      <section className="welcome-card">
        <div>
          <span className="eyebrow">MỘT CHÚT CHĂM SÓC MỖI NGÀY</span>
          <h2>
            Một buổi hẹn nhỏ,
            <br />
            để bé thêm vui.
          </h2>
          <p>
            Chọn dịch vụ, xem giá và tìm khung giờ phù hợp.
            <br />
            Mọi lịch hẹn của bé đều được lưu tại đây.
          </p>
          <Link href="/booking" className="button">
            Đặt lịch chăm sóc <ArrowRight size={18} />
          </Link>
        </div>
        <img
          src="/tailup-companions.webp"
          alt="Chó Golden và mèo ngồi bên nhau trên tấm chăn mềm"
          width={400}
          height={350}
        />
      </section>
      <div className="overview-shortcuts">
        <Link href="/dashboard/pets">
          <PawPrint />
          <div>
            <strong>{petCount} thú cưng</strong>
            <span>Quản lý hồ sơ của bé</span>
          </div>
          <ArrowRight />
        </Link>
        <Link href="/dashboard/bookings">
          <CalendarDays />
          <div>
            <strong>{bookingCount} lịch hẹn từ hôm nay</strong>
            <span>Đang chờ hoặc đã xác nhận</span>
          </div>
          <ArrowRight />
        </Link>
        <Link href="/services">
          <Clock3 />
          <div>
            <strong>Tìm dịch vụ phù hợp</strong>
            <span>Xem giá và thời lượng</span>
          </div>
          <ArrowRight />
        </Link>
      </div>
      <div className="overview-columns">
        <section className="overview-panel">
          <div className="overview-panel-heading">
            <h2>Thú cưng của tôi</h2>
            <Link href="/dashboard/pets">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          {pets.length ? (
            pets.map((p) => (
              <Link className="overview-row" href="/dashboard/pets" key={p.id}>
                <span className="overview-icon">
                  <PawPrint />
                </span>
                <div>
                  <strong>{p.name}</strong>
                  <span>{p.breed || petLabel(p.type)}</span>
                </div>
                <ArrowRight size={16} />
              </Link>
            ))
          ) : (
            <div className="overview-empty">
              <span className="overview-icon">
                <PawPrint />
              </span>
              <h3>Làm quen với người bạn nhỏ</h3>
              <p>
                Thêm tên, giống và thông tin của bé để đặt lịch thuận tiện hơn.
              </p>
              <Link className="button outline" href="/dashboard/pets">
                <Plus size={16} /> Thêm thú cưng đầu tiên
              </Link>
            </div>
          )}
        </section>
        <section className="overview-panel">
          <div className="overview-panel-heading">
            <h2>Lịch hẹn gần đây</h2>
            <Link href="/dashboard/bookings">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          {bookings.length ? (
            bookings.map((b) => (
              <Link
                className="overview-row"
                href="/dashboard/bookings"
                key={b.id}
              >
                <span className="overview-icon">
                  <CalendarDays />
                </span>
                <div>
                  <strong>
                    {b.store.name} · {b.service.name} · {b.pet.name}
                  </strong>
                  <span>
                    {dateLabel(b.bookingDate)} · {b.timeSlot}
                  </span>
                  <span className={`badge ${b.status}`}>
                    {bookingLabels[b.status]}
                  </span>
                </div>
                <ArrowRight size={16} />
              </Link>
            ))
          ) : (
            <div className="overview-empty">
              <span className="overview-icon">
                <CalendarDays />
              </span>
              <h3>Buổi chăm sóc đầu tiên đang chờ</h3>
              <p>
                Tắm thơm hay tỉa lông gọn gàng? Khám phá dịch vụ trước khi chọn
                lịch cho bé.
              </p>
              <Link className="button outline" href="/services">
                Khám phá dịch vụ <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>
      </div>
      <section className="getting-started">
        <div>
          <span className="eyebrow">CHUẨN BỊ CHO LẦN GHÉ TỚI</span>
          <h2>Đặt lịch thật dễ, chỉ 3 bước.</h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <strong>Thêm hồ sơ của bé</strong>
              <p>Lưu thông tin và những điều cần lưu ý.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Chọn dịch vụ & thời gian</strong>
              <p>Xem giá trước khi xác nhận lịch hẹn.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Theo dõi lịch hẹn</strong>
              <p>Kiểm tra trạng thái trong mục Lịch hẹn.</p>
            </div>
          </li>
        </ol>
        <Link href="/journal" className="text-link">
          <BookOpen size={17} /> Đọc thêm cách chăm sóc bé{" "}
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
