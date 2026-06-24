import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { FaqManager } from "@/components/account/FaqManager";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — FAQ", description: "Gestion de la FAQ." });

export default async function AdminFaqPage() {
  await requireRole([ROLES.ADMIN], "/espace/admin/parametrage/faq");
  const entries = await prisma.faqEntry.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div>
      <Link href="/espace/admin/parametrage" className="text-sm font-medium text-brand-700 hover:underline">
        ← Paramétrage
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-900">FAQ</h1>
      <p className="mt-2 text-ink-soft">
        Les entrées publiées alimentent la page publique. Sans entrée, la FAQ par défaut s&apos;affiche.
      </p>
      <div className="mt-6">
        <FaqManager entries={entries} />
      </div>
    </div>
  );
}
