import Link from "next/link";
import { cn } from "@/lib/cn";

type Tone = "onLight" | "onDark";

/**
 * Symbole de marque — foyer (toit) + cœur corail (confiance · soin),
 * inscrit dans un cercle. Conforme à la charte (Logo & système).
 */
export function LogoMark({
  tone = "onLight",
  className,
}: {
  tone?: Tone;
  className?: string;
}) {
  const ring = tone === "onDark" ? "#FAF7F1" : "#15324B";
  const roof = tone === "onDark" ? "#FAF7F1" : "#15324B";
  const heart = "#DE7F5C";
  return (
    <svg viewBox="0 0 48 48" className={cn("h-9 w-9", className)} role="img" aria-label="SOS Nounous & Services">
      <circle cx="24" cy="24" r="21.5" fill="none" stroke={ring} strokeWidth="2" />
      <circle cx="24" cy="24" r="17.5" fill="none" stroke={ring} strokeWidth="1" opacity="0.45" />
      <path d="M11 25.5 L24 14 L37 25.5 Z" fill={roof} />
      <path
        d="M24 33c-5.2-3.4-7-6.3-4.7-8.7 1.5-1.6 3.8-1 4.7.6.9-1.6 3.2-2.2 4.7-.6 2.3 2.4.5 5.3-4.7 8.7z"
        fill={heart}
      />
    </svg>
  );
}

/** Logo complet (symbole + signature typographique). */
export function Logo({
  tone = "onLight",
  className,
  href = "/",
}: {
  tone?: Tone;
  className?: string;
  href?: string | null;
}) {
  const nounous = tone === "onDark" ? "text-white" : "text-brand-900";
  const services = tone === "onDark" ? "text-cream-200" : "text-brand-600";

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark tone={tone} />
      <span className="font-display leading-none">
        <span className="block text-base font-bold tracking-tight">
          <span className="text-accent-500">SOS</span>{" "}
          <span className={nounous}>Nounous</span>
        </span>
        <span className={cn("block text-[0.7rem] font-medium tracking-wide", services)}>
          &amp; Services
        </span>
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="SOS Nounous & Services — accueil" className="inline-flex">
      {content}
    </Link>
  );
}
