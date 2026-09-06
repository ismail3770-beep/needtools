"use client";

import React from "react";

export function StatsBanner() {
  return (
    <div className="border-t border-b border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0] dark:divide-slate-800 py-12">
          
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-black dark:text-white tracking-tight">8+</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-widest">Free Web Tools</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-black dark:text-white tracking-tight">32715+</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-widest">Files Processed</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-black dark:text-white tracking-tight">2+</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-widest">Millions Saved</span>
          </div>

        </div>
      </div>
    </div>
  );
}
