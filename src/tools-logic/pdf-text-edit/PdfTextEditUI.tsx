"use client";
import { ToolDropzone } from "@/components/ui/ToolDropzone";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  Loader2,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Download,
  AlertTriangle,
  Eye,
  X,
  FileWarning,
} from "lucide-react";

import type { ExtractedTextItem, TextEdit, TextParagraph } from "./types";
import { extractTextFromPage, pdfHasTextLayer } from "./useTextExtraction";
import {
  groupTextItemsIntoParagraphs,
  getParagraphsForPage,
} from "./textGrouping";
import { usePdfExport } from "./usePdfExport";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

// ── Constants ─────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 10;
const MAX_PAGES = 20;
const MIN_FONT_SCALE = 0.7;
const DEFAULT_SCALE = 1.5;

// ── Background sampling ──────────────────────────────────────
/**
 * Sample the page background immediately around a text box.
 *
 * The editable text can only be shown once the original glyphs underneath are
 * covered, otherwise both are visible at the same time (the "ghost text" bug).
 * A white rectangle is not good enough: real documents put text on coloured
 * sidebars and dark header bands, so the mask colour is read from the pixels
 * just outside the glyph box and the most frequent value wins.
 */
function sampleMaskColor(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  box: { left: number; top: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number
): string {
  const probes: Array<[number, number]> = [
    [box.left - 3, box.top + box.height / 2],
    [box.left + box.width + 3, box.top + box.height / 2],
    [box.left + box.width / 2, box.top - 3],
    [box.left + box.width / 2, box.top + box.height + 3],
    [box.left + 2, box.top - 2],
    [box.left + 2, box.top + box.height + 2],
  ];

  const counts = new Map<string, number>();
  for (const [cx, cy] of probes) {
    const px = Math.round(cx * dpr);
    const py = Math.round(cy * dpr);
    if (px < 0 || py < 0 || px >= canvasWidth || py >= canvasHeight) continue;
    try {
      const data = ctx.getImageData(px, py, 1, 1).data;
      const hex = `#${[data[0], data[1], data[2]]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")}`;
      counts.set(hex, (counts.get(hex) ?? 0) + 1);
    } catch {
      // getImageData can fail if the canvas is not ready yet — ignore
    }
  }

  let best = "#ffffff";
  let bestCount = 0;
  counts.forEach((count, hex) => {
    if (count > bestCount) {
      bestCount = count;
      best = hex;
    }
  });
  return best;
}

/**
 * Where a browser puts the first baseline inside a block with a given font
 * size and line height. Used to shift the editable box so its first baseline
 * lands exactly on the PDF baseline.
 */
function cssFirstBaseline(fontSize: number, lineHeight: number): number {
  return (lineHeight - fontSize) / 2 + fontSize * 0.8;
}

export default function PdfTextEditUI() {
  // ── State ────────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [viewSize, setViewSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  /** Bumped after every successful canvas render so sampling can run */
  const [renderTick, setRenderTick] = useState(0);

  // Extraction
  const [paragraphs, setParagraphs] = useState<TextParagraph[]>([]);

  // Edits
  const [edits, setEdits] = useState<Record<string, TextEdit>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  /** Measured rendered height (CSS px) per paragraph, for reflow */
  const [blockHeights, setBlockHeights] = useState<Record<string, number>>({});
  /** Sampled background colour per paragraph */
  const [maskColors, setMaskColors] = useState<Record<string, string>>({});

  // Processing
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview / Result
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fontWarnings, setFontWarnings] = useState<string[]>([]);
  const [overflowWarnings, setOverflowWarnings] = useState<string[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { doExport } = usePdfExport();

  // ── File handling ───────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === "application/pdf") handleFileSelection(selected);
  };

  const handleFileSelection = async (selectedFile: File) => {
    setError(null);
    setResultBlob(null);
    setPreviewUrl(null);
    setEdits({});
    setParagraphs([]);
    setBlockHeights({});
    setMaskColors({});
    setActiveId(null);

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      if (loadedPdf.numPages > MAX_PAGES) {
        setError(
          `PDF has ${loadedPdf.numPages} pages. Maximum is ${MAX_PAGES} pages for text editing.`
        );
        setFile(null);
        setIsLoading(false);
        return;
      }

      const hasText = await pdfHasTextLayer(loadedPdf);
      if (!hasText) {
        setError(
          "This PDF contains no extractable text. It may be a scanned document. " +
            "PDF Text Edit only works on text-based PDFs, not scanned images."
        );
        setFile(null);
        setIsLoading(false);
        return;
      }

      setPdfDoc(loadedPdf);
      setTotalPages(loadedPdf.numPages);
      setCurrentPage(1);

      // Thumbnails
      const thumbs: string[] = [];
      for (let i = 1; i <= loadedPdf.numPages; i++) {
        const page = await loadedPdf.getPage(i);
        const vp = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = vp.width;
          canvas.height = vp.height;
          await page.render({ canvasContext: ctx, viewport: vp } as any).promise;
          thumbs.push(canvas.toDataURL("image/jpeg", 0.7));
        }
      }
      setThumbnails(thumbs);

      // Extract + group per page. Geometry is stored in PDF points, so this
      // runs once and stays valid at every zoom level.
      const allParagraphs: TextParagraph[] = [];
      for (let i = 1; i <= loadedPdf.numPages; i++) {
        const page = await loadedPdf.getPage(i);
        const extraction = await extractTextFromPage(page, i);
        const pageItems: ExtractedTextItem[] = extraction.items;
        allParagraphs.push(
          ...groupTextItemsIntoParagraphs(
            pageItems,
            extraction.pageWidth,
            extraction.pageHeight
          )
        );
      }
      setParagraphs(allParagraphs);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError(
        "Failed to load the PDF file. It may be corrupted or password-protected."
      );
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetTool = () => {
    setFile(null);
    setPdfDoc(null);
    setResultBlob(null);
    setPreviewUrl(null);
    setEdits({});
    setParagraphs([]);
    setBlockHeights({});
    setMaskColors({});
    setCurrentPage(1);
    setTotalPages(0);
    setThumbnails([]);
    setError(null);
    setActiveId(null);
    setFontWarnings([]);
    setOverflowWarnings([]);
    setShowPreview(false);
    setViewSize({ width: 0, height: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Render the page canvas ──────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;

        const outputScale = window.devicePixelRatio || 1;
        const cssWidth = Math.floor(viewport.width);
        const cssHeight = Math.floor(viewport.height);

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        const transform =
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        await page.render({
          canvasContext: context,
          transform: transform as any,
          viewport,
        } as any).promise;

        if (cancelled) return;
        // Keep the wrapper size in state. Reading canvasRef during render is
        // not reactive, so the overlay used to be misplaced on first paint.
        setViewSize({ width: cssWidth, height: cssHeight });
        setRenderTick((t) => t + 1);
      } catch (err) {
        console.error("Error rendering page:", err);
      }
    };

    renderPage();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, currentPage, scale]);

  // ── Paragraphs of the current page ─────────────────────────────

  const pageParagraphs = useMemo(
    () => getParagraphsForPage(paragraphs, currentPage),
    [paragraphs, currentPage]
  );

  // Sample the background colour behind every paragraph after each render
  useEffect(() => {
    if (renderTick === 0) return;
    const canvas = canvasRef.current;
    if (!canvas || pageParagraphs.length === 0) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const dpr = canvas.width / Math.max(1, viewSize.width);
    const next: Record<string, string> = {};
    for (const para of pageParagraphs) {
      next[para.id] = sampleMaskColor(
        ctx,
        dpr,
        {
          left: para.x * scale,
          top: para.topPt * scale,
          width: para.width * scale,
          height: para.heightPt * scale,
        },
        canvas.width,
        canvas.height
      );
    }
    setMaskColors((prev) => ({ ...prev, ...next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderTick]);

  /**
   * Reflow: a paragraph that grew taller than its original box pushes every
   * paragraph below it down by the difference.
   */
  const shifts = useMemo(() => {
    const result: Record<string, number> = {};
    let accumulated = 0;
    for (const para of pageParagraphs) {
      result[para.id] = accumulated;
      const measured = blockHeights[para.id];
      const original = para.heightPt * scale;
      if (measured && measured > original + 1) {
        accumulated += measured - original;
      }
    }
    return result;
  }, [pageParagraphs, blockHeights, scale]);

  // ── Edit handling ───────────────────────────────────────

  const updateEdit = useCallback(
    (para: TextParagraph, updates: Partial<TextEdit>) => {
      setEdits((prev) => {
        const existing: TextEdit =
          prev[para.id] ??
          {
            paragraphId: para.id,
            pageNumber: para.pageNumber,
            originalText: para.text,
            newText: para.text,
            isDirty: false,
            pdfX: para.pdfX,
            pdfFirstBaselineY: para.pdfFirstBaselineY,
            width: para.width,
            topPt: para.topPt,
            heightPt: para.heightPt,
            lineHeightPt: para.lineHeightPt,
            availableHeightPt: para.availableHeightPt,
            pageHeight: para.pageHeight,
            fontName: para.fontName,
            fontFamily: para.fontFamily,
            fontSize: para.fontSize,
            ascent: para.ascent,
            descent: para.descent,
            isBold: para.isBold,
            isItalic: para.isItalic,
            isUnderline: para.isUnderline,
            color: para.color,
            alignment: para.alignment,
            maskColor: maskColors[para.id] ?? "#ffffff",
          };

        const merged: TextEdit = {
          ...existing,
          maskColor: maskColors[para.id] ?? existing.maskColor,
          ...updates,
        };

        merged.isDirty =
          merged.newText.trim() !== para.text.trim() ||
          Math.abs(merged.fontSize - para.fontSize) > 0.01 ||
          merged.isBold !== para.isBold ||
          merged.isItalic !== para.isItalic ||
          merged.isUnderline !== para.isUnderline ||
          merged.color !== para.color ||
          merged.alignment !== para.alignment ||
          merged.fontName !== para.fontName;

        return { ...prev, [para.id]: merged };
      });
    },
    [maskColors]
  );

  const measureBlock = useCallback((id: string, el: HTMLDivElement | null) => {
    if (!el) return;
    const height = el.scrollHeight;
    setBlockHeights((prev) =>
      Math.abs((prev[id] ?? 0) - height) < 0.5 ? prev : { ...prev, [id]: height }
    );
  }, []);

  const dirtyEditCount = Object.values(edits).filter((e) => e.isDirty).length;

  // ── Export ────────────────────────────────────────────

  const handleExport = async () => {
    if (!file || dirtyEditCount === 0) return;

    setIsExporting(true);
    setFontWarnings([]);
    setOverflowWarnings([]);

    try {
      const result = await doExport(file, edits, MIN_FONT_SCALE);
      const blob = new Blob([result.pdfBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      setResultBlob(blob);
      setFontWarnings(result.fontWarnings);
      setOverflowWarnings(result.overflowWarnings);
      setPreviewUrl(URL.createObjectURL(blob));
      setShowPreview(true);
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export the edited PDF. " + String(err));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    window.dispatchEvent(
      new CustomEvent("tool_processed", { detail: { fileName: file.name } })
    );
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `edited_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeParagraph = pageParagraphs.find((p) => p.id === activeId) ?? null;

  // ── Render ────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {error && !file && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl">
          <FileWarning className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      )}

      {!file && (
        <ToolDropzone
          onFiles={(files) => {
            if (files[0]) handleFileSelection(files[0]);
          }}
          accept="application/pdf"
          multiple={false}
          fileTypeLabel="PDFs"
          buttonText="Choose Files"
        />
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-3 p-8 text-sm text-black/60 dark:text-white/60">
          <Loader2 className="w-5 h-5 animate-spin" />
          Reading the document…
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-8">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-black dark:text-white">
                  Preview Edited PDF
                </h3>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
              >
                <X className="w-5 h-5 text-black/60 dark:text-white/60" />
              </button>
            </div>

            {(fontWarnings.length > 0 || overflowWarnings.length > 0) && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    {fontWarnings.map((w, i) => (
                      <p key={`fw-${i}`}>{w}</p>
                    ))}
                    {overflowWarnings.map((w, i) => (
                      <p key={`ow-${i}`}>{w}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-auto p-4 bg-slate-100 dark:bg-neutral-800">
              <iframe
                src={previewUrl}
                className="w-full h-full min-h-[500px] rounded-lg border border-black/10 dark:border-white/10"
                title="PDF Preview"
              />
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-black/10 dark:border-white/10">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2.5 bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Back to Editing
              </button>
              <button
                onClick={handleDownload}
                className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg hover:bg-black/90 dark:hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      {file && pdfDoc && !isLoading && (
        <div className="fixed inset-0 z-[100] bg-slate-100 dark:bg-neutral-900 flex flex-col font-sans">
          {/* Toolbar */}
          <div className="h-14 bg-white dark:bg-neutral-950 border-b border-black/10 dark:border-white/10 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={resetTool}
                className="p-2 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <div className="w-px h-6 bg-black/10 dark:bg-white/10" />
              <span className="font-semibold text-black dark:text-white truncate max-w-[200px] text-sm">
                {file.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {dirtyEditCount > 0 && (
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  {dirtyEditCount} edit{dirtyEditCount !== 1 ? "s" : ""}
                </span>
              )}
              <p className="text-xs text-black/40 dark:text-white/40">
                Click a paragraph to edit — Enter adds a line
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={dirtyEditCount === 0 || isExporting}
                className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-sm hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Workspace */}
          <div className="flex flex-1 overflow-hidden">
            {/* Thumbnails */}
            <div className="w-56 bg-white dark:bg-neutral-950 border-r border-black/10 dark:border-white/10 flex flex-col z-10 shrink-0">
              <div className="p-3 border-b border-black/10 dark:border-white/10">
                <h4 className="font-semibold text-black/80 dark:text-white/80 text-xs">
                  Pages ({totalPages})
                </h4>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {thumbnails.map((src, idx) => {
                  const pageNum = idx + 1;
                  const pageEditCount = Object.values(edits).filter(
                    (e) => e.pageNumber === pageNum && e.isDirty
                  ).length;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveId(null);
                        setCurrentPage(pageNum);
                      }}
                      className={`w-full relative cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                        currentPage === pageNum
                          ? "border-blue-500 shadow-sm"
                          : "border-transparent hover:border-blue-300"
                      }`}
                    >
                      <img
                        src={src}
                        alt={`Page ${pageNum}`}
                        className="w-full h-auto bg-white"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1.5 rounded">
                        {pageNum}
                      </div>
                      {pageEditCount > 0 && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {pageEditCount}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Canvas + overlay */}
            <div className="flex-1 overflow-auto bg-slate-100 dark:bg-neutral-900 p-8 flex flex-col items-center relative">
              <div
                className="relative bg-white shadow-xl border border-black/5 mx-auto"
                style={{
                  width: viewSize.width || undefined,
                  height: viewSize.height || undefined,
                }}
              >
                <canvas ref={canvasRef} className="block" />

                <div
                  className="absolute inset-0 z-10"
                  onMouseDown={(e) => {
                    if (e.target === e.currentTarget) setActiveId(null);
                  }}
                >
                  {pageParagraphs.map((para) => {
                    const edit = edits[para.id];
                    const isActive = activeId === para.id;
                    const isDirty = edit?.isDirty ?? false;
                    const shift = shifts[para.id] ?? 0;

                    // A block must hide the original glyphs whenever its own
                    // text is visible, or whenever reflow moved it away from
                    // where the canvas drew it.
                    const isSolid = isActive || isDirty || shift > 0.5;

                    const fontSizePx =
                      (edit?.fontSize ?? para.fontSize) * scale;
                    const lineHeightPx = para.lineHeightPt * scale;
                    const baselineOffset =
                      (para.ascent -
                        cssFirstBaseline(
                          edit?.fontSize ?? para.fontSize,
                          para.lineHeightPt
                        )) *
                      scale;

                    const maskColor = maskColors[para.id] ?? "#ffffff";
                    const measured = blockHeights[para.id] ?? 0;
                    const maskHeight =
                      Math.max(para.heightPt * scale, measured) + 2;

                    return (
                      <div
                        key={para.id}
                        className="absolute"
                        style={{
                          left: `${para.x * scale}px`,
                          top: `${para.topPt * scale}px`,
                          width: `${para.width * scale}px`,
                          transform: shift ? `translateY(${shift}px)` : undefined,
                          zIndex: isActive ? 30 : 10,
                        }}
                      >
                        {/* Background mask */}
                        {isSolid && (
                          <div
                            aria-hidden
                            className="absolute pointer-events-none"
                            style={{
                              left: "-2px",
                              top: "-1px",
                              width: `${para.width * scale + 4}px`,
                              height: `${maskHeight}px`,
                              backgroundColor: maskColor,
                            }}
                          />
                        )}

                        {/* Editable text */}
                        <div
                          id={`editor-${para.id}`}
                          contentEditable
                          suppressContentEditableWarning
                          spellCheck={false}
                          className={`absolute cursor-text outline-none transition-colors ${
                            isActive
                              ? "ring-2 ring-blue-500"
                              : isDirty
                              ? "ring-1 ring-amber-400/70"
                              : "hover:ring-1 hover:ring-blue-300/70"
                          }`}
                          style={{
                            left: 0,
                            top: `${baselineOffset}px`,
                            width: `${para.width * scale + 2}px`,
                            minHeight: `${para.heightPt * scale}px`,
                            fontSize: `${fontSizePx}px`,
                            lineHeight: `${lineHeightPx}px`,
                            fontFamily: para.cssFontFamily,
                            fontWeight: (edit?.isBold ?? para.isBold)
                              ? "bold"
                              : "normal",
                            fontStyle: (edit?.isItalic ?? para.isItalic)
                              ? "italic"
                              : "normal",
                            textDecoration: (edit?.isUnderline ??
                              para.isUnderline)
                              ? "underline"
                              : "none",
                            textAlign: (edit?.alignment ??
                              para.alignment) as any,
                            color: isSolid
                              ? edit?.color ?? para.color
                              : "transparent",
                            caretColor: edit?.color ?? para.color,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                          ref={(el) => {
                            if (el && !el.dataset.initialized) {
                              el.innerText = edit?.newText ?? para.text;
                              el.dataset.initialized = "1";
                              measureBlock(para.id, el);
                            }
                          }}
                          onFocus={() => setActiveId(para.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              // Insert a plain line break instead of letting
                              // the browser create nested block elements.
                              e.preventDefault();
                              const el = e.currentTarget as HTMLDivElement;
                              document.execCommand("insertLineBreak");
                              updateEdit(para, { newText: el.innerText });
                              measureBlock(para.id, el);
                            }
                            if (e.key === "Escape") {
                              (e.currentTarget as HTMLDivElement).blur();
                              setActiveId(null);
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const text = e.clipboardData.getData("text/plain");
                            document.execCommand("insertText", false, text);
                          }}
                          onInput={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            updateEdit(para, { newText: el.innerText });
                            measureBlock(para.id, el);
                          }}
                          onBlur={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            updateEdit(para, { newText: el.innerText });
                            measureBlock(para.id, el);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Zoom */}
              <div className="sticky bottom-2 mt-4 flex items-center gap-2 bg-white dark:bg-neutral-900 p-2 rounded-xl shadow-lg border border-black/10 dark:border-white/10 z-20">
                <button
                  onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold w-12 text-center text-black/70 dark:text-white/70">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale((s) => Math.min(3, s + 0.25))}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right panel */}
            <div className="w-64 bg-white dark:bg-neutral-950 border-l border-black/10 dark:border-white/10 flex flex-col z-10 shrink-0">
              <div className="p-4 border-b border-black/10 dark:border-white/10">
                <h4 className="font-semibold text-black/80 dark:text-white/80 text-sm">
                  Text Editor
                </h4>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed">
                  Click any paragraph to edit it. Press Enter for a new line —
                  the text re-wraps and the blocks below move down.
                </p>

                {activeParagraph && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold text-black/60 dark:text-white/60 uppercase tracking-wider">
                      Selected Paragraph
                    </h5>
                    {(() => {
                      const para = activeParagraph;
                      const currentEdit = edits[para.id];
                      const currentSize =
                        currentEdit?.fontSize ?? para.fontSize;
                      const isBold = currentEdit?.isBold ?? para.isBold;
                      const isItalic = currentEdit?.isItalic ?? para.isItalic;
                      const isUnderline =
                        currentEdit?.isUnderline ?? para.isUnderline;
                      const alignment =
                        currentEdit?.alignment ?? para.alignment;
                      const currentColor = currentEdit?.color ?? para.color;
                      const currentFont =
                        currentEdit?.fontName ?? para.fontName;

                      return (
                        <div className="space-y-4 text-xs text-black/80 dark:text-white/80">
                          <div className="space-y-1.5">
                            <label className="text-black/60 dark:text-white/50">
                              Font
                            </label>
                            <select
                              value={currentFont}
                              onChange={(e) =>
                                updateEdit(para, { fontName: e.target.value })
                              }
                              className="w-full bg-slate-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg p-2"
                            >
                              <option value={para.fontName}>
                                Original ({para.fontFamily || para.fontName})
                              </option>
                              <option value="Helvetica">Helvetica / Arial</option>
                              <option value="Times-Roman">Times</option>
                              <option value="Courier">Courier</option>
                            </select>
                          </div>

                          <div className="flex gap-2">
                            <div className="flex-1 space-y-1.5">
                              <label className="text-black/60 dark:text-white/50">
                                Size (pt)
                              </label>
                              <input
                                type="number"
                                value={Math.round(currentSize)}
                                onChange={(e) =>
                                  updateEdit(para, {
                                    fontSize:
                                      parseFloat(e.target.value) || currentSize,
                                  })
                                }
                                className="w-full bg-slate-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg p-2"
                              />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <label className="text-black/60 dark:text-white/50">
                                Color
                              </label>
                              <input
                                type="color"
                                value={currentColor}
                                onChange={(e) =>
                                  updateEdit(para, { color: e.target.value })
                                }
                                className="w-full h-[34px] bg-slate-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg p-0.5 cursor-pointer"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-black/60 dark:text-white/50">
                              Style
                            </label>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  updateEdit(para, { isBold: !isBold })
                                }
                                className={`flex-1 py-1.5 rounded-lg border font-bold transition-colors ${
                                  isBold
                                    ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300"
                                    : "bg-slate-50 border-black/10 text-black/70 dark:bg-neutral-900 dark:border-white/10 dark:text-white/70"
                                }`}
                              >
                                B
                              </button>
                              <button
                                onClick={() =>
                                  updateEdit(para, { isItalic: !isItalic })
                                }
                                className={`flex-1 py-1.5 rounded-lg border italic transition-colors ${
                                  isItalic
                                    ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300"
                                    : "bg-slate-50 border-black/10 text-black/70 dark:bg-neutral-900 dark:border-white/10 dark:text-white/70"
                                }`}
                              >
                                I
                              </button>
                              <button
                                onClick={() =>
                                  updateEdit(para, {
                                    isUnderline: !isUnderline,
                                  })
                                }
                                className={`flex-1 py-1.5 rounded-lg border underline transition-colors ${
                                  isUnderline
                                    ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300"
                                    : "bg-slate-50 border-black/10 text-black/70 dark:bg-neutral-900 dark:border-white/10 dark:text-white/70"
                                }`}
                              >
                                U
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-black/60 dark:text-white/50">
                              Alignment
                            </label>
                            <div className="flex gap-2">
                              {(["left", "center", "right"] as const).map(
                                (option) => (
                                  <button
                                    key={option}
                                    onClick={() =>
                                      updateEdit(para, { alignment: option })
                                    }
                                    className={`flex-1 py-1.5 rounded-lg border capitalize transition-colors ${
                                      alignment === option
                                        ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300"
                                        : "bg-slate-50 border-black/10 text-black/70 dark:bg-neutral-900 dark:border-white/10 dark:text-white/70"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                )
                              )}
                            </div>
                          </div>

                          {currentEdit?.isDirty && (
                            <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                Modified
                              </span>
                              <button
                                onClick={() => {
                                  setEdits((prev) => {
                                    const next = { ...prev };
                                    delete next[para.id];
                                    return next;
                                  });
                                  setBlockHeights((prev) => {
                                    const next = { ...prev };
                                    delete next[para.id];
                                    return next;
                                  });
                                  const el = document.getElementById(
                                    `editor-${para.id}`
                                  );
                                  if (el) el.innerText = para.text;
                                }}
                                className="text-red-500 hover:text-red-600 underline"
                              >
                                Reset
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-black/60 dark:text-white/60 uppercase tracking-wider">
                    Changes
                  </h5>
                  {dirtyEditCount === 0 ? (
                    <p className="text-xs text-black/40 dark:text-white/40">
                      No changes made yet.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {Object.values(edits)
                        .filter((e) => e.isDirty)
                        .map((edit) => (
                          <div
                            key={edit.paragraphId}
                            className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs"
                          >
                            <p className="text-black/40 dark:text-white/40 line-through truncate">
                              {edit.originalText}
                            </p>
                            <p className="text-black/80 dark:text-white/80 font-medium truncate">
                              {edit.newText}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                  <p className="text-[10px] text-black/30 dark:text-white/30 leading-relaxed">
                    Works best on text-based documents. Rotated text and
                    scanned pages cannot be edited.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
