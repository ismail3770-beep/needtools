"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { FileOutput, Loader2, Download, Trash2, AlertCircle } from "lucide-react";
import { ToolDropzone } from "@/components/ui/ToolDropzone";
import { downloadFileBlob } from "@/lib/pdf-backend-api";
import { formatBytes } from "@/lib/utils";
import { parsePageRange, baseName } from "./lib/pageRange";

export default function ExtractPdfPagesUI() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = async (selected: File) => {
    setError(null);
    setPages("");
    setFile(selected);
    try {
      const doc = await PDFDocument.load(await selected.arrayBuffer());
      setPageCount(doc.getPageCount());
    } catch {
      setPageCount(0);
      setError("Could not read this PDF. It may be corrupted or password-protected.");
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setPages("");
    setError(null);
    setIsProcessing(false);
  };

  const process = async () => {
    if (!file) return;
    const targets = parsePageRange(pages, pageCount);

    if (targets.length === 0) {
      setError("Enter at least one valid page number, for example 2,4-6.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const source = await PDFDocument.load(await file.arrayBuffer());
      const output = await PDFDocument.create();
      const copied = await output.copyPages(source, targets);
      copied.forEach((page) => output.addPage(page));

      const bytes = await output.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      downloadFileBlob(blob, `${baseName(file.name)}_extracted.pdf`);
      window.dispatchEvent(
        new CustomEvent("tool_processed", { detail: { fileName: file.name } })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while extracting pages.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file && (
        <ToolDropzone
          onFiles={(files) => files[0] && handleFileSelection(files[0])}
          accept="application/pdf"
          multiple={false}
          fileTypeLabel="PDFs"
          buttonText="Choose File"
        />
      )}

      {file && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                <FileOutput className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-zinc-900 dark:text-white truncate">{file.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatBytes(file.size)}
                  {pageCount > 0 && ` · ${pageCount} pages`}
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              disabled={isProcessing}
              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Remove file"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Pages to extract
            </label>
            <input
              type="text"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              disabled={isProcessing}
              placeholder="e.g. 2,4-6"
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              The selected pages are saved into a new PDF, in the order they appear in the document.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={process}
            disabled={isProcessing || pageCount === 0}
            className="w-full px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Extract Pages & Download
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
