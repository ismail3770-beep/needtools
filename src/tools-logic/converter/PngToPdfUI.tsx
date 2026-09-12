"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { FileImage, Loader2, Download, Trash2, X, AlertCircle } from "lucide-react";
import { ToolDropzone } from "@/components/ui/ToolDropzone";
import { downloadFileBlob } from "@/lib/pdf-backend-api";
import { formatBytes } from "@/lib/utils";

type PageSizeMode = "image" | "a4";

// A4 in PDF points.
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

export default function PngToPdfUI() {
  const [files, setFiles] = useState<File[]>([]);
  const [sizeMode, setSizeMode] = useState<PageSizeMode>("image");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (incoming: File[]) => {
    setError(null);
    setFiles((prev) => [...prev, ...incoming.filter((f) => f.type === "image/png")]);
  };

  const removeAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setFiles([]);
    setError(null);
    setIsProcessing(false);
  };

  const process = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const doc = await PDFDocument.create();

      for (const file of files) {
        const image = await doc.embedPng(await file.arrayBuffer());

        if (sizeMode === "image") {
          // One page exactly the size of the image, no borders.
          const page = doc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        } else {
          // Fit inside A4 while preserving the aspect ratio, then centre it.
          const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
          const margin = 28;
          const maxWidth = A4_WIDTH - margin * 2;
          const maxHeight = A4_HEIGHT - margin * 2;
          const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
          const width = image.width * ratio;
          const height = image.height * ratio;
          page.drawImage(image, {
            x: (A4_WIDTH - width) / 2,
            y: (A4_HEIGHT - height) / 2,
            width,
            height,
          });
        }
      }

      const bytes = await doc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      downloadFileBlob(blob, "converted-images.pdf");
      window.dispatchEvent(
        new CustomEvent("tool_processed", { detail: { fileName: files[0].name } })
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not build the PDF: ${err.message}`
          : "Could not build the PDF."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-6">
      <ToolDropzone
        onFiles={(incoming) => addFiles(Array.from(incoming))}
        accept="image/png"
        multiple
        fileTypeLabel="PNG images"
        buttonText="Choose Files"
      />

      {files.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-bold text-zinc-900 dark:text-white">
              {files.length} image{files.length > 1 ? "s" : ""} · {formatBytes(totalSize)}
            </h3>
            <button
              onClick={reset}
              disabled={isProcessing}
              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Clear all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => removeAt(index)}
                  disabled={isProcessing}
                  className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-colors disabled:opacity-50"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Page size
            </span>
            <div className="grid grid-cols-2 gap-3">
              {(["image", "a4"] as PageSizeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSizeMode(mode)}
                  disabled={isProcessing}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                    sizeMode === mode
                      ? "border-brand-600 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {mode === "image" ? "Match image size" : "Fit to A4"}
                </button>
              ))}
            </div>
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
                Building PDF...
              </>
            ) : (
              <>
                <FileImage className="w-5 h-5" />
                Convert to PDF
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
