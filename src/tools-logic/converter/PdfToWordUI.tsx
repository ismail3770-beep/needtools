"use client";

import { ToolDropzone } from "@/components/ui/ToolDropzone";
import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, FileText, Loader2, Download, AlertCircle, RefreshCw } from "lucide-react";
import { pdfToWordWithBackend, downloadFileBlob } from "@/lib/pdf-backend-api";
import { formatBytes } from "@/lib/utils";

interface ProcessedFile {
  originalFile: File;
  processedBlob: Blob | null;
  status: "pending" | "processing" | "done" | "error";
  errorMsg?: string;
}

export default function PdfToWordUI() {
  const [fileState, setFileState] = useState<ProcessedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((selectedFiles: FileList | File[]) => {
    const file = Array.from(selectedFiles)[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setFileState({
        originalFile: file,
        processedBlob: null,
        status: "error",
        errorMsg: "Selected file is not a valid PDF."
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setFileState({
        originalFile: file,
        processedBlob: null,
        status: "error",
        errorMsg: "File exceeds 50MB limit."
      });
      return;
    }

    setFileState({
      originalFile: file,
      processedBlob: null,
      status: "pending"
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const convertFile = async () => {
    if (!fileState || fileState.status === "processing") return;

    setFileState(prev => prev ? { ...prev, status: "processing", errorMsg: undefined } : null);

    try {
      const blob = await pdfToWordWithBackend(fileState.originalFile);
      setFileState(prev => prev ? { ...prev, status: "done", processedBlob: blob } : null);

      window.dispatchEvent(new CustomEvent("tool_processed", { detail: { fileName: fileState.originalFile.name } }));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFileState(prev => prev ? { ...prev, status: "error", errorMsg } : null);
    }
  };

  const handleDownload = () => {
    if (!fileState?.processedBlob) return;
    const downloadName = fileState.originalFile.name.replace(/\.pdf$/i, ".docx");
    downloadFileBlob(fileState.processedBlob, downloadName);
  };

  const reset = () => {
    setFileState(null);
  };

  return (
    <div className="space-y-6">
      {!fileState ? (
        <ToolDropzone
          onFiles={(files) => { if (files[0]) handleFiles([files[0]]); }}
          accept="application/pdf"
          multiple={false}
          fileTypeLabel="PDFs"
          buttonText="Choose Files"
        />
      ) : (
        <div className="bg-black/5 dark:bg-white/5/30 rounded-2xl p-6 sm:p-8 border border-black/10 dark:border-white/10/50 space-y-6">

          {fileState.status === "error" && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 dark:text-red-300">
                <strong className="block font-semibold mb-1">Conversion Failed</strong>
                {fileState.errorMsg || "An unknown error occurred."}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-950 rounded-2xl border border-black/10 dark:border-white/10">
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/50">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-black dark:text-white truncate">{fileState.originalFile.name}</p>
              <div className="flex items-center gap-2 text-xs mt-0.5 text-black/50 dark:text-white/50">
                <span>{formatBytes(fileState.originalFile.size)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-black/10 dark:border-white/10/50">
            <button
              onClick={reset}
              disabled={fileState.status === "processing"}
              className="px-6 py-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Start Over
            </button>

            {fileState.status === "pending" || fileState.status === "error" ? (
              <button
                onClick={convertFile}
                className="px-8 py-3 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                Convert to Word
              </button>
            ) : fileState.status === "processing" ? (
              <button
                disabled
                className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl opacity-70 flex items-center gap-2 cursor-not-allowed"
              >
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> Download Word File
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
