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

// Original tools
const ImageCompressorUI = dynamic(() => import("@/tools-logic/image/ImageCompressorUI"), { loading: () => <ToolLoader />, ssr: false });
const QrCodeGeneratorUI = dynamic(() => import("@/tools-logic/security/QrCodeGeneratorUI"), { loading: () => <ToolLoader />, ssr: false });
const PasswordGeneratorUI = dynamic(() => import("@/tools-logic/security/PasswordGeneratorUI"), { loading: () => <ToolLoader />, ssr: false });
const WordCounterUI = dynamic(() => import("@/tools-logic/text/WordCounterUI"), { loading: () => <ToolLoader />, ssr: false });
const ImageToPdfUI = dynamic(() => import("@/tools-logic/converter/ImageToPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfToJpgUI = dynamic(() => import("@/tools-logic/converter/PdfToJpgUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfEditorUI = dynamic(() => import("@/tools-logic/pdf-editor/PdfEditorUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfCompressorUI = dynamic(() => import("@/tools-logic/pdf/PdfCompressorUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfMergeUI = dynamic(() => import("@/tools-logic/pdf/PdfMergeUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfSplitOrganizeUI = dynamic(() => import("@/tools-logic/pdf/PdfSplitOrganizeUI"), { loading: () => <ToolLoader />, ssr: false });
const ProtectPdfUI = dynamic(() => import("@/tools-logic/pdf/ProtectPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const FillAndSignPdfUI = dynamic(() => import("@/tools-logic/pdf/FillAndSignPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const ImageResizerUI = dynamic(() => import("@/tools-logic/image/ImageResizerUI"), { loading: () => <ToolLoader />, ssr: false });
const JpgToPngUI = dynamic(() => import("@/tools-logic/image/JpgToPngUI"), { loading: () => <ToolLoader />, ssr: false });
const MetaTagCheckerUI = dynamic(() => import("@/tools-logic/seo/MetaTagCheckerUI"), { loading: () => <ToolLoader />, ssr: false });
const LinkShortenerUI = dynamic(() => import("@/tools-logic/marketing/LinkShortenerUI"), { loading: () => <ToolLoader />, ssr: false });
const UtmBuilderUI = dynamic(() => import("@/tools-logic/marketing/UtmBuilderUI"), { loading: () => <ToolLoader />, ssr: false });
const LinkAnalyticsUI = dynamic(() => import("@/tools-logic/marketing/LinkAnalyticsUI"), { loading: () => <ToolLoader />, ssr: false });
const BioPagesUI = dynamic(() => import("@/tools-logic/marketing/BioPagesUI"), { loading: () => <ToolLoader />, ssr: false });

// New tools
const JsonFormatterUI = dynamic(() => import("@/tools-logic/developer/JsonFormatterUI"), { loading: () => <ToolLoader />, ssr: false });
const GradientGeneratorUI = dynamic(() => import("@/tools-logic/developer/GradientGeneratorUI"), { loading: () => <ToolLoader />, ssr: false });
const BoxShadowGeneratorUI = dynamic(() => import("@/tools-logic/developer/BoxShadowGeneratorUI"), { loading: () => <ToolLoader />, ssr: false });
const ColorConverterUI = dynamic(() => import("@/tools-logic/converter/ColorConverterUI"), { loading: () => <ToolLoader />, ssr: false });
const TimestampConverterUI = dynamic(() => import("@/tools-logic/converter/TimestampConverterUI"), { loading: () => <ToolLoader />, ssr: false });
const MarkdownPreviewerUI = dynamic(() => import("@/tools-logic/developer/MarkdownPreviewerUI"), { loading: () => <ToolLoader />, ssr: false });
const HashGeneratorUI = dynamic(() => import("@/tools-logic/security/HashGeneratorUI"), { loading: () => <ToolLoader />, ssr: false });
const Base64ConverterUI = dynamic(() => import("@/tools-logic/converter/Base64ConverterUI"), { loading: () => <ToolLoader />, ssr: false });
const CaseConverterUI = dynamic(() => import("@/tools-logic/text/CaseConverterUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfTextEditUI = dynamic(() => import("@/tools-logic/pdf-text-edit/PdfTextEditUI"), { loading: () => <ToolLoader />, ssr: false });

interface ToolDispatcherProps {
  tool: ToolItem;
}

export function ToolDispatcher({ tool }: ToolDispatcherProps) {
  useEffect(() => {
    addRecentTool(tool.slug);
    import("@/lib/db").then(({ recordToolUsage }) => {
      recordToolUsage(tool.slug).catch(() => {});
    });
  }, [tool.slug]);

  const renderTool = () => {
    switch (tool.id) {
      case "pdf-editor": return <PdfEditorUI />;
      case "image-compressor": return <ImageCompressorUI />;
      case "pdf-compressor": return <PdfCompressorUI />;
      case "pdf-merge": return <PdfMergeUI />;
      case "qr-generator": return <QrCodeGeneratorUI />;
      case "password-generator": return <PasswordGeneratorUI />;
      case "word-counter": return <WordCounterUI />;
      case "image-to-pdf": return <ImageToPdfUI />;
      case "pdf-to-jpg": return <PdfToJpgUI />;
      case "pdf-split": return <PdfSplitOrganizeUI />;
      case "protect-pdf": return <ProtectPdfUI />;
      case "sign-pdf": return <FillAndSignPdfUI />;
      case "image-resizer": return <ImageResizerUI />;
      case "jpg-to-png": return <JpgToPngUI />;
      case "meta-tag-checker": return <MetaTagCheckerUI />;
      case "link-shortener": return <LinkShortenerUI />;
      case "utm-builder": return <UtmBuilderUI />;
      case "link-analytics": return <LinkAnalyticsUI />;
      case "bio-pages": return <BioPagesUI />;

      // New tools mapping
      case "json-formatter": return <JsonFormatterUI />;
      case "gradient-generator": return <GradientGeneratorUI />;
      case "box-shadow-generator": return <BoxShadowGeneratorUI />;
      case "color-converter": return <ColorConverterUI />;
      case "timestamp-converter": return <TimestampConverterUI />;
      case "markdown-previewer": return <MarkdownPreviewerUI />;
      case "hash-generator": return <HashGeneratorUI />;
      case "base64-converter": return <Base64ConverterUI />;
      case "case-converter": return <CaseConverterUI />;
      case "pdf-text-edit": return <PdfTextEditUI />;
      
      default:
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
