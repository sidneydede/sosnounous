import Link from "next/link";
import type { Service } from "@/lib/data/services";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col rounded-2xl border border-brand-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
    >
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-accent-50 group-hover:text-accent-600">
        <Icon name={service.icon as IconName} />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-brand-900">{service.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
        {service.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {service.frequencies.map((f) => (
          <Badge key={f} tone="neutral">
            {f}
          </Badge>
        ))}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-600">
        En savoir plus
        <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
