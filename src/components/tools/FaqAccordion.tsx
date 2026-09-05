"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ToolFaq } from "@/types/tool";

interface FaqAccordionProps {
  faqs: ToolFaq[];
  toolName: string;
}

export function FaqAccordion({ faqs, toolName }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-12 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          FAQs About NeedTools&apos; {toolName}
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div key={idx} className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${idx}`}
                className="w-full py-4 text-left flex items-center justify-between gap-4 font-bold text-base text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  id={`faq-panel-${idx}`}
                  className="pb-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed animate-fade-in"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
