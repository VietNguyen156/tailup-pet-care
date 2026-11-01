import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { ServiceIcon } from "./icons";
import { money } from "@/lib/utils";
export type ServiceView = {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon: string;
  price: number;
  durationMinutes: number;
  description: string;
  process: unknown;
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
      <div className="service-card-top">
        <span className="service-icon">
          <ServiceIcon name={service.icon} />
        </span>
        <span className="small-number">0{index + 1}</span>
      </div>
      <span className="eyebrow">{service.category}</span>
      <Link href={`/services/${service.slug}`}>
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
          href={`/booking?service=${service.id}`}
          className="round-link"
          aria-label={`Đặt lịch ${service.name}`}
        >
          <ArrowUpRight />
        </Link>
      </div>
    </article>
  );
}
