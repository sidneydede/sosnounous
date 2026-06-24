import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { DeleteAccountForm } from "@/components/account/DeleteAccountForm";
import { NotificationPreferences } from "@/components/account/NotificationPreferences";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Sécurité", description: "Mot de passe et compte." });

export default async function SecuritePage() {
  const me = (await getSessionUser())!;
  const prefs = await prisma.user.findUnique({
    where: { id: me.id },
    select: { notifyEmail: true, notifySms: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Sécurité &amp; préférences</h1>
        <p className="mt-2 text-ink-soft">Gérez votre mot de passe, vos notifications et votre compte.</p>
      </div>

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-brand-900">Changer de mot de passe</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Par sécurité, vous resterez connecté(e) sur cet appareil ; les autres sessions seront fermées.
        </p>
        <div className="mt-5">
          <ChangePasswordForm />
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-brand-900">Préférences de notification</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Choisissez comment vous souhaitez être informé(e).
        </p>
        <div className="mt-5">
          <NotificationPreferences
            initialEmail={prefs?.notifyEmail ?? true}
            initialSms={prefs?.notifySms ?? true}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-red-800">Supprimer mon compte</h2>
        <p className="mt-1 text-sm text-ink-soft">
          La suppression est définitive et entraîne l&apos;effacement de vos données (droit RGPD).
        </p>
        <div className="mt-5">
          <DeleteAccountForm />
        </div>
      </section>
    </div>
  );
}
