"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FILE_TYPES, fileTypeLabels, type FileType } from "@/lib/fileTypes";

export interface FileRow {
  id: string;
  type: string;
  originalName: string;
  size: number;
  createdAt: string;
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function IntervenantFiles({ files }: { files: FileRow[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Sélectionnez un fichier.");
      return;
    }
    setBusy(true);
    try {
      // Pas de Content-Type manuel : le navigateur définit la frontière multipart.
      const res = await fetch("/api/account/files", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Envoi impossible.");
        return;
      }
      formRef.current?.reset();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/account/files/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-brand-900">{f.originalName}</p>
                <p className="text-xs text-ink-muted">
                  {fileTypeLabels[f.type as FileType] ?? f.type} · {humanSize(f.size)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <a
                  href={`/api/files/${f.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
                >
                  <Icon name="arrow-right" className="h-4 w-4" /> Télécharger
                </a>
                <button type="button" onClick={() => remove(f.id)} className="text-ink-muted hover:text-red-600" aria-label="Supprimer le fichier">
                  <Icon name="close" className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Aucune pièce déposée pour le moment.</p>
      )}

      <form ref={formRef} onSubmit={upload} className="grid gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium text-brand-900">Type</label>
          <select id="type" name="type" className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm">
            {FILE_TYPES.map((t) => <option key={t} value={t}>{fileTypeLabels[t]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="file" className="mb-1 block text-sm font-medium text-brand-900">Fichier</label>
          <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="text-sm" />
        </div>
        <Button type="submit" size="sm" variant="primary" disabled={busy}>
          {busy ? "Envoi…" : "Déposer"}
        </Button>
        {error && <p className="text-sm text-red-600 sm:col-span-3" role="alert">{error}</p>}
      </form>
      <p className="text-xs text-ink-muted">
        Formats acceptés : JPEG, PNG, WEBP, PDF (5 Mo max). Vos pièces sont chiffrées et
        accessibles uniquement par vous et l&apos;agence.
      </p>
    </div>
  );
}
