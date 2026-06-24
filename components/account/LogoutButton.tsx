"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-accent-600 disabled:opacity-60",
        className,
      )}
    >
      <Icon name="arrow-right" className="h-4 w-4" />
      {loading ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
