/**
 * Génération de CSV pour les exports back-office (reporting).
 * Séparateur « ; » + BOM UTF-8 pour une ouverture correcte dans Excel (FR/accents).
 */

function escapeCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[";\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(headers: string[], rows: (unknown[])[]): string {
  const lines = [headers.map(escapeCell).join(";")];
  for (const row of rows) lines.push(row.map(escapeCell).join(";"));
  return "﻿" + lines.join("\r\n"); // BOM + CRLF
}

/** Construit une réponse HTTP de téléchargement CSV. */
export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
