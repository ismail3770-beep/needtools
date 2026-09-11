"use client";

import React, { useEffect, useRef } from "react";
import QrCodeGeneratorUI from "@/tools-logic/security/QrCodeGeneratorUI";
import { ToolItem } from "@/types/tool";
import Link from "next/link";
import QRCodeStyling from "qr-code-styling";
import { QrCode } from "lucide-react";
import { FaqAccordion } from "@/components/tools/FaqAccordion";
import { GeoContentSection } from "@/components/seo/GeoContentSection";


export function PremiumQrCodeView({ tool }: { tool: ToolItem }) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans text-black dark:text-white">
      
      {/* Hero Section */}
      <section id="hero" className="border-b border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-black/5 dark:border-white/10">
              <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-black/10 dark:divide-white/10">
                  <div className="py-4 md:py-6 lg:py-8 lg:pr-10 xl:pr-12 flex flex-col justify-center border-b border-black/5 dark:border-white/10 lg:border-b-0">
                      <p className="inline-flex self-start items-center gap-2 rounded-full bg-white dark:bg-neutral-900/20 shadow-sm px-3 py-1 text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60 mb-6">
                          <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" aria-hidden="true"></span>
                          QR Codes
                      </p>
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">Print once. Track every scan.</h1>
                      <p className="mt-5 text-lg text-black/60 dark:text-white/60 leading-relaxed max-w-lg">Dynamic QR codes tied to your short links. Update destinations anytime — without reprinting posters, packaging, or menus.</p>
                      <div className="mt-8 flex flex-wrap items-center gap-3">
                          <a href="#generator" className="inline-flex items-center justify-center rounded-lg bg-black dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 transition-colors">Start generating</a>
                          <button className="inline-flex items-center justify-center rounded-lg border border-black/5 dark:border-white/10 px-6 py-3 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">See video</button>
                      </div>
                  </div>
                  <div className="py-4 md:py-6 lg:py-8 flex items-center justify-center bg-gradient-to-br from-sky-300 to-indigo-300 relative">
                      
                      {/* Decorative background blur blobs */}
                      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/40 blur-3xl rounded-full"></div>
                      <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full"></div>
                      
                      {/* Reverted and Scaled Down Hero Card */}
                      <div className="w-full max-w-[280px] rounded-2xl bg-white p-4 shadow-2xl dark:bg-neutral-900 text-black dark:text-white relative z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40">QR Editor</span>
                        </div>
                        
                        {/* QR Code Container */}
                        <div className="w-full aspect-square bg-slate-900 dark:bg-black rounded-xl flex items-center justify-center overflow-hidden shadow-inner border border-black/10 dark:border-white/10">
                          <QrCode className="w-2/3 h-2/3 text-white opacity-90" strokeWidth={1.5} />
                        </div>
                      </div>

                  </div>
              </div>
          </div>
      </section>

      {/* AI GEO Section (Generative Engine Optimization) */}
      <div className="border-b border-black/5 dark:border-white/10 bg-white dark:bg-neutral-950 pb-8 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-black/5 dark:border-white/10">
          <GeoContentSection tool={tool} />
        </div>
      </div>

      {/* Generator Section */}
      <section id="generator" className="border-b border-black/5 dark:border-white/10 scroll-mt-24">
          <div className="max-w-7xl mx-auto border-x border-black/5 dark:border-white/10 pb-10">
              <div className="py-10 md:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Create QR Codes for Free. <span className="text-black/50 dark:text-white/60">Pick a type, style it, and download — static or trackable.</span></h2>
              </div>
              <div className="border-t border-black/5 dark:border-white/10 p-1">
                  <QrCodeGeneratorUI />
              </div>
          </div>
      </section>

      {/* Features Section */}
      <section id="all-features" className="border-b border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto border-x border-black/5 dark:border-white/10 pb-10">
              <div className="py-10 md:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">QR codes that work for you. <span className="text-black/50 dark:text-white/60">Formats, static or dynamic routing, and brand-level customization in one place.</span></h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-2 border-t border-black/5 dark:border-white/10 p-1 lg:items-stretch">
                  <article className="rounded-xl shadow-sm bg-white dark:bg-neutral-900/20 p-6 md:p-8 flex flex-col min-w-0 h-full">
                      <h3 className="text-xl font-bold tracking-tight">14+ formats</h3>
                      <p className="mt-2 text-sm text-black/60 dark:text-white/60 leading-relaxed">
                          Effortlessly create QR codes for countless scenarios and needs: share website links, transfer contact details with vCards, provide instant WiFi connections, pre-fill emails or SMS messages, organize events, add app links, and much more.
                      </p>
                 
                      <div className="relative mt-auto pt-8 -mx-6 md:-mx-8 min-w-0 overflow-hidden space-y-2">
                          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 md:w-8 bg-gradient-to-r from-white dark:from-black/70 to-transparent z-10" aria-hidden="true"></div>
                          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 md:w-8 bg-gradient-to-l from-white dark:from-black/70 to-transparent z-10" aria-hidden="true"></div>
                          <div className="overflow-hidden">
                              <div className="flex w-max gap-2 px-6 md:px-8 animate-marquee">
                                  <div className="w-40 shrink-0 rounded-lg border border-black/5 dark:border-white/10 px-4 py-3"><p className="text-sm font-semibold">URL</p><p className="mt-1 text-xs text-black/50 dark:text-white/50">Open any web destination.</p></div>
                                  <div className="w-40 shrink-0 rounded-lg border border-black/5 dark:border-white/10 px-4 py-3"><p className="text-sm font-semibold">vCard</p><p className="mt-1 text-xs text-black/50 dark:text-white/50">Share contact details instantly.</p></div>
                                  <div className="w-40 shrink-0 rounded-lg border border-black/5 dark:border-white/10 px-4 py-3"><p className="text-sm font-semibold">WiFi</p><p className="mt-1 text-xs text-black/50 dark:text-white/50">Connect guests without passwords.</p></div>
                                  {/* Duplicate for smooth marquee if implemented with CSS, keeping static for now */}
                              </div>
                          </div>
                          <div className="overflow-hidden">
                              <div className="flex w-max gap-2 px-6 md:px-8 animate-marquee-slow">
                                  <div className="w-40 shrink-0 rounded-lg border border-black/5 dark:border-white/10 px-4 py-3"><p className="text-sm font-semibold">Email</p><p className="mt-1 text-xs text-black/50 dark:text-white/50">Pre-fill subject and message.</p></div>
                                  <div className="w-40 shrink-0 rounded-lg border border-black/5 dark:border-white/10 px-4 py-3"><p className="text-sm font-semibold">SMS</p><p className="mt-1 text-xs text-black/50 dark:text-white/50">Start a text with one scan.</p></div>
                                  <div className="w-40 shrink-0 rounded-lg border border-black/5 dark:border-white/10 px-4 py-3"><p className="text-sm font-semibold">Event</p><p className="mt-1 text-xs text-black/50 dark:text-white/50">Add calendar details in a tap.</p></div>
                              </div>
                          </div>
                      </div>
                  </article>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-full">
                      <article className="rounded-xl shadow-sm bg-white dark:bg-neutral-900/20 p-6 md:p-8 flex flex-col h-full">
                          <div className="w-10 h-10 rounded-lg border border-black/5 dark:border-white/10 flex items-center justify-center mb-5">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
                          </div>
                          <h3 className="text-lg font-bold tracking-tight">Static QR codes</h3>
                          <p className="mt-2 text-sm text-black/60 dark:text-white/60 leading-relaxed">Data is baked into the code — works offline, perfect for unchanging details.</p>
                      </article>
                      <article className="rounded-xl shadow-sm bg-white dark:bg-neutral-900/20 p-6 md:p-8 flex flex-col h-full">
                          <div className="w-10 h-10 rounded-lg border border-black/5 dark:border-white/10 flex items-center justify-center mb-5">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                          </div>
                          <h3 className="text-lg font-bold tracking-tight">Dynamic QR codes</h3>
                          <p className="mt-2 text-sm text-black/60 dark:text-white/60 leading-relaxed">Track QR code scans with our dynamic QR codes</p>
                      </article>
                      <article className="rounded-xl shadow-sm bg-white dark:bg-neutral-900/20 p-6 md:p-8 flex flex-col h-full">
                          <div className="w-10 h-10 rounded-lg border border-black/5 dark:border-white/10 flex items-center justify-center mb-5">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.153 2.25 2.25 0 01-2.4 2.447 2.25 2.25 0 01-1.183-4.276 3 3 0 002.168-1.577A6.721 6.721 0 0112 3.75c1.907 0 3.645.776 4.89 2.028a3 3 0 002.168 1.577 2.25 2.25 0 11-.987 4.34 2.25 2.25 0 01-2.4-2.447 3 3 0 00-5.78-1.153z"/></svg>
                          </div>
                          <h3 className="text-lg font-bold tracking-tight">Brand styling</h3>
                          <p className="mt-2 text-sm text-black/60 dark:text-white/60 leading-relaxed">Customize colors to match your brand</p>
                      </article>
                      <article className="rounded-xl shadow-sm bg-white dark:bg-neutral-900/20 p-6 md:p-8 flex flex-col h-full">
                          <div className="w-10 h-10 rounded-lg border border-black/5 dark:border-white/10 flex items-center justify-center mb-5">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
                          </div>
                          <h3 className="text-lg font-bold tracking-tight">Tied to short links</h3>
                          <p className="mt-2 text-sm text-black/60 dark:text-white/60 leading-relaxed">One destination powering both QR scans and short URL campaigns.</p>
                      </article>
                  </div>
              </div>
          </div>
      </section>

      {/* Static vs Dynamic Section */}
      <section id="static-dynamic" className="border-b border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-black/5 dark:border-white/10">
              <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-black/10 dark:divide-white/10">
                  <div className="py-12 md:py-16 lg:pr-12 xl:pr-16 flex flex-col justify-center border-b border-black/5 dark:border-white/10 lg:border-b-0">
                      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Static or dynamic — your call. <span className="text-black/50 dark:text-white/60">Bake data in for permanence, or route live for campaigns that change.</span></h2>
                      <ul className="mt-8 space-y-4">
                          <li className="flex items-start gap-3"><span className="mt-0.5 flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg></span><span className="text-sm text-black/70 dark:text-white/70">Static: set it once, scan forever — even offline</span></li>
                          <li className="flex items-start gap-3"><span className="mt-0.5 flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg></span><span className="text-sm text-black/70 dark:text-white/70">Dynamic: edit the destination after print</span></li>
                          <li className="flex items-start gap-3"><span className="mt-0.5 flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg></span><span className="text-sm text-black/70 dark:text-white/70">Scan analytics on every dynamic code</span></li>
                      </ul>
                  </div>
                  <div className="py-12 md:py-16 lg:pl-12 xl:pl-16 flex items-center justify-center">
                      <div className="w-full max-w-sm space-y-3">
                          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900/20 p-5 shadow-xl">
                              <div className="flex items-center justify-between mb-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">Static payload</p><span className="text-[10px] font-semibold text-black/35 dark:text-white/35">Locked</span></div>
                              <p className="text-xs text-black/50 dark:text-white/50">Format · URL redirect</p>
                              <p className="mt-1 text-sm font-semibold truncate">https://needtools.app</p>
                          </div>
                          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900/20 p-5 shadow-xl">
                              <div className="flex items-center justify-between mb-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">Live routing</p><span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Live</span></div>
                              <p className="text-xs text-black/50 dark:text-white/50">Destination</p>
                              <p className="mt-1 text-sm font-semibold truncate">needtools.app/x7k</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="border-b border-black/5 dark:border-white/10 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-white/10">
              <div className="grid lg:grid-cols-2 py-10 md:py-20">
                  <div className="py-12 md:py-16 lg:py-20 lg:pr-12 xl:pr-16 border-b border-white/10 lg:border-b-0 flex flex-col justify-center">
                      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Trackable to the dot</h2>
                      <p className="mt-4 text-white/60 leading-relaxed max-w-md">The beautify of QR codes is that almost any type of data can be encoded in them. Most types of data can be tracked very easily so you will know exactly when and from where a person scanned your QR code.</p>
                      <ul className="mt-8 space-y-4">
                          <li className="flex items-start gap-3"><span className="mt-0.5 flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-white text-black"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg></span><span className="text-sm text-white/80">Real-time scan counts and trends</span></li>
                          <li className="flex items-start gap-3"><span className="mt-0.5 flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-white text-black"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg></span><span className="text-sm text-white/80">Device and geo breakdown</span></li>
                          <li className="flex items-start gap-3"><span className="mt-0.5 flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-white text-black"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg></span><span className="text-sm text-white/80">Same analytics as your short links</span></li>
                      </ul>
                  </div>
                  <div className="py-12 md:py-16 lg:py-20 lg:pl-12 xl:pl-16 flex items-center text-black">
                      <div className="w-full rounded-xl bg-white border border-black/10 overflow-hidden shadow-xl">
                          <div className="grid grid-cols-2 divide-x divide-black/10 border-b border-black/10">
                              <div className="p-5"><p className="text-[11px] font-semibold uppercase tracking-wider text-black">Total scans</p><p className="mt-1 text-3xl font-bold tabular-nums">8,412</p><p className="mt-1 text-xs text-black">↑ 19% this month</p></div>
                              <div className="p-5"><p className="text-[11px] font-semibold uppercase tracking-wider text-black">Unique scanners</p><p className="mt-1 text-3xl font-bold tabular-nums">5,903</p><p className="mt-1 text-xs text-black">↑ 12% this month</p></div>
                          </div>
                          <div className="p-5">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-black mb-4">Scans over time</p>
                              <div className="flex items-end gap-1 sm:gap-1.5 h-24 sm:h-28" aria-hidden="true">
                                  {[28,40,35,55,48,72,60,88,65,78,52,70].map((h, i) => (
                                      <div key={i} className={`flex-1 rounded-sm ${i === 7 ? 'bg-black' : 'bg-black/20'}`} style={{ height: `${h}%` }}></div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* FAQs */}
      <section className="border-b border-black/5 dark:border-white/10 bg-white dark:bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-black/5 dark:border-white/10">
              <div className="max-w-3xl mx-auto py-16 md:py-24">
                  <div className="text-center mb-12">
                      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Frequently asked questions</h2>
                  </div>
                  <FaqAccordion faqs={tool.faqs} toolName={tool.name} />
              </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-black/5 dark:border-white/10">
              <div className="py-16 md:py-24 text-center">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto">Ready to try QR Codes?</h2>
                  <p className="mt-4 text-black/60 dark:text-white/60 max-w-lg mx-auto leading-relaxed">Start free — no credit card required.</p>
                  <div className="mt-8">
                      <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="inline-flex items-center justify-center rounded-lg bg-black dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 transition-colors">Get started free</button>
                  </div>
              </div>
          </div>
      </section>
      
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
