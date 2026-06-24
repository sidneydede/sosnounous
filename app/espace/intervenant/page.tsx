import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import {
  getOrCreateProfile,
  parseList,
  serializeList,
  profileStatusLabels,
  PROFILE_STATUS,
  type ProfileStatus,
} from "@/lib/profiles";
import { getServices, getActiveZoneNames } from "@/lib/cms";
import { IntervenantProfileForm } from "@/components/account/IntervenantProfileForm";
import { ReferencesManager } from "@/components/account/ReferencesManager";
import { IntervenantFiles } from "@/components/account/IntervenantFiles";
import { SubmitProfileButton } from "@/components/account/SubmitProfileButton";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Mon profil professionnel", description: "Profil intervenant." });

const statusTone: Record<string, "neutral" | "brand" | "success" | "accent"> = {
  DRAFT: "neutral",
  SUBMITTED: "brand",
  IN_REVIEW: "brand",
  VERIFIED: "success",
  ACTIVE: "success",
  SUSPENDED: "accent",
  ARCHIVED: "neutral",
};

export default async function IntervenantProfilePage() {
  const me = await getSessionUser();
  if (!me) redirect("/connexion?next=/espace/intervenant");
  if (me.role !== ROLES.INTERVENANT) redirect("/espace");

  const profile = await getOrCreateProfile({
    id: me.id,
    metiers: serializeList(me.metiers),
    commune: me.commune,
  });
  const references = await prisma.reference.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "asc" },
  });
  const files = await prisma.intervenantFile.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
  });
  const [serviceOptions, zoneOptions] = await Promise.all([getServices(), getActiveZoneNames()]);

  const status = profile.status as ProfileStatus;
  const isPublished = status === PROFILE_STATUS.VERIFIED || status === PROFILE_STATUS.ACTIVE;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-brand-900">Mon profil professionnel</h1>
          <Badge tone={statusTone[status] ?? "neutral"}>{profileStatusLabels[status]}</Badge>
        </div>
        <p className="mt-2 text-ink-soft">
          Un profil complet et vérifié est davantage proposé aux familles.
        </p>
      </div>

      {/* Bandeau de statut (RG-07) */}
      {status === PROFILE_STATUS.DRAFT && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
          <p className="flex items-center gap-2 text-sm text-brand-800">
            <Icon name="edit" className="h-5 w-5" />
            Votre profil est en <strong>brouillon</strong>. Complétez-le puis soumettez-le à la
            vérification de l&apos;agence pour devenir visible.
          </p>
        </div>
      )}
      {(status === PROFILE_STATUS.SUBMITTED || status === PROFILE_STATUS.IN_REVIEW) && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <p className="flex items-center gap-2 text-sm text-brand-800">
            <Icon name="clock" className="h-5 w-5" />
            Votre profil est <strong>en cours de vérification</strong> par l&apos;agence. Vous serez
            notifié(e) dès qu&apos;il sera validé.
          </p>
        </div>
      )}
      {isPublished && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="flex items-center gap-2 text-sm text-emerald-800">
            <Icon name="check-circle" className="h-5 w-5" />
            Votre profil est <strong>vérifié</strong> et visible des familles. Tenez vos informations
            à jour pour recevoir des offres adaptées.
          </p>
        </div>
      )}
      {status === PROFILE_STATUS.SUSPENDED && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="flex items-center gap-2 text-sm text-red-800">
            <Icon name="lock" className="h-5 w-5" />
            Votre profil est <strong>suspendu</strong>. Contactez l&apos;agence pour plus d&apos;informations.
          </p>
        </div>
      )}

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <IntervenantProfileForm
          initial={{
            headline: profile.headline ?? "",
            bio: profile.bio ?? "",
            photoUrl: profile.photoUrl ?? "",
            metiers: parseList(profile.metiers),
            zones: parseList(profile.zones),
            experienceYears: profile.experienceYears,
            languages: parseList(profile.languages),
            skills: parseList(profile.skills),
            formations: parseList(profile.formations),
            hasDrivingLicense: profile.hasDrivingLicense,
            missionTypes: parseList(profile.missionTypes),
            availabilityDays: parseList(profile.availabilityDays),
            status,
          }}
          services={serviceOptions}
          zones={zoneOptions}
        />
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-brand-900">Références</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Ajoutez vos anciens employeurs. L&apos;agence les vérifie pour attribuer le badge
          « Références vérifiées ».
        </p>
        <div className="mt-5">
          <ReferencesManager references={references} />
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-brand-900">Pièces justificatives</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Déposez votre pièce d&apos;identité, votre photo et vos justificatifs. Ces documents sont
          chiffrés et réservés à la vérification par l&apos;agence.
        </p>
        <div className="mt-5">
          <IntervenantFiles
            files={files.map((f) => ({
              id: f.id,
              type: f.type,
              originalName: f.originalName,
              size: f.size,
              createdAt: f.createdAt.toISOString(),
            }))}
          />
        </div>
      </section>

      {status === PROFILE_STATUS.DRAFT && (
        <section className="rounded-2xl border border-accent-200 bg-accent-50 p-6">
          <h2 className="text-lg font-semibold text-brand-900">Prêt(e) à être proposé(e) ?</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Une fois votre profil complété, soumettez-le à la vérification de l&apos;agence.
          </p>
          <div className="mt-4">
            <SubmitProfileButton />
          </div>
        </section>
      )}
    </div>
  );
}
