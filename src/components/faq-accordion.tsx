"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FaqEntry } from "@/types";

export function FaqAccordion({ faqs }: { faqs: FaqEntry[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="divide-y divide-black/5 border-t border-b border-black/5">
      {faqs.map((faq) => {
        const open = openId === faq.id;
        return (
          <div key={faq.id}>
            <button
              onClick={() => setOpenId(open ? null : faq.id)}
              aria-expanded={open}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="font-medium text-sm pr-4">{faq.question}</span>
              <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && <p className="pb-4 text-sm text-brand-text/60 leading-relaxed">{faq.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
