"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
return (
<section className="relative pt-16 pb-12 sm:pt-24 sm:pb-20 overflow-hidden">
{/* Premium Animated Grid Background */}
<div className="absolute inset-0 -z-10 bg-soft-pattern [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

{/* Subtle Glows */}
<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-500/10 dark:bg-blue-500/20 blur-[100px] rounded-full pointer-events-none -z-10" />

<div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
{/* Headline */}
<h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
Every web tool you need, <br className="hidden sm:inline" />
<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
right in your browser.
</span>
</h1>

{/* Subtitle */}
<p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
Fast, private tools for images, PDFs, developer utilities, and security. Everything processes directly in your device memory with <strong className="text-slate-900 dark:text-slate-200">zero server uploads.</strong>
</p>

{/* Call to Actions */}
<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
<Link
href="#categories"
className="glow-effect w-full sm:w-auto group relative flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-8 py-3.5 text-sm font-semibold text-white dark:text-slate-900 shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:shadow-xl hover:-translate-y-0.5 transition-all"
>
<Sparkles className="w-4 h-4 text-blue-400 dark:text-blue-600" />
Explore All Tools
<ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
</Link>
</div>
</div>
</section>
);
}
