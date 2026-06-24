import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  // CTA principal : corail (chaleur, action) — CDC §5.5
  accent: "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700",
  // Action de confiance : bleu/teal
  primary: "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900",
  outline:
    "border border-brand-700 text-brand-800 hover:bg-brand-50 active:bg-brand-100",
  ghost: "text-brand-800 hover:bg-brand-50",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-[0.95rem]",
  lg: "px-7 py-3.5 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

/** Bouton-lien (interne ou externe). */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const isExternal = href.startsWith("http");
  if (isExternal) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

/** Bouton d'action (formulaires). */
export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}
