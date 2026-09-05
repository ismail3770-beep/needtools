"use client";

import React, { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import { 
  UploadCloud, 
  Trash2, 
  Loader2,
  Download,
  Settings2,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MousePointerClick
} from "lucide-react";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

interface PdfPage {
  id: string;
  originalIndex: number;
  dataUrl: string;
  selected: boolean;
}

export default function PdfSplitOrganizeUI() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [pages, setPages] = useState<PdfPage[]>([]);
  
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
      alert("Please drop a valid PDF file.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      handleFileSelection(selectedFile);
    }
  };

  const handleFileSelection = async (selectedFile: File) => {
    setFile(selectedFile);
    setPages([]);
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
        const viewport = page.getViewport({ scale: 1.0 }); // Keep scale small for thumbnails
        
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
          selected: false,
        });
        
        setProgress({ current: i, total: numPages });
      }
      
      setPages(extractedPages);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("An error occurred while loading the PDF. It might be corrupted or password-protected.");
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTool = () => {
    setFile(null);
    setFileBytes(null);
    setPages([]);
    setProgress({ current: 0, total: 0 });
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const togglePageSelection = (index: number) => {
    const newPages = [...pages];
    newPages[index].selected = !newPages[index].selected;
    setPages(newPages);
  };

  const selectAll = () => {
    setPages(pages.map((p) => ({ ...p, selected: true })));
  };

  const deselectAll = () => {
    setPages(pages.map((p) => ({ ...p, selected: false })));
  };

  const removeSelected = () => {
    setPages(pages.filter((p) => !p.selected));
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index > 0) {
      const newPages = [...pages];
      const temp = newPages[index - 1];
      newPages[index - 1] = newPages[index];
      newPages[index] = temp;
      setPages(newPages);
    } else if (direction === 'right' && index < pages.length - 1) {
      const newPages = [...pages];
      const temp = newPages[index + 1];
      newPages[index + 1] = newPages[index];
      newPages[index] = temp;
      setPages(newPages);
    }
  };

  const generateNewPdf = async (onlySelected: boolean) => {
    if (!fileBytes || pages.length === 0) return;

    setIsProcessing(true);
    try {
      const targetPages = onlySelected ? pages.filter(p => p.selected) : pages;
      
      if (targetPages.length === 0) {
        alert("Please select at least one page to extract.");
        setIsProcessing(false);
        return;
      }

      const originalPdf = await PDFDocument.load(fileBytes);
      const newPdf = await PDFDocument.create();

      const pageIndices = targetPages.map(p => p.originalIndex);
      const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);

      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file?.name.replace(".pdf", "")}_organized.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while generating the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className="w-full">
      {!file ? (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative overflow-hidden rounded-3xl border-2 border-dashed border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5/50 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-black/80 dark:bg-white/10 transition-colors group"
        >
          <div className="px-6 py-16 sm:py-20 flex flex-col items-center justify-center text-center z-10 relative">
            <div className="w-20 h-20 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
              <UploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3">
              Upload PDF to Split & Organize
            </h3>
            <p className="text-sm text-black/50 dark:text-white/50 max-w-md mx-auto mb-8">
              Drag & drop your PDF file here, or click to browse. Extract, delete, or rearrange pages easily.
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
              className="px-8 py-3.5 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-semibold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
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
            <p className="mt-4 text-xs font-medium text-black/40 dark:text-white/40 dark:text-black/50 dark:text-white/50 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              100% Private - Processed in your browser
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header & Global Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/5 dark:bg-white/5/50 p-4 sm:p-5 rounded-2xl border border-black/10 dark:border-white/10">
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1.5 text-xs font-semibold text-black/70 dark:text-white/70 dark:text-slate-300 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    disabled={selectedCount === 0}
                    className="px-3 py-1.5 text-xs font-semibold text-black/70 dark:text-white/70 dark:text-slate-300 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deselect All
                  </button>
                  <span className="text-xs font-medium text-black/50 dark:text-white/50 ml-2">
                    {selectedCount} selected
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={removeSelected}
                    disabled={selectedCount === 0}
                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>

              {/* Grid Workspace */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {pages.map((page, index) => (
                  <div 
                    key={page.id}
                    className={`group relative flex flex-col bg-white rounded-xl border-2 transition-all overflow-hidden cursor-pointer shadow-sm hover:shadow-md ${
                      page.selected 
                        ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/20" 
                        : "border-black/10 dark:border-white/10 hover:border-blue-400"
                    }`}
                    onClick={() => togglePageSelection(index)}
                  >
                    {/* Checkbox badge */}
                    <div className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
                      page.selected 
                        ? "bg-black dark:bg-white text-white scale-100" 
                        : "bg-white/90 text-slate-300 border border-black/20 dark:border-white/20 scale-90 group-hover:scale-100"
                    }`}>
                      <CheckCircle2 className={`w-4 h-4 ${page.selected ? "" : "opacity-0"}`} />
                    </div>
                    
                    {/* Page number badge */}
                    <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                      {index + 1}
                    </div>

                    <div className="aspect-[1/1.4] w-full bg-black/10 dark:bg-white/10 dark:bg-neutral-950 relative">
                      <img 
                        src={page.dataUrl} 
                        alt={`Page ${index + 1}`}
                        className={`w-full h-full object-contain transition-opacity ${page.selected ? "opacity-90" : "opacity-100"}`}
                      />
                    </div>
                    
                    {/* Reorder controls (don't trigger selection when clicked) */}
                    <div className="bg-black/5 dark:bg-white/5/80 p-2 flex items-center justify-between border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => movePage(index, 'left')}
                        disabled={index === 0}
                        className="p-1 text-black/40 dark:text-white/40 hover:text-black/70 dark:text-white/70 dark:hover:text-slate-200 hover:bg-black/20 dark:hover:bg-white/20 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-30"
                        title="Move Left"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => movePage(index, 'right')}
                        disabled={index === pages.length - 1}
                        className="p-1 text-black/40 dark:text-white/40 hover:text-black/70 dark:text-white/70 dark:hover:text-slate-200 hover:bg-black/20 dark:hover:bg-white/20 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-30"
                        title="Move Right"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {pages.length === 0 && !isProcessing && (
                  <div className="col-span-full py-12 text-center text-black/50 dark:text-white/50">
                    No pages left in the document.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-black/10 dark:border-white/10">
                <button
                  onClick={() => generateNewPdf(false)}
                  disabled={isProcessing || pages.length === 0}
                  className="flex-1 flex justify-center items-center gap-2 py-3.5 px-4 bg-neutral-950 dark:bg-white text-white dark:text-black dark:text-white dark:text-black font-bold rounded-xl hover:bg-black/80 dark:bg-white/10 dark:hover:bg-black/10 dark:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {isProcessing && !selectedCount ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  Save current view as PDF
                </button>
                
                <button
                  onClick={() => generateNewPdf(true)}
                  disabled={isProcessing || selectedCount === 0}
                  className="flex-1 flex justify-center items-center gap-2 py-3.5 px-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-black/90 dark:hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isProcessing && selectedCount > 0 ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings2 className="w-5 h-5" />}
                  Extract {selectedCount > 0 ? selectedCount : ""} selected pages
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
