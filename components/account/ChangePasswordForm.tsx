"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/forms/Field";
import { checkPasswordStrength } from "@/lib/auth/password";
import type { FieldErrors } from "@/lib/validation";
import { Icon } from "@/components/ui/Icon";

type Status = "idle" | "loading" | "success" | "error";

export function ChangePasswordForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const currentPassword = String(fd.get("currentPassword") ?? "");
    const newPassword = String(fd.get("newPassword") ?? "");

    const clientErrors: FieldErrors = {};
    if (!currentPassword) clientErrors.currentPassword = "Mot de passe actuel requis.";
    const strength = checkPasswordStrength(newPassword);
    if (strength) clientErrors.newPassword = strength;
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.errors) setErrors(json.errors as FieldErrors);
        setServerError(json.error ?? "Modification impossible.");
        setStatus("error");
        return;
      }
      setErrors({});
      setStatus("success");
      form.reset();
      router.refresh();
    } catch {
      setServerError("Modification impossible. Réessayez.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <TextField
        id="currentPassword"
        label="Mot de passe actuel"
        type="password"
        required
        autoComplete="current-password"
        error={errors.currentPassword}
      />
      <TextField
        id="newPassword"
        label="Nouveau mot de passe"
        type="password"
        required
        autoComplete="new-password"
        error={errors.newPassword}
      />
      <p className="-mt-3 text-xs text-ink-muted">
        Au moins 8 caractères, avec une lettre et un chiffre.
      </p>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      )}
      {status === "success" && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
          <Icon name="check-circle" className="h-5 w-5" /> Mot de passe mis à jour.
        </p>
      )}

      <Button type="submit" variant="primary" disabled={status === "loading"}>
        {status === "loading" ? "Modification…" : "Changer mon mot de passe"}
      </Button>
    </form>
  );
}
