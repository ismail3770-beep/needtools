"use client";

import React, { useState } from "react";
import { BackendConvertTool } from "../converter/BackendConvertTool";
import { pdfToTiffWithBackend } from "@/lib/pdf-backend-api";

function stem(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/** The backend clamps DPI to 72-300; keep the options inside that range. */
const DPI_OPTIONS = [
  { value: 96, label: "96 DPI — smaller file, screen viewing" },
  { value: 150, label: "150 DPI — balanced (recommended)" },
  { value: 220, label: "220 DPI — sharper detail" },
  { value: 300, label: "300 DPI — print and archival quality" },
];

export default function PdfToTiffUI() {
  const [dpi, setDpi] = useState(150);

  return (
    <BackendConvertTool
      title="PDF to TIFF"
      description="Export your PDF as a single multi-page TIFF image, ideal for archiving, printing and faxing."
      accept=".pdf,application/pdf"
      fileTypeLabel="PDFs"
      iconType="pdf"
      processingLabel="Rendering pages to TIFF..."
      convert={(file) => pdfToTiffWithBackend(file, dpi)}
      outputName={(file) => `${stem(file.name)}.tiff`}
      note="Pages are stored with lossless deflate compression, so the file can be large for long documents or high DPI settings."
      options={
        <label className="block">
          <span className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            Output resolution
          </span>
          <select
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value))}
            className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          >
            {DPI_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Choose this before uploading — conversion starts as soon as the file is added.
          </span>
        </label>
      }
    />
  );
}
