"use client";
import { ToolDropzone } from "@/components/ui/ToolDropzone";

import React, { useState, useRef } from "react";
import { Upload, Download, RefreshCcw, Image as ImageIcon, ArrowRight } from "lucide-react";

export default function JpgToPngUI() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("jpeg") && !file.type.includes("jpg")) {
      alert("Please select a JPG/JPEG image.");
      return;
    }

    setSelectedFile(file);
    setConvertedUrl(null);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleConvert = async () => {
    if (!previewUrl || !selectedFile) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewUrl;
      });

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2d context");

      // Draw original JPG onto canvas
      ctx.drawImage(img, 0, 0);

      // Convert to PNG format
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      setConvertedUrl(dataUrl);
    } catch (error) {
      console.error("Error converting image:", error);
      alert("Failed to convert image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    window.dispatchEvent(new CustomEvent('tool_processed', { detail: { fileName: 'processed_file' } }));
    if (!convertedUrl || !selectedFile) return;
    const link = document.createElement("a");
    link.href = convertedUrl;
    // Replace .jpg/.jpeg with .png in the filename
    const newFilename = selectedFile.name.replace(/\.jpe?g$/i, ".png");
    link.download = newFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setConvertedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-violet-100 dark:bg-violet-900/30 rounded-2xl mb-2">
          <ImageIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        </div>
        <h2 className="text-2xl font-bold text-black dark:text-white">JPG to PNG Converter</h2>
        <p className="text-sm text-black/50 dark:text-white/50 max-w-lg mx-auto">
          Instantly convert your JPG/JPEG images to transparent-ready PNG format.
        </p>
      </div>

      {!selectedFile ? (
        <ToolDropzone
          onFiles={(files) => {
            if (files[0]) {
              handleFileSelect({ target: { files: [files[0]] } } as any);
            }
          }}
          accept="image/jpeg,image/jpg"
          multiple={false}
          fileTypeLabel="JPG images"
          buttonText="Choose Files"
          iconType="image"
        />
      ) : (
        <div className="max-w-2xl mx-auto space-y-6 bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 bg-black/5 rounded-xl border border-black/10 dark:border-white/10">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-black/40 dark:text-white/40 uppercase tracking-wider">From</span>
              <span className="font-semibold text-black dark:text-white">JPG</span>
            </div>
            <ArrowRight className="w-5 h-5 text-black/40 dark:text-white/40" />
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-black/40 dark:text-white/40 uppercase tracking-wider">To</span>
              <span className="font-semibold text-violet-600 dark:text-violet-400">PNG</span>
            </div>
          </div>

          <div className="aspect-[4/3] bg-black/10 rounded-xl border border-black/10 dark:border-white/10 overflow-hidden relative flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={convertedUrl || previewUrl!}
              alt="Preview"
              className="max-w-full max-h-full object-contain p-2"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-black/60 dark:text-white/60 truncate max-w-[200px] sm:max-w-sm">
              {selectedFile.name}
            </span>
            <span className="text-black/40 dark:text-white/40">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Choose Another
            </button>

            {!convertedUrl ? (
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="flex-[2] flex items-center justify-center gap-2 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-50 text-white dark:text-black font-semibold py-3 px-6 rounded-xl transition-all active:scale-[0.98]"
              >
                {isProcessing ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                {isProcessing ? "Converting..." : "Convert to PNG"}
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="flex-[2] flex items-center justify-center gap-2 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-semibold py-3 px-6 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-sm"
              >
                <Download className="w-5 h-5" />
                Download PNG
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
