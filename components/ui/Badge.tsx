import { cn } from "@/lib/cn";

type Tone = "brand" | "accent" | "neutral" | "success";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-800 border-brand-200",
  accent: "bg-accent-50 text-accent-700 border-accent-200",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

/** Badge de confiance / étiquette (CDC §2.15 — badges vérifié, références, formé). */
export function Badge({
  tone = "brand",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
