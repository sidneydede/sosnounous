"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { readConsent, writeConsent } from "@/lib/cookies";

/** Gestion fine du consentement aux cookies (CDC §4.4). */
export function CookiePreferences() {
  const [analytics, setAnalytics] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  useEffect(() => {
    // Lecture côté client uniquement (cookie absent au rendu serveur).
    const c = readConsent();
    if (c) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnalytics(c.analytics);
      setCurrentDate(c.date || null);
    }
  }, []);

  function save() {
    const now = new Date().toISOString();
    writeConsent(analytics, now);
    setCurrentDate(now);
    setSaved(true);
  }

  return (
    <div className="space-y-5">
      {/* Cookies nécessaires (toujours actifs) */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-brand-100 bg-white p-5">
        <div>
          <h2 className="text-base font-semibold text-brand-900">Cookies strictement nécessaires</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Indispensables au fonctionnement du site (session de connexion, sécurité). Ils ne
            peuvent pas être désactivés.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          Toujours actifs
        </span>
      </div>

      {/* Cookies de mesure d'audience */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-brand-100 bg-white p-5">
        <div>
          <h2 className="text-base font-semibold text-brand-900">Mesure d&apos;audience</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Nous aident à comprendre l&apos;usage du site pour l&apos;améliorer. Déposés uniquement
            avec votre accord.
          </p>
        </div>
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-brand-300"
            checked={analytics}
            onChange={(e) => {
              setAnalytics(e.target.checked);
              setSaved(false);
            }}
          />
          <span className="text-sm font-medium text-brand-900">{analytics ? "Activé" : "Désactivé"}</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="accent" onClick={save}>
          Enregistrer mes préférences
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
            <Icon name="check-circle" className="h-5 w-5" /> Préférences enregistrées
          </span>
        )}
      </div>

      {currentDate && (
        <p className="text-xs text-ink-muted">
          Dernier choix enregistré le {new Date(currentDate).toLocaleString("fr-FR")}.
        </p>
      )}
    </div>
  );
}
