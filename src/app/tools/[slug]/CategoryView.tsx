import React from "react";
import { CATEGORIES } from "@/config/categories";
import { getToolsByCategory } from "@/config/toolsRegistry";
import { ToolCard } from "@/components/home/ToolCard";
import { notFound } from "next/navigation";
import { ToolItem } from "@/types/tool";

export function CategoryView({ categoryId }: { categoryId: string }) {
  const category = CATEGORIES.find((c) => c.id === categoryId);

  if (!category) {
    notFound();
  }

  const tools = getToolsByCategory(categoryId);

  // Group tools by subCategory
  const groupedTools = tools.reduce((acc, tool) => {
    const subCat = tool.subCategory || "OTHER TOOLS";
    if (!acc[subCat]) acc[subCat] = [];
    acc[subCat].push(tool);
    return acc;
  }, {} as Record<string, ToolItem[]>);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white dark:bg-neutral-950">
      
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-black/5 via-transparent to-transparent dark:from-white/5 opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 text-black dark:text-white text-sm font-semibold tracking-wide border border-black/10 dark:border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black dark:bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black dark:bg-white"></span>
            </span>
            Category
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-black dark:text-white tracking-tight">
            {category.name}
          </h1>
          <p className="text-lg sm:text-xl text-black/60 dark:text-white/60 max-w-2xl mx-auto leading-relaxed">
            {category.description} Select a tool below to get started.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="py-12 sm:py-20 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-24">
          
          <div className="space-y-16">
            {Object.entries(groupedTools).map(([subCat, subCatTools]) => (
              <section key={subCat} className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                
                {/* Left Side: Sticky Header */}
                <div className="lg:w-1/4 shrink-0">
                  <div className="sticky top-24">
                    <h2 className="text-lg font-bold tracking-widest text-black dark:text-white uppercase mb-2">
                      {subCat}
                    </h2>
                    <div className="w-12 h-1 bg-black/20 dark:bg-white/20 rounded-full mb-4 lg:hidden" />
                    <p className="text-sm text-black/50 dark:text-white/50 hidden lg:block leading-relaxed">
                      Explore our high-quality utilities for {subCat.toLowerCase()}.
                    </p>
                  </div>
                </div>
                
                {/* Right Side: Tool Grid */}
                <div className="lg:w-3/4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {subCatTools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </div>
                
              </section>
            ))}
          </div>
          
        </div>
      </main>
    </div>
  );
}
