import type { PublicProfile } from "@/lib/profiles";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

/**
 * Carte de profil ANONYMISÉE (RG-09, RG-15).
 * N'affiche jamais de coordonnées : prénom + initiale, badges de confiance.
 */
export function ProfileCard({ profile }: { profile: PublicProfile }) {
  const initial = profile.displayName.charAt(0).toUpperCase();
  return (
    <article className="flex flex-col rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 font-display text-lg font-bold text-brand-700"
          aria-hidden
        >
          {initial}
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-brand-900">{profile.displayName}</h3>
          <p className="truncate text-sm text-ink-soft">
            {profile.metiers.join(" · ") || "Intervenant"}
          </p>
        </div>
      </div>

      {profile.headline && (
        <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{profile.headline}</p>
      )}

      <dl className="mt-3 space-y-1.5 text-sm text-ink-soft">
        {profile.zones.length > 0 && (
          <div className="flex items-center gap-2">
            <Icon name="location" className="h-4 w-4 shrink-0 text-brand-500" />
            <dt className="sr-only">Zones</dt>
            <dd className="truncate">{profile.zones.join(", ")}</dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Icon name="clock" className="h-4 w-4 shrink-0 text-brand-500" />
          <dt className="sr-only">Disponibilité & expérience</dt>
          <dd>
            {profile.missionTypes.join(", ") || "Disponibilités à préciser"}
            {profile.experienceYears > 0 && ` · ${profile.experienceYears} ans d'expérience`}
          </dd>
        </div>
        {profile.languages.length > 0 && (
          <div className="flex items-center gap-2">
            <Icon name="users" className="h-4 w-4 shrink-0 text-brand-500" />
            <dt className="sr-only">Langues</dt>
            <dd>{profile.languages.join(", ")}</dd>
          </div>
        )}
        {profile.rating != null && (
          <div className="flex items-center gap-2">
            <Icon name="star" className="h-4 w-4 shrink-0 text-accent-500" />
            <dt className="sr-only">Note</dt>
            <dd>
              {profile.rating.toFixed(1)} / 5
              {profile.ratingCount > 0 && ` (${profile.ratingCount} avis)`}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {profile.identityVerified && (
          <Badge tone="success">
            <Icon name="check-circle" className="h-3.5 w-3.5" /> Profil vérifié
          </Badge>
        )}
        {profile.referencesVerified && <Badge tone="brand">Références vérifiées</Badge>}
        {profile.trained && <Badge tone="accent">Formé(e)</Badge>}
        {profile.hasDrivingLicense && <Badge tone="neutral">Permis</Badge>}
      </div>

      <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
        <Icon name="lock" className="h-4 w-4 shrink-0" />
        Coordonnées communiquées après validation de l&apos;agence.
      </p>
    </article>
  );
}
