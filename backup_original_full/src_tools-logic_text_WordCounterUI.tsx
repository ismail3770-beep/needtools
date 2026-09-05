"use client";

import React, { useState, useMemo } from "react";
import { Copy, Trash2, Check } from "lucide-react";

export default function WordCounterUI() {
const [text, setText] = useState("");
const [copied, setCopied] = useState(false);

const stats = useMemo(() => {
const trimmed = text.trim();
const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
const characters = text.length;
const charactersNoSpaces = text.replace(/\s/g, "").length;
const sentences = trimmed ? (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (trimmed.length > 0 ? 1 : 0) : 0;
const paragraphs = trimmed ? text.split(/\n+/).filter((p) => p.trim().length > 0).length : 0;

const readingTimeMinutes = Math.ceil(words / 200);
const speakingTimeMinutes = Math.ceil(words / 130);

return {
words,
characters,
charactersNoSpaces,
sentences,
paragraphs,
readingTime: readingTimeMinutes === 0 ? "< 1 min" : `${readingTimeMinutes} min`,
speakingTime: speakingTimeMinutes === 0 ? "< 1 min" : `${speakingTimeMinutes} min`,
};
}, [text]);

const handleCopy = () => {
if (!text) return;
navigator.clipboard.writeText(text);
setCopied(true);
setTimeout(() => setCopied(false), 2000);
};

const transformCase = (type: "upper" | "lower" | "title" | "clean") => {
if (!text) return;
if (type === "upper") setText(text.toUpperCase());
if (type === "lower") setText(text.toLowerCase());
if (type === "title") {
setText(
text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
);
}
if (type === "clean") {
setText(text.replace(/\s+/g, " ").trim());
}
};

return (
<div className="space-y-4">
{/* Metrics Top Grid */}
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
{[
{ label: "Words", value: stats.words.toLocaleString(), color: "text-zinc-900 dark:text-zinc-100" },
{ label: "Characters", value: stats.characters.toLocaleString(), color: "text-zinc-900 dark:text-zinc-100" },
{ label: "Chars (No Space)", value: stats.charactersNoSpaces.toLocaleString(), color: "text-zinc-900 dark:text-zinc-100" },
{ label: "Sentences", value: stats.sentences.toLocaleString(), color: "text-zinc-900 dark:text-zinc-100" },
{ label: "Paragraphs", value: stats.paragraphs.toLocaleString(), color: "text-zinc-900 dark:text-zinc-100" },
{ label: "Reading Time", value: stats.readingTime, color: "text-emerald-600 dark:text-emerald-400" },
].map((item, idx) => (
<div
key={idx}
className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-0.5"
>
<div className={`text-xl font-bold font-mono ${item.color}`}>
{item.value}
</div>
<div className="text-[10px] font-medium text-zinc-500">
{item.label}
</div>
</div>
))}
</div>

{/* Editor Box */}
<div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
{/* Quick Toolbar */}
<div className="flex items-center justify-between gap-2 flex-wrap border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
<div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
<button
onClick={() => transformCase("upper")}
className="px-2 py-1 text-[11px] font-semibold rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
>
UPPER
</button>
<button
onClick={() => transformCase("lower")}
className="px-2 py-1 text-[11px] font-semibold rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
>
lower
</button>
<button
onClick={() => transformCase("title")}
className="px-2 py-1 text-[11px] font-semibold rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
>
Title
</button>
<button
onClick={() => transformCase("clean")}
className="px-2 py-1 text-[11px] font-semibold rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
>
Clean Space
</button>
</div>

<div className="flex items-center gap-1.5">
<button
onClick={() => setText("")}
disabled={!text}
className="p-1.5 rounded text-zinc-400 hover:text-rose-500 disabled:opacity-40"
title="Clear"
>
<Trash2 className="w-4 h-4" />
</button>
<button
onClick={handleCopy}
disabled={!text}
className="py-1 px-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 text-white dark:text-zinc-900 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40"
>
{copied ? (
<>
<Check className="w-3 h-3 text-emerald-500" /> Copied
</>
) : (
<>
<Copy className="w-3 h-3" /> Copy
</>
)}
</button>
</div>
</div>

{/* Textarea */}
<textarea
rows={8}
value={text}
onChange={(e) => setText(e.target.value)}
placeholder="Paste or type text here..."
className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm leading-relaxed placeholder:text-zinc-400 focus:outline-none resize-y"
/>
</div>

{/* Social Media Counter Limits */}
<div className="p-3 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
<div className="text-[11px] font-semibold text-zinc-500 mb-2">
Social Media Character Limits
</div>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
{[
{ platform: "Twitter / X", max: 280, current: stats.characters },
{ platform: "LinkedIn", max: 3000, current: stats.characters },
{ platform: "Instagram", max: 2200, current: stats.characters },
{ platform: "Facebook", max: 63206, current: stats.characters },
].map((soc, i) => {
const isOver = soc.current > soc.max;
return (
<div key={i} className="space-y-1">
<div className="flex justify-between text-[11px] font-medium">
<span className="text-zinc-500">{soc.platform}</span>
<span className={isOver ? "text-rose-500 font-bold" : "text-zinc-800 dark:text-zinc-200"}>
{soc.current}/{soc.max}
</span>
</div>
<div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
<div
className={`h-full rounded-full ${isOver ? "bg-rose-500" : "bg-zinc-900 dark:bg-zinc-100"}`}
style={{ width: `${Math.min(100, (soc.current / soc.max) * 100)}%` }}
/>
</div>
</div>
);
})}
</div>
</div>
</div>
);
}
