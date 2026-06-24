import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/forms/auth/ForgotForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Mot de passe oublié",
  description: "Réinitialisez le mot de passe de votre compte SOS Nounous & Services.",
  path: "/mot-de-passe-oublie",
});

export default function MotDePasseOubliePage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Indiquez votre e-mail pour recevoir un lien de réinitialisation."
      footer={
        <Link href="/connexion" className="font-medium text-brand-700 hover:underline">
          ← Retour à la connexion
        </Link>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
