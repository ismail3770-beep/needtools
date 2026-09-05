"use client";

import React, { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import { 
UploadCloud, 
Trash2, 
Loader2,
CheckCircle2,
Download,
FileBox,
Settings2,
FileArchive,
ArrowRight
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

if (typeof window !== "undefined") {
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function PdfCompressorUI() {
const [file, setFile] = useState<File | null>(null);
const [isProcessing, setIsProcessing] = useState(false);
const [progress, setProgress] = useState({ current: 0, total: 0 });
const [resultBlob, setResultBlob] = useState<Blob | null>(null);

// Compression level: 0.1 to 1.0 (Canvas JPEG quality)
const [compressionLevel, setCompressionLevel] = useState<number>(0.6);
// Scale down resolution: 1.0 = normal, 0.5 = half resolution
const [resolutionScale, setResolutionScale] = useState<number>(1.0);

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
alert("Please drop a valid PDF file.");
}
}, []);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const selectedFile = e.target.files?.[0];
if (selectedFile && selectedFile.type === "application/pdf") {
handleFileSelection(selectedFile);
}
};

const handleFileSelection = (selectedFile: File) => {
setFile(selectedFile);
setResultBlob(null);
};

const resetTool = () => {
setFile(null);
setResultBlob(null);
setProgress({ current: 0, total: 0 });
setIsProcessing(false);
if (fileInputRef.current) fileInputRef.current.value = "";
};

const compressPdf = async () => {
if (!file) return;
setIsProcessing(true);
setResultBlob(null);

try {
const arrayBuffer = await file.arrayBuffer();
const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
const pdf = await loadingTask.promise;

const numPages = pdf.numPages;
setProgress({ current: 0, total: numPages });

const compressedPdf = new jsPDF({
orientation: "portrait",
unit: "pt",
format: "a4",
});

for (let i = 1; i <= numPages; i++) {
const page = await pdf.getPage(i);
const viewport = page.getViewport({ scale: resolutionScale });

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
if (!context) continue;

canvas.width = viewport.width;
canvas.height = viewport.height;

const renderContext = {
canvasContext: context,
viewport: viewport,
};

await page.render(renderContext as any).promise;
const imgData = canvas.toDataURL("image/jpeg", compressionLevel);

if (i > 1) compressedPdf.addPage([viewport.width, viewport.height], viewport.width > viewport.height ? "landscape" : "portrait");
else {
// first page size
compressedPdf.setPage(1);
// Workaround for jsPDF page size setting
}

compressedPdf.addImage(imgData, "JPEG", 0, 0, viewport.width, viewport.height);
setProgress({ current: i, total: numPages });
}

const result = compressedPdf.output("blob");
setResultBlob(result);
} catch (error) {
console.error("Error compressing PDF:", error);
alert("Failed to compress PDF. The file might be corrupted or protected.");
} finally {
setIsProcessing(false);
}
};

const downloadResult = () => {
if (!resultBlob || !file) return;
const url = URL.createObjectURL(resultBlob);
const a = document.createElement("a");
a.href = url;
a.download = file.name.replace(".pdf", "-compressed.pdf");
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
};

