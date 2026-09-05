"use client";

import React, { useState } from "react";
import { Check, Copy, AlertCircle, Sparkles, Minimize2, Maximize2, Trash2 } from "lucide-react";

export default function JsonFormatterUI() {
const [inputJson, setInputJson] = useState('{\n  "status": "success",\n  "data": {\n    "name": "needtools",\n    "privacy": "100% Client-Side",\n    "features": ["zero-upload", "fast", "no-ads"]\n  }\n}');
const [errorMsg, setErrorMsg] = useState<string | null>(null);
const [copied, setCopied] = useState(false);

const formatJson = (spaces: number) => {
try {
const parsed = JSON.parse(inputJson);
setInputJson(JSON.stringify(parsed, null, spaces));
setErrorMsg(null);
} catch (err: any) {
setErrorMsg(err.message || "Invalid JSON syntax");
}
};

const minifyJson = () => {
try {
const parsed = JSON.parse(inputJson);
setInputJson(JSON.stringify(parsed));
setErrorMsg(null);
} catch (err: any) {
setErrorMsg(err.message || "Invalid JSON syntax");
}
};

const handleCopy = () => {
if (!inputJson) return;
navigator.clipboard.writeText(inputJson);
setCopied(true);
setTimeout(() => setCopied(false), 2000);
};

return (
<div className="space-y-4">
{/* Toolbar */}
<div className="flex items-center justify-between gap-2 flex-wrap p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
<div className="flex items-center gap-2 flex-wrap">
<button
onClick={() => formatJson(2)}
className="py-1.5 px-3 rounded-xl bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 shadow-sm flex items-center gap-1.5"
>
<Sparkles className="w-3.5 h-3.5 text-brand-500" /> Beautify (2 Spaces)
</button>
<button
onClick={() => formatJson(4)}
className="py-1.5 px-3 rounded-xl bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 shadow-sm"
>
Beautify (4 Spaces)
</button>
<button
onClick={minifyJson}
className="py-1.5 px-3 rounded-xl bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 shadow-sm flex items-center gap-1.5"
>
<Minimize2 className="w-3.5 h-3.5" /> Minify
</button>
</div>

<div className="flex items-center gap-2">
<button
onClick={() => setInputJson("")}
className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
title="Clear"
>
<Trash2 className="w-4 h-4" />
</button>
<button
onClick={handleCopy}
className="py-1.5 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
>
{copied ? (
<>
<Check className="w-3.5 h-3.5 text-emerald-300" /> Copied!
</>
) : (
<>
<Copy className="w-3.5 h-3.5" /> Copy JSON
</>
)}
</button>
</div>
</div>

{/* Error Alert Box if Syntax is Broken */}
{errorMsg && (
<div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
<AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
<div>
<span className="font-bold">Syntax Error:</span> {errorMsg}
</div>
</div>
)}

{/* Editor Box */}
<div className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 border border-zinc-800 shadow-xl font-mono text-sm">
<textarea
rows={16}
value={inputJson}
onChange={(e) => {
setInputJson(e.target.value);
if (errorMsg) setErrorMsg(null);
}}
placeholder="Paste unformatted JSON here..."
className="w-full bg-transparent text-emerald-400 font-mono text-xs sm:text-sm leading-relaxed placeholder:text-zinc-600 focus:outline-none resize-y"
spellCheck={false}
/>
</div>
</div>
);
}
