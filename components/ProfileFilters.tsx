"use client";

import { useRouter } from "next/navigation";
import { SelectField } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { services as staticServices } from "@/lib/data/services";

interface ServiceOption { slug: string; shortName: string }

export interface FilterValues {
  metier?: string;
  zone?: string;
  frequency?: string;
  language?: string;
  sort?: string;
}

/**
 * Filtres de recherche des profils (M4). Navigue via la query string
 * (URL partageable et indexable) — le serveur applique le matching.
 */
export function ProfileFilters({
  facets,
  current,
  services = staticServices,
  zones = [],
}: {
  facets: { zones: string[]; languages: string[] };
  current: FilterValues;
  services?: ServiceOption[];
  zones?: string[];
}) {
  const router = useRouter();
  // Union des zones paramétrées et des zones réellement présentes sur les profils.
  const zoneOptions = Array.from(new Set([...zones, ...facets.zones])).sort();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const key of ["metier", "zone", "frequency", "language", "sort"]) {
      const value = String(fd.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `/trouver-un-intervenant?${qs}` : "/trouver-un-intervenant");
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Filtrer les profils"
      className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField id="metier" label="Service" defaultValue={current.metier ?? ""}>
          <option value="">Tous les services</option>
          {services.map((s) => (
            <option key={s.slug} value={s.shortName}>
              {s.shortName}
            </option>
          ))}
        </SelectField>

        <SelectField id="zone" label="Commune / zone" defaultValue={current.zone ?? ""}>
          <option value="">Toutes les zones</option>
          {zoneOptions.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </SelectField>

        <SelectField id="frequency" label="Fréquence" defaultValue={current.frequency ?? ""}>
          <option value="">Toutes</option>
          <option value="Ponctuel">Ponctuel</option>
          <option value="Régulier">Régulier</option>
          <option value="Temps plein">Temps plein</option>
        </SelectField>

        <SelectField id="language" label="Langue" defaultValue={current.language ?? ""}>
          <option value="">Toutes les langues</option>
          {facets.languages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </SelectField>

        <SelectField id="sort" label="Trier par" defaultValue={current.sort ?? "relevance"}>
          <option value="relevance">Pertinence</option>
          <option value="rating">Note</option>
          <option value="experience">Expérience</option>
        </SelectField>

        <div className="flex items-end">
          <Button type="submit" variant="primary" className="w-full">
            Rechercher
          </Button>
        </div>
      </div>
    </form>
  );
}
