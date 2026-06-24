"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** Soumet le profil à la vérification de l'agence (RG-07 : DRAFT → SUBMITTED). */
export function SubmitProfileButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account/intervenant-profile/submit", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Soumission impossible.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button type="button" variant="accent" onClick={submit} disabled={loading}>
        {loading ? "Envoi…" : "Soumettre mon profil à la vérification"}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
