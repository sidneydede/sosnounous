import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/forms/auth/ResetForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Réinitialiser le mot de passe",
  description: "Définissez un nouveau mot de passe pour votre compte.",
  path: "/reinitialiser-mot-de-passe",
});

export default async function ReinitialiserPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Choisissez un nouveau mot de passe sécurisé."
      footer={
        <Link href="/connexion" className="font-medium text-brand-700 hover:underline">
          ← Retour à la connexion
        </Link>
      }
    >
      <ResetForm token={token ?? ""} />
    </AuthShell>
  );
}
