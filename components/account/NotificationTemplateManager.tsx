"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export interface TemplateData {
  subject: string;
  body: string;
  enabled: boolean;
}

export interface EventDef {
  key: string;
  label: string;
  critical: boolean;
}

const inputCls = "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm";

function Card({ ev, tpl }: { ev: EventDef; tpl: TemplateData }) {
  const router = useRouter();
  const [subject, setSubject] = useState(tpl.subject);
  const [body, setBody] = useState(tpl.body);
  const [enabled, setEnabled] = useState(tpl.enabled);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/notification-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: ev.key, subject, body, enabled }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-brand-100 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-brand-900">
          {ev.label}{" "}
          <span className="text-xs text-ink-muted">({ev.key})</span>
          {ev.critical && (
            <span className="ml-2 rounded-full bg-accent-50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-accent-700">
              Critique
            </span>
          )}
        </p>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={enabled}
            onChange={(e) => { setEnabled(e.target.checked); setSaved(false); }}
            disabled={ev.critical}
          />
          {ev.critical ? "Toujours actif" : enabled ? "Actif" : "Désactivé"}
        </label>
      </div>
      <input className={`${inputCls} mt-3`} value={subject} onChange={(e) => { setSubject(e.target.value); setSaved(false); }} placeholder="Objet (laisser vide = objet par défaut)" aria-label="Objet" />
      <textarea className={`${inputCls} mt-2`} rows={2} value={body} onChange={(e) => { setBody(e.target.value); setSaved(false); }} placeholder="Corps — utilisez {message} pour insérer le contenu dynamique, {site} pour le nom de l'agence. Vide = texte par défaut." aria-label="Corps" />
      <div className="mt-2 flex items-center gap-3">
        <Button type="button" size="sm" variant="primary" disabled={busy} onClick={save}>Enregistrer</Button>
        {saved && <span className="inline-flex items-center gap-1 text-sm text-emerald-700"><Icon name="check-circle" className="h-4 w-4" /> Enregistré</span>}
      </div>
    </div>
  );
}

export function NotificationTemplateManager({
  events,
  templates,
}: {
  events: EventDef[];
  templates: Record<string, TemplateData>;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">
        Personnalisez l&apos;objet et le corps de chaque notification. Laisser vide pour conserver
        le texte par défaut. Désactiver une notification (hors critique) en suspend l&apos;envoi.
      </p>
      {events.map((ev) => (
        <Card
          key={ev.key}
          ev={ev}
          tpl={templates[ev.key] ?? { subject: "", body: "", enabled: true }}
        />
      ))}
    </div>
  );
}
