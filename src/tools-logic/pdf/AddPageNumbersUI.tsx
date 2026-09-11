"use client";
import { ToolDropzone } from "@/components/ui/ToolDropzone";


import React, { useState, useRef, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  UploadCloud,
  Trash2,
  Loader2,
  CheckCircle2,
  Download,
  FileBox,
  FileArchive,
  ArrowRight,
  Settings2,
  Hash,
  Type,
  LayoutTemplate
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50 MB

type Position = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
type Format = "plain" | "page-n" | "n-of-total" | "page-n-of-total" | "dashes";

export default function AddPageNumbersUI() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Configuration state
  const [position, setPosition] = useState<Position>("bottom-center");
  const [format, setFormat] = useState<Format>("plain");
  const [fontSize, setFontSize] = useState<number>(12);
  const [startPage, setStartPage] = useState<number>(1);
  const [startNumber, setStartNumber] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add("border-blue-500", "bg-blue-50/50", "dark:bg-blue-900/20");
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-blue-500", "bg-blue-50/50", "dark:bg-blue-900/20");
    }
  }, []);

  const handleFileSelection = useCallback(async (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > MAX_PDF_SIZE) {
      setError(`File is too large (${formatBytes(selectedFile.size)}). Maximum size is 50 MB.`);
      return;
    }

    setFile(selectedFile);
    setResultBlob(null);
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setFileBytes(bytes);

      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);

      // Render thumbnail of the first page
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport } as any).promise;
        setThumbnailUrl(canvas.toDataURL("image/jpeg", 0.8));
      }
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError("An error occurred while loading the PDF. It might be corrupted or password-protected.");
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-blue-500", "bg-blue-50/50", "dark:bg-blue-900/20");
    }
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      handleFileSelection(droppedFile);
    } else {
      setError("Please drop a valid PDF file.");
    }
  }, [handleFileSelection]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      handleFileSelection(selectedFile);
    }
  };

  const resetTool = () => {
    setFile(null);
    setFileBytes(null);
    setThumbnailUrl(null);
    setResultBlob(null);
    setError(null);
    setTotalPages(0);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processPdf = async () => {
    if (!fileBytes) return;
    setIsProcessing(true);
    setResultBlob(null);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.load(fileBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const total = pages.length;

      pages.forEach((page, index) => {
        if (index < startPage - 1) return; // Skip pages before startPage

        const currentNumber = startNumber + (index - (startPage - 1));
        const { width, height } = page.getSize();

        let text = "";
        switch (format) {
          case "plain": text = `${currentNumber}`; break;
          case "page-n": text = `Page ${currentNumber}`; break;
          case "n-of-total": text = `${currentNumber} of ${total}`; break;
          case "page-n-of-total": text = `Page ${currentNumber} of ${total}`; break;
          case "dashes": text = `- ${currentNumber} -`; break;
        }

        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const margin = 36; // roughly 0.5 inch

        let x = 0;
        let y = 0;

        switch (position) {
          case "top-left":
            x = margin;
            y = height - margin - fontSize;
            break;
          case "top-center":
            x = (width - textWidth) / 2;
            y = height - margin - fontSize;
            break;
          case "top-right":
            x = width - margin - textWidth;
            y = height - margin - fontSize;
            break;
          case "bottom-left":
            x = margin;
            y = margin;
            break;
          case "bottom-center":
            x = (width - textWidth) / 2;
            y = margin;
            break;
          case "bottom-right":
            x = width - margin - textWidth;
            y = margin;
            break;
        }

        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err) {
      console.error("Error adding page numbers:", err);
      setError("Failed to process the PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(".pdf", "")}_numbered.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const positionOptions: { id: Position; label: string }[] = [
    { id: "top-left", label: "Top Left" },
    { id: "top-center", label: "Top Center" },
    { id: "top-right", label: "Top Right" },
    { id: "bottom-left", label: "Bottom Left" },
    { id: "bottom-center", label: "Bottom Center" },
    { id: "bottom-right", label: "Bottom Right" },
  ];

  const formatOptions: { id: Format; label: string; preview: string }[] = [
    { id: "plain", label: "Plain Number", preview: "1" },
    { id: "page-n", label: "Page N", preview: "Page 1" },
    { id: "n-of-total", label: "N of Total", preview: `1 of ${totalPages || "N"}` },
    { id: "page-n-of-total", label: "Page N of Total", preview: `Page 1 of ${totalPages || "N"}` },
    { id: "dashes", label: "Dashed", preview: "- 1 -" },
  ];

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-sm text-red-800 dark:text-red-300">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="shrink-0 text-red-500 hover:text-red-700 dark:hover:text-red-200 font-bold text-lg leading-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload Zone */}
      {!file && (
        <ToolDropzone
          onFiles={(files) => files[0] && handleFileSelection(files[0])}
          accept="application/pdf"
          multiple={false}
          fileTypeLabel="PDFs"
          buttonText="Choose Files"
        />
      )}

      {/* Configuration Area */}
      {file && !resultBlob && (
        <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 sm:p-8 border border-black/10 dark:border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Left Col: Settings */}
            <div className="flex-1 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileArchive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black dark:text-white text-lg truncate max-w-[200px] sm:max-w-[15rem]">
                      {file.name}
                    </h3>
                    <p className="text-sm text-black/50 dark:text-white/50">
                      {formatBytes(file.size)} • {totalPages} pages
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetTool}
                  disabled={isProcessing}
                  className="p-2 text-black/40 dark:text-white/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Remove file"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-black/10 dark:border-white/10">
                {/* Position */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-black/70 dark:text-white/70">
                    <LayoutTemplate className="w-4 h-4 text-blue-500" />
                    Number Position
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                    {positionOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setPosition(opt.id)}
                        className={`aspect-video flex items-center justify-center rounded-lg border-2 transition-all text-xs font-medium ${
                          position === opt.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-transparent hover:bg-black/10 dark:hover:bg-white/10 text-black/50 dark:text-white/50"
                        }`}
                        title={opt.label}
                      >
                        <div className={`w-2 h-2 rounded-full ${position === opt.id ? "bg-blue-500" : "bg-black/20 dark:bg-white/20"} ${
                          opt.id.includes("top") ? "mb-auto mt-2" : "mt-auto mb-2"
                        } ${
                          opt.id.includes("left") ? "mr-auto ml-2" : opt.id.includes("right") ? "ml-auto mr-2" : "mx-auto"
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-black/70 dark:text-white/70">
                    <Hash className="w-4 h-4 text-emerald-500" />
                    Number Format
                  </label>
                  <div className="space-y-2">
                    {formatOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setFormat(opt.id)}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border text-sm transition-all ${
                          format === opt.id
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-semibold"
                            : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70 font-medium"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className="opacity-50">{opt.preview}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size & Settings */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-black/70 dark:text-white/70">
                      <Type className="w-4 h-4 text-purple-500" />
                      Font Size
                    </label>
                    <div className="flex gap-2">
                      {[10, 12, 14].map((size) => (
                        <button
                          key={size}
                          onClick={() => setFontSize(size)}
                          className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                            fontSize === size
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-bold"
                              : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70 font-medium"
                          }`}
                        >
                          {size === 10 ? "Small" : size === 12 ? "Medium" : "Large"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-black/70 dark:text-white/70">
                      <Settings2 className="w-4 h-4 text-amber-500" />
                      Start on Page
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={totalPages || 1}
                      value={startPage}
                      onChange={(e) => setStartPage(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-black/70 dark:text-white/70">
                      <Settings2 className="w-4 h-4 text-amber-500 opacity-0" />
                      Starting Number
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={startNumber}
                      onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Preview */}
            <div className="w-full sm:w-64 shrink-0 flex flex-col items-center space-y-3">
              <span className="text-sm font-semibold text-black/70 dark:text-white/70 self-start">
                Preview
              </span>
              <div className="relative w-full aspect-[1/1.4] bg-white dark:bg-neutral-900 border-2 border-black/10 dark:border-white/10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="First page preview" className="w-full h-full object-contain opacity-70" />
                ) : (
                  <Loader2 className="w-6 h-6 animate-spin text-black/20 dark:text-white/20" />
                )}

                {/* Visual Position Indicator Overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className={`w-8 h-3 rounded-full bg-blue-500 transition-opacity ${position === "top-left" ? "opacity-100 shadow-md shadow-blue-500/50" : "opacity-0"}`} />
                    <div className={`w-8 h-3 rounded-full bg-blue-500 transition-opacity ${position === "top-center" ? "opacity-100 shadow-md shadow-blue-500/50" : "opacity-0"}`} />
                    <div className={`w-8 h-3 rounded-full bg-blue-500 transition-opacity ${position === "top-right" ? "opacity-100 shadow-md shadow-blue-500/50" : "opacity-0"}`} />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className={`w-8 h-3 rounded-full bg-blue-500 transition-opacity ${position === "bottom-left" ? "opacity-100 shadow-md shadow-blue-500/50" : "opacity-0"}`} />
                    <div className={`w-8 h-3 rounded-full bg-blue-500 transition-opacity ${position === "bottom-center" ? "opacity-100 shadow-md shadow-blue-500/50" : "opacity-0"}`} />
                    <div className={`w-8 h-3 rounded-full bg-blue-500 transition-opacity ${position === "bottom-right" ? "opacity-100 shadow-md shadow-blue-500/50" : "opacity-0"}`} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-black/40 dark:text-white/40 max-w-[200px]">
                Indicator shows approximate location on the page.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={processPdf}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl transition-all shadow-lg shadow-sm hover:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  Add Page Numbers
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results Area */}
      {resultBlob && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">Processing Complete!</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Successfully added numbers to {totalPages} pages.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={resetTool}
                className="flex-1 sm:flex-none px-4 py-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Process Another
              </button>
              <button
                onClick={downloadResult}
                className="flex-1 sm:flex-none px-6 py-3 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl shadow-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
