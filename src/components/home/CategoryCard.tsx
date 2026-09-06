import React from "react";
import Link from "next/link";
import { CATEGORY_THEMES } from "@/config/categories";
import { CategoryInfo } from "@/types/tool";
import { DynamicIcon } from "@/components/icons/DynamicIcon";
import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  category: CategoryInfo;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const theme = CATEGORY_THEMES[category.id];

  return (
    <Link
      href={`/tools/${category.id}`}
      className="group block p-6 h-[140px] rounded-2xl bg-white dark:bg-neutral-950 border border-[#E2E8F0] dark:border-white/10 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/30 hover:shadow-sm relative overflow-hidden"
    >
      <div className="flex items-start gap-4 h-full relative z-10">
        {/* Icon */}
        <div className={`w-[42px] h-[42px] shrink-0 rounded-lg flex items-center justify-center ${theme.iconBg} border border-[#E2E8F0] dark:border-white/5`}>
          <DynamicIcon name={category.iconName} className={`w-[20px] h-[20px] ${theme.iconColor} group-hover:scale-110 transition-transform`} />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <h3 className="font-bold text-[16px] text-[#0F172A] dark:text-white leading-tight truncate">
                {category.name}
              </h3>
            </div>
            
            {/* Right Arrow */}
            <div className="shrink-0 ml-3">
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-white/20 group-hover:text-[#64748B] dark:group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
          
          <p className="text-[14px] text-[#64748B] dark:text-white/60 line-clamp-2 leading-relaxed pr-2">
            {category.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
