"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Préférences de notification (RG-37). Les envois critiques restent toujours émis. */
export function NotificationPreferences({
  initialEmail,
  initialSms,
}: {
  initialEmail: boolean;
  initialSms: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [sms, setSms] = useState(initialSms);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setSaved(false);
    try {
      const res = await fetch("/api/account/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyEmail: email, notifySms: sms }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between gap-4 rounded-xl border border-brand-100 p-4">
        <span>
          <span className="block text-sm font-medium text-brand-900">Notifications par e-mail</span>
          <span className="block text-xs text-ink-muted">Accusés, profils proposés, suivi des demandes.</span>
        </span>
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-brand-300"
          checked={email}
          onChange={(e) => { setEmail(e.target.checked); setSaved(false); }}
        />
      </label>

      <label className="flex items-center justify-between gap-4 rounded-xl border border-brand-100 p-4">
        <span>
          <span className="block text-sm font-medium text-brand-900">Notifications par SMS</span>
          <span className="block text-xs text-ink-muted">Rappels et alertes (hors codes de sécurité, toujours envoyés).</span>
        </span>
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-brand-300"
          checked={sms}
          onChange={(e) => { setSms(e.target.checked); setSaved(false); }}
        />
      </label>

      <div className="flex items-center gap-3">
        <Button type="button" variant="primary" disabled={busy} onClick={save}>
          {busy ? "Enregistrement…" : "Enregistrer mes préférences"}
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
            <Icon name="check-circle" className="h-5 w-5" /> Enregistré
          </span>
        )}
      </div>
      <p className="text-xs text-ink-muted">
        Les messages essentiels à la sécurité de votre compte (codes de vérification) sont toujours envoyés.
      </p>
    </div>
  );
}
