"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const FREQ = ["Ponctuel", "Régulier", "Temps plein"];
const ICON_HINT = "child, home, chef, car, shield…";
const inputCls = "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm";

export interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  longDescription: string;
  icon: string;
  tasks: string[];
  frequencies: string[];
  useCases: string[];
  sortOrder: number;
  published: boolean;
}

const toLines = (a: string[]) => a.join("\n");
const fromLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

function Row({ s }: { s: ServiceRow }) {
  const router = useRouter();
  const [f, setF] = useState({
    name: s.name, shortName: s.shortName, tagline: s.tagline, description: s.description,
    longDescription: s.longDescription, icon: s.icon, sortOrder: s.sortOrder,
    tasks: toLines(s.tasks), useCases: toLines(s.useCases),
  });
  const [freqs, setFreqs] = useState<string[]>(s.frequencies);
  const [busy, setBusy] = useState(false);
  const upd = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/admin/services/${s.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      router.refresh();
    } finally { setBusy(false); }
  }
  async function save() {
    await patch({ ...f, sortOrder: Number(f.sortOrder), tasks: fromLines(f.tasks), useCases: fromLines(f.useCases), frequencies: freqs });
  }
  async function remove() { setBusy(true); await fetch(`/api/admin/services/${s.id}`, { method: "DELETE" }); router.refresh(); }

  return (
    <details className="rounded-xl border border-brand-100 bg-white p-4">
      <summary className="flex cursor-pointer items-center justify-between gap-2">
        <span className="font-medium text-brand-900">{f.name} <span className="text-xs text-ink-muted">/{s.slug}</span></span>
        <span className={s.published ? "text-xs text-emerald-700" : "text-xs text-ink-muted"}>{s.published ? "Publié" : "Masqué"}</span>
      </summary>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input className={inputCls} value={f.name} onChange={(e) => upd("name", e.target.value)} aria-label="Nom" placeholder="Nom" />
        <input className={inputCls} value={f.shortName} onChange={(e) => upd("shortName", e.target.value)} aria-label="Nom court" placeholder="Nom court (métier)" />
        <input className={inputCls} value={f.tagline} onChange={(e) => upd("tagline", e.target.value)} aria-label="Accroche" placeholder="Accroche" />
        <input className={inputCls} value={f.icon} onChange={(e) => upd("icon", e.target.value)} aria-label="Icône" placeholder={`Icône (${ICON_HINT})`} />
      </div>
      <textarea className={`${inputCls} mt-2`} rows={2} value={f.description} onChange={(e) => upd("description", e.target.value)} aria-label="Description" placeholder="Description courte" />
      <textarea className={`${inputCls} mt-2`} rows={3} value={f.longDescription} onChange={(e) => upd("longDescription", e.target.value)} aria-label="Description longue" placeholder="Description détaillée" />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <textarea className={inputCls} rows={3} value={f.tasks} onChange={(e) => upd("tasks", e.target.value)} aria-label="Tâches" placeholder="Tâches (une par ligne)" />
        <textarea className={inputCls} rows={3} value={f.useCases} onChange={(e) => upd("useCases", e.target.value)} aria-label="Cas d'usage" placeholder="Cas d'usage (un par ligne)" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {FREQ.map((fr) => (
          <label key={fr} className={cn("flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm", freqs.includes(fr) ? "border-brand-600 bg-cream text-brand-800" : "border-brand-200 text-ink-soft")}>
            <input type="checkbox" className="h-4 w-4" checked={freqs.includes(fr)} onChange={() => setFreqs((p) => p.includes(fr) ? p.filter((x) => x !== fr) : [...p, fr])} />
            {fr}
          </label>
        ))}
        <input className="w-16 rounded-lg border border-brand-200 px-2 py-2 text-sm" type="number" value={f.sortOrder} onChange={(e) => upd("sortOrder", e.target.value)} aria-label="Ordre" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="primary" disabled={busy} onClick={save}>Enregistrer</Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => patch({ published: !s.published })}>{s.published ? "Dépublier" : "Publier"}</Button>
        <button type="button" onClick={remove} disabled={busy} className="ml-auto text-ink-muted hover:text-red-600" aria-label="Supprimer"><Icon name="close" className="h-5 w-5" /></button>
      </div>
    </details>
  );
}

export function ServiceManager({ services }: { services: ServiceRow[] }) {
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
      const res = await fetch("/api/admin/services", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: String(fd.get("slug") ?? ""), name: String(fd.get("name") ?? ""),
          shortName: String(fd.get("shortName") ?? ""), description: String(fd.get("description") ?? ""),
          icon: String(fd.get("icon") ?? "home"),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.errors?.slug ?? json.errors?.name ?? json.error ?? "Ajout impossible."); return; }
      form.reset();
      router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={create} className="space-y-2 rounded-xl border border-brand-100 bg-cream p-4">
        <p className="text-sm font-semibold text-brand-900">Nouveau service</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input name="name" required placeholder="Nom (ex. Jardinage)" className={inputCls} />
          <input name="slug" required placeholder="slug (ex. jardinage)" className={inputCls} />
          <input name="shortName" required placeholder="Nom court (ex. Jardinage)" className={inputCls} />
          <input name="icon" placeholder={`Icône (${ICON_HINT})`} className={inputCls} />
        </div>
        <textarea name="description" required rows={2} placeholder="Description courte" className={inputCls} />
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <Button type="submit" size="sm" variant="accent" disabled={busy}>Ajouter</Button>
        <p className="text-xs text-ink-muted">Complétez ensuite les détails (tâches, fréquences…) en dépliant le service créé.</p>
      </form>

      <div className="space-y-3">
        {services.length > 0 ? services.map((s) => <Row key={s.id} s={s} />) : (
          <p className="text-sm text-ink-muted">Aucun service en base. Le catalogue par défaut est utilisé.</p>
        )}
      </div>
    </div>
  );
}
