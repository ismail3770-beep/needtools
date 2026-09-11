"use client";
import { ToolDropzone } from "@/components/ui/ToolDropzone";


import React, { useState, useRef, useCallback, MouseEvent } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, rgb } from "pdf-lib";
import {
  UploadCloud, 
  Trash2, 
  Loader2,
  CheckCircle2,
  Download,
  FileBox,
  PenTool,
  Type,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  X
} from "lucide-react";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

interface PdfPage {
  index: number;
  dataUrl: string;
  width: number;
  height: number;
}

interface Annotation {
  id: string;
  pageIndex: number;
  text: string;
  x: number; // Percentage X
  y: number; // Percentage Y
}

export default function FillAndSignPdfUI() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeTextInput, setActiveTextInput] = useState<{ x: number, y: number } | null>(null);
  const [tempText, setTempText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
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
    // Prevent browser crash from very large PDFs
    const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > MAX_PDF_SIZE) {
      alert("File too large. Maximum size is 50MB for browser-based PDF processing.");
      return;
    }

    setFile(selectedFile);
    setPages([]);
    setAnnotations([]);
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setFileBytes(bytes);

      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      
      const numPages = pdf.numPages;
      const extractedPages: PdfPage[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); 
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
        } as any).promise;
        
        extractedPages.push({
          index: i - 1,
          dataUrl: canvas.toDataURL("image/jpeg", 0.8),
          width: viewport.width,
          height: viewport.height,
        });
      }
      
      setPages(extractedPages);
      setCurrentPage(0);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("An error occurred while loading the PDF.");
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTool = () => {
    setFile(null);
    setFileBytes(null);
    setPages([]);
    setAnnotations([]);
    setActiveTextInput(null);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (activeTextInput) return; // Already adding text
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setActiveTextInput({ x, y });
    setTempText("");
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const saveAnnotation = () => {
    if (tempText.trim() && activeTextInput) {
      setAnnotations([...annotations, {
        id: Date.now().toString(),
        pageIndex: currentPage,
        text: tempText.trim(),
        x: activeTextInput.x,
        y: activeTextInput.y,
      }]);
    }
    setActiveTextInput(null);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const generateFilledPdf = async () => {
    if (!fileBytes) return;

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pdfPages = pdfDoc.getPages();

      annotations.forEach((ann) => {
        const page = pdfPages[ann.pageIndex];
        if (!page) return;

        const { width, height } = page.getSize();
        
        // Convert percentage to actual PDF points
        // Note: pdf-lib uses a coordinate system where (0,0) is the bottom-left corner!
        // But our UI percentage has Y=0 at the top.
        const xPoint = (ann.x / 100) * width;
        const yPoint = height - ((ann.y / 100) * height); 

        page.drawText(ann.text, {
          x: xPoint,
          y: yPoint - 10, // Adjust baseline slightly so it aligns with the click
          size: 14,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytesModified = await pdfDoc.save();
      const blob = new Blob([pdfBytesModified as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = file?.name.replace(".pdf", "_filled.pdf") || "filled.pdf";
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

  const currentPageData = pages[currentPage];
  const currentPageAnnotations = annotations.filter(a => a.pageIndex === currentPage);

  return (
    <div className="w-full">
      {!file ? (
        <ToolDropzone
          onFiles={(files) => files[0] && handleFileSelection(files[0])}
          accept=".pdf,application/pdf"
          multiple={false}
          fileTypeLabel="PDFs"
          buttonText="Choose Files"
        />
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                <FileBox className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-black dark:text-white truncate max-w-[200px] sm:max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-black/50 dark:text-white/50">
                  {annotations.length} texts added
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetTool}
                className="px-4 py-2 text-sm font-medium text-black/60 dark:text-white/60 dark:text-slate-300 bg-black/5 dark:bg-white/5 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/10 dark:bg-white/10 dark:hover:bg-black/80 dark:bg-white/10 transition-colors"
              >
                Upload Another
              </button>
              <button
                onClick={generateFilledPdf}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl shadow-sm transition-colors disabled:opacity-70"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Save PDF
              </button>
            </div>
          </div>

          {/* Workspace */}
          {currentPageData && (
            <div className="bg-black/10 dark:bg-white/10 dark:bg-neutral-950 rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center border border-black/10 dark:border-white/10 overflow-x-auto relative min-h-[60vh]">
              
              <div className="bg-white/80/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm mb-6 flex items-center gap-4 sticky top-0 z-10 border border-black/10 dark:border-white/10">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-1 text-black/50 dark:text-white/50 hover:text-black dark:text-white dark:hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold text-black/70 dark:text-white/70 dark:text-slate-300">
                  Page {currentPage + 1} of {pages.length}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
                  disabled={currentPage === pages.length - 1}
                  className="p-1 text-black/50 dark:text-white/50 hover:text-black dark:text-white dark:hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4 text-sm font-medium text-black/50 dark:text-white/50">
                <MousePointerClick className="w-4 h-4" /> Click anywhere on the page to add text
              </div>

              <div className="relative shadow-xl border border-black/10 dark:border-white/10 inline-block bg-white">
                <img 
                  src={currentPageData.dataUrl} 
                  alt={`Page ${currentPage + 1}`}
                  className="max-w-full h-auto object-contain cursor-crosshair"
                  onClick={handleImageClick}
                  style={{ maxHeight: '1000px' }}
                />

                {/* Render existing annotations */}
                {currentPageAnnotations.map((ann) => (
                  <div 
                    key={ann.id}
                    className="absolute group flex items-center gap-1"
                    style={{ left: `${ann.x}%`, top: `${ann.y}%`, transform: 'translateY(-100%)' }}
                  >
                    <div className="text-black bg-yellow-200/50 backdrop-blur-sm px-1 rounded text-sm sm:text-base font-medium border border-yellow-400/50 whitespace-nowrap leading-none shadow-sm">
                      {ann.text}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeAnnotation(ann.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded-full shadow-sm hover:scale-110 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Render active text input */}
                {activeTextInput && (
                  <div 
                    className="absolute z-20 flex items-center gap-2"
                    style={{ left: `${activeTextInput.x}%`, top: `${activeTextInput.y}%`, transform: 'translateY(-100%)' }}
                    onClick={(e) => e.stopPropagation()} // Prevent creating a new input when clicking on the input
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={tempText}
                      onChange={(e) => setTempText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveAnnotation();
                        if (e.key === 'Escape') setActiveTextInput(null);
                      }}
                      onBlur={saveAnnotation}
                      placeholder="Type text..."
                      className="px-2 py-1 text-sm sm:text-base text-black bg-white border-2 border-blue-500 rounded shadow-lg outline-none min-w-[150px]"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
