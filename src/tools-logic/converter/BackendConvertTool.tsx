"use client";

import React, { useState } from "react";
import { ToolDropzone } from "@/components/ui/ToolDropzone";
import { downloadFileBlob } from "@/lib/pdf-backend-api";
import { CheckCircle2, Download, AlertTriangle, RotateCcw } from "lucide-react";

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export interface BackendConvertToolProps {
  /** Heading shown above the dropzone. */
  title: string;
  /** Short helper line under the heading. */
  description: string;
  /** `accept` attribute for the file input. */
  accept: string;
  /** Plural label used in "or drop ___ here". */
  fileTypeLabel: string;
  /** Dropzone icon style. */
  iconType?: "pdf" | "image" | "file";
  /** Does the actual conversion and resolves with the output blob. */
  convert: (file: File) => Promise<Blob>;
  /** Builds the download filename from the original file. */
  outputName: (file: File) => string;
  /** Text shown while the conversion is running. */
  processingLabel?: string;
  /** Optional note rendered under the result (e.g. fidelity caveats). */
  note?: string;
  /** Reject files larger than this. Defaults to 30MB (backend limit). */
  maxSizeMB?: number;
  /**
   * Optional settings rendered ABOVE the dropzone.
   *
   * Conversion starts the moment a file is dropped, so any setting that
   * affects the output has to be chosen first. Keep the parent's state in a
   * closure over `convert` so the current value is used.
   */
  options?: React.ReactNode;
}

/**
 * Shared single-file conversion shell.
 *
 * Deliberately surfaces the real error message instead of a generic failure,
 * because most failures here are actionable (backend offline, unsupported
 * document, file too large).
 */
export function BackendConvertTool({
  title,
  description,
  accept,
  fileTypeLabel,
  iconType = "file",
  convert,
  outputName,
  processingLabel = "Converting your file...",
  note,
  maxSizeMB = 30,
  options,
}: BackendConvertToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setResultBlob(null);
    setError(null);
    setIsProcessing(false);
  };

  const handleFiles = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    if (selected.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setFile(selected);
    setError(null);
    setResultBlob(null);
    setIsProcessing(true);

    try {
      const blob = await convert(selected);
      setResultBlob(blob);
      window.dispatchEvent(
        new CustomEvent("tool_processed", { detail: { fileName: selected.name } })
      );
    } catch (err) {
      console.error("Conversion failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Conversion failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{title}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">{description}</p>
      </div>

      {!file && (
        <div className="space-y-4">
          {options && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-5">
              {options}
            </div>
          )}
          <ToolDropzone
            onFiles={handleFiles}
            accept={accept}
            multiple={false}
            fileTypeLabel={fileTypeLabel}
            iconType={iconType}
            buttonText="Choose File"
          />
          {error && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      )}

      {file && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {humanSize(file.size)}
              </p>
            </div>
            {!isProcessing && (
              <button
                onClick={reset}
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start over
              </button>
            )}
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 py-10 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <span>{processingLabel}</span>
            </div>
          )}

          {error && !isProcessing && (
            <div className="mt-5 flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                <p className="font-semibold mb-0.5">Conversion failed</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {resultBlob && !isProcessing && (
            <div className="mt-6 text-center">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                Conversion complete
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                Output size: {humanSize(resultBlob.size)}
              </p>

              <button
                onClick={() => downloadFileBlob(resultBlob, outputName(file))}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              {note && (
                <p className="mt-5 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  {note}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BackendConvertTool;
