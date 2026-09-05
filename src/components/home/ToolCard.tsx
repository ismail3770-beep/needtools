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
      className="group block p-6 h-[140px] rounded-2xl bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/10 transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 hover:-translate-y-1 relative overflow-hidden"
    >
      <div className="flex items-start gap-4 h-full relative z-10">
        {/* Icon (Solid color like reference) */}
        <div className={`w-[42px] h-[42px] shrink-0 rounded flex items-center justify-center ${theme.activeBorder.replace('border-', 'bg-')}`}>
          <DynamicIcon name={tool.iconName} className="w-[20px] h-[20px] text-white" />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="font-bold text-[16px] text-black dark:text-white leading-tight truncate group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors">
              {tool.name}
            </h3>
            {/* Right Arrow (aligned with title) */}
            <div className="shrink-0 ml-3">
              <ChevronRight className="w-5 h-5 text-black/20 dark:text-white/20 group-hover:text-black/60 dark:group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
          <p className="text-[14px] text-black/60 dark:text-white/60 line-clamp-2 leading-relaxed pr-2">
            {tool.shortDescription}
          </p>
        </div>
      </div>
    </Link>
  );
}
