import { getSessionUser } from "@/lib/auth/session";
import { ProfileForm } from "@/components/account/ProfileForm";
import { roleLabels } from "@/lib/auth/roles";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Mon profil", description: "Gérez vos informations." });

export default async function ProfilPage() {
  const user = (await getSessionUser())!;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Mon profil</h1>
      <p className="mt-2 text-ink-soft">Mettez à jour vos informations personnelles.</p>

      {/* Identifiants vérifiés (non modifiables dans cet incrément) */}
      <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50 p-5 text-sm">
        <p className="font-semibold text-brand-900">Identifiants de connexion</p>
        <dl className="mt-3 grid gap-2 sm:grid-cols-3">
          <div>
            <dt className="text-ink-muted">Type de compte</dt>
            <dd className="font-medium text-brand-900">{roleLabels[user.role]}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">E-mail</dt>
            <dd className="font-medium text-brand-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Téléphone</dt>
            <dd className="font-medium text-brand-900">{user.phone}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-ink-muted">
          La modification de l&apos;e-mail ou du téléphone (revérification) sera disponible
          dans un prochain incrément.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <ProfileForm
          role={user.role}
          initial={{
            firstName: user.firstName,
            lastName: user.lastName,
            commune: user.commune,
            metiers: user.metiers,
          }}
        />
      </div>
    </div>
  );
}
