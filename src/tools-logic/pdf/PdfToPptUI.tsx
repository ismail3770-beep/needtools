"use client";

import React, { useState } from "react";
import { BackendConvertTool } from "../converter/BackendConvertTool";
import { pdfToPptWithBackend } from "@/lib/pdf-backend-api";

function stem(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/** The backend clamps DPI to 72-300; keep the options inside that range. */
const DPI_OPTIONS = [
  { value: 96, label: "96 DPI — smaller file, screen viewing" },
  { value: 150, label: "150 DPI — balanced (recommended)" },
  { value: 220, label: "220 DPI — sharper text" },
  { value: 300, label: "300 DPI — print quality, large file" },
];

export default function PdfToPptUI() {
  const [dpi, setDpi] = useState(150);

  return (
    <BackendConvertTool
      title="PDF to PowerPoint"
      description="Turn every page of your PDF into a PowerPoint slide, sized to match the original document."
      accept=".pdf,application/pdf"
      fileTypeLabel="PDFs"
      iconType="pdf"
      processingLabel="Building your presentation..."
      convert={(file) => pdfToPptWithBackend(file, dpi)}
      outputName={(file) => `${stem(file.name)}.pptx`}
      note="Each slide contains a high-resolution image of the page, so the layout is pixel-accurate but the text is not individually editable."
      options={
        <label className="block">
          <span className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            Slide image quality
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
