"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export interface ConversationMessage {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
}

/** Fil de messagerie famille ↔ agence rattaché à une demande (M7 — RG-25). */
export function Conversation({
  demandeId,
  messages,
  currentUserId,
}: {
  demandeId: string;
  messages: ConversationMessage[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = String(fd.get("body") ?? "").trim();
    if (!body) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/demandes/${demandeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        form.reset();
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {messages.length > 0 ? (
        <ul className="space-y-3">
          {messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                    mine ? "bg-brand-700 text-white" : "bg-brand-50 text-ink",
                  )}
                >
                  <p className={cn("mb-0.5 text-xs font-semibold", mine ? "text-brand-100" : "text-brand-700")}>
                    {mine ? "Vous" : m.senderRole === "ADMIN" ? "SOS Nounous & Services" : m.senderName}
                  </p>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className={cn("mt-1 text-[0.7rem]", mine ? "text-brand-200" : "text-ink-muted")}>
                    {new Date(m.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Aucun message pour le moment. Démarrez la conversation.</p>
      )}

      <form onSubmit={send} className="mt-4 flex items-end gap-2">
        <textarea
          name="body"
          rows={2}
          required
          maxLength={2000}
          placeholder="Votre message…"
          className="flex-1 rounded-xl border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-300"
        />
        <Button type="submit" variant="accent" disabled={busy}>
          {busy ? "…" : "Envoyer"}
        </Button>
      </form>
    </div>
  );
}
