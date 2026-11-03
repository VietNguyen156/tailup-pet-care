import Link from "next/link";
import { CalendarDays, Clock, PawPrint } from "lucide-react";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookingLabels, dateLabel, money } from "@/lib/utils";
import { StatusAction } from "@/components/status-action";
export const metadata = { title: "Lịch hẹn của tôi" };
export default async function Page() {
  const user = await requirePageUser();
  const bookings = await db.booking.findMany({
    where: { userId: user.id },
    include: {
      store: { select: { name: true, slug: true } },
      pet: true,
      service: true,
      staff: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">NHỮNG CUỘC HẸN NHỎ</span>
          <h1>Lịch hẹn của tôi</h1>
          <p className="muted">
            Theo dõi trạng thái và chuẩn bị cho lần ghé tiếp theo.
          </p>
        </div>
        <Link className="button" href="/booking">
          Đặt lịch mới
        </Link>
      </div>
      {bookings.length ? (
        bookings.map((b) => (
          <article className="list-card" key={b.id}>
            <Link
              className="tenant-product-store"
              href={`/stores/${b.store.slug}`}
            >
              {b.store.name}
            </Link>
            <div className="list-card-head">
              <div>
                <h3>{b.service.name}</h3>
                <p>
                  #{b.id.slice(-8).toUpperCase()} ·{" "}
                  {b.staff?.name ?? "TailUp sắp xếp nhân viên"}
                </p>
              </div>
              <span className={`badge ${b.status}`}>
                {bookingLabels[b.status]}
              </span>
            </div>
            <div className="list-card-details">
              <span>
                <PawPrint size={14} />
                {b.pet.name}
              </span>
              <span>
                <CalendarDays size={14} />
                {dateLabel(b.bookingDate)}
              </span>
              <span>
                <Clock size={14} />
                {b.timeSlot}
              </span>
            </div>
            {b.note && <p className="small-text">Ghi chú: {b.note}</p>}
            <div className="list-card-bottom">
              <span>
                Thanh toán tại cửa hàng <strong>{money(b.price)}</strong>
              </span>
              {["PENDING", "CONFIRMED"].includes(b.status) && (
                <StatusAction
                  url={`/api/bookings/${b.id}`}
                  status="CANCELLED"
                  label="Hủy lịch"
                  confirmMessage="Bạn muốn hủy lịch hẹn này?"
                />
              )}
            </div>
          </article>
        ))
      ) : (
        <div className="empty-state panel">
          <CalendarDays />
          <h2>Mình chưa có hẹn.</h2>
          <p>Chọn một dịch vụ và khung giờ phù hợp để đặt lịch cho bé.</p>
          <Link className="button" href="/booking">
            Đặt lịch đầu tiên
          </Link>
        </div>
      )}
      <p className="muted small-text mt-6">
        Hiển thị tối đa 100 lịch hẹn gần nhất.
      </p>
    </>
  );
}
