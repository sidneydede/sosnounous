"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export function AdminDeleteDocButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button type="button" onClick={remove} disabled={busy} className="text-ink-muted hover:text-red-600" aria-label="Supprimer le document">
      <Icon name="close" className="h-5 w-5" />
    </button>
  );
}
