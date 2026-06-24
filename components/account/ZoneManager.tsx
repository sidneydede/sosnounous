"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export interface ZoneRow {
  id: string;
  name: string;
  sortOrder: number;
  active: boolean;
}

const inputCls = "rounded-lg border border-brand-200 px-3 py-2 text-sm";

function Row({ zone }: { zone: ZoneRow }) {
  const router = useRouter();
  const [name, setName] = useState(zone.name);
  const [order, setOrder] = useState(zone.sortOrder);
  const [busy, setBusy] = useState(false);

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/admin/zones/${zone.id}`, {
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
    await fetch(`/api/admin/zones/${zone.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <li className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-100 bg-white p-3">
      <input className={`${inputCls} flex-1`} value={name} onChange={(e) => setName(e.target.value)} aria-label="Nom de la zone" />
      <input className={`${inputCls} w-16`} type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} aria-label="Ordre" />
      <Button type="button" size="sm" variant="primary" disabled={busy} onClick={() => patch({ name, sortOrder: order })}>Enregistrer</Button>
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => patch({ active: !zone.active })}>
        {zone.active ? "Désactiver" : "Activer"}
      </Button>
      <span className={zone.active ? "text-xs text-emerald-700" : "text-xs text-ink-muted"}>{zone.active ? "Active" : "Inactive"}</span>
      <button type="button" onClick={remove} disabled={busy} className="ml-auto text-ink-muted hover:text-red-600" aria-label="Supprimer"><Icon name="close" className="h-5 w-5" /></button>
    </li>
  );
}

export function ZoneManager({ zones }: { zones: ZoneRow[] }) {
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
      const res = await fetch("/api/admin/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: String(fd.get("name") ?? ""), sortOrder: Number(fd.get("sortOrder") ?? 0) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.errors?.name ?? json.error ?? "Ajout impossible.");
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
      <form onSubmit={create} className="flex flex-wrap items-end gap-2 rounded-xl border border-brand-100 bg-cream p-4">
        <div className="flex-1">
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-brand-900">Nouvelle zone / commune</label>
          <input id="name" name="name" required placeholder="Ex. Cocody" className={`${inputCls} w-full`} />
        </div>
        <input name="sortOrder" type="number" defaultValue={0} className={`${inputCls} w-20`} aria-label="Ordre" />
        <Button type="submit" size="sm" variant="accent" disabled={busy}>Ajouter</Button>
        {error && <p className="w-full text-sm text-red-600" role="alert">{error}</p>}
      </form>

      {zones.length > 0 ? (
        <ul className="space-y-2">{zones.map((z) => <Row key={z.id} zone={z} />)}</ul>
      ) : (
        <p className="text-sm text-ink-muted">Aucune zone. Les communes par défaut sont utilisées sur le site.</p>
      )}
    </div>
  );
}
