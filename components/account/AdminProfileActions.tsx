"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { profileStatusLabels, PROFILE_STATUS, type ProfileStatus } from "@/lib/profiles";

const SETTABLE: ProfileStatus[] = [
  PROFILE_STATUS.IN_REVIEW,
  PROFILE_STATUS.VERIFIED,
  PROFILE_STATUS.ACTIVE,
  PROFILE_STATUS.SUSPENDED,
  PROFILE_STATUS.ARCHIVED,
  PROFILE_STATUS.DRAFT,
];

interface Props {
  profileId: string;
  status: ProfileStatus;
  identityVerified: boolean;
  referencesVerified: boolean;
  trained: boolean;
  blacklisted: boolean;
  notes: string;
}

export function AdminProfileActions(props: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState(props.notes);
  const [statusValue, setStatusValue] = useState<ProfileStatus>(props.status);

  async function act(action: string, extra?: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/admin/profiles/${props.profileId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Vérifications (RG-10) */}
      <div>
        <h3 className="text-sm font-semibold text-brand-900">Vérifications</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant={props.identityVerified ? "outline" : "primary"} disabled={busy} onClick={() => act(props.identityVerified ? "identity_fail" : "identity_pass")}>
            {props.identityVerified ? "Annuler vérif. identité" : "Valider l'identité"}
          </Button>
          <Button type="button" size="sm" variant={props.referencesVerified ? "outline" : "primary"} disabled={busy} onClick={() => act(props.referencesVerified ? "references_fail" : "references_pass")}>
            {props.referencesVerified ? "Annuler vérif. références" : "Valider les références"}
          </Button>
          <Button type="button" size="sm" variant={props.trained ? "outline" : "primary"} disabled={busy} onClick={() => act("toggle_trained")}>
            {props.trained ? "Retirer « formé »" : "Marquer « formé »"}
          </Button>
        </div>
      </div>

      {/* Cycle de vie (RG-07) */}
      <div>
        <h3 className="text-sm font-semibold text-brand-900">Statut du profil</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value as ProfileStatus)}
            className="rounded-xl border border-brand-200 px-3 py-2 text-sm"
            aria-label="Nouveau statut"
          >
            {SETTABLE.map((s) => (
              <option key={s} value={s}>
                {profileStatusLabels[s]}
              </option>
            ))}
          </select>
          <Button type="button" size="sm" variant="accent" disabled={busy} onClick={() => act("set_status", { status: statusValue })}>
            Appliquer le statut
          </Button>
        </div>
      </div>

      {/* Notes internes + blacklist */}
      <div>
        <h3 className="text-sm font-semibold text-brand-900">Notes internes (non publiques)</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-xl border border-brand-200 px-3 py-2 text-sm"
          placeholder="Qualification, points de vigilance…"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="primary" disabled={busy} onClick={() => act("save_notes", { notes })}>
            Enregistrer les notes
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={props.blacklisted ? "" : "border-red-300 text-red-700 hover:bg-red-50"}
            disabled={busy}
            onClick={() => act("toggle_blacklist")}
          >
            {props.blacklisted ? "Retirer de la blacklist" : "Mettre en blacklist"}
          </Button>
        </div>
      </div>
    </div>
  );
}
