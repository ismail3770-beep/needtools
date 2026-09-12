"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Wrench, Loader2, Download, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ToolDropzone } from "@/components/ui/ToolDropzone";
import { downloadFileBlob } from "@/lib/pdf-backend-api";
import { formatBytes } from "@/lib/utils";
import { baseName } from "./lib/pageRange";

interface RepairReport {
  totalPages: number;
  recovered: number;
  skipped: number[];
}

export default function RepairPdfUI() {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<RepairReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = (selected: File) => {
    setFile(selected);
    setReport(null);
    setError(null);
  };

  const reset = () => {
    setFile(null);
    setReport(null);
    setError(null);
    setIsProcessing(false);
  };

  const process = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setReport(null);

    try {
      const buffer = await file.arrayBuffer();

      // Lenient parsing: tolerate broken objects and skip encryption checks,
      // which is the whole point of a repair tool.
      const source = await PDFDocument.load(buffer, {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false,
      });

      const totalPages = source.getPageCount();
      const output = await PDFDocument.create();
      const skipped: number[] = [];

      // Copy page by page so one unrecoverable page does not lose the rest.
      for (let i = 0; i < totalPages; i++) {
        try {
          const [page] = await output.copyPages(source, [i]);
          output.addPage(page);
        } catch {
          skipped.push(i + 1);
        }
      }

      const recovered = output.getPageCount();
      if (recovered === 0) {
        setError(
          "No pages could be recovered. This file is too badly damaged to rebuild in the browser."
        );
        return;
      }

      const bytes = await output.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      downloadFileBlob(blob, `${baseName(file.name)}_repaired.pdf`);
      setReport({ totalPages, recovered, skipped });
      window.dispatchEvent(
        new CustomEvent("tool_processed", { detail: { fileName: file.name } })
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not rebuild this PDF: ${err.message}`
          : "Could not rebuild this PDF."
      );
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
                <Wrench className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-zinc-900 dark:text-white truncate">{file.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{formatBytes(file.size)}</p>
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

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            The file is re-parsed leniently and rewritten from scratch, page by page. This fixes
            broken cross-reference tables and damaged metadata. Pages that cannot be read are
            skipped so you still keep the rest.
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {report && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
              <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-sm text-emerald-900 dark:text-emerald-300">
                <p className="font-semibold">
                  Recovered {report.recovered} of {report.totalPages} pages.
                </p>
                {report.skipped.length > 0 && (
                  <p className="mt-1 text-emerald-700 dark:text-emerald-400/80">
                    Could not read page{report.skipped.length > 1 ? "s" : ""}{" "}
                    {report.skipped.join(", ")}.
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={process}
            disabled={isProcessing}
            className="w-full px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Repairing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Repair & Download
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
