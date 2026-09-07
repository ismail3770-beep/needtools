"use client";

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, Trash2, Loader2, Download, FileBox, FileText, Languages, X } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { ocrPdfWithBackend, downloadFileBlob } from "@/lib/pdf-backend-api";

export default function OcrPdfUI() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>("eng");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 20 * 1024 * 1024; // 20MB

  const handleFileSelection = useCallback((selectedFiles: FileList | File[]) => {
    setErrorMsg(null);
    setResultBlob(null);
    const selectedFile = selectedFiles[0];

    if (!selectedFile) return;

    if (selectedFile.size > MAX_SIZE) {
      setErrorMsg(`File "${selectedFile.name}" exceeds the 20MB limit.`);
      return;
    }

    setFile(selectedFile);
  }, [MAX_SIZE]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  }, [handleFileSelection]);

  const removeFile = () => {
    setFile(null);
    setResultBlob(null);
    setErrorMsg(null);
  };

  const runOcr = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setResultBlob(null);

    try {
      const blob = await ocrPdfWithBackend(file, language);
      setResultBlob(blob);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "document";
    downloadFileBlob(resultBlob, `${baseName}_ocr.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!file && (
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
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => { if (e.target.files) handleFileSelection(e.target.files); }}
          />
          <div className="w-16 h-16 mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-black dark:text-white mb-2">
            Select a PDF or Image for OCR
          </h3>
          <p className="text-sm text-black/50 dark:text-white/50 text-center max-w-sm mb-4">
            Drag and drop a file here. Max size 20MB.
          </p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-semibold text-black/60 dark:text-white/60 dark:text-slate-300">
            <FileBox className="w-3.5 h-3.5" /> .PDF, Image Supported
          </span>
          <div className="mt-6 pointer-events-none">
            <span className="inline-flex items-center gap-2 px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-sm transition-all">
              Choose File
            </span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-red-600 dark:text-red-400 font-bold text-sm">!</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900 dark:text-red-200">Error processing file</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{errorMsg}</p>
            </div>
          </div>
          <button onClick={() => setErrorMsg(null)} className="p-1 text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* File processing UI */}
      {file && (
        <div className="bg-black/5 dark:bg-white/5/30 rounded-2xl p-6 sm:p-8 border border-black/10 dark:border-white/10/50 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between pb-6 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/50">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-black dark:text-white truncate">{file.name}</p>
                <div className="text-xs mt-0.5 text-black/50 dark:text-white/50">
                  {formatBytes(file.size)}
                </div>
              </div>
            </div>

            <button onClick={removeFile} disabled={isProcessing} className="p-2 text-black/40 hover:text-red-500 transition-colors disabled:opacity-50">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-black/70 dark:text-white/70">
              <Languages className="w-4 h-4 text-blue-500" /> Document Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isProcessing || !!resultBlob}
              className="w-full sm:w-64 px-4 py-2.5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="eng">English</option>
              <option value="ben">Bengali</option>
              <option value="eng+ben">English + Bengali</option>
            </select>
            <p className="text-xs text-black/50 dark:text-white/50">Select the language(s) present in the document for best OCR results.</p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 border-t border-black/10 dark:border-white/10">
            {!resultBlob ? (
              <button
                onClick={runOcr}
                disabled={isProcessing}
                className="w-full sm:w-auto px-8 py-3 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing OCR...</> : "Run OCR"}
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                  ✓ OCR Complete
                </span>
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto px-8 py-3 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download Searchable PDF
                </button>
                <button
                  onClick={removeFile}
                  className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-bold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  Process Another
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
