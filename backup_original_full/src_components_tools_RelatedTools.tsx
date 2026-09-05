import React from "react";
import { ToolItem } from "@/types/tool";
import { TOOLS_REGISTRY } from "@/config/toolsRegistry";
import { ToolCard } from "@/components/home/ToolCard";
import { Sparkles } from "lucide-react";

interface RelatedToolsProps {
currentTool: ToolItem;
}

export function RelatedTools({ currentTool }: RelatedToolsProps) {
// Find same category tools first, then others
const related = TOOLS_REGISTRY.filter((t) => t.slug !== currentTool.slug)
.sort((a, b) => (a.category === currentTool.category ? -1 : 1))
.slice(0, 3);

if (related.length === 0) return null;

return (
<section className="space-y-6 my-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
<div className="space-y-1">
<div className="flex items-center gap-2">
<Sparkles className="w-5 h-5 text-brand-500" />
<h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
You Might Also Like
</h2>
</div>
<p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
More free browser-based tools to supercharge your workflow.
</p>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
{related.map((tool) => (
<ToolCard key={tool.id} tool={tool} />
))}
</div>
</section>
);
}
