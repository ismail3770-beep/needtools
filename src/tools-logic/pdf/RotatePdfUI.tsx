"use client";

import { CloudImportButtons } from "@/components/ui/CloudImportButtons";

import React, { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, degrees } from "pdf-lib";
import {
  UploadCloud,
  Loader2,
  Download,
  FileText,
  RotateCcw,
  RotateCw,
  CheckCircle2
} from "lucide-react";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

interface PdfPage {
  id: string;
  originalIndex: number;
  dataUrl: string;
  rotation: number;
}

export default function RotatePdfUI() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Drag & Drop Handlers
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
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File exceeds the 50MB limit. Please choose a smaller file.");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFile(selectedFile);
    setPages([]);
    setError(null);
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setFileBytes(bytes);

      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;

      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });

      const extractedPages: PdfPage[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 }); // Keep scale small for thumbnails

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext as any).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

        extractedPages.push({
          id: `page-${i}-${Date.now()}`,
          originalIndex: i - 1, // 0-indexed for pdf-lib
          dataUrl,
          rotation: 0, // Starts at 0 relative to original orientation
        });

        setProgress({ current: i, total: numPages });
      }

      setPages(extractedPages);
    } catch (error) {
      console.error("Error loading PDF:", error);
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
    setPages([]);
    setError(null);
    setProgress({ current: 0, total: 0 });
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const rotatePage = (index: number, deg: number) => {
    const newPages = [...pages];
    let newRotation = (newPages[index].rotation + deg) % 360;
    if (newRotation < 0) newRotation += 360; // Normalize to 0, 90, 180, 270
    newPages[index].rotation = newRotation;
    setPages(newPages);
  };

  const rotateAll = (deg: number) => {
    setPages(pages.map(p => {
      let newRotation = (p.rotation + deg) % 360;
      if (newRotation < 0) newRotation += 360;
      return { ...p, rotation: newRotation };
    }));
  };

  const generateNewPdf = async () => {
    if (!fileBytes || pages.length === 0) return;

    setIsProcessing(true);
    try {
      const originalPdf = await PDFDocument.load(fileBytes);
      const newPdf = await PDFDocument.create();

      const pageIndices = pages.map(p => p.originalIndex);
      const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);

      copiedPages.forEach((page, index) => {
        const existingRotation = page.getRotation().angle;
        const addedRotation = pages[index].rotation;
        page.setRotation(degrees(existingRotation + addedRotation));
        newPdf.addPage(page);
      });

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${file?.name.replace(".pdf", "")}_rotated.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("An error occurred while generating the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300 font-bold text-lg leading-none"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}
      {!file ? (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative overflow-hidden rounded-3xl border-2 border-dashed border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors group"
        >
          <div className="px-6 py-16 sm:py-20 flex flex-col items-center justify-center text-center z-10 relative">
            <div className="w-20 h-20 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
              <UploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3">
              Upload PDF to Rotate
            </h3>
            <p className="text-sm text-black/50 dark:text-white/50 max-w-md mx-auto mb-8">
              Drag & drop your PDF file here, or click to browse. Easily rotate individual pages or the entire document.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,application/pdf"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-8 py-3.5 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading pages...
                </>
              ) : (
                "Choose PDF File"
              )}
            </button>
            <p className="mt-4 text-xs font-medium text-black/40 dark:text-white/50 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              100% Private - Processed in your browser
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header & Global Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/5 dark:bg-white/5 p-4 sm:p-5 rounded-2xl border border-black/10 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-black dark:text-white truncate max-w-[200px] sm:max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-black/50 dark:text-white/50 font-medium">
                  {pages.length} pages total
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={resetTool}
                className="flex-1 sm:flex-none px-4 py-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Upload Another
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isProcessing && pages.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
              <p className="text-lg font-bold text-black dark:text-white">
                Reading PDF Pages...
              </p>
              <p className="text-sm text-black/50 dark:text-white/50 mt-2">
                Loaded {progress.current} of {progress.total} pages
              </p>
              <div className="w-full max-w-md h-2 bg-black/10 dark:bg-white/10 rounded-full mt-6 overflow-hidden">
                <div
                  className="h-full bg-black dark:bg-white rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(progress.current / Math.max(1, progress.total)) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md py-3 px-2 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-lg p-1">
                  <span className="text-xs font-semibold px-2 text-black/60 dark:text-white/60">Rotate All:</span>
                  <button onClick={() => rotateAll(-90)} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors text-black/70 dark:text-white/70" title="Rotate Left">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button onClick={() => rotateAll(180)} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors text-black/70 dark:text-white/70" title="Rotate 180°">
                    <RotateCw className="w-4 h-4 rotate-90" />
                  </button>
                  <button onClick={() => rotateAll(90)} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors text-black/70 dark:text-white/70" title="Rotate Right">
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid Workspace */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className="group relative flex flex-col bg-white dark:bg-neutral-950 rounded-xl border border-black/10 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                      {index + 1}
                    </div>

                    <div className="aspect-square w-full bg-black/5 dark:bg-white/5 relative flex items-center justify-center p-4">
                      <img
                        src={page.dataUrl}
                        alt={`Page ${index + 1}`}
                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                        style={{ transform: `rotate(${page.rotation}deg)` }}
                      />
                    </div>

                    <div className="bg-black/5 dark:bg-white/5 p-2 flex items-center justify-center gap-4 border-t border-slate-100 dark:border-white/10">
                      <button
                        onClick={() => rotatePage(index, -90)}
                        className="p-1.5 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
                        title="Rotate Left"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-medium text-black/40 dark:text-white/40 w-8 text-center">
                        {page.rotation === 0 ? '0°' : `${page.rotation}°`}
                      </span>
                      <button
                        onClick={() => rotatePage(index, 90)}
                        className="p-1.5 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
                        title="Rotate Right"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 mt-6 border-t border-black/10 dark:border-white/10">
                <button
                  onClick={generateNewPdf}
                  disabled={isProcessing || pages.length === 0}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-black/90 dark:hover:bg-white/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  Download Rotated PDF
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
