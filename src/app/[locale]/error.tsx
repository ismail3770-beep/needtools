"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#0b0f19]">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="relative flex justify-center">
          <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-rose-500/10 flex items-center justify-center border border-rose-200 dark:border-rose-900/50">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Something went wrong!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            An unexpected error occurred while processing your request. Please try again or return to the homepage.
          </p>
        </div>

        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800/50 text-left overflow-hidden">
          <p className="text-xs font-mono text-rose-600 dark:text-rose-400 break-words">
            {error.message || "Unknown error occurred"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-900 dark:text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Home className="w-5 h-5 text-slate-400" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}