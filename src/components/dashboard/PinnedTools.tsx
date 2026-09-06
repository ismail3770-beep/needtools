"use client";

import React from "react";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import type { PinnedTool } from "@/lib/db";
import { getToolBySlug } from "@/config/toolsRegistry";
import { CATEGORIES } from "@/config/categories";

interface PinnedToolsProps {
  pinnedTools: PinnedTool[];
}

export function PinnedTools({ pinnedTools }: PinnedToolsProps) {
  if (pinnedTools.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-10 h-10 mx-auto text-[#64748B]/50 mb-3" />
        <p className="text-sm font-medium text-[#64748B]">No pinned tools yet</p>
        <p className="text-xs text-[#64748B]/70 mt-1">Star your favorite tools for quick access</p>
        <Link href="/tools" className="inline-block mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700">
          Browse Tools →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {pinnedTools.map((pt) => {
        const tool = getToolBySlug(pt.toolSlug);
        if (!tool) return null;
        const category = CATEGORIES.find((c) => c.id === tool.category);

        return (
          <Link
            key={pt.toolSlug}
            href={`/tools/${tool.slug}`}
            className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-[#E2E8F0] dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-brand-500 fill-brand-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] dark:text-white truncate group-hover:text-brand-600 transition-colors">
                {tool.name}
              </p>
              <p className="text-xs text-[#64748B] dark:text-white/50 truncate mt-0.5">{category?.name}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
