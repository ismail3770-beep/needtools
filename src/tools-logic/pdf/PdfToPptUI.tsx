"use client";

import React from "react";
import { BackendConvertTool } from "../converter/BackendConvertTool";
import { pdfToPptWithBackend } from "@/lib/pdf-backend-api";

function stem(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export default function PdfToPptUI() {
  return (
    <BackendConvertTool
      title="PDF to PowerPoint"
      description="Turn every page of your PDF into a PowerPoint slide, sized to match the original document."
      accept=".pdf,application/pdf"
      fileTypeLabel="PDFs"
      iconType="pdf"
      processingLabel="Building your presentation..."
      convert={(file) => pdfToPptWithBackend(file, 150)}
      outputName={(file) => `${stem(file.name)}.pptx`}
      note="Each slide contains a high-resolution image of the page, so the layout is pixel-accurate but the text is not individually editable."
    />
  );
}
