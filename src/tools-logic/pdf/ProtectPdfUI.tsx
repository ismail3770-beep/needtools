"use client";

import React, { useState, useRef } from "react";
import { ToolDropzone } from "@/components/ui/ToolDropzone";
import { protectPdfWithBackend, downloadFileBlob } from "@/lib/pdf-backend-api";
import {
  Trash2,
  CheckCircle2,
  Download,
  FileBox,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

/** Permission keys accepted by the backend /protect endpoint. */
const PERMISSION_OPTIONS: Array<{ key: string; label: string; hint: string }> = [
  { key: "print", label: "Allow printing", hint: "Reader can print the document" },
  { key: "copy", label: "Allow copying text", hint: "Reader can select and copy content" },
  { key: "modify", label: "Allow editing", hint: "Reader can change page content" },
  { key: "annot-forms", label: "Allow comments & form filling", hint: "Reader can annotate and fill forms" },
];

export default function ProtectPdfUI() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState<string[]>(["print"]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (selectedFile: File) => {
    const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > MAX_PDF_SIZE) {
      setError("File too large. Maximum size is 50MB.");
      return;
    }
    setFile(selectedFile);
    setResultBlob(null);
    setError(null);
    setPassword("");
  };

  const resetTool = () => {
    setFile(null);
    setResultBlob(null);
    setError(null);
    setPassword("");
    setPermissions(["print"]);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const protectPdf = async () => {
    if (!file || password.length < 3) return;
    setIsProcessing(true);
    setError(null);
    setResultBlob(null);

    try {
      const blob = await protectPdfWithBackend(file, password, permissions);
      setResultBlob(blob);
      window.dispatchEvent(
        new CustomEvent("tool_processed", { detail: { fileName: file.name } })
      );
    } catch (err) {
      console.error("Error protecting PDF:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not protect the PDF. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    downloadFileBlob(resultBlob, file.name.replace(/\.pdf$/i, "") + "_protected.pdf");
  };

  return (
    <div className="w-full">
      {!file ? (
        <div className="space-y-4">
          <ToolDropzone
            onFiles={(files) => files[0] && handleFileSelection(files[0])}
            accept=".pdf,application/pdf"
            multiple={false}
            fileTypeLabel="PDFs"
            buttonText="Choose Files"
          />
          {error && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between p-4 sm:p-5 bg-white rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                <FileBox className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-black dark:text-white truncate max-w-[200px] sm:max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-black/50 dark:text-white/50">
                  Ready to be protected
                </p>
              </div>
            </div>

            <button
              onClick={resetTool}
              disabled={isProcessing}
              className="p-2 text-black/40 dark:text-white/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Remove file"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {!resultBlob && (
            <div className="bg-white rounded-2xl border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-sm">
              <h4 className="text-lg font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" />
                Set Password Protection
              </h4>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-black/70 dark:text-white/70 mb-2">
                    Enter Password to Open Document
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Type a strong password..."
                      className="w-full pl-4 pr-12 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black dark:text-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-black/50 dark:text-white/50 mt-2">
                    Please remember this password. If you lose it, the document cannot be recovered.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/70 dark:text-white/70 mb-3">
                    What can readers do after unlocking?
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {PERMISSION_OPTIONS.map((opt) => (
                      <label
                        key={opt.key}
                        className="flex items-start gap-3 p-3 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={permissions.includes(opt.key)}
                          onChange={() => togglePermission(opt.key)}
                          className="mt-0.5 w-4 h-4 accent-blue-600"
                        />
                        <span>
                          <span className="block text-sm font-medium text-black dark:text-white">
                            {opt.label}
                          </span>
                          <span className="block text-xs text-black/50 dark:text-white/50">
                            {opt.hint}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    Encrypted with <strong>AES-256</strong>. Your text, vectors, forms and bookmarks
                    stay intact &mdash; nothing is converted to images.
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                    <div className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                      <p className="font-semibold mb-0.5">Could not protect this PDF</p>
                      <p>{error}</p>
                    </div>
                  </div>
                )}

                {isProcessing ? (
                  <div className="pt-2 flex items-center justify-center gap-3 py-4 text-sm font-medium text-black/70 dark:text-white/70">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Encrypting PDF on the server...</span>
                  </div>
                ) : (
                  <button
                    onClick={protectPdf}
                    disabled={password.length < 3}
                    className="w-full flex justify-center items-center gap-2 py-4 px-6 bg-neutral-950 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Protect PDF Now
                  </button>
                )}
              </div>
            </div>
          )}

          {resultBlob && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-black dark:text-white mb-2">
                PDF Successfully Protected!
              </h4>
              <p className="text-sm text-black/60 dark:text-white/60 mb-8 max-w-md mx-auto">
                Your document is encrypted with AES-256. The password is required to open it.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl shadow-sm transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Protected PDF
                </button>
                <button
                  onClick={resetTool}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold py-3.5 px-6 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Protect Another
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
