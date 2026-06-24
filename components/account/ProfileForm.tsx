"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/forms/Field";
import { services } from "@/lib/data/services";
import { ROLES, type Role } from "@/lib/auth/roles";
import type { FieldErrors } from "@/lib/validation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Status = "idle" | "loading" | "success" | "error";

interface Props {
  role: Role;
  initial: { firstName: string; lastName: string; commune: string; metiers: string[] };
}

export function ProfileForm({ role, initial }: Props) {
  const router = useRouter();
  const [metiers, setMetiers] = useState<string[]>(initial.metiers);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  function toggleMetier(value: string) {
    setMetiers((m) => (m.includes(value) ? m.filter((v) => v !== value) : [...m, value]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: String(fd.get("firstName") ?? ""),
      lastName: String(fd.get("lastName") ?? ""),
      commune: String(fd.get("commune") ?? ""),
      metiers: role === ROLES.INTERVENANT ? metiers : undefined,
    };
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.errors) setErrors(json.errors as FieldErrors);
        setServerError(json.error ?? "Mise à jour impossible.");
        setStatus("error");
        return;
      }
      setErrors({});
      setStatus("success");
      router.refresh();
    } catch {
      setServerError("Mise à jour impossible. Réessayez.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="firstName" label="Prénom" required defaultValue={initial.firstName} error={errors.firstName} />
        <TextField id="lastName" label="Nom" required defaultValue={initial.lastName} error={errors.lastName} />
      </div>
      <TextField id="commune" label="Commune / zone" required defaultValue={initial.commune} error={errors.commune} />

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

      {serverError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      )}
      {status === "success" && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
          <Icon name="check-circle" className="h-5 w-5" /> Profil mis à jour.
        </p>
      )}

      <Button type="submit" variant="accent" disabled={status === "loading"}>
        {status === "loading" ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
