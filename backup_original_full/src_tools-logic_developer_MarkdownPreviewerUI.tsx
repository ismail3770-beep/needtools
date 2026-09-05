"use client";

import React, { useState } from "react";
import {
Bold,
Italic,
Code,
Heading2,
List,
Quote,
Copy,
Check,
Download,
FileCode,
} from "lucide-react";

const INITIAL_MD = `# Markdown Live Previewer 🚀

Welcome to **needtools Markdown Studio**!

## Key Highlights:
- **Instant Dual-Pane Live Rendering**
- *100% Client-Side* (Your documents never touch a server)
- Export to formatted HTML or download as a \`.md\` file

### Code Example:
\`\`\`typescript
const greeting: string = "Hello, Privacy-First Tools!";
console.log(greeting);
\`\`\`

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

Feel free to start editing!`;

export default function MarkdownPreviewerUI() {
const [markdown, setMarkdown] = useState(INITIAL_MD);
const [copiedMd, setCopiedMd] = useState(false);
const [copiedHtml, setCopiedHtml] = useState(false);

const parseMarkdown = (md: string) => {
let html = md
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;");

html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold mt-3 mb-1.5 text-zinc-900 dark:text-zinc-100">$1</h3>');
html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mt-4 mb-2 border-b border-zinc-200 dark:border-zinc-800 pb-1 text-zinc-900 dark:text-zinc-100">$1</h2>');
html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold mt-4 mb-2 border-b border-zinc-200 dark:border-zinc-800 pb-1.5 text-zinc-900 dark:text-zinc-100">$1</h1>');

html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-zinc-900 dark:text-zinc-100">$1</strong>');
html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');

html = html.replace(
/^\> (.*$)/gim,
'<blockquote class="border-l-2 border-zinc-400 pl-3 py-1 my-2 bg-zinc-100 dark:bg-zinc-800/60 rounded-r italic text-zinc-600 dark:text-zinc-300 text-xs">$1</blockquote>'
);

html = html.replace(
/\`\`\`([a-z]*)\n([\s\S]*?)\`\`\`/gim,
'<pre class="p-3 my-2 bg-zinc-900 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto"><code>$2</code></pre>'
);
html = html.replace(
/\`([^\`]+)\`/gim,
'<code class="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100">$1</code>'
);

html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-xs text-zinc-700 dark:text-zinc-300">$1</li>');
html = html.replace(/\n\n+/g, '<div class="my-2"></div>');

return html;
};

const insertSnippet = (prefix: string, suffix: string = "") => {
setMarkdown((prev) => prev + `\n${prefix}Text${suffix}`);
};

const handleCopyMd = () => {
navigator.clipboard.writeText(markdown);
setCopiedMd(true);
setTimeout(() => setCopiedMd(false), 2000);
};

const handleCopyHtml = () => {
navigator.clipboard.writeText(parseMarkdown(markdown));
setCopiedHtml(true);
setTimeout(() => setCopiedHtml(false), 2000);
};

const handleDownload = () => {
const blob = new Blob([markdown], { type: "text/markdown" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `document-${Date.now()}.md`;
a.click();
URL.revokeObjectURL(url);
};

return (
<div className="space-y-3">
{/* Action Toolbar */}
<div className="flex items-center justify-between gap-2 flex-wrap p-1.5 sm:p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
<div className="flex items-center gap-1 flex-wrap">
<button
onClick={() => insertSnippet("**", "**")}
className="p-1.5 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
title="Bold"
>
<Bold className="w-3.5 h-3.5" />
</button>
<button
onClick={() => insertSnippet("*", "*")}
className="p-1.5 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
title="Italic"
>
<Italic className="w-3.5 h-3.5" />
</button>
<button
onClick={() => insertSnippet("## ")}
className="p-1.5 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
title="Heading"
>
<Heading2 className="w-3.5 h-3.5" />
</button>
<button
onClick={() => insertSnippet("- ")}
className="p-1.5 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
title="List"
>
<List className="w-3.5 h-3.5" />
</button>
<button
onClick={() => insertSnippet("> ")}
className="p-1.5 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
title="Quote"
>
<Quote className="w-3.5 h-3.5" />
</button>
<button
onClick={() => insertSnippet("```\n", "\n```")}
className="p-1.5 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
title="Code Block"
>
<Code className="w-3.5 h-3.5" />
</button>
</div>

<div className="flex items-center gap-1.5">
<button
onClick={handleCopyHtml}
className="py-1 px-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 shadow-sm"
>
{copiedHtml ? <Check className="w-3 h-3 text-emerald-500" /> : <FileCode className="w-3 h-3 text-zinc-500" />}
<span className="text-[11px]">Copy HTML</span>
</button>

<button
onClick={handleDownload}
className="py-1 px-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 text-white dark:text-zinc-900 text-xs font-medium flex items-center gap-1 shadow-sm"
>
<Download className="w-3 h-3" />
<span className="text-[11px]">.MD</span>
</button>
</div>
</div>

{/* Editor & Preview Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
{/* Markdown Source */}
<div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-sm">
<div className="flex items-center justify-between text-xs font-medium text-zinc-500">
<span className="text-[11px] uppercase tracking-wider font-semibold">Markdown Source</span>
<button
onClick={handleCopyMd}
className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 text-[11px]"
>
{copiedMd ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
<span>Copy</span>
</button>
</div>
<textarea
rows={14}
value={markdown}
onChange={(e) => setMarkdown(e.target.value)}
className="w-full bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none resize-y leading-relaxed"
/>
</div>

{/* Live Preview Pane */}
<div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-sm">
<div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
Live Preview
</div>
<div
dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
className="w-full h-[310px] overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-1.5"
/>
</div>
</div>
</div>
);
}
