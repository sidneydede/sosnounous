/**
 * Mise en forme typographique pour les contenus longs (pages légales, etc.).
 * Évite la dépendance @tailwindcss/typography pour ce périmètre.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        max-w-3xl text-ink-soft
        [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-brand-900
        [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-brand-900
        [&_p]:mt-3 [&_p]:leading-relaxed
        [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5
        [&_li]:leading-relaxed
        [&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline
        [&_strong]:text-brand-900
      "
    >
      {children}
    </div>
  );
}
