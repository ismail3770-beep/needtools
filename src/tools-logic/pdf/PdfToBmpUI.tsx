"use client";

import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import { ImageIcon, Loader2, Download, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ToolDropzone } from "@/components/ui/ToolDropzone";
import { downloadFileBlob } from "@/lib/pdf-backend-api";
import { formatBytes } from "@/lib/utils";
import { baseName } from "./lib/pageRange";
import { encodeBmp } from "./lib/bmp";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

interface RenderedPage {
  pageNumber: number;
  blob: Blob;
  size: number;
}

export default function PdfToBmpUI() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(1.5);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = (selected: File) => {
    setFile(selected);
    setPages([]);
    setError(null);
  };

  const reset = () => {
    setFile(null);
    setPages([]);
    setError(null);
    setProgress({ current: 0, total: 0 });
    setIsProcessing(false);
  };

  const process = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setPages([]);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      setProgress({ current: 0, total: pdf.numPages });

      const rendered: RenderedPage[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // BMP has no alpha, so paint a white background first.
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport } as any).promise;

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const blob = encodeBmp(canvas.width, canvas.height, imageData.data);

        rendered.push({ pageNumber: i, blob, size: blob.size });
        setProgress({ current: i, total: pdf.numPages });
      }

      setPages(rendered);
      window.dispatchEvent(
        new CustomEvent("tool_processed", { detail: { fileName: file.name } })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while rendering the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadZip = async () => {
    if (!file || pages.length === 0) return;
    const folderName = baseName(file.name);
    const zip = new JSZip();
    const folder = zip.folder(folderName);
    if (!folder) return;
    pages.forEach((p) => folder.file(`page-${p.pageNumber}.bmp`, p.blob));
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadFileBlob(zipBlob, `${folderName}-bmp.zip`);
  };

  const downloadOne = (p: RenderedPage) => {
    if (!file) return;
    downloadFileBlob(p.blob, `${baseName(file.name)}-page-${p.pageNumber}.bmp`);
  };

  const totalSize = pages.reduce((sum, p) => sum + p.size, 0);

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

      {file && pages.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                <ImageIcon className="w-6 h-6" />
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

          <div className="space-y-3">
            <label className="flex items-center justify-between text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <span>Resolution scale</span>
              <span className="text-brand-600 dark:text-brand-400">{scale}x</span>
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.5"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              disabled={isProcessing}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              BMP is uncompressed, so files are large by design. Keep the scale low for long
              documents.
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
            disabled={isProcessing}
            className="w-full px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Converting ({progress.current}/{progress.total})...
              </>
            ) : (
              "Convert to BMP"
            )}
          </button>
        </div>
      )}

      {pages.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <p className="font-semibold text-emerald-900 dark:text-emerald-300">
                {pages.length} BMP file{pages.length > 1 ? "s" : ""} · {formatBytes(totalSize)}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={reset}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Convert Another
              </button>
              <button
                onClick={downloadZip}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download ZIP
              </button>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            {pages.map((p) => (
              <div key={p.pageNumber} className="flex items-center justify-between gap-4 p-4">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  page-{p.pageNumber}.bmp
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatBytes(p.size)}
                  </span>
                  <button
                    onClick={() => downloadOne(p)}
                    className="p-2 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 rounded-lg transition-colors"
                    title="Download BMP"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
