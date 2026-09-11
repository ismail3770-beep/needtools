"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, Image as ImageIcon, Download, Settings2, RefreshCcw, Maximize } from "lucide-react";

export default function ImageResizerUI() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainRatio, setMaintainRatio] = useState<boolean>(true);
  const [originalRatio, setOriginalRatio] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setResizedUrl(null);

    // Revoke previous object URL to prevent memory leak
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Get original dimensions
    const img = new Image();
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
      setOriginalRatio(img.width / img.height);
    };
    img.src = objectUrl;
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value) || 0;
    setWidth(newWidth);
    if (maintainRatio && newWidth > 0) {
      setHeight(Math.round(newWidth / originalRatio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value) || 0;
    setHeight(newHeight);
    if (maintainRatio && newHeight > 0) {
      setWidth(Math.round(newHeight * originalRatio));
    }
  };

  const handleResize = async () => {
    if (!previewUrl || width <= 0 || height <= 0) return;
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

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2d context");

      // Draw and resize
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob URL (more memory-efficient than toDataURL)
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, selectedFile?.type || "image/jpeg", 0.9)
      );
      if (!blob) throw new Error("Failed to create image blob");

      // Revoke previous resized URL if any
      if (resizedUrl) URL.revokeObjectURL(resizedUrl);
      setResizedUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error resizing image:", error);
      alert("Failed to resize image. Please try another one.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    window.dispatchEvent(new CustomEvent('tool_processed', { detail: { fileName: 'processed_file' } }));
    if (!resizedUrl || !selectedFile) return;
    const link = document.createElement("a");
    link.href = resizedUrl;
    link.download = `resized-${selectedFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    // Revoke object URLs to prevent memory leak
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setResizedUrl(null);
    setWidth(0);
    setHeight(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-2">
          <Maximize className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-black dark:text-white">Image Resizer</h2>
        <p className="text-sm text-black/50 dark:text-white/50 max-w-lg mx-auto">
          Resize your images to exact pixel dimensions instantly in your browser.
        </p>
      </div>

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-black/20 dark:border-white/20 rounded-3xl p-12 text-center hover:bg-black/5 dark:bg-white/5 dark:hover:bg-black/80 dark:bg-white/10/50 transition-colors cursor-pointer group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
          />
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <p className="font-semibold text-black dark:text-white text-lg">Click to select an image</p>
          <p className="text-black/50 dark:text-white/50 text-sm mt-1">Supports JPG, PNG, WEBP</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Preview */}
          <div className="space-y-4">
            <div className="aspect-video bg-black/10 dark:bg-white/10 dark:bg-neutral-950 rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resizedUrl || previewUrl!}
                alt="Preview"
                className="max-w-full max-h-full object-contain p-4"
              />
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-medium text-black/50 dark:text-white/50">
                {selectedFile.name}
              </span>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <RefreshCcw className="w-3 h-3" /> Start Over
              </button>
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="space-y-6 bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-2 text-black dark:text-white dark:text-black font-semibold pb-4 border-b border-slate-100">
              <Settings2 className="w-5 h-5 text-blue-600" />
              Resize Dimensions
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/70 dark:text-white/70 dark:text-slate-300">Width (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={handleWidthChange}
                  className="w-full px-4 py-2.5 bg-black/5 border border-black/10 dark:border-white/10 rounded-xl text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/70 dark:text-white/70 dark:text-slate-300">Height (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={handleHeightChange}
                  className="w-full px-4 py-2.5 bg-black/5 border border-black/10 dark:border-white/10 rounded-xl text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={maintainRatio}
                  onChange={(e) => setMaintainRatio(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${maintainRatio ? 'bg-black dark:bg-white border-blue-600' : 'border-black/20 dark:border-white/20 group-hover:border-blue-500'}`}>
                  {maintainRatio && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                </div>
              </div>
              <span className="text-sm font-medium text-black/70 dark:text-white/70 dark:text-slate-300">Maintain aspect ratio</span>
            </label>

            <div className="pt-4">
              {!resizedUrl ? (
                <button
                  onClick={handleResize}
                  disabled={isProcessing || width <= 0 || height <= 0}
                  className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black font-semibold py-3.5 px-6 rounded-xl transition-all active:scale-[0.98]"
                >
                  {isProcessing ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                  {isProcessing ? "Resizing..." : "Resize Image"}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-semibold py-3.5 px-6 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-sm"
                  >
                    <Download className="w-5 h-5" />
                    Download Resized Image
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold py-3.5 px-6 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <RefreshCcw className="w-5 h-5" />
                    Resize Another Image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
