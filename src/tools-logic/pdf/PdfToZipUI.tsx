"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { FileArchive, Loader2, Download, Trash2, AlertCircle } from "lucide-react";
import { ToolDropzone } from "@/components/ui/ToolDropzone";
import { downloadFileBlob } from "@/lib/pdf-backend-api";
import { formatBytes } from "@/lib/utils";
import { baseName } from "./lib/pageRange";

export default function PdfToZipUI() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = async (selected: File) => {
    setError(null);
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
    setError(null);
    setProgress({ current: 0, total: 0 });
    setIsProcessing(false);
  };

  const process = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const source = await PDFDocument.load(await file.arrayBuffer());
      const total = source.getPageCount();
      setProgress({ current: 0, total });

      const folderName = baseName(file.name);
      const zip = new JSZip();
      const folder = zip.folder(folderName);
      if (!folder) throw new Error("Could not create the archive.");

      // Each page becomes its own single-page PDF inside the ZIP.
      for (let i = 0; i < total; i++) {
        const single = await PDFDocument.create();
        const [page] = await single.copyPages(source, [i]);
        single.addPage(page);
        const bytes = await single.save();
        folder.file(`page-${i + 1}.pdf`, bytes);
        setProgress({ current: i + 1, total });
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadFileBlob(zipBlob, `${folderName}-pages.zip`);
      window.dispatchEvent(
        new CustomEvent("tool_processed", { detail: { fileName: file.name } })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while splitting the PDF.");
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
                <FileArchive className="w-6 h-6" />
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

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Every page is saved as its own PDF and bundled into a single ZIP file. Nothing leaves
            your browser.
          </p>

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
                Splitting ({progress.current}/{progress.total})...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Split & Download ZIP
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
