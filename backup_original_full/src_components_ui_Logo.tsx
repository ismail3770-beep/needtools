import React from "react";
import Link from "next/link";

interface LogoProps {
size?: "sm" | "md" | "lg";
showText?: boolean;
showTagline?: boolean;
className?: string;
asLink?: boolean;
}

export function Logo({
size = "md",
showText = true,
showTagline = true,
className = "",
asLink = true,
}: LogoProps) {
const sizeMap = {
sm: { icon: "w-7 h-7", text: "text-base", badge: "text-[9px]" },
md: { icon: "w-9 h-9", text: "text-lg", badge: "text-[10px]" },
lg: { icon: "w-12 h-12", text: "text-2xl", badge: "text-xs" },
};

const currentSize = sizeMap[size];

const content = (
<div className={`flex items-center gap-2.5 group shrink-0 ${className}`}>
{/* Precision Geometric Brand Mark */}
<div className={`relative ${currentSize.icon} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
<svg
viewBox="0 0 40 40"
fill="none"
xmlns="http://www.w3.org/2000/svg"
className="w-full h-full drop-shadow-md"
>
<defs>
<linearGradient id="nt-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stopColor="#3b82f6" />
<stop offset="50%" stopColor="#6366f1" />
<stop offset="100%" stopColor="#8b5cf6" />
</linearGradient>
<linearGradient id="nt-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
<stop offset="0%" stopColor="#06b6d4" />
<stop offset="100%" stopColor="#3b82f6" />
</linearGradient>
</defs>

{/* Rounded Base Badge */}
<rect width="40" height="40" rx="10" fill="url(#nt-grad-primary)" />

{/* Geometric Precision 'N' Overlay */}
<path
d="M11 29V11C11 10.1716 11.6716 9.5 12.5 9.5H14C14.8284 9.5 15.5 10.1716 15.5 11V29C15.5 29.8284 14.8284 30.5 14 30.5H12.5C11.6716 30.5 11 29.8284 11 29Z"
fill="white"
fillOpacity="0.95"
/>

<path
d="M13.5 11L26.5 29"
stroke="white"
strokeWidth="3.8"
strokeLinecap="round"
/>

<path
d="M24.5 29V11C24.5 10.1716 25.1716 9.5 26 9.5H27.5C28.3284 9.5 29 10.1716 29 11V29C29 29.8284 28.3284 30.5 27.5 30.5H26C25.1716 30.5 24.5 29.8284 24.5 29Z"
fill="url(#nt-grad-accent)"
/>

<circle cx="20" cy="20" r="2" fill="white" className="animate-pulse" />
</svg>
</div>

{/* Wordmark Typography */}
{showText && (
<div className="flex flex-col justify-center">
<div className="flex items-center gap-1.5 leading-none">
<span
className={`font-black tracking-tight text-slate-900 dark:text-white ${currentSize.text}`}
>
Need<span className="text-blue-600 dark:text-blue-400">Tools</span>
</span>
<span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[9px] tracking-wider uppercase border border-blue-500/20">
Free
</span>
</div>
{showTagline && (
<span
className={`font-medium text-slate-400 dark:text-slate-500 mt-0.5 tracking-normal ${currentSize.badge}`}
>
Zero-Upload Web Tools
</span>
)}
</div>
)}
</div>
);

if (asLink) {
return (
<Link href="/" className="inline-flex">
{content}
</Link>
);
}

return content;
}
