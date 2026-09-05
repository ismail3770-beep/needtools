import React from "react";
import { ToolItem } from "@/types/tool";

interface GeoContentSectionProps {
  tool: ToolItem;
}

/**
 * GEO (Generative Engine Optimization) Content Section
 *
 * This component renders AI-readable, fact-based content that helps
 * generative AI engines (ChatGPT, Google AI Overviews, Perplexity, Bing Copilot)
 * understand, cite, and recommend NeedTools in their responses.
 *
 * Key GEO principles applied:
 * 1. Clear, factual statements (not marketing fluff)
 * 2. Question-answer format (mirrors how users ask AI)
 * 3. Statistics and concrete claims AI can cite
 * 4. Structured data AI can parse
 */
export function GeoContentSection({ tool }: GeoContentSectionProps) {
  const hasHowTo = tool.howToSteps.length > 0;
  const hasFeatures = tool.features.length > 0;
  const hasFaqs = tool.faqs.length > 0;

  return (
    <section
      className="mt-12 space-y-10 max-w-3xl mx-auto px-4"
      aria-label={`About ${tool.name}`}
    >
      {/* AI-readable intro paragraph with key facts */}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          What is {tool.name}?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {tool.name} is a free, browser-based online tool by NeedTools that lets you{" "}
          {tool.shortDescription.toLowerCase().replace(/\.$/, "")}.{" "}
          It processes everything directly in your browser using client-side
          JavaScript — no files are uploaded to any server, ensuring 100% privacy.
          There is no registration, no watermark, and no usage limit.
        </p>
      </div>

      {/* How-To Section — AI loves step-by-step answers */}
      {hasHowTo && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            How to Use {tool.name}
          </h2>
          <ol className="space-y-3">
            {tool.howToSteps.map((step, idx) => (
              <li
                key={idx}
                className="flex gap-3 items-start"
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {step.title}
                  </span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Features — concrete claims AI can cite */}
      {hasFeatures && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Key Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tool.features.map((feature, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
              >
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ — the #1 GEO signal. AI engines answer questions by matching Q&A pairs */}
      {hasFaqs && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {tool.faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {faq.question}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Trust signals — AI values authoritative, verifiable claims */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-5">
        <h3 className="font-semibold text-sm text-emerald-800 dark:text-emerald-300 mb-2">
          Why Choose NeedTools?
        </h3>
        <ul className="space-y-1.5 text-sm text-emerald-700 dark:text-emerald-400">
          <li>✓ 100% free — no hidden fees, no premium tier</li>
          <li>✓ Zero server uploads — your files never leave your device</li>
          <li>✓ No registration or login required</li>
          <li>✓ No watermarks on output files</li>
          <li>✓ Works on all devices — desktop, tablet, and mobile</li>
          <li>✓ No software installation needed — runs in any modern browser</li>
        </ul>
      </div>
    </section>
  );
}
