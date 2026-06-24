"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextField, TextArea, SelectField, Honeypot } from "@/components/forms/Field";
import { validateDevis, type DevisInput, type FieldErrors } from "@/lib/validation";
import { services as staticServices, type Frequency } from "@/lib/data/services";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

interface ServiceOption { slug: string; shortName: string; name: string }

type Status = "idle" | "loading" | "success" | "error";

const frequencies: Frequency[] = ["Ponctuel", "Régulier", "Temps plein"];
const stepLabels = ["Service", "Détails", "Coordonnées"];

const emptyForm: DevisInput = {
  service: "",
  frequency: "",
  city: "",
  details: "",
  name: "",
  email: "",
  phone: "",
  consent: false,
  company: "",
};

export function DevisForm({
  defaultService,
  services = staticServices,
  zones = [],
}: {
  defaultService?: string;
  services?: ServiceOption[];
  zones?: string[];
}) {
  const [form, setForm] = useState<DevisInput>({
    ...emptyForm,
    service: defaultService ?? "",
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof DevisInput>(key: K, value: DevisInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Validation partielle par étape pour bloquer la progression si incomplet.
  function stepErrors(s: number): FieldErrors {
    const all = validateDevis(form);
    const keysByStep: string[][] = [
      ["service", "frequency"],
      ["city"],
      ["name", "email", "phone", "consent"],
    ];
    const allowed = keysByStep[s] ?? [];
    return Object.fromEntries(
      Object.entries(all).filter(([k]) => allowed.includes(k)),
    );
  }

  function next() {
    const e = stepErrors(step);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => Math.min(s + 1, stepLabels.length - 1));
  }

  function prev() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const all = validateDevis(form);
    setErrors(all);
    if (Object.keys(all).length > 0) {
      // Renvoie l'utilisateur vers la première étape contenant une erreur
      if (all.service || all.frequency) setStep(0);
      else if (all.city) setStep(1);
      else setStep(2);
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.errors) setErrors(json.errors as FieldErrors);
        setServerError(json.error ?? "Une erreur est survenue. Merci de réessayer.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setServerError("Impossible d'envoyer la demande. Vérifiez votre connexion.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center" role="status">
        <Icon name="check-circle" className="mx-auto h-12 w-12 text-emerald-600" />
        <h3 className="mt-4 text-xl font-semibold text-brand-900">Demande envoyée !</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Merci. Votre demande de devis a bien été reçue. Un conseiller SOS Nounous &amp; Services
          vous contactera rapidement avec une estimation adaptée. Un accusé de réception vous a été envoyé.
        </p>
        <div className="mt-6">
          <ButtonLink href="/" variant="outline">
            Retour à l&apos;accueil
          </ButtonLink>
        </div>
      </div>
    );
  }

  const progress = ((step + 1) / stepLabels.length) * 100;

  return (
    <form onSubmit={handleSubmit} noValidate className="relative">
      <Honeypot />

      {/* Barre de progression (CDC §5.3) */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-ink-soft">
          <span>
            Étape {step + 1} sur {stepLabels.length} — {stepLabels[step]}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-brand-100" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={stepLabels.length}>
          <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <ol className="mt-3 flex gap-2">
          {stepLabels.map((label, i) => (
            <li
              key={label}
              className={cn(
                "flex items-center gap-1.5 text-xs",
                i <= step ? "text-brand-800" : "text-ink-muted",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full text-[0.7rem] font-bold",
                  i < step
                    ? "bg-accent-500 text-white"
                    : i === step
                      ? "bg-brand-700 text-white"
                      : "bg-brand-100 text-ink-muted",
                )}
              >
                {i < step ? "✓" : i + 1}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Étape 1 — Service & fréquence */}
      {step === 0 && (
        <div className="space-y-4">
          <SelectField
            id="service"
            label="Quel service recherchez-vous ?"
            required
            value={form.service}
            onChange={(e) => update("service", e.target.value)}
            error={errors.service}
          >
            <option value="">— Sélectionnez un service —</option>
            {services.map((s) => (
              <option key={s.slug} value={s.shortName}>
                {s.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="frequency"
            label="À quelle fréquence ?"
            required
            value={form.frequency}
            onChange={(e) => update("frequency", e.target.value)}
            error={errors.frequency}
          >
            <option value="">— Sélectionnez une fréquence —</option>
            {frequencies.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </SelectField>
        </div>
      )}

      {/* Étape 2 — Localisation & détails */}
      {step === 1 && (
        <div className="space-y-4">
          {zones.length > 0 ? (
            <SelectField
              id="city"
              label="Commune"
              required
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              error={errors.city}
            >
              <option value="">— Sélectionnez une commune —</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </SelectField>
          ) : (
            <TextField
              id="city"
              label="Commune / quartier"
              required
              placeholder="Ex. Cocody, Marcory…"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              error={errors.city}
            />
          )}
          <TextArea
            id="details"
            label="Précisez votre besoin"
            placeholder="Horaires souhaités, nombre et âge des enfants, tâches attendues, contraintes, budget indicatif…"
            value={form.details}
            onChange={(e) => update("details", e.target.value)}
            error={errors.details}
          />
        </div>
      )}

      {/* Étape 3 — Coordonnées & consentement */}
      {step === 2 && (
        <div className="space-y-4">
          <TextField
            id="name"
            label="Nom complet"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            error={errors.name}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="email"
              label="E-mail"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              error={errors.email}
            />
            <TextField
              id="phone"
              label="Téléphone"
              type="tel"
              required
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              error={errors.phone}
            />
          </div>
          <div>
            <label className="flex items-start gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-brand-300"
                checked={form.consent}
                onChange={(e) => update("consent", e.target.checked)}
              />
              <span>
                J&apos;accepte que mes données soient traitées pour le traitement de ma demande,
                conformément à la{" "}
                <a href="/politique-de-confidentialite" className="font-medium text-brand-700 underline">
                  politique de confidentialité
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
        </div>
      )}

      {serverError && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      )}

      {/* Navigation entre étapes */}
      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={prev}>
            ← Précédent
          </Button>
        ) : (
          <span />
        )}
        {step < stepLabels.length - 1 ? (
          <Button type="button" variant="primary" onClick={next}>
            Suivant →
          </Button>
        ) : (
          <Button type="submit" variant="accent" size="lg" disabled={status === "loading"}>
            {status === "loading" ? "Envoi…" : "Envoyer ma demande"}
          </Button>
        )}
      </div>
    </form>
  );
}
