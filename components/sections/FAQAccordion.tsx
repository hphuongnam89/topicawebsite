"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: readonly FAQ[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="w-full">
      {faqs.map((faq, index) => (
        <div key={index} className="border-b border-line-200">
          <button
            onClick={() => toggle(index)}
            className="flex w-full items-center justify-between py-4 text-left font-semibold text-ink-950 transition-colors hover:text-brand-700"
            aria-expanded={openIndex === index}
          >
            <span>{faq.question}</span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          <motion.div
            initial={false}
            animate={{
              height: openIndex === index ? "auto" : 0,
              opacity: openIndex === index ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-body text-ink-600">{faq.answer}</div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
