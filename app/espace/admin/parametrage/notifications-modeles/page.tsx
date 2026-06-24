import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { NOTIFICATION_EVENTS } from "@/lib/notificationEvents";
import {
  NotificationTemplateManager,
  type TemplateData,
} from "@/components/account/NotificationTemplateManager";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — Modèles de notifications", description: "Modèles éditables." });

export default async function NotificationTemplatesPage() {
  await requireRole([ROLES.ADMIN], "/espace/admin/parametrage/notifications-modeles");

  const rows = await prisma.notificationTemplate.findMany();
  const templates: Record<string, TemplateData> = {};
  for (const r of rows) {
    templates[r.event] = { subject: r.subject ?? "", body: r.body ?? "", enabled: r.enabled };
  }

  const events = Object.entries(NOTIFICATION_EVENTS).map(([key, def]) => ({
    key,
    label: def.label,
    critical: def.critical,
  }));

  return (
    <div>
      <Link href="/espace/admin/parametrage" className="text-sm font-medium text-brand-700 hover:underline">
        ← Paramétrage
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-900">Modèles de notifications</h1>
      <p className="mt-2 text-ink-soft">
        Personnalisez les notifications e-mail / SMS sans intervention technique (RG-41).
      </p>
      <div className="mt-6">
        <NotificationTemplateManager events={events} templates={templates} />
      </div>
    </div>
  );
}
