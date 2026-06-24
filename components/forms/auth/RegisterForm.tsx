"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField, Honeypot } from "@/components/forms/Field";
import { validateRegister, type RegisterInput } from "@/lib/auth/validation";
import { ROLES, roleLabels, type Role } from "@/lib/auth/roles";
import { services as staticServices } from "@/lib/data/services";

interface ServiceOption { slug: string; shortName: string }
import type { FieldErrors } from "@/lib/validation";
import { cn } from "@/lib/cn";

type Status = "idle" | "loading" | "error";

export function RegisterForm({
  defaultRole = ROLES.FAMILY,
  services = staticServices,
}: {
  defaultRole?: Role;
  services?: ServiceOption[];
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(defaultRole);
  const [metiers, setMetiers] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  function toggleMetier(value: string) {
    setMetiers((m) => (m.includes(value) ? m.filter((v) => v !== value) : [...m, value]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const fd = new FormData(e.currentTarget);
    const data: RegisterInput = {
      role,
      firstName: String(fd.get("firstName") ?? ""),
      lastName: String(fd.get("lastName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      password: String(fd.get("password") ?? ""),
      commune: String(fd.get("commune") ?? ""),
      metiers: role === ROLES.INTERVENANT ? metiers : undefined,
      consent: fd.get("consent") === "on",
      company: String(fd.get("company") ?? ""),
    };

    const clientErrors = validateRegister(data);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.errors) setErrors(json.errors as FieldErrors);
        setServerError(json.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      // Compte créé : direction la vérification OTP (RG-03)
      router.push(`/verification?email=${encodeURIComponent(json.email)}`);
    } catch {
      setServerError("Impossible de créer le compte. Vérifiez votre connexion.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative space-y-5">
      <Honeypot />

      {/* Choix du type de compte (RG-01) */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-brand-900">Je suis…</legend>
        <div className="grid grid-cols-2 gap-3">
          {[ROLES.FAMILY, ROLES.INTERVENANT].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              aria-pressed={role === r}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                role === r
                  ? "border-brand-700 bg-brand-50 text-brand-800"
                  : "border-brand-200 text-ink-soft hover:border-brand-300",
              )}
            >
              {r === ROLES.FAMILY ? "Une famille" : "Un intervenant"}
              <span className="mt-0.5 block text-xs font-normal text-ink-muted">
                {r === ROLES.FAMILY ? "Je cherche du personnel" : "Je propose mes services"}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="firstName" label="Prénom" required autoComplete="given-name" error={errors.firstName} />
        <TextField id="lastName" label="Nom" required autoComplete="family-name" error={errors.lastName} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="email" label="E-mail" type="email" required autoComplete="email" error={errors.email} />
        <TextField id="phone" label="Téléphone" type="tel" required autoComplete="tel" placeholder="+225…" error={errors.phone} />
      </div>
      <TextField id="commune" label="Commune / zone" required placeholder="Ex. Cocody" error={errors.commune} />

      {role === ROLES.INTERVENANT && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-brand-900">
            Métier(s) proposé(s) <span className="text-accent-600">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {services.map((s) => (
              <label
                key={s.slug}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                  metiers.includes(s.shortName)
                    ? "border-brand-600 bg-brand-50 text-brand-800"
                    : "border-brand-200 text-ink-soft",
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-brand-300"
                  checked={metiers.includes(s.shortName)}
                  onChange={() => toggleMetier(s.shortName)}
                />
                {s.shortName}
              </label>
            ))}
          </div>
          {errors.metiers && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.metiers}
            </p>
          )}
        </fieldset>
      )}

      <TextField
        id="password"
        label="Mot de passe"
        type="password"
        required
        autoComplete="new-password"
        error={errors.password}
      />
      <p className="-mt-3 text-xs text-ink-muted">
        Au moins 8 caractères, avec une lettre et un chiffre.
      </p>

      <div>
        <label className="flex items-start gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="consent" className="mt-1 h-4 w-4 rounded border-brand-300" />
          <span>
            J&apos;accepte la{" "}
            <a href="/politique-de-confidentialite" target="_blank" className="font-medium text-brand-700 underline">
              politique de confidentialité
            </a>{" "}
            et les{" "}
            <a href="/cgu" target="_blank" className="font-medium text-brand-700 underline">
              conditions d&apos;utilisation
            </a>
            . <span className="text-accent-600">*</span>
          </span>
        </label>
        {errors.consent && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.consent}
          </p>
        )}
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="accent" size="lg" disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Création…" : `Créer mon compte ${roleLabels[role]}`}
      </Button>
    </form>
  );
}
