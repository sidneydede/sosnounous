"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { faqCategories } from "@/lib/data/faq";

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  published: boolean;
}

const inputCls = "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm";

function Row({ entry }: { entry: FaqRow }) {
  const router = useRouter();
  const [q, setQ] = useState(entry.question);
  const [a, setA] = useState(entry.answer);
  const [cat, setCat] = useState(entry.category);
  const [order, setOrder] = useState(entry.sortOrder);
  const [busy, setBusy] = useState(false);

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/admin/faq/${entry.id}`, {
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
    await fetch(`/api/admin/faq/${entry.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-brand-100 p-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Question" />
        <div className="flex items-center gap-2">
          <select className={inputCls} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Catégorie">
            {faqCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="w-16 rounded-lg border border-brand-200 px-2 py-2 text-sm" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} aria-label="Ordre" />
        </div>
      </div>
      <textarea className={`${inputCls} mt-2`} rows={2} value={a} onChange={(e) => setA(e.target.value)} aria-label="Réponse" />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="primary" disabled={busy} onClick={() => patch({ question: q, answer: a, category: cat, sortOrder: order })}>
          Enregistrer
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => patch({ published: !entry.published })}>
          {entry.published ? "Dépublier" : "Publier"}
        </Button>
        <span className={entry.published ? "text-xs text-emerald-700" : "text-xs text-ink-muted"}>
          {entry.published ? "Publiée" : "Masquée"}
        </span>
        <button type="button" onClick={remove} disabled={busy} className="ml-auto text-ink-muted hover:text-red-600" aria-label="Supprimer">
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function FaqManager({ entries }: { entries: FaqRow[] }) {
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
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: String(fd.get("question") ?? ""),
          answer: String(fd.get("answer") ?? ""),
          category: String(fd.get("category") ?? ""),
          sortOrder: Number(fd.get("sortOrder") ?? 0),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.errors?.question ?? json.errors?.answer ?? json.error ?? "Ajout impossible.");
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
        <p className="text-sm font-semibold text-brand-900">Nouvelle question</p>
        <input name="question" required placeholder="Question" className={inputCls} />
        <textarea name="answer" required rows={2} placeholder="Réponse" className={inputCls} />
        <div className="flex items-center gap-2">
          <select name="category" className={inputCls}>
            {faqCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input name="sortOrder" type="number" defaultValue={0} className="w-20 rounded-lg border border-brand-200 px-2 py-2 text-sm" aria-label="Ordre" />
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <Button type="submit" size="sm" variant="accent" disabled={busy}>Ajouter</Button>
      </form>

      <div className="space-y-3">
        {entries.length > 0 ? entries.map((e) => <Row key={e.id} entry={e} />) : (
          <p className="text-sm text-ink-muted">Aucune entrée. La page publique affiche la FAQ par défaut.</p>
        )}
      </div>
    </div>
  );
}
