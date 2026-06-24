"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextArea, Honeypot } from "@/components/forms/Field";
import { validateContact, type ContactInput, type FieldErrors } from "@/lib/validation";
import { Icon } from "@/components/ui/Icon";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const fd = new FormData(e.currentTarget);
    const data: ContactInput = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
      consent: fd.get("consent") === "on",
      company: String(fd.get("company") ?? ""),
    };

    // Validation client (l'API revalide côté serveur)
    const clientErrors = validateContact(data);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      setServerError("Impossible d'envoyer le message. Vérifiez votre connexion.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center" role="status">
        <Icon name="check-circle" className="mx-auto h-10 w-10 text-emerald-600" />
        <h3 className="mt-3 text-lg font-semibold text-brand-900">Message envoyé !</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Merci, nous avons bien reçu votre message. Un conseiller vous répondra rapidement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative space-y-4">
      <Honeypot />
      <TextField id="name" label="Nom complet" required autoComplete="name" error={errors.name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="email" label="E-mail" type="email" required autoComplete="email" error={errors.email} />
        <TextField id="phone" label="Téléphone" type="tel" required autoComplete="tel" error={errors.phone} />
      </div>
      <TextField id="subject" label="Sujet" required error={errors.subject} />
      <TextArea id="message" label="Votre message" required error={errors.message} />

      <div>
        <label className="flex items-start gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="consent" className="mt-1 h-4 w-4 rounded border-brand-300" />
          <span>
            J&apos;accepte que mes données soient traitées conformément à la{" "}
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

      {serverError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="accent" size="lg" disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? "Envoi en cours…" : "Envoyer le message"}
      </Button>
    </form>
  );
}
