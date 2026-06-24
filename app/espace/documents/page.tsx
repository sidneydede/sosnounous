import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { documentTypeLabels, type DocumentType } from "@/lib/documents";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Mes documents", description: "Vos documents." });

export default async function DocumentsPage() {
  const me = await requireRole([ROLES.FAMILY], "/espace/documents");
  const documents = await prisma.document.findMany({
    where: { familyId: me.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Mes documents</h1>
      <p className="mt-2 text-ink-soft">
        Retrouvez vos devis, contrats, attestations et factures, en lecture seule.
      </p>

      {documents.length > 0 ? (
        <ul className="mt-6 divide-y divide-brand-100 rounded-2xl border border-brand-100 bg-white">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-brand-900">{d.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="neutral">{documentTypeLabels[d.type as DocumentType] ?? d.type}</Badge>
                  <span className="text-xs text-ink-muted">{new Date(d.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                <Icon name="arrow-right" className="h-4 w-4" /> Télécharger
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50 p-8 text-center">
          <Icon name="lock" className="mx-auto h-8 w-8 text-brand-400" />
          <p className="mt-2 text-sm text-ink-soft">
            Aucun document pour le moment. Vos devis et contrats apparaîtront ici dès que l&apos;agence
            les mettra à disposition.
          </p>
        </div>
      )}
    </div>
  );
}
