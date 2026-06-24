"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SETTABLE_DEMANDE_STATUSES, demandeStatusLabels, type DemandeStatus } from "@/lib/demandes";

interface Props {
  demandeId: string;
  status: DemandeStatus;
  assigned: boolean;
  quoteAmount: string;
  quoteNote: string;
  notes: string;
}

export function AdminDemandeActions(props: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [statusValue, setStatusValue] = useState<DemandeStatus>(props.status);
  const [quoteAmount, setQuoteAmount] = useState(props.quoteAmount);
  const [quoteNote, setQuoteNote] = useState(props.quoteNote);
  const [notes, setNotes] = useState(props.notes);

  async function act(action: string, extra?: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/admin/demandes/${props.demandeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="primary" disabled={busy} onClick={() => act("qualify")}>
          Qualifier
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={props.assigned || busy} onClick={() => act("assign_me")}>
          {props.assigned ? "Affectée" : "M'affecter cette demande"}
        </Button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-brand-900">Statut</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select value={statusValue} onChange={(e) => setStatusValue(e.target.value as DemandeStatus)} className="rounded-xl border border-brand-200 px-3 py-2 text-sm">
            {SETTABLE_DEMANDE_STATUSES.map((s) => (
              <option key={s} value={s}>{demandeStatusLabels[s]}</option>
            ))}
          </select>
          <Button type="button" size="sm" variant="accent" disabled={busy} onClick={() => act("set_status", { status: statusValue })}>
            Appliquer
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-brand-900">Devis / estimation</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} placeholder="Montant (ex. 80 000 FCFA / mois)" className="rounded-xl border border-brand-200 px-3 py-2 text-sm" />
          <input value={quoteNote} onChange={(e) => setQuoteNote(e.target.value)} placeholder="Note (facultatif)" className="rounded-xl border border-brand-200 px-3 py-2 text-sm" />
        </div>
        <div className="mt-2">
          <Button type="button" size="sm" variant="primary" disabled={busy} onClick={() => act("set_quote", { quoteAmount, quoteNote })}>
            Enregistrer le devis
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-brand-900">Notes internes</h3>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-2 w-full rounded-xl border border-brand-200 px-3 py-2 text-sm" placeholder="Qualification, contraintes…" />
        <div className="mt-2">
          <Button type="button" size="sm" variant="primary" disabled={busy} onClick={() => act("save_notes", { notes })}>
            Enregistrer les notes
          </Button>
        </div>
      </div>
    </div>
  );
}
