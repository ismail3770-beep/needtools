"use client";

import React from "react";
import { BackendConvertTool } from "./BackendConvertTool";
import { officeToPdfWithBackend } from "@/lib/pdf-backend-api";

function stem(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export default function PptToPdfUI() {
  return (
    <BackendConvertTool
      title="PowerPoint to PDF"
      description="Convert PPT, PPTX or ODP presentations into a PDF with layouts and fonts preserved."
      accept=".ppt,.pptx,.odp"
      fileTypeLabel="presentations"
      iconType="file"
      processingLabel="Converting presentation to PDF..."
      convert={(file) => officeToPdfWithBackend(file)}
      outputName={(file) => `${stem(file.name)}.pdf`}
      note="Slide animations and transitions cannot be represented in a PDF, so each slide is exported as a static page."
    />
  );
}
