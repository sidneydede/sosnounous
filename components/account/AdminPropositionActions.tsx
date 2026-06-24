"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** Pilotage d'une proposition par l'agence (M6). */
export function AdminPropositionActions({
  propositionId,
  coordinatesReleased,
  status,
}: {
  propositionId: string;
  coordinatesReleased: boolean;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [meetingAt, setMeetingAt] = useState("");

  async function act(action: string, extra?: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/admin/propositions/${propositionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const placed = status === "PLACED";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => act("set_status", { status: "RETAINED" })}>
          Marquer retenue
        </Button>
        {!coordinatesReleased && (
          <Button type="button" size="sm" variant="primary" disabled={busy} onClick={() => act("release_coordinates")}>
            Communiquer les coordonnées
          </Button>
        )}
        {!placed && (
          <Button type="button" size="sm" variant="accent" disabled={busy} onClick={() => act("place")}>
            Confirmer le placement
          </Button>
        )}
        <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => act("reject")}>
          Écarter
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="datetime-local"
          value={meetingAt}
          onChange={(e) => setMeetingAt(e.target.value)}
          className="rounded-xl border border-brand-200 px-3 py-1.5 text-sm"
          aria-label="Date de rencontre"
        />
        <Button type="button" size="sm" variant="outline" disabled={busy || !meetingAt} onClick={() => act("plan_meeting", { meetingAt })}>
          Planifier la rencontre
        </Button>
      </div>
    </div>
  );
}
