"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextField } from "@/components/forms/Field";
import { checkPasswordStrength } from "@/lib/auth/password";
import { Icon } from "@/components/ui/Icon";

type Status = "idle" | "loading" | "success" | "error";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();

  if (!token) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        Lien invalide. Veuillez refaire une demande de réinitialisation.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const strength = checkPasswordStrength(password);
    setFieldError(strength ?? undefined);
    if (strength) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.errors?.password) setFieldError(json.errors.password);
        setError(json.error ?? "Réinitialisation impossible.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Réinitialisation impossible. Réessayez.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center" role="status">
        <Icon name="check-circle" className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="mt-3 text-sm text-ink-soft">
          Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.
        </p>
        <div className="mt-5">
          <ButtonLink href="/connexion" variant="accent">
            Se connecter
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <TextField
        id="password"
        label="Nouveau mot de passe"
        type="password"
        required
        autoComplete="new-password"
        error={fieldError}
      />
      <p className="-mt-3 text-xs text-ink-muted">
        Au moins 8 caractères, avec une lettre et un chiffre.
      </p>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" variant="accent" size="lg" disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Enregistrement…" : "Réinitialiser mon mot de passe"}
      </Button>
    </form>
  );
}
