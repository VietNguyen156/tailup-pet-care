import { catalogStoreId } from "@/lib/catalog-scope";
import Link from "next/link";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = { title: "Các cửa hàng trên TailUp" };
export default async function Page() {
  const stores = await db.store.findMany({
    where: { isActive: true, id: await catalogStoreId() },
    orderBy: { name: "asc" },
  });
  return (
    <div className="container page-space">
      <div className="page-intro">
        <span className="eyebrow">CÙNG TAILUP CHĂM SÓC BÉ</span>
        <h1>Tìm một cửa hàng phù hợp.</h1>
        <p>
          Một tài khoản dùng chung. Chọn cửa hàng để xem dịch vụ, sản phẩm và
          đặt lịch.
        </p>
      </div>
      <div className="tenant-store-grid">
        {stores.map((s) => (
          <article key={s.id} className="panel">
            <span className="eyebrow">CỬA HÀNG TRÊN TAILUP</span>
            <h2>{s.name}</h2>
            <p>{s.description}</p>
            {s.address && <p>{s.address}</p>}
            {s.phone && <p>Điện thoại: {s.phone}</p>}
            <Link className="button" href={`/stores/${s.slug}`}>
              Ghé cửa hàng
            </Link>
          </article>
        ))}
      </div>
      {!stores.length && (
        <p className="empty-state">Chưa có cửa hàng đang hoạt động.</p>
      )}
    </div>
  );
}
