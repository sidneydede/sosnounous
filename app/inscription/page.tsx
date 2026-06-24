import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/forms/auth/RegisterForm";
import { getSessionUser } from "@/lib/auth/session";
import { isRole, ROLES, type Role } from "@/lib/auth/roles";
import { getServices } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Créer un compte",
  description: "Inscrivez-vous comme famille ou comme intervenant sur SOS Nounous & Services.",
  path: "/inscription",
});

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  if (await getSessionUser()) redirect("/espace");

  const { role } = await searchParams;
  const defaultRole: Role = role && isRole(role) ? (role as Role) : ROLES.FAMILY;
  const services = await getServices();

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Quelques informations suffisent pour démarrer."
      footer={
        <>
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="font-medium text-brand-700 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <RegisterForm defaultRole={defaultRole} services={services} />
    </AuthShell>
  );
}
