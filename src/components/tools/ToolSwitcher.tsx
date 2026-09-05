import React from "react";
import Link from "next/link";
import { ToolItem } from "@/types/tool";
import { TOOLS_REGISTRY } from "@/config/toolsRegistry";

export function ToolSwitcher({ currentTool }: { currentTool: ToolItem }) {
  const otherTools = TOOLS_REGISTRY.filter(
    (t) => t.category === currentTool.category && t.slug !== currentTool.slug
  );

  if (otherTools.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 mb-4">
      <div className="flex items-center gap-2 px-1">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-2">
          Explore more:
        </span>
        {otherTools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="whitespace-nowrap px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
          >
            {tool.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
