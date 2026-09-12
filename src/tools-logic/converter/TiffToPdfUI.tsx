"use client";

import React from "react";
import { BackendConvertTool } from "./BackendConvertTool";
import { tiffToPdfWithBackend } from "@/lib/pdf-backend-api";

function stem(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export default function TiffToPdfUI() {
  return (
    <BackendConvertTool
      title="TIFF to PDF"
      description="Turn a single-page or multi-page TIFF scan into a PDF. Every frame becomes one page."
      accept=".tif,.tiff,image/tiff"
      fileTypeLabel="TIFF images"
      iconType="image"
      processingLabel="Converting TIFF to PDF..."
      convert={(file) => tiffToPdfWithBackend(file)}
      outputName={(file) => `${stem(file.name)}.pdf`}
      note="TIFF cannot be decoded by browsers, so this conversion runs on the server. Files are processed and deleted immediately."
    />
  );
}
