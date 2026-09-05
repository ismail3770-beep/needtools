import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ToolItem } from "@/types/tool";
import { DynamicIcon } from "@/components/icons/DynamicIcon";
import { CATEGORY_THEMES } from "@/config/categories";

interface ToolCardProps {
tool: ToolItem;
featured?: boolean;
}

export function ToolCard({ tool }: ToolCardProps) {
const theme = CATEGORY_THEMES[tool.category] || CATEGORY_THEMES.developer;

return (
<Link
href={`/tools/${tool.slug}`}
className="group block p-6 h-[140px] rounded-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 dark:hover:border-blue-500/30 relative overflow-hidden"
>
<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
<div className="flex items-start gap-4 h-full">
{/* Icon (Solid color like reference) */}
<div className={`w-[42px] h-[42px] shrink-0 rounded flex items-center justify-center ${theme.activeBorder.replace('border-', 'bg-')}`}>
<DynamicIcon name={tool.iconName} className="w-[20px] h-[20px] text-white" />
</div>

{/* Content */}
<div className="flex flex-col flex-1 min-w-0 pt-0.5">
<div className="flex items-start justify-between mb-1.5">
<h3 className="font-bold text-[16px] text-slate-900 dark:text-white leading-tight truncate group-hover:text-blue-600 transition-colors">
{tool.name}
</h3>
{/* Right Arrow (aligned with title) */}
<div className="shrink-0 ml-3">
<ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
</div>
</div>
<p className="text-[14px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed pr-2">
{tool.shortDescription}
</p>
</div>
</div>
</Link>
);
}
