import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/forms/auth/LoginForm";
import { getSessionUser } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Connexion",
  description: "Connectez-vous à votre espace SOS Nounous & Services.",
  path: "/connexion",
});

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getSessionUser()) redirect("/espace");

  const { next } = await searchParams;
  // N'autorise que des chemins internes (évite les redirections ouvertes)
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/espace";

  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à votre espace personnel."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-brand-700 hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <LoginForm next={safeNext} />
    </AuthShell>
  );
}
