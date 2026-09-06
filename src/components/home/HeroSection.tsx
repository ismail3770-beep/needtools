"use client";

import React from "react";
import { ArrowRight, Settings, Image as ImageIcon, FileText, Lock, QrCode } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-16 sm:pt-24 sm:pb-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Content */}
          <div className="text-center lg:text-left space-y-6 max-w-2xl mx-auto lg:mx-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0F172A] dark:text-white leading-[1.15]">
              We make web tools <span className="text-brand-600 dark:text-brand-400">easy.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-[#64748B] dark:text-white/60 leading-relaxed font-medium">
              Compress images, secure passwords, format JSON, generate CSS, and convert data right from your browser. It's fast, free, and completely private because your files never leave your device.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4">
              <Link
                href="#popular"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-600 dark:bg-brand-500 px-7 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 dark:hover:bg-brand-600 transition-all hover:-translate-y-0.5"
              >
                Explore Tools
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto group flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-neutral-950 px-7 py-3 text-sm font-semibold text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* Right Column: Abstract Illustration */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            {/* Window Frame Mockup */}
            <div className="relative rounded-2xl bg-white dark:bg-neutral-950 border border-[#E2E8F0] dark:border-white/10 shadow-2xl overflow-hidden aspect-[4/3] sm:aspect-auto sm:h-[400px]">
              {/* Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E2E8F0] dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-white/20" />
                </div>
              </div>
              
              {/* Window Content (NeedTools Actual UI Mockup) */}
              <div className="p-6 h-full flex flex-col gap-4 bg-white dark:bg-neutral-950">
                
                {/* Image Compressor Mockup */}
                <div className="flex gap-4 p-3 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-indigo-100 dark:border-indigo-900 hover:border-indigo-300 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200">photo.jpg</span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">-75%</span>
                    </div>
                    <div className="h-1.5 bg-indigo-50 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600 w-[25%] rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Password Generator Mockup */}
                <div className="flex gap-4 p-3 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-emerald-100 dark:border-emerald-900 hover:border-emerald-300 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2 py-1">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200">Password Generator</span>
                    <div className="h-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded flex items-center px-2">
                      <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300 tracking-widest">q7$Xp9!wM#2k</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Mockup */}
                <div className="flex gap-4 p-3 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-purple-100 dark:border-purple-900 hover:border-purple-300 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2 py-1">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200">QR Code Link</span>
                    <div className="flex gap-2 items-center h-4 mt-1">
                      <div className="h-4 w-4 bg-purple-500 dark:bg-purple-400 rounded-sm" />
                      <div className="h-4 w-4 bg-purple-300 dark:bg-purple-600 rounded-sm" />
                      <div className="h-4 flex-1 bg-gradient-to-r from-purple-100 to-transparent dark:from-purple-900/40 rounded-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
