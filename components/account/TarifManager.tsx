"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export interface TarifRow {
  id: string;
  service: string;
  label: string;
  amount: string;
  unit: string | null;
  note: string | null;
  sortOrder: number;
  published: boolean;
}

const inputCls = "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm";

function Row({ entry }: { entry: TarifRow }) {
  const router = useRouter();
  const [service, setService] = useState(entry.service);
  const [label, setLabel] = useState(entry.label);
  const [amount, setAmount] = useState(entry.amount);
  const [unit, setUnit] = useState(entry.unit ?? "");
  const [order, setOrder] = useState(entry.sortOrder);
  const [busy, setBusy] = useState(false);

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/admin/tarifs/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    await fetch(`/api/admin/tarifs/${entry.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-brand-100 p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} aria-label="Libellé" placeholder="Libellé" />
        <input className={inputCls} value={service} onChange={(e) => setService(e.target.value)} aria-label="Service" placeholder="Service (ou Tous)" />
        <input className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Montant" placeholder="Montant" />
        <div className="flex items-center gap-2">
          <input className={inputCls} value={unit} onChange={(e) => setUnit(e.target.value)} aria-label="Unité" placeholder="/ mois, / heure…" />
          <input className="w-16 rounded-lg border border-brand-200 px-2 py-2 text-sm" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} aria-label="Ordre" />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="primary" disabled={busy} onClick={() => patch({ service, label, amount, unit, sortOrder: order })}>
          Enregistrer
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => patch({ published: !entry.published })}>
          {entry.published ? "Dépublier" : "Publier"}
        </Button>
        <span className={entry.published ? "text-xs text-emerald-700" : "text-xs text-ink-muted"}>
          {entry.published ? "Publié" : "Masqué"}
        </span>
        <button type="button" onClick={remove} disabled={busy} className="ml-auto text-ink-muted hover:text-red-600" aria-label="Supprimer">
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function TarifManager({ entries }: { entries: TarifRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/tarifs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: String(fd.get("service") ?? ""),
          label: String(fd.get("label") ?? ""),
          amount: String(fd.get("amount") ?? ""),
          unit: String(fd.get("unit") ?? ""),
          sortOrder: Number(fd.get("sortOrder") ?? 0),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.errors?.label ?? json.errors?.amount ?? json.error ?? "Ajout impossible.");
        return;
      }
      form.reset();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={create} className="space-y-2 rounded-xl border border-brand-100 bg-brand-50 p-4">
        <p className="text-sm font-semibold text-brand-900">Nouveau barème</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input name="label" required placeholder="Libellé (ex. Garde régulière)" className={inputCls} />
          <input name="service" placeholder="Service (ou Tous)" className={inputCls} />
          <input name="amount" required placeholder="Montant (ex. À partir de 80 000 FCFA)" className={inputCls} />
          <div className="flex items-center gap-2">
            <input name="unit" placeholder="/ mois, / heure…" className={inputCls} />
            <input name="sortOrder" type="number" defaultValue={0} className="w-20 rounded-lg border border-brand-200 px-2 py-2 text-sm" aria-label="Ordre" />
          </div>
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <Button type="submit" size="sm" variant="accent" disabled={busy}>Ajouter</Button>
      </form>

      <div className="space-y-3">
        {entries.length > 0 ? entries.map((e) => <Row key={e.id} entry={e} />) : (
          <p className="text-sm text-ink-muted">Aucun barème. La page Tarifs affiche les principes tarifaires généraux.</p>
        )}
      </div>
    </div>
  );
}