return (
<div className="space-y-6">
{/* Upload Zone */}
{!file && (
<div
ref={dropZoneRef}
onDragOver={handleDragOver}
onDragLeave={handleDragLeave}
onDrop={handleDrop}
className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/20 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer overflow-hidden"
onClick={() => fileInputRef.current?.click()}
>
<input
type="file"
ref={fileInputRef}
onChange={handleFileChange}
accept="application/pdf"
className="hidden"
/>
<div className="w-16 h-16 mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
<UploadCloud className="w-8 h-8" />
</div>
<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
Upload PDF Document
</h3>
<p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-4">
Drag and drop your PDF here, or click to browse. Max size 50MB. All processing is strictly local.
</p>
<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
<FileBox className="w-3.5 h-3.5" />
.PDF Supported
</span>
</div>
)}

{/* Configuration Area */}
{file && !resultBlob && (
<div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/50 space-y-6">
<div className="flex items-start justify-between">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
<FileArchive className="w-6 h-6" />
</div>
<div>
<h3 className="font-bold text-slate-900 dark:text-white text-lg truncate max-w-[200px] sm:max-w-md">
{file.name}
</h3>
<p className="text-sm text-slate-500 dark:text-slate-400">
{formatBytes(file.size)}
</p>
</div>
</div>
<button
onClick={resetTool}
disabled={isProcessing}
className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
title="Remove file"
>
<Trash2 className="w-5 h-5" />
</button>
</div>

<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-300">
<strong>Note:</strong> Client-side PDF compression converts the pages to high-quality images. Text will no longer be selectable in the compressed PDF.
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700/50">
{/* Compression Level */}
<div className="space-y-3">
<label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
<span className="flex items-center gap-2">
<Settings2 className="w-4 h-4 text-blue-500" />
Compression Level
</span>
<span className="text-blue-600 dark:text-blue-400">
{compressionLevel < 0.4 ? "High" : compressionLevel < 0.7 ? "Medium" : "Low"}
</span>
</label>
<input
type="range"
min="0.1"
max="1.0"
step="0.1"
value={compressionLevel}
onChange={(e) => setCompressionLevel(parseFloat(e.target.value))}
disabled={isProcessing}
className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
/>
<div className="flex justify-between text-xs text-slate-500 font-medium">
<span>Smaller File</span>
<span>Better Quality</span>
</div>
</div>

{/* Resolution Scale */}
<div className="space-y-3">
<label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
<span className="flex items-center gap-2">
<Settings2 className="w-4 h-4 text-purple-500" />
Resolution
</span>
<span className="text-purple-600 dark:text-purple-400">
{resolutionScale}x
</span>
</label>
<input
type="range"
min="0.5"
max="2.0"
step="0.25"
value={resolutionScale}
onChange={(e) => setResolutionScale(parseFloat(e.target.value))}
disabled={isProcessing}
className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
/>
<div className="flex justify-between text-xs text-slate-500 font-medium">
<span>Standard</span>
<span>HD</span>
</div>
</div>
</div>

<div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
<button
onClick={compressPdf}
disabled={isProcessing}
className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>
{isProcessing ? (
<>
<Loader2 className="w-5 h-5 animate-spin" />
Compressing ({progress.current}/{progress.total})...
</>
) : (
<>
Compress PDF
<ArrowRight className="w-5 h-5" />
</>
)}
</button>
</div>

{isProcessing && (
<div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
<div 
className="h-full bg-blue-500 transition-all duration-300" 
style={{ width: `${(progress.current / progress.total) * 100}%` }}
/>
</div>
)}
</div>
)}

{/* Results Area */}
{resultBlob && (
<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
<div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
<CheckCircle2 className="w-7 h-7" />
</div>
<div>
<h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">Compression Complete!</h4>
<div className="flex items-center gap-2 mt-1">
<span className="text-sm font-medium text-slate-500 line-through decoration-red-500">{formatBytes(file?.size || 0)}</span>
<ArrowRight className="w-4 h-4 text-emerald-600" />
<span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
{formatBytes(resultBlob.size)} 
{file?.size && resultBlob.size < file.size && (
<span className="ml-2 text-xs bg-emerald-200 dark:bg-emerald-800 px-2 py-0.5 rounded-full">
-{Math.round((1 - resultBlob.size / file.size) * 100)}%
</span>
)}
</span>
</div>
</div>
</div>

<div className="flex items-center gap-3 w-full sm:w-auto">
<button
onClick={resetTool}
className="flex-1 sm:flex-none px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
>
Compress Another
</button>
<button
onClick={downloadResult}
className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
>
<Download className="w-5 h-5" />
Download PDF
</button>
</div>
</div>
</div>
)}
</div>
);
}
