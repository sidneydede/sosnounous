"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, Honeypot } from "@/components/forms/Field";
import { Icon } from "@/components/ui/Icon";

type Status = "idle" | "loading" | "success" | "error";

export function ForgotForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(fd.get("email") ?? ""),
          company: String(fd.get("company") ?? ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Demande impossible. Réessayez.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center" role="status">
        <Icon name="mail" className="mx-auto h-9 w-9 text-emerald-600" />
        <p className="mt-3 text-sm text-ink-soft">
          Si un compte est associé à cette adresse, un e-mail contenant un lien de
          réinitialisation vient d&apos;être envoyé. Pensez à vérifier vos courriers indésirables.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative space-y-4">
      <Honeypot />
      <TextField id="email" label="Votre e-mail" type="email" required autoComplete="email" />
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" variant="accent" size="lg" disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Envoi…" : "Recevoir le lien de réinitialisation"}
      </Button>
    </form>
  );
}
