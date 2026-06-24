import type { MethodStep } from "@/lib/data/method";
import { Icon, type IconName } from "@/components/ui/Icon";

/** Affiche un parcours en étapes numérotées (CDC §5.4 — méthode en étapes). */
export function MethodSteps({ steps }: { steps: MethodStep[] }) {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step) => (
        <li key={step.number} className="relative flex flex-col">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-700 text-base font-bold text-white">
              {step.number}
            </span>
            <Icon name={step.icon as IconName} className="h-6 w-6 text-accent-500" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-brand-900">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  );
}
