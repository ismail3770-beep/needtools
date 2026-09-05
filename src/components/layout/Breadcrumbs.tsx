"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { getToolBySlug } from "@/config/toolsRegistry";
import { CATEGORIES } from "@/config/categories";

export function Breadcrumbs() {
  const pathname = usePathname();
  
  if (!pathname || pathname === "/") return null;

  const paths = pathname.split("/").filter(Boolean);
  
  // If we're not in /tools, we can show a basic breadcrumb
  if (paths[0] !== "tools") {
    return (
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b0f19]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 text-[13px] sm:text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          {paths.map((p, i) => (
            <React.Fragment key={p}>
              <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
              <span className={`truncate ${i === paths.length - 1 ? "text-slate-900 dark:text-slate-100 font-medium" : ""}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Handle /tools/[slug]
  const slug = paths[1];
  if (!slug) return null;

  // Is it a category?
  const category = CATEGORIES.find((c) => c.id === slug);
  // Is it a tool?
  const tool = getToolBySlug(slug);

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b0f19]/50 backdrop-blur-sm sticky top-[64px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 overflow-x-auto scrollbar-none whitespace-nowrap">
        <Link href="/" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
        
        {category && (
          <span className="text-slate-900 dark:text-slate-100 font-medium shrink-0">
            {category.name}
          </span>
        )}

        {tool && (
          <>
            <Link 
              href={`/tools/${tool.category}`} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
            >
              {CATEGORIES.find(c => c.id === tool.category)?.name || "Tools"}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
            <span className="text-slate-900 dark:text-slate-100 font-medium shrink-0">
              {tool.name}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
