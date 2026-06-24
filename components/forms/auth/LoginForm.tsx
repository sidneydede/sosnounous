"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField, Honeypot } from "@/components/forms/Field";
import { validateLogin, type LoginInput } from "@/lib/auth/validation";
import type { FieldErrors } from "@/lib/validation";

type Status = "idle" | "loading" | "error";

export function LoginForm({ next = "/espace" }: { next?: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const fd = new FormData(e.currentTarget);
    const data: LoginInput = {
      identifier: String(fd.get("identifier") ?? ""),
      password: String(fd.get("password") ?? ""),
      company: String(fd.get("company") ?? ""),
    };

    const clientErrors = validateLogin(data);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        // Compte non vérifié : redirection vers la vérification OTP
        if (json.needsVerification && json.email) {
          router.push(`/verification?email=${encodeURIComponent(json.email)}`);
          return;
        }
        if (json.errors) setErrors(json.errors as FieldErrors);
        setServerError(json.error ?? "Identifiants invalides.");
        setStatus("error");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setServerError("Connexion impossible. Vérifiez votre réseau.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative space-y-4">
      <Honeypot />
      <TextField
        id="identifier"
        label="E-mail ou téléphone"
        required
        autoComplete="username"
        error={errors.identifier}
      />
      <div>
        <TextField
          id="password"
          label="Mot de passe"
          type="password"
          required
          autoComplete="current-password"
          error={errors.password}
        />
        <div className="mt-1.5 text-right">
          <Link href="/mot-de-passe-oublie" className="text-sm font-medium text-brand-700 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="accent" size="lg" disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
