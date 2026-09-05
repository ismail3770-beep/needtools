"use client";

import React, { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { 
UploadCloud, 
Trash2, 
Loader2,
CheckCircle2,
Download,
FileBox,
GripVertical,
ArrowRight
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface PdfFile {
id: string;
file: File;
previewUrl?: string; // Optional: could render first page using pdf.js, but keeping it simple for now
}

export default function PdfMergeUI() {
const [files, setFiles] = useState<PdfFile[]>([]);
const [isProcessing, setIsProcessing] = useState(false);
const [resultBlob, setResultBlob] = useState<Blob | null>(null);

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

const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
if (droppedFiles.length > 0) {
handleFileSelection(droppedFiles);
} else {
alert("Please drop valid PDF files.");
}
}, []);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const selectedFiles = Array.from(e.target.files || []).filter(f => f.type === "application/pdf");
if (selectedFiles.length > 0) {
handleFileSelection(selectedFiles);
}
};

const handleFileSelection = (newFiles: File[]) => {
const mapped = newFiles.map(f => ({
id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
file: f,
}));
setFiles(prev => [...prev, ...mapped]);
setResultBlob(null);
};

const removeFile = (id: string) => {
setFiles(files.filter(f => f.id !== id));
};

const moveFile = (index: number, direction: 'up' | 'down') => {
if ((direction === 'up' && index === 0) || (direction === 'down' && index === files.length - 1)) return;

const newFiles = [...files];
const swapIndex = direction === 'up' ? index - 1 : index + 1;
[newFiles[index], newFiles[swapIndex]] = [newFiles[swapIndex], newFiles[index]];
setFiles(newFiles);
};

const resetTool = () => {
setFiles([]);
setResultBlob(null);
setIsProcessing(false);
if (fileInputRef.current) fileInputRef.current.value = "";
};

const mergePdfs = async () => {
if (files.length < 2) {
alert("Please upload at least 2 PDF files to merge.");
return;
}

setIsProcessing(true);
setResultBlob(null);

try {
const mergedPdf = await PDFDocument.create();

for (const pdfFile of files) {
const arrayBuffer = await pdfFile.file.arrayBuffer();
const pdf = await PDFDocument.load(arrayBuffer);
const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
copiedPages.forEach((page) => mergedPdf.addPage(page));
}

const pdfBytes = await mergedPdf.save();
const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
setResultBlob(blob);
} catch (error) {
console.error("Error merging PDFs:", error);
alert("Failed to merge PDFs. Make sure none of them are password protected or corrupted.");
} finally {
setIsProcessing(false);
}
};

const downloadResult = () => {
if (!resultBlob) return;
const url = URL.createObjectURL(resultBlob);
const a = document.createElement("a");
a.href = url;
a.download = "needtools-merged.pdf";
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
};

return (
<div className="space-y-6">
{/* Upload Zone */}
{!resultBlob && (
<>
<div
ref={dropZoneRef}
onDragOver={handleDragOver}
onDragLeave={handleDragLeave}
onDrop={handleDrop}
className="relative group flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/20 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer overflow-hidden"
onClick={() => fileInputRef.current?.click()}
>
<input
type="file"
ref={fileInputRef}
onChange={handleFileChange}
accept="application/pdf"
multiple
className="hidden"
/>
<div className="w-14 h-14 mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
<UploadCloud className="w-7 h-7" />
</div>
<h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
Add PDF Files
</h3>
<p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
Drag and drop multiple PDFs here, or click to browse.
</p>
</div>

{/* File List */}
{files.length > 0 && (
<div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 space-y-4">
<div className="flex justify-between items-center mb-2">
<h4 className="font-semibold text-slate-700 dark:text-slate-300">
Files to Merge ({files.length})
</h4>
<button
onClick={() => setFiles([])}
className="text-sm text-red-500 hover:text-red-600 font-medium"
>
Clear All
</button>
</div>

<div className="space-y-2">
{files.map((fileObj, index) => (
<div key={fileObj.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl group">
<div className="flex items-center gap-3 overflow-hidden">
<div className="cursor-grab text-slate-400 hover:text-slate-600 flex flex-col gap-1">
<button onClick={() => moveFile(index, 'up')} disabled={index === 0} className="disabled:opacity-30">
<GripVertical className="w-4 h-4" />
</button>
</div>
<FileBox className="w-6 h-6 text-blue-500 shrink-0" />
<div className="truncate">
<p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
{fileObj.file.name}
</p>
<p className="text-xs text-slate-500">
{formatBytes(fileObj.file.size)}
</p>
</div>
</div>
<button
onClick={() => removeFile(fileObj.id)}
className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
>
<Trash2 className="w-4 h-4" />
</button>
</div>
))}
</div>

<div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
<button
onClick={mergePdfs}
disabled={isProcessing || files.length < 2}
className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>
{isProcessing ? (
<>
<Loader2 className="w-5 h-5 animate-spin" />
Merging...
</>
) : (
<>
Merge {files.length} PDFs
<ArrowRight className="w-5 h-5" />
</>
)}
</button>
</div>
</div>
)}
</>
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
<h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">Merge Complete!</h4>
<p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
Combined {files.length} files into {formatBytes(resultBlob.size)}.
</p>
</div>
</div>

<div className="flex items-center gap-3 w-full sm:w-auto">
<button
onClick={resetTool}
className="flex-1 sm:flex-none px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
>
Merge More
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
