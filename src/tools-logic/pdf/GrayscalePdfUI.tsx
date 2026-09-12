"use client";

import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import { Contrast, Loader2, Download, Trash2, AlertCircle } from "lucide-react";
import { ToolDropzone } from "@/components/ui/ToolDropzone";
import { downloadFileBlob } from "@/lib/pdf-backend-api";
import { formatBytes } from "@/lib/utils";
import { baseName } from "./lib/pageRange";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

export default function GrayscalePdfUI() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = (selected: File) => {
    setFile(selected);
    setError(null);
  };

  const reset = () => {
    setFile(null);
    setError(null);
    setProgress({ current: 0, total: 0 });
    setIsProcessing(false);
  };

  const process = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      setProgress({ current: 0, total: pdf.numPages });

      const output = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        // Keep the original point size for the PDF page, but render at a
        // higher scale so the rasterised result still looks sharp.
        const baseViewport = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport } as any).promise;

        // Rec. 601 luma weights give a far more natural result than a flat
        // average of the three channels.
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let p = 0; p < data.length; p += 4) {
          const luma = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
          data[p] = luma;
          data[p + 1] = luma;
          data[p + 2] = luma;
        }
        context.putImageData(imageData, 0, 0);

        const pngBlob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (!pngBlob) continue;

        const embedded = await output.embedPng(await pngBlob.arrayBuffer());
        const newPage = output.addPage([baseViewport.width, baseViewport.height]);
        newPage.drawImage(embedded, {
          x: 0,
          y: 0,
          width: baseViewport.width,
          height: baseViewport.height,
        });

        setProgress({ current: i, total: pdf.numPages });
      }

      const bytes = await output.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      downloadFileBlob(blob, `${baseName(file.name)}_grayscale.pdf`);
      window.dispatchEvent(
        new CustomEvent("tool_processed", { detail: { fileName: file.name } })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while converting the PDF.");
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
                <Contrast className="w-6 h-6" />
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
              <span>Output quality</span>
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
              Pages are re-rendered as grayscale images, so selectable text becomes part of the
              image. Higher quality means a larger file.
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
              <>
                <Download className="w-5 h-5" />
                Convert to Grayscale
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
