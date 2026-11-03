import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { ServiceIcon } from "./icons";
import { money } from "@/lib/utils";
export type ServiceView = {
  id: string;
  storeId?: string;
  store?: { id: string; name: string; slug: string };
  name: string;
  slug: string;
  category: string;
  icon: string;
  price: number;
  durationMinutes: number;
  description: string;
  process: unknown;
  imageUrl?: string;
};
export function ServiceCard({
  service,
  index = 0,
}: {
  service: ServiceView;
  index?: number;
}) {
  return (
    <article className={`service-card service-${index % 4}`}>
      {service.imageUrl && (
        <Link
          href={`/services/${service.slug}`}
          aria-label={`Chi tiết ${service.name}`}
          prefetch={false}
        >
          <img
            src={service.imageUrl}
            alt={service.name}
            loading="lazy"
            style={{
              width: "100%",
              aspectRatio: "3 / 2",
              objectFit: "cover",
              borderRadius: 8,
              marginBottom: 20,
            }}
          />
        </Link>
      )}
      <div className="service-card-top">
        <span className="service-icon">
          <ServiceIcon name={service.icon} />
        </span>
        <span className="small-number">0{index + 1}</span>
      </div>
      <span className="eyebrow">{service.category}</span>
      {service.store && (
        <Link
          className="tenant-product-store"
          href={`/stores/${service.store.slug}`}
          prefetch={false}
        >
          {service.store.name}
        </Link>
      )}
      <Link href={`/services/${service.slug}`} prefetch={false}>
        <h3>{service.name}</h3>
      </Link>
      <p>{service.description}</p>
      <div className="service-card-bottom">
        <div>
          <strong>{money(service.price)}</strong>
          <small>
            <Clock size={13} /> {service.durationMinutes} phút
          </small>
        </div>
        <Link
          href={`/services/${service.slug}`}
          className="round-link"
          aria-label={`Chi tiết ${service.name}`}
          prefetch={false}
        >
          <ArrowUpRight />
        </Link>
      </div>
    </article>
  );
}
