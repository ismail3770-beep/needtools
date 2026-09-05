import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Lock, Heart } from "lucide-react";
import { CATEGORIES } from "@/config/categories";

export function Footer() {
return (
<footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b0f19] transition-colors mt-20">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
<div className="grid grid-cols-1 md:grid-cols-4 gap-8">

{/* Brand Info */}
<div className="md:col-span-2 space-y-3.5">
<Link href="/" className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
<Sparkles className="w-4 h-4" />
</div>
<span className="font-extrabold text-base text-slate-900 dark:text-white">
Need<span className="text-blue-600 dark:text-blue-400">Tools</span>
</span>
</Link>
<p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
High-performance, privacy-first web utilities for creators and developers. Compress images, convert PDFs, and process data with zero files uploaded to servers.
</p>
<div className="flex items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
<span className="w-2 h-2 rounded-full bg-emerald-500" />
<span>100% In-Browser Execution • Zero Server Latency</span>
</div>
</div>

{/* Categories */}
<div>
<h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
Tool Categories
</h5>
<ul className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
{CATEGORIES.map((cat) => (
<li key={cat.id}>
<Link href={`/tools/${cat.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
{cat.name}
</Link>
</li>
))}
</ul>
</div>

{/* Legal & Trust */}
<div>
<h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
Trust & Support
</h5>
<ul className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
<li>
<Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
Contact & Feedback
</Link>
</li>
<li>
<Link href="/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
Privacy Policy
</Link>
</li>
<li>
<Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
Terms of Service
</Link>
</li>
</ul>
</div>
</div>

{/* Bottom Bar */}
<div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
<p>© {new Date().getFullYear()} NeedTools. Free for personal and commercial use.</p>
<div className="flex items-center gap-4">
<span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
<Lock className="w-3.5 h-3.5" /> 100% Client-Side Safe
</span>
</div>
</div>
</div>
</footer>
);
}
