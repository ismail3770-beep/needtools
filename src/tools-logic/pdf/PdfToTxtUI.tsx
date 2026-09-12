"use client";

import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { FileText, Loader2, Download, Trash2, AlertCircle, Copy, Check } from "lucide-react";
import { ToolDropzone } from "@/components/ui/ToolDropzone";
import { downloadFileBlob } from "@/lib/pdf-backend-api";
import { formatBytes } from "@/lib/utils";
import { baseName } from "./lib/pageRange";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

export default function PdfToTxtUI() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = (selected: File) => {
    setFile(selected);
    setText("");
    setError(null);
  };

  const reset = () => {
    setFile(null);
    setText("");
    setError(null);
    setProgress({ current: 0, total: 0 });
    setIsProcessing(false);
  };

  const process = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setText("");

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      setProgress({ current: 0, total: pdf.numPages });

      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => (item as { str?: string }).str ?? "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        pages.push(`--- Page ${i} ---\n${pageText}`);
        setProgress({ current: i, total: pdf.numPages });
      }

      const joined = pages.join("\n\n");
      setText(joined);

      if (joined.replace(/--- Page \d+ ---/g, "").trim().length === 0) {
        setError(
          "No text layer found. This PDF is probably a scan — run it through the OCR tool first."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while reading the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const download = () => {
    if (!file || !text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    downloadFileBlob(blob, `${baseName(file.name)}.txt`);
    window.dispatchEvent(
      new CustomEvent("tool_processed", { detail: { fileName: file.name } })
    );
  };

  const copy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <FileText className="w-6 h-6" />
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

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!text && (
            <button
              onClick={process}
              disabled={isProcessing}
              className="w-full px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting ({progress.current}/{progress.total})...
                </>
              ) : (
                "Extract Text"
              )}
            </button>
          )}

          {text && (
            <div className="space-y-4">
              <textarea
                readOnly
                value={text}
                rows={12}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={download}
                  className="flex-1 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download .txt
                </button>
                <button
                  onClick={copy}
                  className="flex-1 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
