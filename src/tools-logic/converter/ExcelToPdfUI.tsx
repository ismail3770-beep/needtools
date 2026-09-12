"use client";

import React from "react";
import { BackendConvertTool } from "./BackendConvertTool";
import { officeToPdfWithBackend } from "@/lib/pdf-backend-api";

function stem(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export default function ExcelToPdfUI() {
  return (
    <BackendConvertTool
      title="Excel to PDF"
      description="Convert XLS, XLSX, ODS or CSV spreadsheets into a clean, shareable PDF."
      accept=".xls,.xlsx,.ods,.csv"
      fileTypeLabel="spreadsheets"
      iconType="file"
      processingLabel="Converting spreadsheet to PDF..."
      convert={(file) => officeToPdfWithBackend(file)}
      outputName={(file) => `${stem(file.name)}.pdf`}
      note="Wide sheets are paginated using the print area defined in the workbook. Set page breaks in Excel first if you need an exact layout."
    />
  );
}
