"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { DOCUMENT_TYPES, documentTypeLabels } from "@/lib/documents";

/** Ajout d'un document pour la famille par l'agence (M7 — RG-26). */
export function AddDocumentForm({ demandeId }: { demandeId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demandeId,
          type: String(fd.get("type") ?? ""),
          title: String(fd.get("title") ?? ""),
          url: String(fd.get("url") ?? ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.errors?.url ?? json.errors?.title ?? json.error ?? "Ajout impossible.");
        return;
      }
      form.reset();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={add} className="grid gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 sm:grid-cols-2">
      <div>
        <label htmlFor="type" className="mb-1 block text-sm font-medium text-brand-900">Type</label>
        <select id="type" name="type" className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm">
          {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{documentTypeLabels[t]}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-brand-900">Titre</label>
        <input id="title" name="title" required className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm" placeholder="Ex. Devis garde régulière" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="url" className="mb-1 block text-sm font-medium text-brand-900">Lien du document (URL)</label>
        <input id="url" name="url" type="url" required className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm" placeholder="https://…" />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" variant="primary" size="sm" disabled={busy}>
          {busy ? "Ajout…" : "Mettre le document à disposition"}
        </Button>
      </div>
    </form>
  );
}
