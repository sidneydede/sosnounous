"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** Demande de remplacement par la famille (US-11). */
export function ReplacementButton({ demandeId }: { demandeId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await fetch(`/api/demandes/${demandeId}/replacement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      setDone(true);
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <p className="text-sm text-emerald-700">Demande de remplacement transmise à l&apos;agence.</p>;
  }

  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        Demander un remplacement
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
      <label htmlFor="reason" className="text-sm font-medium text-brand-900">
        Motif (facultatif)
      </label>
      <textarea
        id="reason"
        rows={2}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
        placeholder="Ex. indisponibilité de l'intervenant"
      />
      <div className="mt-2 flex gap-2">
        <Button type="button" size="sm" variant="accent" disabled={busy} onClick={submit}>
          {busy ? "Envoi…" : "Confirmer"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
