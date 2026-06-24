import { cn } from "@/lib/cn";
import { Container } from "./Container";

/** Section verticale avec espacement homogène (cohérence — CDC §5.1). */
export function Section({
  className,
  containerClassName,
  children,
  id,
  as: Tag = "section",
}: {
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  id?: string;
  as?: "section" | "div";
}) {
  return (
    <Tag id={id} className={cn("py-14 sm:py-20", className)}>
      <Container className={containerClassName}>{children}</Container>
    </Tag>
  );
}

/** Titre de section avec sur-titre optionnel et centrage. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
  as = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  as?: "h1" | "h2";
}) {
  const Heading = as;
  return (
    <div className={cn("max-w-2xl", centered && "mx-auto text-center")}>
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent-600">
          {eyebrow}
        </p>
      )}
      <Heading
        className={cn(
          as === "h1"
            ? "text-3xl font-bold sm:text-4xl lg:text-5xl"
            : "text-2xl font-bold sm:text-3xl lg:text-4xl",
        )}
      >
        {title}
      </Heading>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
