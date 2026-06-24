"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/forms/Field";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

export interface ReferenceItem {
  id: string;
  employerName: string;
  contact: string | null;
  relationship: string | null;
  status: string;
}

const statusTone: Record<string, "success" | "neutral" | "accent"> = {
  VERIFIED: "success",
  PENDING: "neutral",
  REJECTED: "accent",
};
const statusLabel: Record<string, string> = {
  VERIFIED: "Vérifiée",
  PENDING: "En attente",
  REJECTED: "Rejetée",
};

export function ReferencesManager({ references }: { references: ReferenceItem[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    setLoading(true);
    try {
      const res = await fetch("/api/account/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employerName: String(fd.get("employerName") ?? ""),
          contact: String(fd.get("contact") ?? ""),
          relationship: String(fd.get("relationship") ?? ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.errors?.employerName ?? json.error ?? "Ajout impossible.");
        return;
      }
      form.reset();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/account/references/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {references.length > 0 ? (
        <ul className="space-y-2">
          {references.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white p-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-brand-900">{r.employerName}</p>
                <p className="truncate text-sm text-ink-muted">
                  {[r.relationship, r.contact].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={statusTone[r.status] ?? "neutral"}>{statusLabel[r.status] ?? r.status}</Badge>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  className="text-ink-muted hover:text-red-600"
                  aria-label={`Supprimer la référence ${r.employerName}`}
                >
                  <Icon name="close" className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Aucune référence ajoutée pour le moment.</p>
      )}

      <form onSubmit={add} className="grid gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 sm:grid-cols-3">
        <TextField id="employerName" name="employerName" label="Employeur" required />
        <TextField id="relationship" name="relationship" label="Lien (ex. ancienne famille)" />
        <TextField id="contact" name="contact" label="Contact (tél./e-mail)" />
        {error && (
          <p className="text-sm text-red-600 sm:col-span-3" role="alert">
            {error}
          </p>
        )}
        <div className="sm:col-span-3">
          <Button type="submit" variant="primary" size="sm" disabled={loading}>
            {loading ? "Ajout…" : "Ajouter une référence"}
          </Button>
        </div>
      </form>
    </div>
  );
}
