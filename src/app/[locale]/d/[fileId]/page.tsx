"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { storage } from "@/lib/appwrite";
import Link from "next/link";
import { FileIcon, Download, AlertTriangle } from "lucide-react";

export default function DownloadPage() {
  const { fileId } = useParams();
  const [fileMeta, setFileMeta] = useState<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFile() {
      if (!fileId) return;
      try {
        const result = await storage.getFile("TemporaryDownloads", fileId as string);
        setFileMeta(result);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchFile();
  }, [fileId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !fileMeta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-neutral-950 font-sans p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-black/5 dark:border-white/10">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Link Expired or Invalid</h1>
          <p className="text-black/60 dark:text-white/60 mb-8">
            This download link has expired or the file has been permanently deleted as part of our 7-day privacy policy.
          </p>
          <Link href="/" className="inline-flex items-center justify-center w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
            Back to Tools
          </Link>
        </div>
      </div>
    );
  }

  const downloadUrl = storage.getFileDownload("TemporaryDownloads", fileId as string).toString();
  const fileSizeInMB = (fileMeta.sizeOriginal / (1024 * 1024)).toFixed(2);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-neutral-950 font-sans p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-black/5 dark:border-white/10">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileIcon className="w-8 h-8" />
        </div>
        
        <h1 className="text-xl font-bold text-black dark:text-white mb-1 truncate px-4" title={fileMeta.name}>
          {fileMeta.name}
        </h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">
          {fileSizeInMB} MB
        </p>

        <a 
          href={downloadUrl} 
          className="inline-flex items-center justify-center w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors mb-4 group"
        >
          <Download className="w-5 h-5 mr-2 group-hover:-translate-y-0.5 transition-transform" />
          Download File
        </a>

        <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/30 w-full justify-center">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>This link automatically expires in 7 days.</span>
        </div>
      </div>
    </div>
  );
}
