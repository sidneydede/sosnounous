"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/data/faq";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/** Accordéon FAQ accessible (détail/sommaire natif géré au clavier). */
export function Faq({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-brand-100 rounded-2xl border border-brand-100 bg-white">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={open}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                onClick={() => setOpenIndex(open ? null : i)}
              >
                <span className="font-semibold text-brand-900">{item.question}</span>
                <Icon
                  name="chevron-down"
                  className={cn(
                    "h-5 w-5 shrink-0 text-brand-600 transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>
            </h3>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              hidden={!open}
              className="px-5 pb-5 text-sm leading-relaxed text-ink-soft"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
