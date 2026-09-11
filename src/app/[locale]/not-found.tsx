import React from "react";
import Link from "next/link";
import { Search, Home, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#0b0f19]">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <span className="text-[12rem] font-extrabold text-blue-600">404</span>
          </div>
          <div className="relative flex justify-center pb-8 pt-12">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 rotate-12">
              <FileQuestion className="w-12 h-12 text-blue-600 dark:text-blue-500" />
            </div>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            We couldn't find the tool or page you're looking for. It might have been moved or doesn't exist yet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 relative z-10">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
          <Link
            href="/#categories"
            className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-900 dark:text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Search className="w-5 h-5 text-slate-400" />
            Browse Tools
          </Link>
        </div>
      </div>
    </div>
  );
}