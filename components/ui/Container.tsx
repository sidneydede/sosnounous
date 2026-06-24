import { cn } from "@/lib/cn";

/** Conteneur centré à largeur maîtrisée (cohérence des marges — CDC §5.1). */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
