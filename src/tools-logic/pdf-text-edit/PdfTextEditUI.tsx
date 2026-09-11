"use client";
import { ToolDropzone } from "@/components/ui/ToolDropzone";



import React, { useState, useRef, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  UploadCloud,
  Loader2,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Download,
  CheckCircle2,
  AlertTriangle,
  Eye,
  X,
  FileWarning,
} from "lucide-react";

import type {
  TextLineGroup,
  TextEdit,
  ExtractedTextItem,
} from "./types";
import { extractTextFromPage, pdfHasTextLayer } from "./useTextExtraction";
import { groupTextItemsIntoLines, getLineGroupsForPage } from "./textGrouping";
import { usePdfExport } from "./usePdfExport";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

// ── Constants ──────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 10;
const MAX_PAGES = 20;
const MIN_FONT_SCALE = 0.7;
const DEFAULT_SCALE = 1.5;

export default function PdfTextEditUI() {
  // ── State ──────────────────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  // Text extraction
  const [allLineGroups, setAllLineGroups] = useState<TextLineGroup[]>([]);
  const [hasTextLayer, setHasTextLayer] = useState(true);

  // Edits
  const [edits, setEdits] = useState<Record<string, TextEdit>>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

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
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hooks
  const { doExport } = usePdfExport();

  // ── File handling ──────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.add("border-blue-500", "bg-blue-50/50", "dark:bg-blue-900/20");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove("border-blue-500", "bg-blue-50/50", "dark:bg-blue-900/20");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove("border-blue-500", "bg-blue-50/50", "dark:bg-blue-900/20");
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      handleFileSelection(droppedFile);
    } else {
      setError("Please drop a valid PDF file.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === "application/pdf") {
      handleFileSelection(selected);
    }
  };

  const handleFileSelection = async (selectedFile: File) => {
    setError(null);
    setResultBlob(null);
    setPreviewUrl(null);
    setEdits({});
    setAllLineGroups([]);

    // File size check
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Page count check
      if (loadedPdf.numPages > MAX_PAGES) {
        setError(`PDF has ${loadedPdf.numPages} pages. Maximum is ${MAX_PAGES} pages for text editing.`);
        setFile(null);
        setIsLoading(false);
        return;
      }

      // Check for text layer
      const hasText = await pdfHasTextLayer(loadedPdf);
      setHasTextLayer(hasText);

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

      // Generate thumbnails
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

      // Extract text from all pages
      const allItems: ExtractedTextItem[] = [];
      for (let i = 1; i <= loadedPdf.numPages; i++) {
        const page = await loadedPdf.getPage(i);
        const items = await extractTextFromPage(page, i, DEFAULT_SCALE);
        allItems.push(...items);
      }

      // Group into lines
      // Group per page separately to avoid cross-page grouping
      const allGroups: TextLineGroup[] = [];
      for (let i = 1; i <= loadedPdf.numPages; i++) {
        const pageItems = allItems.filter((it) => it.pageNumber === i);
        const pageGroups = groupTextItemsIntoLines(pageItems);
        allGroups.push(...pageGroups);
      }
      setAllLineGroups(allGroups);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError("Failed to load the PDF file. It may be corrupted or password-protected.");
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
    setAllLineGroups([]);
    setCurrentPage(1);
    setTotalPages(0);
    setThumbnails([]);
    setError(null);
    setSelectedGroupId(null);
    setFontWarnings([]);
    setOverflowWarnings([]);
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Render page ────────────────────────────────────────────────

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        const transform = outputScale !== 1
          ? [outputScale, 0, 0, outputScale, 0, 0]
          : undefined;

        await page.render({
          canvasContext: context,
          transform: transform as any,
          viewport,
        } as any).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
      }
    };
    renderPage();
  }, [pdfDoc, currentPage, scale]);

  // ── Edit handlers ──────────────────────────────────────────────

  const updateEdit = useCallback(
    (group: TextLineGroup, updates: Partial<TextEdit>) => {
      setEdits((prev) => {
        const existing = prev[group.id] || {
          lineGroupId: group.id,
          pageNumber: group.pageNumber,
          originalText: group.fullText,
          newText: group.fullText,
          isDirty: false,
          pdfX: group.items[0].pdfX,
          pdfY: group.items[0].pdfY,
          pdfWidth: group.items.reduce(
            (sum, it) => Math.max(sum, it.pdfX + it.pdfWidth),
            0
          ) - group.items[0].pdfX,
          pdfHeight: group.items[0].pdfHeight,
          fontName: group.items[0].fontName,
          fontFamily: group.items[0].fontFamily || group.items[0].fontName,
          fontSize: group.items[0].fontSize,
          isBold: group.items[0].isBold,
          isItalic: group.items[0].isItalic,
          isUnderline: group.items[0].isUnderline || false,
          color: group.items[0].color,
          alignment: group.items[0].alignment || 'left',
        };

        const merged = { ...existing, ...updates };

        merged.isDirty =
          merged.newText !== group.fullText ||
          merged.fontSize !== group.items[0].fontSize ||
          merged.fontFamily !== (group.items[0].fontFamily || group.items[0].fontName) ||
          merged.isBold !== group.items[0].isBold ||
          merged.isItalic !== group.items[0].isItalic ||
          merged.color !== group.items[0].color ||
          merged.alignment !== (group.items[0].alignment || 'left');

        return {
          ...prev,
          [group.id]: merged,
        };
      });
    },
    []
  );

  const dirtyEditCount = Object.values(edits).filter((e) => e.isDirty).length;

  // ── Export ──────────────────────────────────────────────────────

  const handleExport = async () => {
    if (!file || dirtyEditCount === 0) return;

    setIsExporting(true);
    setFontWarnings([]);
    setOverflowWarnings([]);

    try {
      const result = await doExport(file, edits, MIN_FONT_SCALE);
      const blob = new Blob([result.pdfBytes as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
      setFontWarnings(result.fontWarnings);
      setOverflowWarnings(result.overflowWarnings);

      // Create preview URL
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export the edited PDF. " + String(err));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    window.dispatchEvent(new CustomEvent('tool_processed', { detail: { fileName: 'processed_file' } }));
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `edited_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Current page line groups ───────────────────────────────────
  const currentPageGroups = getLineGroupsForPage(allLineGroups, currentPage);

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {/* Error Message */}
      {error && !file && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl">
          <FileWarning className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {!file && (
        <ToolDropzone
          onFiles={(files) => { if (files[0]) handleFileSelection(files[0]); }}
          accept="application/pdf"
          multiple={false}
          fileTypeLabel="PDFs"
          buttonText="Choose Files"
        />
      )}

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-8">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-black dark:text-white">Preview Edited PDF</h3>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
              >
                <X className="w-5 h-5 text-black/60 dark:text-white/60" />
              </button>
            </div>

            {/* Warnings */}
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

            {/* PDF Preview */}
            <div className="flex-1 overflow-auto p-4 bg-slate-100 dark:bg-neutral-800">
              <iframe
                src={previewUrl}
                className="w-full h-full min-h-[500px] rounded-lg border border-black/10 dark:border-white/10"
                title="PDF Preview"
              />
            </div>

            {/* Preview Actions */}
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

      {/* Editor Area */}
      {file && pdfDoc && !isLoading && (
        <div className="fixed inset-0 z-[100] bg-slate-100 dark:bg-neutral-900 flex flex-col font-sans">
          {/* Top Toolbar */}
          <div className="h-14 bg-white dark:bg-neutral-950 border-b border-black/10 dark:border-white/10 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
            {/* Left: Back & File name */}
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

            {/* Center: Edit count */}
            <div className="flex items-center gap-3">
              {dirtyEditCount > 0 && (
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  {dirtyEditCount} edit{dirtyEditCount !== 1 ? "s" : ""}
                </span>
              )}
              <p className="text-xs text-black/40 dark:text-white/40">
                Click on any text to edit it
              </p>
            </div>

            {/* Right: Export */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={dirtyEditCount === 0 || isExporting}
                className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-sm hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
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
            {/* Left Sidebar: Thumbnails */}
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
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-full relative cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                        currentPage === pageNum
                          ? "border-blue-500 shadow-sm"
                          : "border-transparent hover:border-blue-300"
                      }`}
                    >
                      <img src={src} alt={`Page ${pageNum}`} className="w-full h-auto bg-white" />
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

            {/* Center: Canvas + Text Overlay */}
            <div className="flex-1 overflow-auto bg-slate-100 dark:bg-neutral-900 p-8 flex flex-col items-center relative">
              <div
                className="relative bg-white shadow-xl border border-black/5 mx-auto"
                style={{
                  width: canvasRef.current?.style.width || "auto",
                  height: canvasRef.current?.style.height || "auto",
                }}
              >
                <canvas ref={canvasRef} className="block" />

                {/* Editable Text Overlay */}
                <div
                  className="absolute inset-0 z-10"
                  style={{
                    width: canvasRef.current?.style.width,
                    height: canvasRef.current?.style.height,
                  }}
                  onClick={(e) => {
                    // Deselect when clicking empty area
                    if (e.target === e.currentTarget) {
                      setSelectedGroupId(null);
                    }
                  }}
                >
                  {currentPageGroups.map((group) => {
                    const edit = edits[group.id];
                    const isSelected = selectedGroupId === group.id;
                    const isDirty = edit?.isDirty ?? false;
                    const displayText = edit ? edit.newText : group.fullText;

                    return (
                      <div
                        key={group.id}
                        id={`editor-${group.id}`}
                        className={`absolute cursor-text transition-all duration-150 ${
                          isSelected
                            ? "bg-blue-50/80 dark:bg-blue-900/30 outline outline-2 outline-blue-500 z-20"
                            : isDirty
                            ? "bg-amber-50/60 dark:bg-amber-900/20 outline outline-1 outline-amber-400/50 hover:outline-blue-400/50"
                            : "hover:bg-blue-50/40 dark:hover:bg-blue-900/10 hover:outline hover:outline-1 hover:outline-blue-300/50 hover:border-dashed"
                        }`}
                        style={{
                          left: `${group.x}px`,
                          top: `${group.y}px`,
                          width: `${group.width + 4}px`,
                          minHeight: `${group.height}px`,
                          fontSize: `${group.items[0].height}px`,
                          lineHeight: `${group.height}px`,
                          fontFamily: edit?.fontFamily || group.items[0].fontFamily || '"Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontWeight: (edit?.isBold ?? group.items[0].isBold) ? "bold" : "normal",
                          fontStyle: (edit?.isItalic ?? group.items[0].isItalic) ? "italic" : "normal",
                          textDecoration: (edit?.isUnderline ?? group.items[0].isUnderline) ? "underline" : "none",
                          textAlign: (edit?.alignment || group.items[0].alignment || 'left') as any,
                          color: isSelected || isDirty ? (edit?.color || group.items[0].color || "#000") : "transparent",
                          padding: "0 2px",
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        ref={(el) => {
                          // Set initial text content via ref to avoid
                          // dangerouslySetInnerHTML + contentEditable conflict
                          if (el && !el.dataset.initialized) {
                            el.innerText = displayText;
                            el.dataset.initialized = "1";
                          }
                        }}
                        onFocus={() => setSelectedGroupId(group.id)}
                        onBlur={(e) => {
                          const newText = (e.currentTarget as HTMLDivElement).innerText;
                          updateEdit(group, { newText });
                        }}
                        onInput={(e) => {
                          const newText = (e.currentTarget as HTMLDivElement).innerText;
                          updateEdit(group, { newText });
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 ml-28 flex items-center gap-2 bg-white dark:bg-neutral-900 p-2 rounded-xl shadow-lg border border-black/10 dark:border-white/10 z-20">
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

            {/* Right Sidebar: Info Panel */}
            <div className="w-64 bg-white dark:bg-neutral-950 border-l border-black/10 dark:border-white/10 flex flex-col z-10 shrink-0">
              <div className="p-4 border-b border-black/10 dark:border-white/10">
                <h4 className="font-semibold text-black/80 dark:text-white/80 text-sm">
                  Text Editor
                </h4>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Instructions */}
                <div className="space-y-2">
                  <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed">
                    Click on any text in the PDF to select and edit it. Changed text will be highlighted.
                  </p>
                </div>

                {/* Selected Text Info */}
                {selectedGroupId && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold text-black/60 dark:text-white/60 uppercase tracking-wider">
                      Selected Text
                    </h5>
                    {(() => {
                      const group = currentPageGroups.find((g) => g.id === selectedGroupId);
                      if (!group) return null;

                      const currentEdit = edits[group.id];
                      const currentFont = currentEdit?.fontFamily ?? (group.items[0].fontFamily || group.items[0].fontName);
                      const currentSize = currentEdit?.fontSize ?? group.items[0].fontSize;
                      const isBold = currentEdit?.isBold ?? group.items[0].isBold;
                      const isItalic = currentEdit?.isItalic ?? group.items[0].isItalic;
                      const isUnderline = currentEdit?.isUnderline ?? group.items[0].isUnderline ?? false;
                      const alignment = currentEdit?.alignment ?? group.items[0].alignment ?? 'left';
                      const currentColor = currentEdit?.color ?? group.items[0].color;

                      return (
                        <div className="space-y-4 text-xs text-black/80 dark:text-white/80">
                          <div className="space-y-1.5">
                            <label className="text-black/60 dark:text-white/50">Font Family</label>
                            <select
                              value={currentFont}
                              onChange={(e) => updateEdit(group, { fontFamily: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg p-2"
                            >
                              <option value={group.items[0].fontFamily || group.items[0].fontName}>Original ({group.items[0].fontFamily || group.items[0].fontName})</option>
                              <option value="Helvetica">Helvetica</option>
                              <option value="Times-Roman">Times</option>
                              <option value="Courier">Courier</option>
                            </select>
                          </div>

                          <div className="flex gap-2">
                            <div className="flex-1 space-y-1.5">
                              <label className="text-black/60 dark:text-white/50">Size (pt)</label>
                              <input
                                type="number"
                                value={Math.round(currentSize)}
                                onChange={(e) => updateEdit(group, { fontSize: parseInt(e.target.value) || currentSize })}
                                className="w-full bg-slate-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg p-2"
                              />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <label className="text-black/60 dark:text-white/50">Color</label>
                              <input
                                type="color"
                                value={currentColor}
                                onChange={(e) => updateEdit(group, { color: e.target.value })}
                                className="w-full h-[34px] bg-slate-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg p-0.5 cursor-pointer"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-black/60 dark:text-white/50">Style</label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateEdit(group, { isBold: !isBold })}
                                className={`flex-1 py-1.5 rounded-lg border font-bold transition-colors ${isBold ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300' : 'bg-slate-50 border-black/10 text-black/70 dark:bg-neutral-900 dark:border-white/10 dark:text-white/70'}`}
                              >B</button>
                              <button
                                onClick={() => updateEdit(group, { isItalic: !isItalic })}
                                className={`flex-1 py-1.5 rounded-lg border italic transition-colors ${isItalic ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300' : 'bg-slate-50 border-black/10 text-black/70 dark:bg-neutral-900 dark:border-white/10 dark:text-white/70'}`}
                              >I</button>
                              <button
                                onClick={() => updateEdit(group, { isUnderline: !isUnderline })}
                                className={`flex-1 py-1.5 rounded-lg border underline transition-colors ${isUnderline ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300' : 'bg-slate-50 border-black/10 text-black/70 dark:bg-neutral-900 dark:border-white/10 dark:text-white/70'}`}
                              >U</button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-black/60 dark:text-white/50">Alignment</label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateEdit(group, { alignment: 'left' })}
                                className={`flex-1 py-1.5 rounded-lg border transition-colors ${alignment === 'left' ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300' : 'bg-slate-50 border-black/10 text-black/70 dark:bg-neutral-900 dark:border-white/10 dark:text-white/70'}`}
                              >Left</button>
                              <button
                                onClick={() => updateEdit(group, { alignment: 'center' })}
                                className={`flex-1 py-1.5 rounded-lg border transition-colors ${alignment === 'center' ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300' : 'bg-slate-50 border-black/10 text-black/70 dark:bg-neutral-900 dark:border-white/10 dark:text-white/70'}`}
                              >Center</button>
                              <button
                                onClick={() => updateEdit(group, { alignment: 'right' })}
                                className={`flex-1 py-1.5 rounded-lg border transition-colors ${alignment === 'right' ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300' : 'bg-slate-50 border-black/10 text-black/70 dark:bg-neutral-900 dark:border-white/10 dark:text-white/70'}`}
                              >Right</button>
                            </div>
                          </div>

                          {currentEdit?.isDirty && (
                            <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                              <span className="text-amber-600 dark:text-amber-400 font-medium">Modified</span>
                              <button
                                onClick={() => {
                                  setEdits(prev => {
                                    const next = { ...prev };
                                    delete next[group.id];
                                    return next;
                                  });
                                  const el = document.getElementById(`editor-${group.id}`);
                                  if (el) el.innerText = group.fullText;
                                }}
                                className="text-red-500 hover:text-red-600 underline"
                              >Reset</button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Edit Summary */}
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
                            key={edit.lineGroupId}
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

                {/* Limitations Notice */}
                <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                  <p className="text-[10px] text-black/30 dark:text-white/30 leading-relaxed">
                    Works best on simple text documents. Complex layouts, custom fonts,
                    or multi-column designs may have imperfect results.
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
