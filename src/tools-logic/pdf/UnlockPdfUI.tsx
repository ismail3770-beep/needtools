"use client";
import { ToolDropzone } from "@/components/ui/ToolDropzone";

import React, { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import {
  UploadCloud,
  Trash2,
  Loader2,
  CheckCircle2,
  Download,
  FileBox,
  Unlock,
  Eye,
  EyeOff,
  ShieldOff
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

export default function UnlockPdfUI() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add("border-blue-500", "bg-blue-50/50", "dark:bg-blue-900/20");
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-blue-500", "bg-blue-50/50", "dark:bg-blue-900/20");
    }
  }, []);

  const checkEncryption = async (buffer: ArrayBuffer) => {
    setIsChecking(true);
    setIsEncrypted(null);
    setSuccessMessage(null);
    setError(null);

    try {
      // Try to load without a password
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      await loadingTask.promise;

      // If we reach here, no password was needed
      setIsEncrypted(false);
      setSuccessMessage("This PDF is already unlocked!");
    } catch (err: any) {
      if (err.name === "PasswordException") {
        setIsEncrypted(true);
      } else {
        console.error("Error reading PDF:", err);
        setError(err.message || "Could not read the PDF file.");
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleFileSelection = useCallback(async (selectedFile: File) => {
    const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > MAX_PDF_SIZE) {
      setError("File too large. Maximum size is 50MB.");
      return;
    }

    setFile(selectedFile);
    setResultBlob(null);
    setPassword("");
    setError(null);
    setSuccessMessage(null);
    setIsEncrypted(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      setFileBuffer(buffer);
      await checkEncryption(buffer);
    } catch (err) {
      console.error("Error processing file:", err);
      setError("Failed to read the file. Please try again.");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-blue-500", "bg-blue-50/50", "dark:bg-blue-900/20");
    }
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      handleFileSelection(droppedFile);
    } else {
      setError("Please drop a valid PDF file.");
    }
  }, [handleFileSelection]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      handleFileSelection(selectedFile);
    }
  };

  const resetTool = () => {
    setFile(null);
    setFileBuffer(null);
    setResultBlob(null);
    setPassword("");
    setIsProcessing(false);
    setIsChecking(false);
    setIsEncrypted(null);
    setError(null);
    setSuccessMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const unlockPdf = async () => {
    if (!file || !fileBuffer || !password) return;

    setIsProcessing(true);
    setResultBlob(null);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. Verify password with pdfjsLib first to provide quick feedback
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(fileBuffer),
          password: password
        });
        await loadingTask.promise;
      } catch (err: any) {
        if (err.name === "PasswordException") {
          throw new Error("Incorrect password. Please try again.");
        } else {
          throw err;
        }
      }

      // 2. Load with pdf-lib to save without encryption
      const pdfDoc = await PDFDocument.load(fileBuffer, { password: password } as any);
      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      setResultBlob(blob);
      setSuccessMessage("PDF Successfully Unlocked!");
    } catch (err: any) {
      console.error("Error unlocking PDF:", err);
      setError(
        err.message.includes("Incorrect password")
          ? "Incorrect password. Please try again."
          : err.message || "An error occurred while unlocking the PDF. The encryption type might not be supported."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name.replace(".pdf", "_unlocked.pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-700 dark:text-red-300 flex items-start gap-3">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <div>
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs underline mt-1 hover:text-red-900 dark:hover:text-red-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {successMessage && isEncrypted === false && (
        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="shrink-0 mt-0.5 w-5 h-5" />
          <div>
            <p className="font-semibold">{successMessage}</p>
            <p className="text-xs mt-1 opacity-80">This file doesn't require a password and isn't encrypted.</p>
          </div>
        </div>
      )}

      {!file ? (
        <ToolDropzone
          onFiles={(files) => files[0] && handleFileSelection(files[0])}
          accept=".pdf,application/pdf"
          multiple={false}
          fileTypeLabel="PDFs"
          buttonText="Choose Files"
        />
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between p-4 sm:p-5 bg-white dark:bg-neutral-950 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                <FileBox className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-black dark:text-white truncate max-w-[200px] sm:max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-black/50 dark:text-white/50">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <button
              onClick={resetTool}
              disabled={isProcessing || isChecking}
              className="p-2 text-black/40 dark:text-white/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Remove file"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {isChecking && (
            <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-black/10 dark:border-white/10 p-8 text-center shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="font-semibold text-black dark:text-white">Analyzing Document...</p>
            </div>
          )}

          {!isChecking && isEncrypted && !resultBlob && (
            <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-sm">
              <h4 className="text-lg font-bold text-black dark:text-white mb-2 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-blue-500" />
                Unlock Document
              </h4>
              <p className="text-sm text-black/60 dark:text-white/60 mb-6">
                This document is password protected. Please enter the current password to unlock it and remove encryption permanently.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-black/70 dark:text-white/70 mb-2">
                    PDF Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter the document password..."
                      className="w-full pl-4 pr-12 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-black/40 dark:focus:border-white/40 outline-none transition-all text-black dark:text-white font-medium"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && password && !isProcessing) {
                          unlockPdf();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isProcessing ? (
                  <div className="pt-2 flex items-center justify-center gap-3 py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-black/70 dark:text-white/70">Unlocking PDF...</span>
                  </div>
                ) : (
                  <button
                    onClick={unlockPdf}
                    disabled={!password}
                    className="w-full flex justify-center items-center gap-2 py-4 px-6 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Unlock className="w-5 h-5" />
                    Unlock PDF Now
                  </button>
                )}
              </div>
            </div>
          )}

          {(!isChecking && isEncrypted === false) && (
            <div className="flex justify-center mt-6">
              <button
                onClick={resetTool}
                className="flex items-center justify-center gap-2 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold py-3.5 px-6 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Upload a Different File
              </button>
            </div>
          )}

          {resultBlob && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-black dark:text-white mb-2">
                {successMessage}
              </h4>
              <p className="text-sm text-black/60 dark:text-white/60 mb-8 max-w-md mx-auto">
                Your document is now unlocked. The password has been permanently removed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={downloadFile}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl shadow-sm transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Unlocked PDF
                </button>
                <button
                  onClick={resetTool}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold py-3.5 px-6 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Unlock Another
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
