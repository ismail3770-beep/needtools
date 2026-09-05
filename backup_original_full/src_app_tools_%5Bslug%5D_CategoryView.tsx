import React from "react";
import { CATEGORIES } from "@/config/categories";
import { getToolsByCategory } from "@/config/toolsRegistry";
import { ToolCard } from "@/components/home/ToolCard";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { notFound } from "next/navigation";

export function CategoryView({ categoryId }: { categoryId: string }) {
const category = CATEGORIES.find((c) => c.id === categoryId);

if (!category) {
notFound();
}

const tools = getToolsByCategory(categoryId);

return (
<div className="flex min-h-[calc(100vh-64px)]">
{/* Sidebar for Desktop */}
<aside className="hidden lg:block w-72 shrink-0 h-[calc(100vh-64px)] sticky top-16">
<CategorySidebar categoryId={categoryId} />
</aside>

{/* Main Content Area */}
<main className="flex-1 p-6 sm:p-10 lg:p-12 pb-24 overflow-x-hidden">
<div className="max-w-5xl mx-auto space-y-8">
<div className="space-y-2">
<h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
{category.name}
</h1>
<p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
{category.description} Select a tool below to get started.
</p>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
{tools.map((tool) => (
<ToolCard key={tool.id} tool={tool} />
))}
</div>
</div>
</main>
</div>
);
}
