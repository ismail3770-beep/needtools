import { ShareButton } from "@/components/tools/ShareButton";
import React from "react";
import Link from "next/link";
import { CATEGORIES } from "@/config/categories";
import { ToolDispatcher } from "@/components/tools/ToolDispatcher";
import { FaqAccordion } from "@/components/tools/FaqAccordion";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolSwitcher } from "@/components/tools/ToolSwitcher";
import { AdBanner } from "@/components/ads/AdBanner";
import { SidebarAd } from "@/components/ads/SidebarAd";
import { JsonLdSchema } from "@/components/seo/JsonLdSchema";
import { ToolFeedbackWidget } from "@/components/tools/ToolFeedbackWidget";
import { ToolHeroMockup } from "@/components/tools/ToolHeroMockup";
import { getToolBySlug } from "@/config/toolsRegistry";
import { notFound } from "next/navigation";

export function ToolView({ toolSlug }: { toolSlug: string }) {
  const tool = getToolBySlug(toolSlug);

  if (!tool) {
    notFound();
  }

  const category = CATEGORIES.find((c) => c.id === tool.category);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans text-black dark:text-white">
      {/* Schema Markup for AI SEO */}
      <JsonLdSchema tool={tool} />

      {/* Hero Section */}
      <section id="hero" className="border-b border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-black/5 dark:border-white/10">
              <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-black/10 dark:divide-white/10">
                  <div className="py-4 md:py-6 lg:py-8 lg:pr-10 xl:pr-12 flex flex-col justify-center border-b border-black/5 dark:border-white/10 lg:border-b-0">
                      <p className="inline-flex self-start items-center gap-2 rounded-full bg-white dark:bg-neutral-900/20 shadow-sm px-3 py-1 text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60 mb-6 border border-black/5 dark:border-white/5">
                          <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" aria-hidden="true"></span>
                          {category?.name || "Tool"}
                      </p>
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">{tool.name}</h1>
                      <p className="mt-5 text-lg text-black/60 dark:text-white/60 leading-relaxed max-w-lg">{tool.fullDescription}</p>
                      <div className="mt-8 flex flex-wrap items-center gap-3">
                          <a href="#generator" className="inline-flex items-center justify-center rounded-lg bg-black dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 transition-colors shadow-lg">Start generating</a>
                          <ShareButton toolName={tool.name} />
                      </div>
                  </div>
                  <div className="py-4 md:py-6 lg:py-8 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 relative overflow-hidden">
                      {/* Decorative background blur blobs */}
                      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/40 blur-3xl rounded-full"></div>
                      <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full"></div>
                      
                      <div className="relative z-10 w-full flex justify-center">
                        <ToolHeroMockup tool={tool} />
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Ad: Header Banner — below hero, above tool workspace */}
      <div className="border-b border-black/5 dark:border-white/10 bg-[#F8FAFC] dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-black/5 dark:border-white/10 py-4 flex justify-center">
          <AdBanner variant="header" className="max-w-4xl" />
        </div>
      </div>

      {/* Main Interactive Tool Workspace Shell */}
      <section id="generator" className="border-b border-black/5 dark:border-white/10 scroll-mt-24">
          <div className="max-w-7xl mx-auto border-x border-black/5 dark:border-white/10 pb-10">
              <div className="py-10 md:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Try {tool.name}. <span className="text-black/50 dark:text-white/60">Free, secure, and directly in your browser.</span></h2>
              </div>
              <div className="border-t border-black/5 dark:border-white/10 p-1 md:p-4 bg-slate-50 dark:bg-[#0b0f19]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <ToolSwitcher currentTool={tool} />
                  <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-5 sm:p-8">
                      <ToolDispatcher tool={tool} />
                    </div>
                  </div>
                </div>
              </div>
          </div>
      </section>

      {/* Features Section - Premium 3 Column Layout */}
      <section id="features" className="border-b border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto border-x border-black/5 dark:border-white/10 pb-10">
              <div className="py-10 md:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Why use {tool.name}? <span className="text-black/50 dark:text-white/60">Everything you need to get the job done right.</span></h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 border-t border-black/5 dark:border-white/10 p-1 lg:items-stretch">
                  {tool.features?.map((feature, i) => (
                      <article key={i} className="rounded-xl shadow-sm bg-white dark:bg-neutral-900/20 p-6 md:p-8 flex flex-col h-full border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-colors">
                          <div className="w-10 h-10 rounded-lg border border-black/5 dark:border-white/10 flex items-center justify-center mb-5 bg-black/5 dark:bg-white/5">
                              {/* Generic Icon for Features */}
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                          </div>
                          <h3 className="text-lg font-bold tracking-tight">{feature.title}</h3>
                          <p className="mt-2 text-sm text-black/60 dark:text-white/60 leading-relaxed">{feature.description}</p>
                      </article>
                  ))}
              </div>
          </div>
      </section>

      {/* Dark Highlight Section (Mapping HowToSteps to the Analytics layout) */}
      <section id="how-it-works" className="border-b border-black/5 dark:border-white/10 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-white/10">
              <div className="grid lg:grid-cols-2 py-10 md:py-20">
                  <div className="py-12 md:py-16 lg:py-20 lg:pr-12 xl:pr-16 border-b border-white/10 lg:border-b-0 flex flex-col justify-center">
                      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How it works</h2>
                      <p className="mt-4 text-white/60 leading-relaxed max-w-md">Get started in seconds. Our tools are designed to be intuitive, fast, and completely secure.</p>
                      <ul className="mt-8 space-y-4">
                          {tool.howToSteps?.map((step, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="mt-0.5 flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-white text-black text-[10px] font-bold">
                                    {i + 1}
                                </span>
                                <div>
                                    <span className="text-sm text-white font-semibold block">{step.title}</span>
                                    <span className="text-xs text-white/70 block mt-0.5">{step.description}</span>
                                </div>
                            </li>
                          ))}
                      </ul>
                  </div>
                  <div className="py-12 md:py-16 lg:py-20 lg:pl-12 xl:pl-16 flex items-center text-black">
                      <div className="w-full rounded-xl bg-white border border-black/10 overflow-hidden shadow-xl p-8 flex flex-col items-center justify-center text-center space-y-4 bg-gradient-to-br from-slate-50 to-slate-100">
                          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <div>
                              <h3 className="text-xl font-bold">100% Client-Side Processing</h3>
                              <p className="text-sm text-black/60 mt-2 max-w-xs mx-auto">Your files never leave your device. All processing happens right inside your browser for maximum security.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Ad Placement — Result/Post-tool */}
      <div className="border-b border-black/5 dark:border-white/10 bg-slate-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-black/5 dark:border-white/10 py-8">
          <div className="flex gap-8">
            <div className="flex-1 flex justify-center">
              <AdBanner variant="inline" className="max-w-4xl" />
            </div>
            <SidebarAd />
          </div>
        </div>
      </div>

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

      {/* User Helpful Feedback Widget */}
      <section className="border-b border-black/5 dark:border-white/10 bg-slate-50 dark:bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-black/5 dark:border-white/10">
              <div className="max-w-5xl mx-auto space-y-16 py-16">
                  <div className="flex justify-center">
                      <ToolFeedbackWidget toolSlug={tool.slug} />
                  </div>
              </div>
          </div>
      </section>

      {/* Related Tools Discovery */}
      <section className="border-b border-black/5 dark:border-white/10 bg-white dark:bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-black/5 dark:border-white/10 py-16">
              <RelatedTools currentTool={tool} />
          </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-black/5 dark:border-white/10 bg-slate-50 dark:bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x border-black/5 dark:border-white/10">
              <div className="py-16 md:py-24 text-center">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto">Ready to try {tool.name}?</h2>
                  <p className="mt-4 text-black/60 dark:text-white/60 max-w-lg mx-auto leading-relaxed">Start free — no registration required.</p>
                  <div className="mt-8">
                      <a href="#generator" className="inline-flex items-center justify-center rounded-lg bg-black dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 transition-colors">Start using {tool.name}</a>
                  </div>
              </div>
          </div>
      </section>
      
    </div>
  );
}
