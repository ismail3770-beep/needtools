import React from "react";
import { Competitor } from "@/config/competitors";
import Link from "next/link";

export function CompareView({ competitor }: { competitor: Competitor }) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white">
      <section className="border-b border-black/5 dark:border-white/10 py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-neutral-900/20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="text-sm font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
            Compare Alternatives
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            NeedTools vs {competitor.name}
          </h1>
          <p className="text-lg sm:text-xl text-black/60 dark:text-white/60 max-w-2xl mx-auto leading-relaxed">
            {competitor.description} See why thousands are switching to NeedTools for 100% private, zero-upload processing.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-neutral-800/60 border-b border-black/10 dark:border-white/10">
                <th className="py-5 px-6 text-sm font-bold uppercase tracking-wider text-black/70 dark:text-white/70">Feature</th>
                <th className="py-5 px-6 text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">NeedTools</th>
                <th className="py-5 px-6 text-sm font-bold uppercase tracking-wider text-black/50 dark:text-white/50">{competitor.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {competitor.vsNeedTools.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                  <td className="py-5 px-6 text-sm font-semibold">{row.feature}</td>
                  <td className="py-5 px-6 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10">
                    <span className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                      {row.needTools}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-sm text-black/50 dark:text-white/50">{row.competitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 p-8 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-center space-y-4">
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">The Verdict</h2>
          <p className="text-indigo-800/80 dark:text-indigo-200/80 max-w-2xl mx-auto leading-relaxed">
            {competitor.verdict}
          </p>
          <div className="pt-4">
            <Link href="/" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
              Explore All Free Tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
