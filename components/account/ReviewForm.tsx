"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/** Dépôt d'un avis par la famille après une prestation (M11 — US-14). */
export function ReviewForm({ propositionId }: { propositionId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError("Sélectionnez une note.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const comment = String(fd.get("comment") ?? "");
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propositionId, rating, comment }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Envoi impossible.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="mb-1.5 text-sm font-medium text-brand-900">Votre note</p>
        <div className="flex gap-1" role="radiogroup" aria-label="Note sur 5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5"
            >
              <Icon
                name="star"
                className={cn("h-7 w-7", (hover || rating) >= n ? "text-accent-500" : "text-brand-200")}
                strokeWidth={(hover || rating) >= n ? 1 : 1.7}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="mb-1.5 block text-sm font-medium text-brand-900">
          Votre avis
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          required
          maxLength={1500}
          className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-300"
          placeholder="Partagez votre expérience pour aider les autres familles…"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" variant="accent" disabled={busy}>
        {busy ? "Envoi…" : "Publier mon avis"}
      </Button>
      <p className="text-xs text-ink-muted">
        Votre avis sera publié après validation par l&apos;agence.
      </p>
    </form>
  );
}
