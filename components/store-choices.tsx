import Link from "next/link";
import { ArrowRight, MapPin, PawPrint, Phone } from "lucide-react";
import type { StoreDirectoryItem } from "@/lib/store-directory";

export function StoreChoices({
  stores,
}: {
  stores: StoreDirectoryItem[];
}) {
  if (!stores.length)
    return (
      <p className="empty-state">Chưa có cửa hàng đang hoạt động.</p>
    );

  return (
    <div className="tenant-store-grid">
      {stores.map((store) => (
        <article key={store.id} className="panel store-choice-card">
          <span className="store-choice-icon">
            <PawPrint size={22} />
          </span>
          <div>
            <span className="eyebrow">CỬA HÀNG TRÊN TAILUP</span>
            <h2>{store.name}</h2>
          </div>
          <p>{store.description}</p>
          {store.address && (
            <p className="store-choice-detail">
              <MapPin size={16} />
              {store.address}
            </p>
          )}
          {store.phone && (
            <p className="store-choice-detail">
              <Phone size={16} />
              {store.phone}
            </p>
          )}
          <Link className="button" href={store.servicesHref}>
            Xem dịch vụ tại cửa hàng này <ArrowRight size={17} />
          </Link>
        </article>
      ))}
    </div>
  );
}
