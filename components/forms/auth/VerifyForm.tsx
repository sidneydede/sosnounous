"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "loading" | "error";

export function VerifyForm({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (code.trim().length !== 6) {
      setError("Le code comporte 6 chiffres.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Code invalide.");
        setStatus("error");
        return;
      }
      router.push("/espace");
      router.refresh();
    } catch {
      setError("Vérification impossible. Réessayez.");
      setStatus("error");
    }
  }

  async function resend() {
    setResent(false);
    setError(null);
    await fetch("/api/auth/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-ink-soft">
        Un code de vérification à 6 chiffres a été envoyé à{" "}
        <strong className="text-brand-900">{email}</strong>.
      </p>

      <div>
        <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-brand-900">
          Code de vérification
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="w-full rounded-xl border border-brand-200 px-4 py-3 text-center text-2xl tracking-[0.5em] focus:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-300"
          placeholder="000000"
          aria-describedby={error ? "code-error" : undefined}
        />
      </div>

      {error && (
        <p id="code-error" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {resent && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
          Un nouveau code vous a été envoyé.
        </p>
      )}

      <Button type="submit" variant="accent" size="lg" disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Vérification…" : "Vérifier mon compte"}
      </Button>

      <button
        type="button"
        onClick={resend}
        className="w-full text-sm font-medium text-brand-700 hover:underline"
      >
        Je n&apos;ai pas reçu de code — en renvoyer un
      </button>
    </form>
  );
}
