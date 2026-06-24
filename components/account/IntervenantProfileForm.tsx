"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField, TextArea } from "@/components/forms/Field";
import { services as staticServices, type Frequency } from "@/lib/data/services";

interface ServiceOption { slug: string; shortName: string }
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const FREQUENCIES: Frequency[] = ["Ponctuel", "Régulier", "Temps plein"];
const WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export interface ProfileInitial {
  headline: string;
  bio: string;
  photoUrl: string;
  metiers: string[];
  zones: string[];
  experienceYears: number;
  languages: string[];
  skills: string[];
  formations: string[];
  hasDrivingLicense: boolean;
  missionTypes: string[];
  availabilityDays: string[];
  status: string;
}

type Status = "idle" | "loading" | "success" | "error";

function toList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function IntervenantProfileForm({
  initial,
  services = staticServices,
  zones = [],
}: {
  initial: ProfileInitial;
  services?: ServiceOption[];
  zones?: string[];
}) {
  const router = useRouter();
  const [metiers, setMetiers] = useState<string[]>(initial.metiers);
  const [missionTypes, setMissionTypes] = useState<string[]>(initial.missionTypes);
  const [days, setDays] = useState<string[]>(initial.availabilityDays);
  const [hasLicense, setHasLicense] = useState(initial.hasDrivingLicense);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const payload = {
      headline: String(fd.get("headline") ?? ""),
      bio: String(fd.get("bio") ?? ""),
      photoUrl: String(fd.get("photoUrl") ?? ""),
      experienceYears: Number(fd.get("experienceYears") ?? 0),
      zones: toList(String(fd.get("zones") ?? "")),
      languages: toList(String(fd.get("languages") ?? "")),
      skills: toList(String(fd.get("skills") ?? "")),
      formations: toList(String(fd.get("formations") ?? "")),
      metiers,
      missionTypes,
      availabilityDays: days,
      hasDrivingLicense: hasLicense,
    };
    try {
      const res = await fetch("/api/account/intervenant-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error ?? "Enregistrement impossible.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setMessage("Profil enregistré.");
      router.refresh();
    } catch {
      setMessage("Enregistrement impossible. Réessayez.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TextField id="headline" name="headline" label="Accroche" defaultValue={initial.headline} placeholder="Ex. Nounou expérimentée, douce et ponctuelle" />
      <TextArea id="bio" name="bio" label="Présentation" defaultValue={initial.bio} placeholder="Décrivez votre expérience et vos qualités…" rows={4} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-brand-900">Métier(s) proposé(s)</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {services.map((s) => (
            <label
              key={s.slug}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                metiers.includes(s.shortName) ? "border-brand-600 bg-brand-50 text-brand-800" : "border-brand-200 text-ink-soft",
              )}
            >
              <input type="checkbox" className="h-4 w-4 rounded border-brand-300" checked={metiers.includes(s.shortName)} onChange={() => toggle(metiers, setMetiers, s.shortName)} />
              {s.shortName}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="zones" name="zones" label="Zones d'intervention" defaultValue={initial.zones.join(", ")} placeholder="Cocody, Marcory…" list="zone-suggestions" />
        {zones.length > 0 && (
          <datalist id="zone-suggestions">
            {zones.map((z) => <option key={z} value={z} />)}
          </datalist>
        )}
        <TextField id="experienceYears" name="experienceYears" label="Années d'expérience" type="number" min={0} max={60} defaultValue={String(initial.experienceYears)} />
      </div>
      <p className="-mt-3 text-xs text-ink-muted">Séparez les zones par des virgules.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="languages" name="languages" label="Langues parlées" defaultValue={initial.languages.join(", ")} placeholder="Français, …" />
        <TextField id="skills" name="skills" label="Compétences" defaultValue={initial.skills.join(", ")} placeholder="Repassage, cuisine ivoirienne…" />
      </div>
      <TextField id="formations" name="formations" label="Formations / certifications" defaultValue={initial.formations.join(", ")} placeholder="Petite enfance, premiers secours…" />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-brand-900">Type(s) de mission</legend>
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map((f) => (
            <label
              key={f}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                missionTypes.includes(f) ? "border-brand-600 bg-brand-50 text-brand-800" : "border-brand-200 text-ink-soft",
              )}
            >
              <input type="checkbox" className="h-4 w-4 rounded border-brand-300" checked={missionTypes.includes(f)} onChange={() => toggle(missionTypes, setMissionTypes, f)} />
              {f}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-brand-900">Jours de disponibilité</legend>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => (
            <label
              key={d}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm",
                days.includes(d) ? "border-brand-600 bg-brand-50 text-brand-800" : "border-brand-200 text-ink-soft",
              )}
            >
              <input type="checkbox" className="h-4 w-4 rounded border-brand-300" checked={days.includes(d)} onChange={() => toggle(days, setDays, d)} />
              {d}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" className="h-4 w-4 rounded border-brand-300" checked={hasLicense} onChange={(e) => setHasLicense(e.target.checked)} />
        Je possède le permis de conduire
      </label>

      <TextField id="photoUrl" name="photoUrl" label="Photo (URL)" defaultValue={initial.photoUrl} placeholder="https://…" />
      <p className="-mt-3 text-xs text-ink-muted">
        Le dépôt sécurisé de fichiers (photo, pièces) sera disponible dans un prochain incrément.
      </p>

      {message && (
        <p
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-3 text-sm",
            status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
          )}
          role={status === "success" ? "status" : "alert"}
        >
          {status === "success" && <Icon name="check-circle" className="h-5 w-5" />}
          {message}
        </p>
      )}

      <Button type="submit" variant="accent" disabled={status === "loading"}>
        {status === "loading" ? "Enregistrement…" : "Enregistrer mon profil"}
      </Button>
    </form>
  );
}
