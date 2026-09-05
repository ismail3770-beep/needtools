"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { ToolItem } from "@/types/tool";
import { addRecentTool } from "@/lib/storage";
import { RefreshCw, Hammer } from "lucide-react";
import { ToolFocusWrapper } from "@/components/tools/ToolFocusWrapper";

// Shared loading state for lazy-loaded tool UIs
const ToolLoader = () => (
<div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-500">
<RefreshCw className="w-5 h-5 animate-spin" />
<span className="text-xs font-medium">Loading tool...</span>
</div>
);

// We only dynamically import the tools that actually exist in the codebase right now.
const ImageCompressorUI = dynamic(
() => import("@/tools-logic/image/ImageCompressorUI"),
{ loading: () => <ToolLoader />, ssr: false }
);
const QrCodeGeneratorUI = dynamic(
() => import("@/tools-logic/security/QrCodeGeneratorUI"),
{ loading: () => <ToolLoader />, ssr: false }
);
const PasswordGeneratorUI = dynamic(
() => import("@/tools-logic/security/PasswordGeneratorUI"),
{ loading: () => <ToolLoader />, ssr: false }
);
const WordCounterUI = dynamic(
() => import("@/tools-logic/text/WordCounterUI"),
{ loading: () => <ToolLoader />, ssr: false }
);
const ImageToPdfUI = dynamic(
() => import("@/tools-logic/converter/ImageToPdfUI"),
{ loading: () => <ToolLoader />, ssr: false }
);
const PdfToJpgUI = dynamic(
() => import("@/tools-logic/converter/PdfToJpgUI"),
{ loading: () => <ToolLoader />, ssr: false }
);

const PdfCompressorUI = dynamic(
() => import("@/tools-logic/pdf/PdfCompressorUI"),
{ loading: () => <ToolLoader />, ssr: false }
);

const PdfMergeUI = dynamic(
() => import("@/tools-logic/pdf/PdfMergeUI"),
{ loading: () => <ToolLoader />, ssr: false }
);

const PdfSplitOrganizeUI = dynamic(
() => import("@/tools-logic/pdf/PdfSplitOrganizeUI"),
{ loading: () => <ToolLoader />, ssr: false }
);

const ProtectPdfUI = dynamic(
() => import("@/tools-logic/pdf/ProtectPdfUI"),
{ loading: () => <ToolLoader />, ssr: false }
);

const FillAndSignPdfUI = dynamic(
() => import("@/tools-logic/pdf/FillAndSignPdfUI"),
{ loading: () => <ToolLoader />, ssr: false }
);

interface ToolDispatcherProps {
tool: ToolItem;
}

export function ToolDispatcher({ tool }: ToolDispatcherProps) {
useEffect(() => {
addRecentTool(tool.slug);

// Track tool usage for "Popular Tools" analytics via Appwrite
import("@/lib/db").then(({ recordToolUsage }) => {
recordToolUsage(tool.slug).catch(() => {});
});
}, [tool.slug]);

const renderTool = () => {
switch (tool.id) {
case "image-compressor":
return <ImageCompressorUI />;
case "pdf-compressor":
return <PdfCompressorUI />;
case "pdf-merge":
return <PdfMergeUI />;
case "qr-generator":
return <QrCodeGeneratorUI />;
case "password-generator":
return <PasswordGeneratorUI />;
case "word-counter":
return <WordCounterUI />;
case "image-to-pdf":
return <ImageToPdfUI />;
case "pdf-to-jpg":
return <PdfToJpgUI />;
case "pdf-split":
return <PdfSplitOrganizeUI />;
case "protect-pdf":
return <ProtectPdfUI />;
case "sign-pdf":
return <FillAndSignPdfUI />;
default:
// Placeholder for tools that are registered but not yet implemented
return (
<div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl mt-8">
<div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-400">
<Hammer className="w-8 h-8" />
</div>
<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
Coming Soon
</h3>
<p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
We are currently building the <strong>{tool.name}</strong>. Check back soon for updates!
</p>
</div>
);
}
};

return <ToolFocusWrapper>{renderTool()}</ToolFocusWrapper>;
}
