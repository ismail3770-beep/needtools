"use client";

import React from "react";
import { BackendConvertTool } from "../converter/BackendConvertTool";
import { pdfToTiffWithBackend } from "@/lib/pdf-backend-api";

function stem(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export default function PdfToTiffUI() {
  return (
    <BackendConvertTool
      title="PDF to TIFF"
      description="Export your PDF as a single multi-page TIFF image, ideal for archiving, printing and faxing."
      accept=".pdf,application/pdf"
      fileTypeLabel="PDFs"
      iconType="pdf"
      processingLabel="Rendering pages to TIFF..."
      convert={(file) => pdfToTiffWithBackend(file, 150)}
      outputName={(file) => `${stem(file.name)}.tiff`}
      note="Pages are rendered at 150 DPI and stored with lossless deflate compression, so the file can be large for long documents."
    />
  );
}
