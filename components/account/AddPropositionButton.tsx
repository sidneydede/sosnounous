"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** Ajoute un profil suggéré comme proposition à une demande (M6 — présélection). */
export function AddPropositionButton({
  demandeId,
  profileId,
}: {
  demandeId: string;
  profileId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/demandes/${demandeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_proposition", profileId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Ajout impossible.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button type="button" size="sm" variant="primary" disabled={busy} onClick={add}>
        {busy ? "Ajout…" : "Proposer ce profil"}
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
