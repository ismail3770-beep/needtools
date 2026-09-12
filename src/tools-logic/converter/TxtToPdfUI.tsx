"use client";

import React, { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ToolDropzone } from "@/components/ui/ToolDropzone";
import { downloadFileBlob } from "@/lib/pdf-backend-api";
import { CheckCircle2, Download, AlertTriangle, RotateCcw } from "lucide-react";

const PAGE_WIDTH = 595.28; // A4 portrait, points
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;

function stem(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/**
 * Greedy word wrap based on real glyph widths, so the result matches the
 * chosen font rather than an estimated character count.
 */
function wrapLine(
  line: string,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  fontSize: number,
  maxWidth: number
): string[] {
  if (!line.trim()) return [""];

  const words = line.split(/\s+/);
  const out: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) out.push(current);

    // A single word longer than the line: break it character by character.
    if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
      let chunk = "";
      for (const char of word) {
        if (font.widthOfTextAtSize(chunk + char, fontSize) > maxWidth) {
          out.push(chunk);
          chunk = char;
        } else {
          chunk += char;
        }
      }
      current = chunk;
    } else {
      current = word;
    }
  }

  if (current) out.push(current);
  return out;
}

export default function TxtToPdfUI() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [fontSize, setFontSize] = useState(11);
  const [useMonospace, setUseMonospace] = useState(false);

  const reset = () => {
    setFile(null);
    setResultBlob(null);
    setError(null);
    setPageCount(0);
    setIsProcessing(false);
  };

  const handleFiles = (files: File[]) => {
    const selected = files[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }
    setFile(selected);
    setResultBlob(null);
    setError(null);
  };

  const convert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setResultBlob(null);

    try {
      const text = await file.text();

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(
        useMonospace ? StandardFonts.Courier : StandardFonts.Helvetica
      );

      const lineHeight = fontSize * 1.45;
      const maxWidth = PAGE_WIDTH - MARGIN * 2;
      const usableHeight = PAGE_HEIGHT - MARGIN * 2;
      const linesPerPage = Math.max(1, Math.floor(usableHeight / lineHeight));

      // Normalise line endings, then wrap every source line.
      const sourceLines = text.replace(/\r\n?/g, "\n").split("\n");
      const wrapped: string[] = [];
      for (const line of sourceLines) {
        // Standard PDF fonts are WinAnsi-only; replace anything they cannot encode.
        const safe = line.replace(/[^\x09\x20-\x7E\u00A0-\u00FF]/g, "?");
        wrapped.push(...wrapLine(safe.replace(/\t/g, "    "), font, fontSize, maxWidth));
      }

      let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      let lineOnPage = 0;

      for (const line of wrapped) {
        if (lineOnPage >= linesPerPage) {
          page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          lineOnPage = 0;
        }
        if (line) {
          page.drawText(line, {
            x: MARGIN,
            y: PAGE_HEIGHT - MARGIN - lineOnPage * lineHeight - fontSize,
            size: fontSize,
            font,
            color: rgb(0.08, 0.09, 0.16),
          });
        }
        lineOnPage += 1;
      }

      const bytes = await pdfDoc.save();
      setResultBlob(
        new Blob([bytes as unknown as BlobPart], { type: "application/pdf" })
      );
      setPageCount(pdfDoc.getPageCount());
      window.dispatchEvent(
        new CustomEvent("tool_processed", { detail: { fileName: file.name } })
      );
    } catch (err) {
      console.error("TXT to PDF failed:", err);
      setError(
        err instanceof Error ? err.message : "Could not convert this text file."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Text to PDF</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Convert a .txt, .md, .csv or .log file into a paginated A4 PDF. Runs entirely in
          your browser.
        </p>
      </div>

      {!file ? (
        <div className="space-y-4">
          <ToolDropzone
            onFiles={handleFiles}
            accept=".txt,.md,.csv,.log,text/plain"
            multiple={false}
            fileTypeLabel="text files"
            iconType="file"
            buttonText="Choose File"
          />
          {error && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
              {file.name}
            </p>
            <button
              onClick={reset}
              disabled={isProcessing}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Start over
            </button>
          </div>

          {!resultBlob && (
            <div className="pt-6 space-y-6">
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-2">
                  <span>Font size</span>
                  <span className="text-brand-600 dark:text-brand-400">{fontSize} pt</span>
                </label>
                <input
                  type="range"
                  min={8}
                  max={16}
                  step={1}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useMonospace}
                  onChange={(e) => setUseMonospace(e.target.checked)}
                  className="w-4 h-4 accent-brand-600"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-200">
                  Use a monospaced font (best for code and logs)
                </span>
              </label>

              {error && (
                <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <p className="text-xs text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <button
                onClick={convert}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Building PDF...
                  </>
                ) : (
                  "Convert to PDF"
                )}
              </button>
            </div>
          )}

          {resultBlob && (
            <div className="pt-6 text-center">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                PDF ready
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                {pageCount} page{pageCount === 1 ? "" : "s"} generated
              </p>
              <button
                onClick={() => downloadFileBlob(resultBlob, `${stem(file.name)}.pdf`)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <p className="mt-5 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Built with the standard PDF fonts, which cover Latin characters only.
                Unsupported characters are replaced with &ldquo;?&rdquo;.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
