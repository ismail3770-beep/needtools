"use client";

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, Loader2, Download, FileBox, FileSpreadsheet, AlertCircle, XCircle } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { pdfToExcelWithBackend, downloadFileBlob } from "@/lib/pdf-backend-api";

export default function PdfToExcelUI() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = useCallback((selectedFiles: FileList | File[]) => {
    setErrorMsg(null);
    setResultBlob(null);

    const validFiles = Array.from(selectedFiles);
    if (validFiles.length === 0) return;

    const selectedFile = validFiles[0];

    if (selectedFile.type !== "application/pdf") {
      setErrorMsg("Please select a valid PDF file.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setErrorMsg("File exceeds 50MB limit.");
      return;
    }

    setFile(selectedFile);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  }, [handleFileSelection]);

  const extractToExcel = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setResultBlob(null);

    try {
      const blob = await pdfToExcelWithBackend(file);
      setResultBlob(blob);
      window.dispatchEvent(new CustomEvent('tool_processed', { detail: { fileName: file.name } }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("No tables detected in the PDF")) {
        setErrorMsg("No tables detected in the PDF. Please ensure your PDF contains tabular data.");
      } else {
        setErrorMsg(message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadExcel = () => {
    if (!resultBlob || !file) return;
    const excelName = file.name.replace(/\.pdf$/i, '.xlsx');
    downloadFileBlob(resultBlob, excelName);
  };

  const resetFile = () => {
    setFile(null);
    setResultBlob(null);
    setErrorMsg(null);
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
            accept="application/pdf"
            className="hidden"
            onChange={(e) => { if (e.target.files) handleFileSelection(e.target.files); }}
          />
          <div className="w-16 h-16 mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-black dark:text-white mb-2">
            Select a PDF to extract
          </h3>
          <p className="text-sm text-black/50 dark:text-white/50 text-center max-w-sm mb-4">
            Drag and drop a PDF file here. Max size 50MB.
          </p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-semibold text-black/60 dark:text-white/60 dark:text-slate-300">
            <FileBox className="w-3.5 h-3.5" /> .PDF Supported
          </span>
          <div className="mt-6 pointer-events-none">
            <span className="inline-flex items-center gap-2 px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl shadow-sm transition-all">
              Choose PDF File
            </span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Extraction Error</h4>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors">
            <XCircle className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}

      {/* File Info and Processing Controls */}
      {file && (
        <div className="bg-black/5 dark:bg-white/5/30 rounded-2xl p-6 sm:p-8 border border-black/10 dark:border-white/10/50 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/50">
                <FileSpreadsheet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-black dark:text-white truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-2 text-xs mt-0.5 text-black/50 dark:text-white/50">
                  <span>{formatBytes(file.size)}</span>
                  {!resultBlob && !isProcessing && (
                    <button onClick={resetFile} className="text-red-500 hover:underline">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {resultBlob && (
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                Ready to download
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-black/10 dark:border-white/10/50">
            {!resultBlob ? (
              <button
                onClick={extractToExcel}
                disabled={isProcessing}
                className="px-8 py-3 w-full sm:w-auto bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl transition-all shadow-lg shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><FileSpreadsheet className="w-5 h-5" /> Extract Tables to Excel</>
                )}
              </button>
            ) : (
              <div className="flex w-full sm:w-auto items-center gap-3">
                <button
                  onClick={resetFile}
                  className="px-6 py-3 w-full sm:w-auto bg-white dark:bg-neutral-950 hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold rounded-xl transition-all flex items-center justify-center"
                >
                  Convert Another
                </button>
                <button
                  onClick={downloadExcel}
                  className="px-8 py-3 w-full sm:w-auto bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl transition-all shadow-lg shadow-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download Excel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
