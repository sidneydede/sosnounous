"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** Suppression de compte avec confirmation explicite (droit RGPD §4.4). */
export function DeleteAccountForm() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Suppression impossible.");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Suppression impossible. Réessayez.");
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <Button type="button" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => setConfirming(true)}>
        Supprimer mon compte
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-800">
        Cette action est définitive. Toutes vos données seront supprimées.
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        Pour confirmer, saisissez <strong>SUPPRIMER</strong> ci-dessous.
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        className="mt-2 w-full rounded-lg border border-red-300 px-3 py-2 text-sm"
        placeholder="SUPPRIMER"
        aria-label="Confirmation de suppression"
      />
      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          className="bg-red-600 text-white hover:bg-red-700"
          disabled={confirmText !== "SUPPRIMER" || loading}
          onClick={handleDelete}
        >
          {loading ? "Suppression…" : "Confirmer la suppression"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setConfirming(false)} disabled={loading}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
