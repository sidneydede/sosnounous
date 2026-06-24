"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { WEEKDAYS } from "@/lib/documents";

export interface Slot {
  id: string;
  weekday: string;
  startTime: string;
  endTime: string;
}

const weekdayOrder = (w: string) => WEEKDAYS.indexOf(w as (typeof WEEKDAYS)[number]);

/** Gestion du calendrier de disponibilités de l'intervenant (M8 — RG-30). */
export function AvailabilityManager({ slots }: { slots: Slot[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = [...slots].sort(
    (a, b) => weekdayOrder(a.weekday) - weekdayOrder(b.weekday) || a.startTime.localeCompare(b.startTime),
  );

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      const res = await fetch("/api/account/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekday: String(fd.get("weekday") ?? ""),
          startTime: String(fd.get("startTime") ?? ""),
          endTime: String(fd.get("endTime") ?? ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.errors?.endTime ?? json.errors?.startTime ?? json.errors?.weekday ?? json.error ?? "Ajout impossible.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/account/availability/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {sorted.length > 0 ? (
        <ul className="space-y-2">
          {sorted.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white p-3">
              <span className="text-sm text-brand-900">
                <span className="font-medium">{s.weekday}</span> · {s.startTime} – {s.endTime}
              </span>
              <button type="button" onClick={() => remove(s.id)} className="text-ink-muted hover:text-red-600" aria-label="Supprimer le créneau">
                <Icon name="close" className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Aucun créneau pour le moment.</p>
      )}

      <form onSubmit={add} className="grid gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 sm:grid-cols-4 sm:items-end">
        <div>
          <label htmlFor="weekday" className="mb-1 block text-sm font-medium text-brand-900">Jour</label>
          <select id="weekday" name="weekday" className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm">
            {WEEKDAYS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="startTime" className="mb-1 block text-sm font-medium text-brand-900">Début</label>
          <input id="startTime" name="startTime" type="time" defaultValue="08:00" className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="endTime" className="mb-1 block text-sm font-medium text-brand-900">Fin</label>
          <input id="endTime" name="endTime" type="time" defaultValue="12:00" className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm" />
        </div>
        <Button type="submit" variant="primary" size="sm" disabled={busy}>
          {busy ? "Ajout…" : "Ajouter"}
        </Button>
        {error && <p className="text-sm text-red-600 sm:col-span-4" role="alert">{error}</p>}
      </form>
    </div>
  );
}
