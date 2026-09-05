"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { ToolFaq } from "@/types/tool";

interface FaqAccordionProps {
faqs: ToolFaq[];
toolName: string;
}

export function FaqAccordion({ faqs, toolName }: FaqAccordionProps) {
const [openIndex, setOpenIndex] = useState<number | null>(0);

if (!faqs || faqs.length === 0) return null;

return (
<section className="space-y-6 my-12">
<div className="space-y-1">
<div className="flex items-center gap-2">
<HelpCircle className="w-5 h-5 text-brand-500" />
<h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
Frequently Asked Questions
</h2>
</div>
<p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
Everything you need to know about using {toolName}.
</p>
</div>

<div className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
{faqs.map((faq, idx) => {
const isOpen = openIndex === idx;

return (
<div key={idx} className="transition-colors">
<button
onClick={() => setOpenIndex(isOpen ? null : idx)}
aria-expanded={isOpen}
aria-controls={`faq-panel-${idx}`}
className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-brand-600 dark:hover:text-brand-400"
>
<span>{faq.question}</span>
<ChevronDown
className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
isOpen ? "rotate-180 text-brand-500" : ""
}`}
/>
</button>

{isOpen && (
<div
id={`faq-panel-${idx}`}
className="px-6 pb-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed animate-fade-in"
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
