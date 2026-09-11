"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/config/categories";
import { TOOLS_REGISTRY } from "@/config/toolsRegistry";
import * as Icons from "lucide-react";

export function AllToolsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Group tools by category
  const toolsByCategory = CATEGORIES.map((cat) => {
    return {
      category: cat,
      tools: TOOLS_REGISTRY.filter((t) => t.category === cat.id).slice(0, 8), // Show up to 8 tools per category to keep it neat
    };
  }).filter((group) => group.tools.length > 0);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-[#64748B] dark:text-white/60 hover:text-[#0F172A] dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-colors focus:outline-none"
      >
        All Tools
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 top-[64px] z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-[64px] left-0 w-full bg-white dark:bg-neutral-950 border-b border-[#E2E8F0] dark:border-white/10 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
                {toolsByCategory.map(({ category, tools }) => {
                  const Icon = (Icons as any)[category.iconName] || Icons.Box;
                  return (
                    <div key={category.id} className="space-y-4">
                      <div className={`flex items-center gap-2 ${category.colorClass}`}>
                        <div className={`p-1.5 rounded-md bg-opacity-10 dark:bg-opacity-20 ${category.colorClass.replace('text-', 'bg-')}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <Link 
                          href={`/tools/${category.id}`} 
                          className="font-bold text-sm hover:underline"
                          onClick={() => setIsOpen(false)}
                        >
                          {category.name}
                        </Link>
                      </div>
                      
                      <ul className="space-y-2">
                        {tools.map((tool) => (
                          <li key={tool.id}>
                            <Link
                              href={`/tools/${tool.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="group flex items-center gap-2.5 py-1 text-sm text-[#64748B] dark:text-white/60 hover:text-[#0F172A] dark:hover:text-white transition-colors"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-brand-500 transition-colors" />
                              <span className="truncate">{tool.name}</span>
                            </Link>
                          </li>
                        ))}
                        {TOOLS_REGISTRY.filter((t) => t.category === category.id).length > 8 && (
                          <li>
                            <Link
                              href={`/tools/${category.id}`}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                            >
                              View all <Icons.ArrowRight className="w-3 h-3" />
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-slate-50 dark:bg-white/5 px-6 sm:px-8 py-4 border-t border-[#E2E8F0] dark:border-white/10 flex items-center justify-between">
                <p className="text-sm text-[#64748B] dark:text-white/60">
                  Can't find what you're looking for? 
                </p>
                <Link 
                  href="/tools" 
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-semibold text-[#0F172A] dark:text-white hover:underline flex items-center gap-1.5"
                >
                  Browse Directory <Icons.ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
