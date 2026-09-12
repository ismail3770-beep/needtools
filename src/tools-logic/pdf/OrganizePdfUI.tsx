"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { ArrowUpDown, Loader2, Download, Trash2, AlertCircle } from "lucide-react";
import { ToolDropzone } from "@/components/ui/ToolDropzone";
import { downloadFileBlob } from "@/lib/pdf-backend-api";
import { formatBytes } from "@/lib/utils";
import { baseName } from "./lib/pageRange";

export default function OrganizePdfUI() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [order, setOrder] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = async (selected: File) => {
    setError(null);
    setFile(selected);
    try {
      const doc = await PDFDocument.load(await selected.arrayBuffer());
      const count = doc.getPageCount();
      setPageCount(count);
      // Pre-fill with the current order so the user only edits what they need.
      setOrder(Array.from({ length: count }, (_, i) => i + 1).join(","));
    } catch {
      setPageCount(0);
      setOrder("");
      setError("Could not read this PDF. It may be corrupted or password-protected.");
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setOrder("");
    setError(null);
    setIsProcessing(false);
  };

  const process = async () => {
    if (!file) return;

    // Unlike the other page tools, order matters here and repeats are allowed
    // (duplicating a page is a legitimate use), so this is parsed literally.
    const requested = order
      .split(",")
      .map((part) => parseInt(part.trim(), 10))
      .filter((n) => !Number.isNaN(n));

    if (requested.length === 0) {
      setError("Enter the new page order, for example 3,1,2.");
      return;
    }
    const invalid = requested.filter((n) => n < 1 || n > pageCount);
    if (invalid.length > 0) {
      setError(`This PDF has ${pageCount} pages, so these are out of range: ${invalid.join(", ")}.`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const source = await PDFDocument.load(await file.arrayBuffer());
      const output = await PDFDocument.create();
      const copied = await output.copyPages(
        source,
        requested.map((n) => n - 1)
      );
      copied.forEach((page) => output.addPage(page));

      const bytes = await output.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      downloadFileBlob(blob, `${baseName(file.name)}_organized.pdf`);
      window.dispatchEvent(
        new CustomEvent("tool_processed", { detail: { fileName: file.name } })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while reordering pages.");
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
                <ArrowUpDown className="w-6 h-6" />
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
              New page order
            </label>
            <input
              type="text"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              disabled={isProcessing}
              placeholder="e.g. 3,1,2"
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              List every page you want to keep, in the order you want them. Omit a number to drop
              that page, or repeat one to duplicate it.
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
                Reorder & Download
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
