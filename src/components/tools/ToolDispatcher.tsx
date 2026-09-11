"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { ToolItem } from "@/types/tool";
import { addRecentTool } from "@/lib/storage";
import { RefreshCw, Hammer, Lock } from "lucide-react";
import { ToolFocusWrapper } from "@/components/tools/ToolFocusWrapper";
import { useUsageLimit } from "@/components/providers/UsageLimitProvider";

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
const OcrPdfUI = dynamic(() => import("@/tools-logic/converter/OcrPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfToWordUI = dynamic(() => import("@/tools-logic/converter/PdfToWordUI"), { loading: () => <ToolLoader />, ssr: false });
const WordToPdfUI = dynamic(() => import("@/tools-logic/converter/WordToPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfToExcelUI = dynamic(() => import("@/tools-logic/converter/PdfToExcelUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfEditorUI = dynamic(() => import("@/tools-logic/pdf-editor/PdfEditorUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfCompressorUI = dynamic(() => import("@/tools-logic/pdf/PdfCompressorUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfMergeUI = dynamic(() => import("@/tools-logic/pdf/PdfMergeUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfSplitOrganizeUI = dynamic(() => import("@/tools-logic/pdf/PdfSplitOrganizeUI"), { loading: () => <ToolLoader />, ssr: false });
const ProtectPdfUI = dynamic(() => import("@/tools-logic/pdf/ProtectPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const FillAndSignPdfUI = dynamic(() => import("@/tools-logic/pdf/FillAndSignPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const RotatePdfUI = dynamic(() => import("@/tools-logic/pdf/RotatePdfUI"), { loading: () => <ToolLoader />, ssr: false });
const UnlockPdfUI = dynamic(() => import("@/tools-logic/pdf/UnlockPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const AddPageNumbersUI = dynamic(() => import("@/tools-logic/pdf/AddPageNumbersUI"), { loading: () => <ToolLoader />, ssr: false });
const ImageResizerUI = dynamic(() => import("@/tools-logic/image/ImageResizerUI"), { loading: () => <ToolLoader />, ssr: false });
const JpgToPngUI = dynamic(() => import("@/tools-logic/image/JpgToPngUI"), { loading: () => <ToolLoader />, ssr: false });
const MetaTagCheckerUI = dynamic(() => import("@/tools-logic/seo/MetaTagCheckerUI"), { loading: () => <ToolLoader />, ssr: false });
const LinkShortenerUI = dynamic(() => import("@/tools-logic/marketing/LinkShortenerUI"), { loading: () => <ToolLoader />, ssr: false });
const UtmBuilderUI = dynamic(() => import("@/tools-logic/marketing/UtmBuilderUI"), { loading: () => <ToolLoader />, ssr: false });
const LinkAnalyticsUI = dynamic(() => import("@/tools-logic/marketing/LinkAnalyticsUI"), { loading: () => <ToolLoader />, ssr: false });
const BioPagesUI = dynamic(() => import("@/tools-logic/marketing/BioPagesUI"), { loading: () => <ToolLoader />, ssr: false });
const CtaOverlaysUI = dynamic(() => import("@/tools-logic/marketing/CtaOverlaysUI"), { loading: () => <ToolLoader />, ssr: false });
const SplashPagesUI = dynamic(() => import("@/tools-logic/marketing/SplashPagesUI"), { loading: () => <ToolLoader />, ssr: false });
const LinkCampaignsUI = dynamic(() => import("@/tools-logic/marketing/LinkCampaignsUI"), { loading: () => <ToolLoader />, ssr: false });

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

// Additional PDF Tools
const RemovePagesUI = dynamic(() => import("@/tools-logic/pdf/RemovePagesUI"), { loading: () => <ToolLoader />, ssr: false });
const OrganizePdfUI = dynamic(() => import("@/tools-logic/pdf/OrganizePdfUI"), { loading: () => <ToolLoader />, ssr: false });
const GrayscalePdfUI = dynamic(() => import("@/tools-logic/pdf/GrayscalePdfUI"), { loading: () => <ToolLoader />, ssr: false });
const ExtractPdfPagesUI = dynamic(() => import("@/tools-logic/pdf/ExtractPdfPagesUI"), { loading: () => <ToolLoader />, ssr: false });
const RepairPdfUI = dynamic(() => import("@/tools-logic/pdf/RepairPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const PngToPdfUI = dynamic(() => import("@/tools-logic/converter/PngToPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const BmpToPdfUI = dynamic(() => import("@/tools-logic/converter/BmpToPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const TiffToPdfUI = dynamic(() => import("@/tools-logic/converter/TiffToPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const PptToPdfUI = dynamic(() => import("@/tools-logic/converter/PptToPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const TxtToPdfUI = dynamic(() => import("@/tools-logic/converter/TxtToPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const ExcelToPdfUI = dynamic(() => import("@/tools-logic/converter/ExcelToPdfUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfToPngUI = dynamic(() => import("@/tools-logic/pdf/PdfToPngUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfToBmpUI = dynamic(() => import("@/tools-logic/pdf/PdfToBmpUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfToTiffUI = dynamic(() => import("@/tools-logic/pdf/PdfToTiffUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfToPptUI = dynamic(() => import("@/tools-logic/pdf/PdfToPptUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfToTxtUI = dynamic(() => import("@/tools-logic/pdf/PdfToTxtUI"), { loading: () => <ToolLoader />, ssr: false });
const PdfToZipUI = dynamic(() => import("@/tools-logic/pdf/PdfToZipUI"), { loading: () => <ToolLoader />, ssr: false });

interface ToolDispatcherProps {
  tool: ToolItem;
}

export function ToolDispatcher({ tool }: ToolDispatcherProps) {
  const { isLimitReached, setShowPremiumModal } = useUsageLimit();

  useEffect(() => {
    addRecentTool(tool.slug);
    import("@/lib/db").then(({ recordToolUsage }) => {
      recordToolUsage(tool.slug).catch(() => {});
    });

    const handleToolProcessed = async (e: Event) => {
      const customEvent = e as CustomEvent<{ fileName: string }>;
      const fileName = customEvent.detail?.fileName || "Unknown File";
      
      const { account } = await import("@/lib/appwrite");
      try {
        const user = await account.get();
        if (user) {
          const { saveUserHistory } = await import("@/lib/db");
          await saveUserHistory({
            userId: user.$id,
            toolUsed: tool.slug,
            fileName: fileName,
          });
        }
      } catch (err) {
        console.error("Failed to save history:", err);
      }
    };

    window.addEventListener("tool_processed", handleToolProcessed);
    return () => {
      window.removeEventListener("tool_processed", handleToolProcessed);
    };
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
      case "ocr-pdf": return <OcrPdfUI />;
      case "pdf-to-word": return <PdfToWordUI />;
      case "word-to-pdf": return <WordToPdfUI />;
      case "pdf-to-excel": return <PdfToExcelUI />;
      case "pdf-split": return <PdfSplitOrganizeUI />;
      case "protect-pdf": return <ProtectPdfUI />;
      case "sign-pdf": return <FillAndSignPdfUI />;
      case "rotate-pdf": return <RotatePdfUI />;
      case "unlock-pdf": return <UnlockPdfUI />;
      case "add-page-numbers": return <AddPageNumbersUI />;
      case "image-resizer": return <ImageResizerUI />;
      case "jpg-to-png": return <JpgToPngUI />;
      case "meta-tag-checker": return <MetaTagCheckerUI />;
      case "link-shortener": return <LinkShortenerUI />;
      case "utm-builder": return <UtmBuilderUI />;
      case "link-analytics": return <LinkAnalyticsUI />;
      case "bio-pages": return <BioPagesUI />;
      case "cta-overlays": return <CtaOverlaysUI />;
      case "splash-pages": return <SplashPagesUI />;
      case "link-campaigns": return <LinkCampaignsUI />;

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

      // Additional PDF tools mapping
      case "remove-pages": return <RemovePagesUI />;
      case "organize-pdf": return <OrganizePdfUI />;
      case "grayscale-pdf": return <GrayscalePdfUI />;
      case "extract-pdf-pages": return <ExtractPdfPagesUI />;
      case "repair-pdf": return <RepairPdfUI />;
      case "png-to-pdf": return <PngToPdfUI />;
      case "bmp-to-pdf": return <BmpToPdfUI />;
      case "tiff-to-pdf": return <TiffToPdfUI />;
      case "ppt-to-pdf": return <PptToPdfUI />;
      case "txt-to-pdf": return <TxtToPdfUI />;
      case "excel-to-pdf": return <ExcelToPdfUI />;
      case "pdf-to-png": return <PdfToPngUI />;
      case "pdf-to-bmp": return <PdfToBmpUI />;
      case "pdf-to-tiff": return <PdfToTiffUI />;
      case "pdf-to-ppt": return <PdfToPptUI />;
      case "pdf-to-txt": return <PdfToTxtUI />;
      case "pdf-to-zip": return <PdfToZipUI />;
      
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

  return (
    <div className="relative">
      <ToolFocusWrapper>{renderTool()}</ToolFocusWrapper>
      {isLimitReached && (
        <div 
          className="absolute inset-0 z-50 bg-white/50 dark:bg-black/50 backdrop-blur-[2px] flex items-center justify-center rounded-3xl"
          onClick={(e) => {
            e.stopPropagation();
            setShowPremiumModal(true);
          }}
        >
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-xl border border-brand-100 dark:border-brand-900/50 flex flex-col items-center text-center max-w-sm mx-4 animate-fade-in cursor-pointer hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">Usage Limit Reached</h3>
            <p className="text-sm text-[#64748B] dark:text-white/60 mb-4">You have reached the free guest limit for processing files.</p>
            <button className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm w-full">
              Unlock Unlimited Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
