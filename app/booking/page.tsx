import { getServices, previewMode } from "@/lib/catalog";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { BookingForm } from "@/components/booking-form";
export const dynamic = "force-dynamic";
export const metadata = { title: "Đặt lịch chăm sóc" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [user, services, query] = await Promise.all([
    currentUser(),
    getServices(),
    searchParams,
  ]);
  const [pets, staff] = previewMode
    ? [[], []]
    : await Promise.all([
        user
          ? db.pet.findMany({
              where: { userId: user.id },
              select: { id: true, name: true, type: true },
            })
          : [],
        db.user.findMany({
          where: { role: "STAFF" },
          select: { id: true, name: true },
        }),
      ]);
  return (
    <div className="container page-space">
      <div className="page-intro compact">
        <span className="eyebrow">MÌNH HẸN NHAU NHÉ</span>
        <h1>
          Một cuộc hẹn <em>cho bé.</em>
        </h1>
        <p>Vài bước đơn giản, thêm một ngày được yêu thương.</p>
      </div>
      <BookingForm
        services={services}
        pets={pets}
        staff={staff}
        loggedIn={Boolean(user)}
        selectedService={query.service}
      />
    </div>
  );
}
