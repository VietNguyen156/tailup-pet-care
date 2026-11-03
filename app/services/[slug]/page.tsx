import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Clock, Check } from "lucide-react";
import { getServices } from "@/lib/catalog";
import { ServiceIcon } from "@/components/icons";
import { money } from "@/lib/utils";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = (await getServices()).find((s) => s.slug === slug);
  if (!service) notFound();
  return (
    <div className="container page-space">
      <Link
        className="back-link"
        href={`/stores/${service.store.slug}/services`}
      >
        ← Tất cả dịch vụ
      </Link>
      <div className="detail-grid">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            style={{
              width: "100%",
              maxHeight: 600,
              objectFit: "contain",
              borderRadius: 12,
            }}
          />
        ) : (
          <div className="service-detail-art">
            <ServiceIcon name={service.icon} />
            <span>TAILUP CARE CLUB</span>
            <h2>
              Một chút chăm chút.
              <br />
              Thật nhiều yêu thương.
            </h2>
          </div>
        )}
        <div>
          <Link
            className="tenant-product-store"
            href={`/stores/${service.store.slug}`}
          >
            {service.store.name}
          </Link>
          <span className="eyebrow">{service.category}</span>
          <h1 className="detail-title">{service.name}</h1>
          <p className="lead">{service.description}</p>
          <div className="detail-price">
            {money(service.price)}{" "}
            <small>
              <Clock size={16} />
              {service.durationMinutes} phút
            </small>
          </div>
          <h3>Buổi chăm sóc gồm những gì?</h3>
          <ol className="process-list">
            {(service.process as string[]).map((step, i) => (
              <li key={step}>
                <span>0{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="muted small-text">
            <Check size={15} /> Xem giá trước khi đặt · Theo dõi lịch trong tài
            khoản
          </p>
          <Link href={`/booking?service=${service.id}`} className="button">
            Đặt lịch dịch vụ này <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
