"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/components/ui/cn";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: readonly FAQ[];
  allowMultiple?: boolean;
}

export function FAQAccordion({ faqs, allowMultiple = false }: FAQAccordionProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([]);

  const toggle = (index: number) => {
    setOpenIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      return allowMultiple ? [...prev, index] : [index];
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(index);
    }
  };

  return (
    <div className="w-full">
      {faqs.map((faq, index) => {
        const isOpen = openIndices.includes(index);
        const headerId = `faq-header-${index}`;
        const contentId = `faq-content-${index}`;

        return (
          <div key={index} className="border-b border-line-200 last:border-b-0">
            <button
              id={headerId}
              aria-expanded={isOpen}
              aria-controls={contentId}
              onClick={() => toggle(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "flex w-full items-center justify-between py-5 text-left font-semibold transition-colors focus-visible:outline-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20 rounded-sm px-1 -mx-1",
                isOpen ? "text-brand-700" : "text-ink-950 hover:text-brand-700"
              )}
            >
              <span className="text-body-lg pr-4">{faq.question}</span>
              <span className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                isOpen ? "bg-brand-50 text-brand-700" : "bg-paper text-ink-400 group-hover:bg-line-100"
              )}>
                <ChevronDown
                  className={cn("h-5 w-5 transition-transform duration-300", isOpen && "rotate-180")}
                  aria-hidden="true"
                />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={contentId}
                  role="region"
                  aria-labelledby={headerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 pt-1 text-body text-ink-600 pl-1 prose-editorial prose-p:last:mb-0" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
