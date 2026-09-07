"use client";

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, FileText, Download, Loader2, ArrowRight, AlertCircle, X, CheckCircle2 } from "lucide-react";
import { wordToPdfWithBackend, downloadFileBlob } from "@/lib/pdf-backend-api";
import { formatBytes } from "@/lib/utils";

export default function WordToPdfUI() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const VALID_TYPES = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const VALID_EXTENSIONS = [".doc", ".docx"];

  const handleFileSelection = useCallback((selectedFile: File) => {
    setErrorMsg(null);
    setPdfBlob(null);

    const isExtensionValid = VALID_EXTENSIONS.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
    const isTypeValid = VALID_TYPES.includes(selectedFile.type) || !selectedFile.type;

    if (!isExtensionValid && !isTypeValid) {
      setErrorMsg(`Invalid file type. Please upload a .doc or .docx file.`);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMsg(`File exceeds the 50MB limit.`);
      return;
    }

    setFile(selectedFile);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, [handleFileSelection]);

  const convertToPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await wordToPdfWithBackend(file);
      setPdfBlob(blob);
      window.dispatchEvent(new CustomEvent('tool_processed', { detail: { fileName: file.name } }));
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!file || !pdfBlob) return;
    const newFileName = file.name.replace(/\.docx?$/i, '.pdf');
    downloadFileBlob(pdfBlob, newFileName);
  };

  const resetFlow = () => {
    setFile(null);
    setPdfBlob(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 flex items-start gap-3 text-sm text-red-800 dark:text-red-300 relative">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <strong className="font-semibold block mb-1">Error</strong>
            {errorMsg}
          </div>
          <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-md transition-colors absolute top-3 right-3">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
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
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
              }
            }}
          />
          <div className="w-16 h-16 mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-black dark:text-white mb-2">
            Select Word Document
          </h3>
          <p className="text-sm text-black/50 dark:text-white/50 text-center max-w-sm mb-4">
            Drag and drop a Word document here. Max size 50MB.
          </p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-semibold text-black/60 dark:text-white/60 dark:text-slate-300">
            <FileText className="w-3.5 h-3.5" /> .DOC, .DOCX Supported
          </span>
          <div className="mt-6 pointer-events-none">
            <span className="inline-flex items-center gap-2 px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl shadow-sm transition-all">
              Choose File
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-black/5 dark:bg-white/5/30 rounded-2xl p-6 sm:p-8 border border-black/10 dark:border-white/10/50 space-y-6">
          <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-neutral-950 rounded-xl border border-black/10 dark:border-white/10">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/50">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-black dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">{formatBytes(file.size)}</p>
              </div>
            </div>

            {!isProcessing && !pdfBlob && (
              <button onClick={resetFlow} className="p-2 text-black/40 hover:text-red-500 transition-colors shrink-0" title="Remove file">
                <X className="w-5 h-5" />
              </button>
            )}

            {pdfBlob && (
              <div className="shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={resetFlow}
              disabled={isProcessing}
              className="px-6 py-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-bold rounded-xl transition-all shadow-sm hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 flex items-center justify-center"
            >
              Start Over
            </button>

            {!pdfBlob ? (
              <button
                onClick={convertToPdf}
                disabled={isProcessing}
                className="px-8 py-3 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl transition-all shadow-lg shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</>
                ) : (
                  <><ArrowRight className="w-5 h-5" /> Convert to PDF</>
                )}
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl transition-all shadow-lg shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <Download className="w-5 h-5" /> Download PDF
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
