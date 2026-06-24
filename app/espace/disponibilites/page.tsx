import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { getOrCreateProfile, serializeList } from "@/lib/profiles";
import { AvailabilityManager } from "@/components/account/AvailabilityManager";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Mes disponibilités", description: "Calendrier de disponibilités." });

export default async function DisponibilitesPage() {
  const me = await requireRole([ROLES.INTERVENANT], "/espace/disponibilites");
  const profile = await getOrCreateProfile({
    id: me.id,
    metiers: serializeList(me.metiers),
    commune: me.commune,
  });
  const slots = await prisma.availabilitySlot.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Mes disponibilités</h1>
      <p className="mt-2 text-ink-soft">
        Indiquez vos créneaux hebdomadaires : ils aident l&apos;agence à vous proposer des missions
        adaptées.
      </p>
      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <AvailabilityManager slots={slots} />
      </div>
    </div>
  );
}
