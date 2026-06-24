"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Boutons d'expression d'intérêt de la famille sur une proposition (M6). */
export function PropositionInterestButtons({
  propositionId,
  current,
}: {
  propositionId: string;
  current: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function send(interest: "INTERESTED" | "DECLINED") {
    setBusy(true);
    try {
      await fetch(`/api/propositions/${propositionId}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interest }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (current === "INTERESTED") {
    return (
      <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
        <Icon name="check-circle" className="h-4 w-4" /> Vous avez manifesté votre intérêt
      </p>
    );
  }
  if (current === "DECLINED") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink-muted">Profil décliné</span>
        <button type="button" onClick={() => send("INTERESTED")} disabled={busy} className="text-sm font-medium text-brand-700 hover:underline">
          Revenir sur mon choix
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="accent" disabled={busy} onClick={() => send("INTERESTED")}>
        Ce profil m&apos;intéresse
      </Button>
      <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => send("DECLINED")}>
        Décliner
      </Button>
    </div>
  );
}
