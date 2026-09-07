"use client";

import { CloudImportButtons } from "@/components/ui/CloudImportButtons";

import React, { useState, useRef } from "react";
import { Upload, Download, Trash2, RefreshCw, FileText, Plus, Shield, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UploadedImage {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
  width: number;
  height: number;
}

export default function ImageToPdfUI() {
  const { toast } = useToast();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState<"none" | "small" | "normal">("small");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setImages((prev) => [
            ...prev,
            {
              id: `${Date.now()}_${Math.random()}`,
              name: file.name,
              size: file.size,
              dataUrl,
              width: img.naturalWidth,
              height: img.naturalHeight,
            },
          ]);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);

    try {
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: orientation,
        unit: "pt",
        format: pageSize,
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const marginSize = margin === "none" ? 0 : margin === "small" ? 20 : 40;
      const usableWidth = pageWidth - marginSize * 2;
      const usableHeight = pageHeight - marginSize * 2;

      for (let idx = 0; idx < images.length; idx++) {
        const img = images[idx];
        if (idx > 0) {
          doc.addPage(pageSize, orientation);
        }

        const imgRatio = img.width / img.height;
        const pageRatio = usableWidth / usableHeight;

        let renderWidth = usableWidth;
        let renderHeight = usableHeight;

        if (imgRatio > pageRatio) {
          renderHeight = usableWidth / imgRatio;
        } else {
          renderWidth = usableHeight * imgRatio;
        }

        const posX = marginSize + (usableWidth - renderWidth) / 2;
        const posY = marginSize + (usableHeight - renderHeight) / 2;

        const normalizedDataUrl = await new Promise<string>((resolve) => {
          const imageEl = new Image();
          imageEl.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = imageEl.naturalWidth;
            canvas.height = imageEl.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(imageEl, 0, 0);
            }
            resolve(canvas.toDataURL("image/jpeg", 0.95));
          };
          imageEl.onerror = () => resolve(img.dataUrl);
          imageEl.src = img.dataUrl;
        });

        doc.addImage(normalizedDataUrl, "JPEG", posX, posY, renderWidth, renderHeight, undefined, "FAST");
      }

      doc.save(`NeedTools-Document-${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      toast("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {images.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 scale-[0.99]"
              : "border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5/50 dark:bg-neutral-950/40 hover:border-rose-500 hover:bg-rose-50/30 dark:hover:bg-rose-950/10"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white text-white flex items-center justify-center mx-auto shadow-lg shadow-sm">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg sm:text-xl text-black dark:text-white">
                Select images to convert into PDF
              </h3>
              <p className="text-xs sm:text-sm text-black/50 dark:text-white/50">
                Choose multiple JPG, PNG, or WebP photos
              </p>
            </div>

            {/* Prominent Action Button */}
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold text-sm shadow-md shadow-sm transition-transform active:scale-95">
                <Upload className="w-4 h-4" /> Select Image Files
              </span>
            </div>
        <div className="mt-4 pointer-events-auto">
          <CloudImportButtons onFiles={(files) => handleFiles(files as any)} />
        </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <Shield className="w-4 h-4 text-rose-600" />
              <span>100% Client-Side • No files uploaded to servers</span>
            </div>
          </div>
        </div>
      ) : (
        /* Images List & Settings */
        <div className="space-y-6 animate-fade-in">
          {/* Settings Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-black/5 dark:bg-white/5 dark:bg-neutral-950/80 border border-black/10 dark:border-white/10/90 text-xs font-bold">
            <div className="space-y-1.5">
              <label className="block text-black/60 dark:text-white/60">Page Format</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl bg-white border border-black/10 dark:border-white/10 text-black dark:text-white"
              >
                <option value="a4">A4 Standard (210 × 297 mm)</option>
                <option value="letter">US Letter (8.5 × 11 in)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-black/60 dark:text-white/60">Page Orientation</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl bg-white border border-black/10 dark:border-white/10 text-black dark:text-white"
              >
                <option value="portrait">Portrait (Vertical)</option>
                <option value="landscape">Landscape (Horizontal)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-black/60 dark:text-white/60">Page Margins</label>
              <select
                value={margin}
                onChange={(e) => setMargin(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl bg-white border border-black/10 dark:border-white/10 text-black dark:text-white"
              >
                <option value="none">Fit Full Page (No Margin)</option>
                <option value="small">Small Margin (20pt)</option>
                <option value="normal">Standard Margin (40pt)</option>
              </select>
            </div>
          </div>

          {/* Add more files button + counter */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black/70 dark:text-white/70 dark:text-slate-300">
              {images.length} {images.length === 1 ? "Image" : "Images"} Ready for PDF
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-black/70 dark:text-white/70 dark:text-slate-300 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-black/80 dark:bg-white/10"
            >
              <Plus className="w-3.5 h-3.5" /> Add More Photos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Uploaded Images Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="relative p-2.5 rounded-2xl bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 space-y-2 shadow-sm group"
              >
                <div className="relative aspect-[3/4] rounded-xl bg-black/10 dark:bg-white/10 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-neutral-950/80 text-white text-[11px] font-bold">
                    Page {idx + 1}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1 text-xs">
                  <span className="text-black/60 dark:text-white/60 truncate max-w-[100px] font-medium text-[11px]">
                    {img.name}
                  </span>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="p-1 text-black/40 dark:text-white/40 hover:text-rose-600 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-black/10 dark:border-white/10/80">
            <button
              onClick={() => setImages([])}
              className="flex-1 sm:flex-none px-4 py-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Clear All Photos
            </button>

            <button
              onClick={generatePdf}
              disabled={isGenerating}
              className="py-3 px-6 rounded-xl bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Compiling Document...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Convert to PDF ({images.length} {images.length === 1 ? "Page" : "Pages"})
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
