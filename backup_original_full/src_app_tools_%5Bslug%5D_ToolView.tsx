import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CATEGORIES, CATEGORY_THEMES } from "@/config/categories";
import { DynamicIcon } from "@/components/icons/DynamicIcon";
import { ToolDispatcher } from "@/components/tools/ToolDispatcher";
import { HowToUseSection } from "@/components/tools/HowToUseSection";
import { FaqAccordion } from "@/components/tools/FaqAccordion";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdBanner } from "@/components/ads/AdBanner";
import { JsonLdSchema } from "@/components/seo/JsonLdSchema";
import { ToolFeedbackWidget } from "@/components/tools/ToolFeedbackWidget";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { getToolBySlug } from "@/config/toolsRegistry";
import { notFound } from "next/navigation";

export function ToolView({ toolSlug }: { toolSlug: string }) {
const tool = getToolBySlug(toolSlug);

if (!tool) {
notFound();
}

const category = CATEGORIES.find((c) => c.id === tool.category);
const theme = CATEGORY_THEMES[tool.category] || CATEGORY_THEMES.developer;

return (
<div className="flex min-h-[calc(100vh-64px)]">
{/* Sidebar for Desktop */}
<aside className="hidden lg:block w-72 shrink-0 h-[calc(100vh-64px)] sticky top-16">
<CategorySidebar categoryId={tool.category} activeToolSlug={tool.slug} />
</aside>

{/* Main Content Area */}
<main className="flex-1 py-8 sm:py-10 lg:px-8 xl:px-12 overflow-x-hidden">
{/* Schema Markup for AI SEO */}
<JsonLdSchema tool={tool} />

<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">


{/* Tool Header with Authentic Identity */}
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-2">
<div
className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm shrink-0 ${theme.iconBg}`}
>
<DynamicIcon name={tool.iconName} className={`w-7 h-7 ${theme.iconColor}`} />
</div>

<div className="space-y-1.5 flex-1">

<h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
{tool.name}
</h1>

<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
{tool.fullDescription}
</p>
</div>
</div>

{/* Main Interactive Tool Workspace Shell */}
<div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-none">
<ToolDispatcher tool={tool} />
</div>

{/* Ad Placement 1 */}
<AdBanner format="horizontal" />

{/* Programmatic Content: How To Steps & Features */}
<HowToUseSection tool={tool} />

{/* FAQs */}
<FaqAccordion faqs={tool.faqs} toolName={tool.name} />

{/* User Helpful Feedback Widget */}
<ToolFeedbackWidget toolSlug={tool.slug} />

{/* Related Tools Discovery */}
<RelatedTools currentTool={tool} />
</div>
</main>
</div>
);
}
