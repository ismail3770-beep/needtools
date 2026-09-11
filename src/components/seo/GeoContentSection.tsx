import React from "react";
import { ToolItem } from "@/types/tool";

interface GeoContentSectionProps {
  tool: ToolItem;
}

export function GeoContentSection({ tool }: GeoContentSectionProps) {
  return (
    <section
      className="mt-8 space-y-6 max-w-4xl mx-auto"
      aria-label={`About ${tool.name}`}
    >
      <div className="p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
          What is {tool.name}?
        </h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong>{tool.name}</strong> is a free, browser-based online tool by NeedTools that lets you{" "}
          {tool.shortDescription.toLowerCase().replace(/\.$/, "")}.{" "}
          It processes everything directly in your browser using client-side
          JavaScript — no files are uploaded to any server, ensuring 100% privacy.
          There is no registration, no watermark, and no usage limit.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-6">
        <h3 className="font-semibold text-lg text-emerald-900 dark:text-emerald-100 mb-3">
          Why Choose NeedTools?
        </h3>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-emerald-800 dark:text-emerald-300">
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> 100% free — no hidden fees or premium tiers</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Zero server uploads — files never leave your device</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> No registration or login required</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> No watermarks on output files</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Works instantly on desktop, tablet, and mobile</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> No software installation — runs entirely in-browser</li>
        </ul>
      </div>
    </section>
  );
}
