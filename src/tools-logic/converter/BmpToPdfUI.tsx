"use client";
// Generated UI Component
import React, { useState } from "react";
import { UploadCloud, FileType, CheckCircle2 } from "lucide-react";
import { CloudImportButtons } from "@/components/ui/CloudImportButtons";

export default function BmpToPdfUI() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelection = (f: File) => {
    setFile(f);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm w-full max-w-3xl mx-auto">
      <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mb-4">
        <FileType className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Upload your file</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-center max-w-md">
        Select a file from your device or import from cloud storage to begin.
      </p>
      
      {!file ? (
        <div className="w-full max-w-md relative">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 text-zinc-400 mb-3" />
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
            </div>
            <input type="file" className="hidden" onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])} />
          </label>
          <div className="mt-4 pointer-events-auto">
            <CloudImportButtons multiple={false} onFiles={(files) => files[0] && handleFileSelection(files[0] as any)} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center p-6 bg-zinc-50 dark:bg-zinc-800 rounded-2xl w-full max-w-md text-center border border-zinc-200 dark:border-zinc-700">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
          <p className="text-sm font-medium text-zinc-900 dark:text-white w-full mb-6 whitespace-nowrap overflow-hidden text-ellipsis px-4">
            {file.name}
          </p>
          <button className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors w-full">
            Process File
          </button>
        </div>
      )}
    </div>
  );
}
