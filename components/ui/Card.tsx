import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-100 bg-white p-6 shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}
