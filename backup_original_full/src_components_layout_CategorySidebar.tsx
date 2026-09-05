"use client";

import React from "react";
import Link from "next/link";
import { getToolsByCategory } from "@/config/toolsRegistry";
import { CATEGORIES, CATEGORY_THEMES } from "@/config/categories";
import { DynamicIcon } from "@/components/icons/DynamicIcon";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface CategorySidebarProps {
categoryId: string;
activeToolSlug?: string;
}

export function CategorySidebar({ categoryId, activeToolSlug }: CategorySidebarProps) {
const tools = getToolsByCategory(categoryId);
const category = CATEGORIES.find((c) => c.id === categoryId);
const theme = CATEGORY_THEMES[categoryId] || CATEGORY_THEMES.pdf;

if (!category) return null;

return (
<div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
<div className="p-4 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800">

<div className="flex items-center gap-3">
<div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${theme.iconBg}`}>
<DynamicIcon name={category.iconName} className={`w-5 h-5 ${theme.iconColor}`} />
</div>
<div>
<h2 className="text-lg font-bold text-slate-900 dark:text-white">
{category.name}
</h2>
</div>
</div>
</div>

<div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
{(() => {
// 1. Group tools dynamically
const grouped = tools.reduce((acc, tool) => {
const group = tool.subCategory || "OTHER TOOLS";
if (!acc[group]) acc[group] = [];
acc[group].push(tool);
return acc;
}, {} as Record<string, typeof tools>);

// 2. Define preferred order across all categories
const preferredOrder = [
"ORGANIZE PDF", "OPTIMIZE PDF", "CONVERT TO PDF", "CONVERT FROM PDF", "EDIT PDF", "PDF SECURITY", "AI PDF TOOLS",
"OPTIMIZE IMAGE", "EDIT IMAGE", "CONVERT IMAGE",
"LINKS & SHARING", "SECURITY", "TEXT & WRITING", "SITE ANALYSIS", "META & LINKS", "TEXT ANALYSIS"
];

// 3. Sort the keys: preferred groups first, then alphabetically, "OTHER TOOLS" last
const sortedGroups = Object.keys(grouped).sort((a, b) => {
if (a === "OTHER TOOLS") return 1;
if (b === "OTHER TOOLS") return -1;

const indexA = preferredOrder.indexOf(a);
const indexB = preferredOrder.indexOf(b);

if (indexA !== -1 && indexB !== -1) return indexA - indexB;
if (indexA !== -1) return -1;
if (indexB !== -1) return 1;

return a.localeCompare(b);
});

return sortedGroups.map((groupName) => {
const groupTools = grouped[groupName];
return (
<div key={groupName} className="space-y-1">
<h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 ml-2">
{groupName}
</h3>
{groupTools.map((tool) => {
const isActive = tool.slug === activeToolSlug;
return (
<Link
key={tool.slug}
href={`/tools/${tool.slug}`}
className={`flex items-center justify-between group p-2.5 rounded-xl transition-all ${
isActive 
? "bg-slate-100 dark:bg-slate-800/80" 
: "hover:bg-slate-50 dark:hover:bg-slate-800/40"
}`}
>
<div className="flex items-center gap-3">
<div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
isActive 
? theme.iconBg 
: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
}`}>
<DynamicIcon name={tool.iconName} className={`w-4 h-4 ${isActive ? theme.iconColor : ""}`} />
</div>
<div className="flex flex-col">
<span className={`text-sm font-semibold transition-colors ${
isActive 
? "text-slate-900 dark:text-white" 
: "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
}`}>
{tool.name}
</span>
{tool.isNew && (
<span className="text-[10px] font-bold text-blue-500 uppercase">Coming Soon</span>
)}
</div>
</div>
{isActive && <ChevronRight className={`w-4 h-4 ${theme.iconColor}`} />}
</Link>
);
})}
</div>
);
});
})()}
</div>
</div>
);
}
