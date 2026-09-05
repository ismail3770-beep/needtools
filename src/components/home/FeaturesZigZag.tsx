"use client";

import React from "react";
import { Image as ImageIcon, ShieldAlert, QrCode, ArrowRight, ShieldCheck, Download } from "lucide-react";
import Link from "next/link";

export function FeaturesZigZag() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">

        {/* Feature 1: Image Compression (Text Left, Image Right) */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          <div className="md:w-1/2 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/50">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
              Smaller Images, Same Quality
            </h2>
            <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">
              Shrink your images by up to 80% without noticeable quality loss. Everything happens right on your device, so your files are never uploaded anywhere.
            </p>
            <div className="pt-2">
              <Link href="/tools" className="inline-flex items-center gap-2 text-black dark:text-white font-semibold hover:gap-3 transition-all">
                Try Image Compressor <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 w-full">
            <div className="relative aspect-video rounded-3xl bg-black/5 dark:bg-neutral-950 border border-black/10 dark:border-white/10 flex items-center justify-center p-6 sm:p-10">

              {/* Mockup UI for Image Compression */}
              <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-black/10 dark:border-white/10 overflow-hidden">
                <div className="h-32 bg-black/5 dark:bg-neutral-950 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-50 dark:opacity-40" />
                  <ImageIcon className="w-10 h-10 text-white drop-shadow-md relative z-10" />
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-black/50 dark:text-white/50">Original: <strong className="text-black dark:text-white">4.2 MB</strong></span>
                    <ArrowRight className="w-4 h-4 text-black/40 dark:text-white/40" />
                    <span className="text-black/80 dark:text-white/80 font-bold">New: 850 KB</span>
                  </div>
                  <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-black dark:bg-white w-[80%] rounded-full relative" />
                  </div>
                  <div className="flex justify-between text-xs text-black/50 dark:text-white/50 font-medium">
                    <span>Quality: 80%</span>
                    <span>-80% Saved</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Feature 2: Password Generator (Image Left, Text Right) */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
          <div className="md:w-1/2 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/50">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
              Strong Passwords, Instantly
            </h2>
            <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">
              Get secure, random passwords or easy-to-remember passphrases in one click. We don't save or track anything you generate.
            </p>
            <div className="pt-2">
              <Link href="/tools" className="inline-flex items-center gap-2 text-black dark:text-white font-semibold hover:gap-3 transition-all">
                Try Password Generator <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 w-full">
            <div className="relative aspect-video rounded-3xl bg-black/5 dark:bg-neutral-950 border border-black/10 dark:border-white/10 flex items-center justify-center p-6 sm:p-10">

              {/* Mockup UI for Password Generator */}
              <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-black/10 dark:border-white/10 p-6 space-y-5">

                <div className="p-4 bg-black/5 dark:bg-neutral-950 rounded-lg text-center border border-black/10 dark:border-white/10">
                  <span className="font-mono text-lg sm:text-xl font-bold text-black dark:text-white tracking-wider">
                    x$9Q!v#2KpL@7m
                  </span>
                </div>

                <div className="flex items-center gap-2 text-black/80 dark:text-white/80 text-sm font-semibold bg-black/5 dark:bg-white/5 p-2 rounded-md justify-center">
                  <ShieldCheck className="w-4 h-4" />
                  Very Strong
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/60 dark:text-white/60">Length: 14</span>
                    <div className="w-32 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[70%] h-full bg-black dark:bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex justify-between gap-2">
                    <div className="h-8 flex-1 bg-black/5 dark:bg-white/5 rounded-md flex items-center justify-center text-xs font-medium text-black/50 dark:text-white/50">A-Z</div>
                    <div className="h-8 flex-1 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-md flex items-center justify-center text-xs font-medium border border-black/10 dark:border-white/10">a-z</div>
                    <div className="h-8 flex-1 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-md flex items-center justify-center text-xs font-medium border border-black/10 dark:border-white/10">0-9</div>
                    <div className="h-8 flex-1 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-md flex items-center justify-center text-xs font-medium border border-black/10 dark:border-white/10">!@#</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Feature 3: QR Generator (Text Left, Image Right) */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          <div className="md:w-1/2 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-900/50">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
              QR Code Generator
            </h2>
            <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">
              Make QR codes for links, Wi-Fi, or text. Change colors and download high-quality files that never expire.
            </p>
            <div className="pt-2">
              <Link href="/tools/qr-codes" className="inline-flex items-center gap-2 text-black dark:text-white font-semibold hover:gap-3 transition-all">
                Try QR Code Generator <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 w-full">
            <div className="relative aspect-video rounded-3xl bg-black/5 dark:bg-neutral-950 border border-black/10 dark:border-white/10 flex items-center justify-center p-6 sm:p-10">

              {/* Mockup UI for QR Generator */}
              <div className="relative flex gap-4 w-full max-w-md items-center">
                {/* QR Canvas */}
                <div className="w-36 h-36 sm:w-40 sm:h-40 bg-white p-2 rounded-2xl shadow-sm border border-black/10 shrink-0 flex items-center justify-center">
                  <div className="w-full h-full bg-black rounded-lg flex items-center justify-center overflow-hidden">
                    <QrCode className="w-24 h-24 text-white opacity-90" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Control Panel Mockup */}
                <div className="flex-1 space-y-3 p-4 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-black/10 dark:border-white/10">
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 bg-black/10 dark:bg-white/10 rounded" />
                    <div className="h-8 bg-black/5 dark:bg-neutral-950 rounded-md border border-black/10 dark:border-white/10 flex items-center px-3">
                      <div className="w-4 h-4 rounded-full bg-black dark:bg-white mr-2" />
                      <div className="h-2 w-12 bg-black/20 dark:bg-white/20 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 bg-black/10 dark:bg-white/10 rounded" />
                    <div className="h-8 bg-black/5 dark:bg-neutral-950 rounded-md border border-black/10 dark:border-white/10 flex items-center px-3">
                      <div className="w-4 h-4 rounded-full bg-white dark:bg-black border border-black/20 dark:border-white/20 mr-2" />
                      <div className="h-2 w-16 bg-black/20 dark:bg-white/20 rounded" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="h-9 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 rounded-lg flex items-center justify-center gap-2 shadow-sm text-white dark:text-black transition-colors cursor-pointer">
                      <Download className="w-4 h-4" />
                      <div className="h-2 w-16 bg-white/80 dark:bg-black/80 rounded" />
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
