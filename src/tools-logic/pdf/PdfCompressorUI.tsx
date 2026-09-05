"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  Trash2,
  Loader2,
  CheckCircle2,
  Download,
  FileBox,
  Settings2,
  FileArchive,
  ArrowRight
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { compressPdfWithBackend, downloadPdfBlob } from "@/lib/pdf-backend-api";

export default function PdfCompressorUI() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  
  // Compression level: 0.1 to 1.0 (Canvas JPEG quality)
  const [compressionLevel, setCompressionLevel] = useState<number>(0.6);
  // Scale down resolution: 2.0 = standard HD for text, 1.0 = normal, 0.5 = half resolution
  const [resolutionScale, setResolutionScale] = useState<number>(2.0);
  
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

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    setResultBlob(null);
  };

  const resetTool = () => {
    setFile(null);
    setResultBlob(null);
    setProgress({ current: 0, total: 0 });
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const compressPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResultBlob(null);
    setProgress({ current: 10, total: 100 });

    try {
      // Map UI slider (0.1–1.0) to backend image_quality (10–100)
      const imageQuality = Math.round(compressionLevel * 100);

      setProgress({ current: 30, total: 100 });
      const blob = await compressPdfWithBackend(file, imageQuality, resolutionScale);
      setProgress({ current: 100, total: 100 });
      setResultBlob(blob);
    } catch (error) {
      console.error("Error compressing PDF via backend:", error);
      alert(
        "Failed to compress PDF. Make sure the backend is running and try again.\n\n" +
        String(error)
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultBlob || !file) return;
    downloadPdfBlob(resultBlob, file.name);
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

      {/* Configuration Area */}
      {file && !resultBlob && (
        <div className="bg-black/5 dark:bg-white/5/30 rounded-2xl p-6 sm:p-8 border border-black/10 dark:border-white/10/50 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileArchive className="w-6 h-6" />
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

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-4 text-sm text-emerald-800 dark:text-emerald-300">
            <strong>True Compression:</strong> Text, fonts, and vectors are preserved. Only images are compressed. Text remains selectable and sharp!
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-black/10 dark:border-white/10/50">
            {/* Compression Level */}
            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm font-semibold text-black/70 dark:text-white/70 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-blue-500" />
                  Compression Level
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {compressionLevel < 0.4 ? "High" : compressionLevel < 0.7 ? "Medium" : "Low"}
                </span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={compressionLevel}
                onChange={(e) => setCompressionLevel(parseFloat(e.target.value))}
                disabled={isProcessing}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-black/50 dark:text-white/50 font-medium">
                <span>Smaller File</span>
                <span>Better Quality</span>
              </div>
            </div>

            {/* Resolution Scale */}
            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm font-semibold text-black/70 dark:text-white/70 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-purple-500" />
                  Resolution
                </span>
                <span className="text-purple-600 dark:text-purple-400">
                  {resolutionScale}x
                </span>
              </label>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.25"
                value={resolutionScale}
                onChange={(e) => setResolutionScale(parseFloat(e.target.value))}
                disabled={isProcessing}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-black/50 dark:text-white/50 font-medium">
                <span>Low Res</span>
                <span>Ultra HD</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={compressPdf}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl transition-all shadow-lg shadow-sm hover:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Compressing ({progress.current}/{progress.total})...
                </>
              ) : (
                <>
                  Compress PDF
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
          
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
      {resultBlob && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">Compression Complete!</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-black/50 dark:text-white/50 line-through decoration-red-500">{formatBytes(file?.size || 0)}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {formatBytes(resultBlob.size)} 
                    {file?.size && resultBlob.size < file.size && (
                      <span className="ml-2 text-xs bg-emerald-200 dark:bg-emerald-800 px-2 py-0.5 rounded-full">
                        -{Math.round((1 - resultBlob.size / file.size) * 100)}%
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={resetTool}
                className="flex-1 sm:flex-none px-4 py-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Compress Another
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
