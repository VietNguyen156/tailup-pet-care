import { catalogStoreId } from "@/lib/catalog-scope";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceById, getServices, previewMode } from "@/lib/catalog";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { BookingForm } from "@/components/booking-form";
export const dynamic = "force-dynamic";
export const metadata = { title: "Đặt lịch chăm sóc" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; store?: string }>;
}) {
  const query = await searchParams;
  const user = await currentUser();
  const stores = previewMode
    ? [{ id: "store-tailup", slug: "tailup", name: "TailUp" }]
    : await db.store.findMany({
        where: { isActive: true, id: await catalogStoreId() },
        select: { id: true, slug: true, name: true },
        orderBy: { name: "asc" },
      });
  const selectedService = query.service
    ? await getServiceById(query.service)
    : undefined;
  if (query.service && !selectedService) notFound();
  const store = query.store
    ? stores.find((s) => s.slug === query.store)
    : stores.find((s) => s.id === selectedService?.storeId);
  if (query.store && !store) notFound();
  if (store && selectedService && selectedService.storeId !== store.id)
    notFound();
  if (!store)
    return (
      <div className="container page-space">
        <h1>Bạn muốn đặt lịch ở đâu?</h1>
        <p>Chọn cửa hàng trước khi xem dịch vụ và lịch trống.</p>
        <div className="tenant-store-grid">
          {stores.map((s) => (
            <Link
              className="panel"
              href={`/booking?store=${s.slug}`}
              key={s.id}
            >
              <h2>{s.name}</h2>
              <span className="text-link">Chọn cửa hàng →</span>
            </Link>
          ))}
        </div>
        {!stores.length && <p>Chưa có cửa hàng hoạt động.</p>}
      </div>
    );
  const [services, pets] = await Promise.all([
    getServices(store.id),
    user && !previewMode
      ? db.pet.findMany({
          where: { userId: user.id },
          select: { id: true, name: true, type: true },
        })
      : [],
  ]);
  return (
    <div className="container page-space">
      <div className="page-intro compact">
        <Link className="back-link" href={`/stores/${store.slug}`}>
          ← {store.name}
        </Link>
        <h1>Đặt lịch tại {store.name}</h1>
        <p>
          Dịch vụ và khung giờ của cửa hàng bạn đã chọn.{" "}
          <Link className="text-link" href="/booking">
            Đổi cửa hàng
          </Link>
        </p>
      </div>
      <BookingForm
        key={store.id}
        services={services}
        pets={pets}
        staff={[]}
        loggedIn={Boolean(user)}
        selectedService={query.service}
      />
    </div>
  );
}
