"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, Shield, Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";
import { CATEGORIES } from "@/config/categories";

export function Navbar() {
const [isCommandOpen, setIsCommandOpen] = useState(false);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

useEffect(() => {
const handleKeyDown = (e: KeyboardEvent) => {
if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
e.preventDefault();
setIsCommandOpen((prev) => !prev);
}
};

window.addEventListener("keydown", handleKeyDown);
return () => window.removeEventListener("keydown", handleKeyDown);
}, []);

return (
<>
<header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md transition-colors">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

{/* Brand Logo with Authentic Icon Badge */}
<Link href="/" className="flex items-center gap-2.5 group shrink-0">
<div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-base tracking-tight shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
<Sparkles className="w-5 h-5" />
</div>
<div className="flex flex-col">
<span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
Need<span className="text-blue-600 dark:text-blue-400">Tools</span>
</span>
<span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-tight">
Free & Private Web Utilities
</span>
</div>
</Link>


{/* Quick Search Bar (Desktop) */}
<div className="hidden md:flex flex-1 max-w-md mx-6">
<button
onClick={() => setIsCommandOpen(true)}
className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 group"
>
<div className="flex items-center gap-2.5 truncate">
<Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
<span className="truncate">Search 14 tools (e.g. compress photo, qr code)...</span>
</div>
<kbd className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
⌘K
</kbd>
</button>
</div>

{/* Right Navigation Actions */}
<div className="flex items-center gap-2 shrink-0">
{/* Mobile Search Button */}
<button
onClick={() => setIsCommandOpen(true)}
className="p-2 rounded-xl md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
aria-label="Search tools"
>
<Search className="w-4 h-4" />
</button>

<nav className="hidden lg:flex items-center gap-1.5">
<Link
href="/#popular"
className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
>
Popular
</Link>
<Link
href="/#categories"
className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
>
All Tools
</Link>
<Link
href="/contact"
className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
>
Contact
</Link>
</nav>

<div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden lg:block" />

{/* Light / Dark Mode Toggle Button */}
<ThemeToggle />

{/* Mobile menu hamburger */}