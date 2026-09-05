"use client";

import React, { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import { 
  UploadCloud, 
  FileDown, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Download,
  FileBox,
  Settings2
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

interface ExportImage {
  id: string;
  pageNumber: number;
  blobUrl: string;
  blob: Blob;
  size: number;
}

export default function PdfToJpgUI() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [images, setImages] = useState<ExportImage[]>([]);
  const [quality, setQuality] = useState<number>(0.9); // 0.1 to 1.0
  const [scale, setScale] = useState<number>(2.0); // Resolution multiplier (2.0 is good for HD)
  
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

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    setImages([]); // Reset previous
  };

  const resetTool = () => {
    // Revoke all blob URLs to free memory
    images.forEach((img) => URL.revokeObjectURL(img.blobUrl));
    setFile(null);
    setImages([]);
    setProgress({ current: 0, total: 0 });
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processPdf = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setImages([]);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      
      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });
      
      const extractedImages: ExportImage[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: scale });
        
        // Create canvas
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        if (!context) continue;
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render PDF page into canvas context
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext as any).promise;
        
        // Convert canvas to JPG blob (more memory-efficient than toDataURL)
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", quality)
        );
        
        if (!blob) continue;
        
        extractedImages.push({
          id: `page-${i}-${Date.now()}`,
          pageNumber: i,
          blobUrl: URL.createObjectURL(blob),
          blob,
          size: blob.size,
        });
        
        setProgress({ current: i, total: numPages });
      }
      
      setImages(extractedImages);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("An error occurred while processing the PDF. The file might be corrupted or password-protected.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAllAsZip = async () => {
    if (images.length === 0) return;
    
    const zip = new JSZip();
    const folderName = file?.name.replace(".pdf", "") || "pdf-images";
    const folder = zip.folder(folderName);
    
    if (!folder) return;

    images.forEach((img) => {
      folder.file(`page-${img.pageNumber}.jpg`, img.blob);
    });
    
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folderName}-images.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSingleImage = (img: ExportImage) => {
    const a = document.createElement("a");
    a.href = img.blobUrl;
    a.download = `${file?.name.replace(".pdf", "") || "document"}-page-${img.pageNumber}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!file && (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-black/20 dark:border-white/20 rounded-3xl bg-black/5 dark:bg-white/5/50/20 transition-all hover:bg-black/5 dark:bg-white/5 dark:hover:bg-black/80 dark:bg-white/10/40 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
          <div className="w-16 h-16 mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-black dark:text-white mb-2">
            Upload PDF Document
          </h3>
          <p className="text-sm text-black/50 dark:text-white/50 text-center max-w-sm mb-4">
            Drag and drop your PDF here, or click to browse. Max size 50MB. All processing is strictly local.
          </p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-semibold text-black/60 dark:text-white/60 dark:text-slate-300">
            <FileBox className="w-3.5 h-3.5" />
            .PDF Supported
          </span>
          <div className="mt-6 pointer-events-none">
            <span className="inline-flex items-center gap-2 px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl shadow-sm transition-all">
              Choose PDF File
            </span>
          </div>
        </div>
      )}

      {/* Configuration & Processing Area */}
      {file && images.length === 0 && (
        <div className="bg-black/5 dark:bg-white/5/30 rounded-2xl p-6 sm:p-8 border border-black/10 dark:border-white/10/50 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <FileDown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-black dark:text-white text-lg truncate max-w-[200px] sm:max-w-md">
                  {file.name}
                </h3>
                <p className="text-sm text-black/50 dark:text-white/50">
                  {formatBytes(file.size)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-black/10 dark:border-white/10/50">
            {/* Image Quality Settings */}
            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm font-semibold text-black/70 dark:text-white/70 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-blue-500" />
                  Image Quality
                </span>
                <span className="text-blue-600 dark:text-blue-400">{Math.round(quality * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                disabled={isProcessing}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-black/50 dark:text-white/50 font-medium">
                <span>Smaller File</span>
                <span>Higher Quality</span>
              </div>
            </div>

            {/* Resolution/Scale Settings */}
            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm font-semibold text-black/70 dark:text-white/70 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-500" />
                  Resolution Scale
                </span>
                <span className="text-purple-600 dark:text-purple-400">{scale}x</span>
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.5"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                disabled={isProcessing}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-black/50 dark:text-white/50 font-medium">
                <span>Standard (1x)</span>
                <span>Ultra HD (3x)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={processPdf}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl transition-all shadow-lg shadow-sm hover:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Converting ({progress.current}/{progress.total})...
                </>
              ) : (
                <>
                  Convert to JPG
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
          
          {/* Progress Bar */}
          {isProcessing && (
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Results Area */}
      {images.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Conversion Complete!</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400/80">
                  Successfully extracted {images.length} pages.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={resetTool}
                className="flex-1 sm:flex-none px-4 py-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Convert Another
              </button>
              <button
                onClick={downloadAllAsZip}
                className="flex-1 sm:flex-none px-5 py-2 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-lg shadow-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download ZIP
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="group relative rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                <div className="aspect-[1/1.4] w-full bg-black/10 dark:bg-white/10 dark:bg-neutral-950 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.blobUrl}
                    alt={`Page ${img.pageNumber}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button
                      onClick={() => downloadSingleImage(img)}
                      className="p-3 bg-white text-black dark:text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                      title="Download Image"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-3 flex items-center justify-between border-t border-slate-100">
                  <span className="text-sm font-semibold text-black/70 dark:text-white/70 dark:text-slate-300">
                    Page {img.pageNumber}
                  </span>
                  <span className="text-xs text-black/50 dark:text-white/50">
                    {formatBytes(img.size)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Icon to avoid extra imports if not available in lucide
function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
