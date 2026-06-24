import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyForm } from "@/components/forms/auth/VerifyForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Vérification du compte",
  description: "Saisissez le code de vérification reçu pour activer votre compte.",
  path: "/verification",
});

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthShell
      title="Vérifiez votre compte"
      footer={
        <>
          Mauvaise adresse ?{" "}
          <Link href="/inscription" className="font-medium text-brand-700 hover:underline">
            Recommencer l&apos;inscription
          </Link>
        </>
      }
    >
      {email ? (
        <VerifyForm email={email} />
      ) : (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Adresse e-mail manquante. Reprenez le processus d&apos;inscription ou de connexion.
        </p>
      )}
    </AuthShell>
  );
}
