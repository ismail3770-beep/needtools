"use client";

import React from "react";
import { ToolCard } from "@/components/home/ToolCard";
import { CATEGORIES } from "@/config/categories";
import { getToolsByCategory } from "@/config/toolsRegistry";

export default function AllToolsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            All Tools
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Browse our complete collection of free, fast, and secure tools. Everything runs locally in your browser for maximum privacy.
          </p>
        </div>

        {/* Categories and Tools */}
        <div className="space-y-16">
          {CATEGORIES.map((category) => {
            const tools = getToolsByCategory(category.id);
            
            // Skip rendering the category if it has no tools
            if (tools.length === 0) return null;

            return (
              <section key={category.id} id={category.id} className="space-y-6">
                <div className="space-y-2">
                  <h2 className={`text-2xl font-bold ${category.colorClass}`}>
                    {category.name}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {category.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} featured={false} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

      </div>
    </div>
  );
}
