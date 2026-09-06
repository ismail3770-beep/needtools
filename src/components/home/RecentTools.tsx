"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { History, ArrowRight } from "lucide-react";
import { getRecentTools } from "@/lib/storage";
import { TOOLS_REGISTRY } from "@/config/toolsRegistry";
import { CATEGORY_THEMES } from "@/config/categories";
import { DynamicIcon } from "@/components/icons/DynamicIcon";
import { ToolItem } from "@/types/tool";

export function RecentTools() {
  const [recentToolItems, setRecentToolItems] = useState<ToolItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const slugs = getRecentTools();
    if (slugs.length > 0) {
      const items = slugs
        .map((slug) => TOOLS_REGISTRY.find((t) => t.slug === slug))
        .filter((t): t is ToolItem => Boolean(t));
      setRecentToolItems(items);
    }
  }, []);

  if (!mounted || recentToolItems.length === 0) return null;

  return (
    <section className="mb-12 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-500" />
          <h2 className="text-sm font-bold text-[#0F172A] dark:text-slate-100 uppercase tracking-wider">
            Your Recently Used Tools
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {recentToolItems.map((tool) => {
          const theme = CATEGORY_THEMES[tool.category] || CATEGORY_THEMES.utility;
          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 hover:bg-brand-50/20 transition-all group"
            >
              <div className={`w-8 h-8 rounded-lg ${theme.iconBg} flex items-center justify-center shrink-0 transition-colors`}>
                <DynamicIcon name={tool.iconName} className={`w-4 h-4 ${theme.iconColor}`} />
              </div>
              <span className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 truncate">
                {tool.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
