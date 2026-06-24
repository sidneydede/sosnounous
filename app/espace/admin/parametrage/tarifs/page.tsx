import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { TarifManager } from "@/components/account/TarifManager";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — Tarifs", description: "Gestion des barèmes." });

export default async function AdminTarifsPage() {
  await requireRole([ROLES.ADMIN], "/espace/admin/parametrage/tarifs");
  const entries = await prisma.tarif.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <Link href="/espace/admin/parametrage" className="text-sm font-medium text-brand-700 hover:underline">
        ← Paramétrage
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-900">Barèmes &amp; tarifs indicatifs</h1>
      <p className="mt-2 text-ink-soft">
        Les barèmes publiés s&apos;affichent sur la page Tarifs publique. La demande de devis reste
        gratuite et sans engagement.
      </p>
      <div className="mt-6">
        <TarifManager entries={entries} />
      </div>
    </div>
  );
}
