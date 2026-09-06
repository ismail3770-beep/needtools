import React from "react";
import type { Metadata } from "next";
import { Shield, Zap, Eye, Globe, Heart, Code } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — NeedTools",
  description:
    "Learn about NeedTools — a suite of 100% free, privacy-first browser tools for everyday tasks. Our mission is to make powerful web utilities accessible to everyone, with zero data collection.",
  alternates: { canonical: "https://needtools.app/about" },
};

const VALUES = [
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Every tool on NeedTools processes your files entirely within your browser. Your documents, images, and data never touch our servers — we couldn't access them even if we wanted to.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "By leveraging modern WebAssembly, Web Workers, and client-side JavaScript, our tools deliver near-instant results without network latency or server queues.",
  },
  {
    icon: Eye,
    title: "Zero Tracking",
    description:
      "We don't track what files you process, what you convert, or what you create. We use minimal analytics to understand which tools are popular so we can improve them — nothing more.",
  },
  {
    icon: Globe,
    title: "Free for Everyone",
    description:
      "NeedTools is and will always be 100% free. We sustain our infrastructure through unobtrusive advertising and believe that essential web tools should be accessible to everyone regardless of budget.",
  },
  {
    icon: Heart,
    title: "Community Driven",
    description:
      "Our tool roadmap is shaped by user feedback. If there's a utility you need but can't find, let us know — there's a good chance we'll build it.",
  },
  {
    icon: Code,
    title: "Modern Technology",
    description:
      "Built with Next.js, React, and TypeScript, our platform follows modern web development best practices. We continuously update our tools with the latest browser APIs and compression algorithms.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-neutral-950">
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-6 border border-brand-100 dark:border-brand-900/50">
            About NeedTools
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-tight">
            Powerful browser tools.{" "}
            <span className="text-[#64748B] dark:text-white/60">Zero compromise on privacy.</span>
          </h1>
          <p className="mt-6 text-lg text-[#64748B] dark:text-white/60 leading-relaxed max-w-2xl mx-auto">
            NeedTools was built with a simple belief: essential web utilities should be free, fast, and private. We provide a growing suite of browser-based tools that process everything locally on your device — no uploads, no servers, no data collection.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 border-t border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-white mb-6">Our Story</h2>
          <div className="prose max-w-none text-[#64748B] dark:text-white/70 space-y-4 text-base leading-relaxed">
            <p>
              NeedTools started as a personal frustration. Every time we needed to compress a PDF, resize an image, or generate a QR code, we'd encounter the same pattern: upload your file to some server, wait for processing, and then worry about where your data went. Many of these services had unclear privacy policies, aggressive upselling, or file size limits designed to push you toward paid plans.
            </p>
            <p>
              We knew there had to be a better way. Modern browsers are incredibly powerful — equipped with WebAssembly, Canvas APIs, Web Workers, and advanced JavaScript engines. Why should you need to upload sensitive documents to a remote server when your browser can handle the processing itself?
            </p>
            <p>
              That's the insight that launched NeedTools. We built a platform where every tool runs entirely in your browser. When you compress an image on NeedTools, the compression algorithm executes on your device. When you convert a PDF, the conversion happens locally. Your files never leave your computer — they're processed in memory and discarded the moment you close the tab.
            </p>
            <p>
              Today, NeedTools offers a growing collection of tools spanning PDF processing, image optimization, marketing utilities, developer tools, and more. We're committed to keeping every tool free and adding new ones based on what our users need most. Our mission is simple: give everyone access to professional-grade web tools with zero cost and zero privacy compromise.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 border-t border-[#E2E8F0] dark:border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-white mb-10 text-center">What We Stand For</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E2E8F0] dark:border-white/10 hover:border-brand-200 dark:hover:border-brand-800 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-[#64748B] dark:text-white/60 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About NeedTools",
            description: "Learn about NeedTools and our mission to provide free, privacy-first browser tools.",
            url: "https://needtools.app/about",
            mainEntity: {
              "@type": "Organization",
              name: "NeedTools",
              url: "https://needtools.app",
              description: "Free, privacy-first browser tools for everyday tasks.",
            },
          }),
        }}
      />
    </div>
  );
}
