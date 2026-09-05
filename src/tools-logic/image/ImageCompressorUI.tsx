"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Download, Sparkles, RefreshCw, Sliders, Shield, FileImage, ArrowRight, Check, Image as ImageIcon, ArrowDown } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function ImageCompressorUI() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/webp" | "image/png">("image/jpeg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memory cleanup to prevent RAM leaks
  useEffect(() => {
    return () => {
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [originalPreviewUrl, compressedUrl]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast("Please upload a valid image file (JPG, PNG, WebP).", "error");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast("File exceeds the 25MB limit. Please upload a smaller image.", "error");
      return;
    }

    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setOriginalPreviewUrl(url);
    setCompressedBlob(null);
    setCompressedUrl(null);

    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      compressImage(img, quality, outputFormat, file.name);
    };
    img.src = url;
  };

  // Detects whether we can offload compression to a background Web Worker.
  // Falls back gracefully on Safari < 16.4 and older Android WebViews.
  const supportsWorkerCompression =
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof createImageBitmap !== "undefined";

  const compressImage = async (
    img: HTMLImageElement,
    q: number,
    format: "image/jpeg" | "image/webp" | "image/png",
    fileName: string
  ) => {
    const currentCompressedUrl = compressedUrl;
    setIsProcessing(true);

    // ── Path 1: Web Worker + OffscreenCanvas (non-blocking, mobile-friendly) ──
    if (supportsWorkerCompression && selectedFile) {
      try {
        const bitmap = await createImageBitmap(selectedFile);
        const worker = new Worker("/workers/image-compressor.worker.js");
        worker.onmessage = (e: MessageEvent<{ blob?: Blob; error?: string }>) => {
          worker.terminate();
          if (e.data.blob) {
            if (currentCompressedUrl) URL.revokeObjectURL(currentCompressedUrl);
            const newUrl = URL.createObjectURL(e.data.blob);
            setCompressedBlob(e.data.blob);
            setCompressedUrl(newUrl);
          } else {
            toast("Compression failed in background engine. Using standard mode.", "info");
            runCanvasFallback(img, q, format, currentCompressedUrl);
          }
          setIsProcessing(false);
        };
        worker.onerror = () => {
          worker.terminate();
          runCanvasFallback(img, q, format, currentCompressedUrl);
          setIsProcessing(false);
        };
        worker.postMessage(
          { imageBitmap: bitmap, quality: q / 100, format },
          [bitmap]
        );
        return;
      } catch {
        // fall through to canvas path
      }
    }

    // ── Path 2: Main-thread Canvas fallback (legacy browsers) ──
    runCanvasFallback(img, q, format, currentCompressedUrl);
  };

  const runCanvasFallback = (
    img: HTMLImageElement,
    q: number,
    format: "image/jpeg" | "image/webp" | "image/png",
    previousCompressedUrl: string | null
  ) => {
    setIsProcessing(true);
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (format === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (previousCompressedUrl) URL.revokeObjectURL(previousCompressedUrl);
            const newUrl = URL.createObjectURL(blob);
            setCompressedBlob(blob);
            setCompressedUrl(newUrl);
          }
          setIsProcessing(false);
        },
        format,
        q / 100
      );
    }, 50);
  };

  const reloadAndCompress = (q: number, format: typeof outputFormat) => {
    if (!selectedFile) return;
    const tempUrl = URL.createObjectURL(selectedFile);
    const img = new Image();
    img.onload = () => {
      compressImage(img, q, format, selectedFile.name);
      URL.revokeObjectURL(tempUrl);
    };
    img.src = tempUrl;
  };

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    reloadAndCompress(newQuality, outputFormat);
  };

  const handleFormatChange = (newFormat: "image/jpeg" | "image/webp" | "image/png") => {
    setOutputFormat(newFormat);
    reloadAndCompress(quality, newFormat);
  };

  const handleDownload = () => {
    if (!compressedUrl || !selectedFile) return;
    const ext = outputFormat === "image/jpeg" ? "jpg" : outputFormat === "image/webp" ? "webp" : "png";
    const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || "image";
    const downloadName = `${baseName}-optimized.${ext}`;

    const link = document.createElement("a");
    link.href = compressedUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const savingsPercent =
    selectedFile && compressedBlob
      ? Math.max(0, Math.round(((selectedFile.size - compressedBlob.size) / selectedFile.size) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone (Signature iLovePDF / Adobe Web Style) */}
      {!selectedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 scale-[0.99]"
              : "border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5/50 dark:bg-neutral-950/40 hover:border-emerald-500/80 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-sm">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg sm:text-xl text-black dark:text-white">
                Select an image to compress
              </h3>
              <p className="text-xs sm:text-sm text-black/50 dark:text-white/50">
                or drag and drop your photo here
              </p>
            </div>

            {/* Big friendly Action Button */}
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold text-sm shadow-md shadow-sm transition-transform active:scale-95">
                <ImageIcon className="w-4 h-4" /> Select JPG, PNG or WebP
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>100% Client-Side • Files stay securely on your device</span>
            </div>
          </div>
        </div>
      ) : (
        /* Workspace when file is loaded */
        <div className="space-y-6 animate-fade-in">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl bg-black/5 dark:bg-white/5 dark:bg-neutral-950/80 border border-black/10 dark:border-white/10/90">
            {/* Quality Slider */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-600" /> Compression Level
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                  {quality}% Quality
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                step="5"
                value={quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] font-medium text-black/40 dark:text-white/40">
                <span>Maximum Savings (10%)</span>
                <span>Optimal (75%)</span>
                <span>Best Quality (95%)</span>
              </div>
            </div>

            {/* Output Format Picker */}
            <div className="space-y-2.5">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Target Output Format
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "JPG", value: "image/jpeg" },
                  { label: "WebP", value: "image/webp" },
                  { label: "PNG", value: "image/png" },
                ].map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => handleFormatChange(fmt.value as any)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      outputFormat === fmt.value
                        ? "bg-neutral-950 dark:bg-black dark:bg-white text-white border-slate-900 dark:border-emerald-600 shadow-sm"
                        : "bg-white border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 dark:text-slate-300 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-slate-700"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Before & After Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Original Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-black/50 dark:text-white/50 uppercase tracking-wider text-[11px]">
                  Original Image
                </span>
                <span className="font-mono font-semibold text-black/70 dark:text-white/70 dark:text-slate-300 bg-black/10 dark:bg-white/10 px-2.5 py-1 rounded-md text-xs">
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
              <div className="relative aspect-video rounded-xl bg-black/10 dark:bg-white/10 dark:bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-100">
                {originalPreviewUrl && (
                  <img
                    src={originalPreviewUrl}
                    alt="Original Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
              <div className="text-xs text-black/40 dark:text-white/40 truncate">
                {selectedFile.name} {dimensions && `(${dimensions.width}×${dimensions.height}px)`}
              </div>
            </div>

            {/* Compressed Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-950 border-2 border-emerald-500/40 dark:border-emerald-500/30 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Optimized Result
                </span>
                {compressedBlob && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300/50">
                      -{savingsPercent}%
                    </span>
                    <span className="font-mono text-black dark:text-white text-xs font-bold">
                      {formatBytes(compressedBlob.size)}
                    </span>
                  </div>
                )}
              </div>

              <div className="relative aspect-video rounded-xl bg-black/10 dark:bg-white/10 dark:bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-100">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2 text-black/60 dark:text-white/60">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="text-xs font-semibold">Compressing image...</span>
                  </div>
                ) : compressedUrl ? (
                  <img
                    src={compressedUrl}
                    alt="Compressed Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
                <button
                  onClick={handleDownload}
                  disabled={isProcessing || !compressedUrl}
                  className="flex-1 py-3 px-4 rounded-xl bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download Compressed Image
                </button>
                <button
                  onClick={() => {
                    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
                    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
                    setSelectedFile(null);
                    setOriginalPreviewUrl(null);
                    setCompressedBlob(null);
                    setCompressedUrl(null);
                    setDimensions(null);
                  }}
                  className="py-3 px-4 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-black/60 dark:text-white/60 dark:text-slate-300 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-black/80 dark:bg-white/10 transition-colors"
                >
                  Change Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
