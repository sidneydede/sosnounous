"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** L'intervenant accepte ou refuse une proposition (M6). */
export function IntervenantPropositionActions({
  propositionId,
  current,
}: {
  propositionId: string;
  current: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function send(response: "ACCEPTED" | "REFUSED") {
    setBusy(true);
    try {
      await fetch(`/api/propositions/${propositionId}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (current === "ACCEPTED") {
    return (
      <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
        <Icon name="check-circle" className="h-4 w-4" /> Vous avez accepté cette proposition
      </p>
    );
  }
  if (current === "REFUSED") {
    return <p className="text-sm text-ink-muted">Vous avez refusé cette proposition.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="accent" disabled={busy} onClick={() => send("ACCEPTED")}>
        Accepter
      </Button>
      <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => send("REFUSED")}>
        Refuser
      </Button>
    </div>
  );
}
