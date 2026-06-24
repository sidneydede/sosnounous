"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** Modération d'un avis par l'agence (M11 — RG-31/34). */
export function AdminReviewActions({
  reviewId,
  status,
  reply,
}: {
  reviewId: string;
  status: string;
  reply: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [replyText, setReplyText] = useState(reply);

  async function act(action: string, extra?: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/admin/reviews/${reviewId}`, {
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
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status !== "APPROVED" && (
          <Button type="button" size="sm" variant="primary" disabled={busy} onClick={() => act("approve")}>
            Approuver
          </Button>
        )}
        {status !== "REJECTED" && (
          <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => act("reject")}>
            Rejeter
          </Button>
        )}
        {status === "APPROVED" && (
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => act("hide")}>
            Masquer
          </Button>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-brand-900">Réponse publique (RG-34)</label>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm"
          placeholder="Réponse de l'agence (facultatif)…"
        />
        <div className="mt-2">
          <Button type="button" size="sm" variant="primary" disabled={busy} onClick={() => act("reply", { reply: replyText })}>
            Enregistrer la réponse
          </Button>
        </div>
      </div>
    </div>
  );
}
