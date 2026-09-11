"use client";
import { ToolDropzone } from "@/components/ui/ToolDropzone";


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
  Lock,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

export default function ProtectPdfUI() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
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
    // Prevent browser crash from very large PDFs
    const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > MAX_PDF_SIZE) {
      alert("File too large. Maximum size is 50MB for browser-based PDF processing.");
      return;
    }

    setFile(selectedFile);
    setResultBlob(null);
    setPassword("");
  };

  const resetTool = () => {
    setFile(null);
    setResultBlob(null);
    setPassword("");
    setProgress({ current: 0, total: 0 });
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const protectPdf = async () => {
    if (!file || !password) return;
    setIsProcessing(true);
    setResultBlob(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      
      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });
      
      let encryptedPdf: any = null;
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const originalViewport = page.getViewport({ scale: 1.0 });
        const viewport = page.getViewport({ scale: 2.0 }); // High quality scale
        
        if (!encryptedPdf) {
          encryptedPdf = new jsPDF({
            orientation: originalViewport.width > originalViewport.height ? "landscape" : "portrait",
            unit: "pt",
            format: [originalViewport.width, originalViewport.height],
            encryption: {
              userPassword: password,
              ownerPassword: password,
              userPermissions: ["print", "modify", "copy", "annot-forms"]
            }
          });
        } else {
          encryptedPdf.addPage([originalViewport.width, originalViewport.height], originalViewport.width > originalViewport.height ? "landscape" : "portrait");
        }
        
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
        
        // Add image to page
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        encryptedPdf.addImage(imgData, "JPEG", 0, 0, originalViewport.width, originalViewport.height);
        
        setProgress({ current: i, total: numPages });
      }
      
      const pdfBlob = encryptedPdf.output("blob");
      setResultBlob(pdfBlob);
    } catch (error) {
      console.error("Error protecting PDF:", error);
      alert("An error occurred while protecting the PDF. It might already be password-protected or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name.replace(".pdf", "_protected.pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
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
                  <label className="block text-sm font-semibold text-black/70 dark:text-white/70 dark:text-slate-300 mb-2">
                    Enter Password to Open Document
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Type a strong password..."
                      className="w-full pl-4 pr-12 py-3 bg-black/5 dark:bg-white/5 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-black/40 dark:focus:border-white/40 outline-none transition-all text-black dark:text-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black/60 dark:text-white/60 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-black/50 dark:text-white/50 mt-2">
                    Please remember this password. If you lose it, the document cannot be recovered.
                  </p>
                </div>

                {isProcessing ? (
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-black/70 dark:text-white/70 dark:text-slate-300">Encrypting PDF...</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {Math.round((progress.current / Math.max(1, progress.total)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-black/10 dark:bg-white/10 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-black dark:bg-white rounded-full transition-all duration-300 ease-out"
                        style={{ width: progress.total > 0 ? (progress.current / progress.total) * 100 + "%" : "0%" }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={protectPdf}
                    disabled={!password || password.length < 3}
                    className="w-full flex justify-center items-center gap-2 py-4 px-6 bg-neutral-950 dark:bg-white text-white dark:text-black dark:text-white dark:text-black font-bold rounded-xl hover:bg-black/80 dark:bg-white/10 dark:hover:bg-black/10 dark:bg-white/10 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                Your document is now encrypted. You will need the password to open it.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={downloadFile}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl shadow-sm transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Protected PDF
                </button>
                <button
                  onClick={resetTool}
                  className="w-full flex items-center justify-center gap-2 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold py-3.5 px-6 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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
