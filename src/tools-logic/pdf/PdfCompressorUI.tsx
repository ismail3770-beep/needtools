"use client";

import { CloudImportButtons } from "@/components/ui/CloudImportButtons";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { UploadCloud, Trash2, Loader2, CheckCircle2, Download, FileBox, Settings2, FileArchive, ArrowRight, Archive, RefreshCw } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { compressPdfWithBackend, downloadPdfBlob } from "@/lib/pdf-backend-api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import JSZip from "jszip";
import { ShareLinkButton } from "@/components/tools/ShareLinkButton";

interface ProcessedPdf {
  originalFile: File;
  compressedBlob: Blob | null;
  status: "pending" | "processing" | "done" | "error";
  errorMsg?: string;
}

export default function PdfCompressorUI() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [files, setFiles] = useState<ProcessedPdf[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<number>(0.6);
  const [resolutionScale, setResolutionScale] = useState<number>(2.0);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const MAX_FILES = user ? 50 : 5;

  const handleFiles = (selectedFiles: FileList | File[]) => {
    const validFiles = Array.from(selectedFiles).filter(file => {
      if (file.type !== "application/pdf") {
        toast(`Skipped ${file.name}: Not a valid PDF.`, "error");
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast(`Skipped ${file.name}: Exceeds 50MB limit.`, "error");
        return false;
      }
      return true;
    });

    if (files.length + validFiles.length > MAX_FILES) {
      toast(`Limit reached. You can only process up to ${MAX_FILES} files.`, "error");
      validFiles.splice(MAX_FILES - files.length);
    }

    if (validFiles.length === 0) return;

    const newFiles: ProcessedPdf[] = validFiles.map(file => ({
      originalFile: file,
      compressedBlob: null,
      status: "pending"
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const compressAllPdfs = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const updatedFiles = [...files];
    updatedFiles.forEach(f => f.status = "pending");
    setFiles([...updatedFiles]);

    const imageQuality = Math.round(compressionLevel * 100);

    // Process sequentially or Promise.all. PDF compression can be heavy on the backend.
    // Let's do sequential to avoid overwhelming the server.
    for (let i = 0; i < updatedFiles.length; i++) {
      const f = updatedFiles[i];
      
      setFiles(prev => {
        const copy = [...prev];
        copy[i].status = "processing";
        return copy;
      });

      try {
        const blob = await compressPdfWithBackend(f.originalFile, imageQuality, resolutionScale);
        f.compressedBlob = blob;
        f.status = "done";
      } catch (err: unknown) {
        f.status = "error";
        f.errorMsg = err instanceof Error ? err.message : String(err);
      }

      setFiles(prev => {
        const copy = [...prev];
        copy[i] = { ...f };
        return copy;
      });
    }

    setIsProcessing(false);
    window.dispatchEvent(new CustomEvent('tool_processed', { detail: { fileName: files.length > 1 ? `${files.length} PDFs` : files[0].originalFile.name } }));
  };

  const downloadFile = (f: ProcessedPdf) => {
    if (!f.compressedBlob) return;
    const baseName = f.originalFile.name.substring(0, f.originalFile.name.lastIndexOf(".")) || "document";
    downloadPdfBlob(f.compressedBlob, `${baseName}-optimized.pdf`);
  };

  const downloadAllZip = async () => {
    const doneFiles = files.filter(f => f.status === "done" && f.compressedBlob);
    if (doneFiles.length === 0) return;

    const zip = new JSZip();

    doneFiles.forEach((f, i) => {
      const baseName = f.originalFile.name.substring(0, f.originalFile.name.lastIndexOf(".")) || `document_${i}`;
      zip.file(`${baseName}-optimized.pdf`, f.compressedBlob!);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "optimized_pdfs.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const totalOriginalSize = files.reduce((acc, f) => acc + f.originalFile.size, 0);
  const totalCompressedSize = files.reduce((acc, f) => acc + (f.compressedBlob?.size || 0), 0);
  const savingsPercent = totalOriginalSize && totalCompressedSize ? Math.max(0, Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)) : 0;
  
  const doneCount = files.filter(f => f.status === "done").length;
  const progressPercent = files.length ? Math.round((doneCount / files.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-all cursor-pointer overflow-hidden ${
          isDragOver
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
            : "border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5/50 hover:bg-black/5 dark:hover:bg-white/10/40 hover:border-blue-400 dark:hover:border-blue-500/50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="application/pdf"
          className="hidden"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
        />
        <div className="w-16 h-16 mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-black dark:text-white mb-2">
          Select PDFs to compress
        </h3>
        <p className="text-sm text-black/50 dark:text-white/50 text-center max-w-sm mb-4">
          Drag and drop multiple PDFs here (Max {MAX_FILES}). Max size 50MB per file.
        </p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-semibold text-black/60 dark:text-white/60 dark:text-slate-300">
          <FileBox className="w-3.5 h-3.5" /> .PDF Supported
        </span>
        <div className="mt-6 pointer-events-none">
          <span className="inline-flex items-center gap-2 px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl shadow-sm transition-all">
            Choose PDF Files
          </span>
        </div>
        <div className="mt-4 pointer-events-auto">
          <CloudImportButtons onFiles={(files) => handleFiles(files as any)} />
        </div>
      </div>

      {files.length > 0 && (
        <div className="bg-black/5 dark:bg-white/5/30 rounded-2xl p-6 sm:p-8 border border-black/10 dark:border-white/10/50 space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-4 text-sm text-emerald-800 dark:text-emerald-300">
            <strong>True Compression:</strong> Text, fonts, and vectors are preserved. Only images are compressed. Text remains selectable and sharp!
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-black/10 dark:border-white/10/50">
            {/* Compression Level */}
            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm font-semibold text-black/70 dark:text-white/70 dark:text-slate-300">
                <span className="flex items-center gap-2"><Settings2 className="w-4 h-4 text-blue-500" /> Compression Level</span>
                <span className="text-blue-600 dark:text-blue-400">{compressionLevel < 0.4 ? "High" : compressionLevel < 0.7 ? "Medium" : "Low"}</span>
              </label>
              <input type="range" min="0.1" max="1.0" step="0.1" value={compressionLevel} onChange={(e) => setCompressionLevel(parseFloat(e.target.value))} disabled={isProcessing} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>

            {/* Resolution Scale */}
            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm font-semibold text-black/70 dark:text-white/70 dark:text-slate-300">
                <span className="flex items-center gap-2"><Settings2 className="w-4 h-4 text-purple-500" /> Resolution</span>
                <span className="text-purple-600 dark:text-purple-400">{resolutionScale}x</span>
              </label>
              <input type="range" min="0.5" max="4.0" step="0.25" value={resolutionScale} onChange={(e) => setResolutionScale(parseFloat(e.target.value))} disabled={isProcessing} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600" />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span>{files.length} PDF{files.length > 1 ? 's' : ''} ({formatBytes(totalOriginalSize)})</span>
              {doneCount > 0 && <span className="text-emerald-600 dark:text-emerald-400">-{savingsPercent}% Savings</span>}
            </div>
            <button
              onClick={compressAllPdfs}
              disabled={isProcessing}
              className="px-8 py-3 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl transition-all shadow-lg shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><ArrowRight className="w-5 h-5" /> Compress PDFs</>}
            </button>
          </div>
          
          {isProcessing && (
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          )}

          {/* File List */}
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-sm mt-4">
            <div className="max-h-[400px] overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/50">
                    <FileArchive className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-black dark:text-white truncate">{f.originalFile.name}</p>
                    <div className="flex items-center gap-2 text-xs mt-0.5 text-black/50 dark:text-white/50">
                      <span className={f.status === "done" ? "line-through" : ""}>{formatBytes(f.originalFile.size)}</span>
                      {f.status === "done" && f.compressedBlob && (
                        <>
                          <ArrowRight className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatBytes(f.compressedBlob.size)}</span>
                        </>
                      )}
                      {f.status === "error" && <span className="text-red-500 truncate max-w-[150px]">{f.errorMsg}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {f.status === "pending" && <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">Pending</span>}
                    {f.status === "processing" && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                    {f.status === "done" && (
                      <>
                        <ShareLinkButton fileBlob={f.compressedBlob!} fileName={f.originalFile.name.replace(".pdf", "_compressed.pdf")} iconOnly />
                        <button onClick={() => downloadFile(f)} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Download">
                          <Download className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {f.status === "error" && <span className="text-xs font-semibold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-md">Error</span>}
                    <button onClick={() => removeFile(i)} disabled={isProcessing} className="p-2 text-black/40 hover:text-red-500 transition-colors disabled:opacity-50">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {doneCount > 0 && !isProcessing && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800/50 flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  {doneCount} file{doneCount > 1 ? 's' : ''} successfully compressed!
                </span>
                <button onClick={downloadAllZip} className="px-5 py-2.5 rounded-xl bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95">
                  <Archive className="w-4 h-4" /> Download ZIP
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
