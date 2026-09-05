"use client";

import React, { useMemo } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { RecentTools } from "@/components/home/RecentTools";
import { CategoryCard } from "@/components/home/CategoryCard";
import { ToolCard } from "@/components/home/ToolCard";
import { AdBanner } from "@/components/ads/AdBanner";
import { CATEGORIES } from "@/config/categories";
import { getPopularTools } from "@/config/toolsRegistry";
import { Zap, Layers, Shield, Cpu, Lock, CheckCircle } from "lucide-react";

export default function HomePage() {
const popularTools = useMemo(() => getPopularTools(), []);

return (
<div className="min-h-screen pb-20">
{/* Hero Section */}
<HeroSection />

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
{/* Recent Tools (If any saved locally) */}
<RecentTools />

{/* Section 1: Tool Categories Hub */}
<section id="categories" className="space-y-6">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
<div className="space-y-1">
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
<Layers className="w-3.5 h-3.5" />
</div>
<h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
Tool Suites
</h2>
</div>
<p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
Select a category to open its dedicated workspace.
</p>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
{CATEGORIES.map((category) => (
<CategoryCard key={category.id} category={category} />
))}
</div>
</section>

{/* Ad Placement 1 */}
<AdBanner format="horizontal" />

{/* Section 2: Most Popular Tools */}
<section id="popular" className="space-y-6">
<div className="flex items-center justify-between">
<div className="space-y-1">
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
<Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
</div>
<h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
Popular Tools
</h2>
</div>
<p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
Quick access to our most frequently used utilities.
</p>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
{popularTools.map((tool) => (
<ToolCard key={tool.id} tool={tool} featured />
))}
</div>
</section>

{/* Section 3: Why Choose NeedTools (Authentic Trust & Security Grid) */}
<section className="relative rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-8 sm:p-12 space-y-8 overflow-hidden shadow-2xl shadow-blue-500/5">
{/* Decorative Glows */}
<div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
<div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />

<div className="relative text-center max-w-2xl mx-auto space-y-3">
<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/60 dark:border-blue-500/20 backdrop-blur-sm">
<Shield className="w-3.5 h-3.5" />
Privacy & Security Guarantee
</div>
<h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
Why professionals choose NeedTools
</h3>
<p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
Unlike cloud services that upload your sensitive files, photos, and code snippets to third-party servers, NeedTools executes 100% of calculations right inside your browser memory.
</p>
</div>

<div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="group p-6 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 space-y-4">
<div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-900/50 group-hover:bg-emerald-500/20 transition-colors">
<Lock className="w-6 h-6" />