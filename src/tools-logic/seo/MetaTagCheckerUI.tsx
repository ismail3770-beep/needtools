"use client";

import React, { useState } from "react";
import { Search, Globe, FileText, Image as ImageIcon, Twitter, AlertCircle, RefreshCcw } from "lucide-react";

interface MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  themeColor?: string;
}

export default function MetaTagCheckerUI() {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaTags, setMetaTags] = useState<MetaTags | null>(null);

  const isValidPublicUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return false;
      const hostname = parsed.hostname.toLowerCase();
      // Block private/internal IPs and reserved hostnames
      if (
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('172.16.') || hostname.startsWith('172.17.') ||
        hostname.startsWith('172.18.') || hostname.startsWith('172.19.') ||
        hostname.startsWith('172.20.') || hostname.startsWith('172.21.') ||
        hostname.startsWith('172.22.') || hostname.startsWith('172.23.') ||
        hostname.startsWith('172.24.') || hostname.startsWith('172.25.') ||
        hostname.startsWith('172.26.') || hostname.startsWith('172.27.') ||
        hostname.startsWith('172.28.') || hostname.startsWith('172.29.') ||
        hostname.startsWith('172.30.') || hostname.startsWith('172.31.') ||
        hostname.startsWith('169.254.') ||
        hostname === '0.0.0.0' ||
        hostname === '[::1]'
      ) return false;
      return true;
    } catch { return false; }
  };

  const fetchMetaTags = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    // Validate URL to prevent SSRF
    if (!isValidPublicUrl(targetUrl)) {
      setError("Please enter a valid public website URL.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setMetaTags(null);

    try {
      // Use AllOrigins as a free CORS proxy to fetch the HTML
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) throw new Error("Failed to fetch the website");

      const data = await response.json();
      const htmlContent = data.contents;

      if (!htmlContent) throw new Error("No HTML content returned");

      // Parse HTML string in the browser
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");

      const getMetaContent = (nameOrProperty: string): string | undefined => {
        const tag = doc.querySelector(`meta[name="${nameOrProperty}"], meta[property="${nameOrProperty}"]`);
        return tag ? (tag.getAttribute("content") || undefined) : undefined;
      };

      const extractedTags: MetaTags = {
        title: doc.title || getMetaContent("og:title"),
        description: getMetaContent("description"),
        keywords: getMetaContent("keywords"),
        author: getMetaContent("author"),
        ogTitle: getMetaContent("og:title"),
        ogDescription: getMetaContent("og:description"),
        ogImage: getMetaContent("og:image"),
        twitterCard: getMetaContent("twitter:card"),
        twitterTitle: getMetaContent("twitter:title"),
        twitterDescription: getMetaContent("twitter:description"),
        twitterImage: getMetaContent("twitter:image"),
        themeColor: getMetaContent("theme-color"),
      };

      setMetaTags(extractedTags);
    } catch (err) {
      console.error("Meta tag extraction error:", err);
      setError("Failed to fetch meta tags. The website might block automated requests or be unreachable.");
    } finally {
      setIsProcessing(false);
    }
  };

  const MetaItem = ({ label, value, fallback }: { label: string; value?: string; fallback?: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-slate-100/50 last:border-0">
      <span className="text-xs font-bold text-black/50 dark:text-white/50 uppercase tracking-wider w-32 shrink-0 pt-0.5">
        {label}
      </span>
      {value ? (
        <span className="text-sm font-medium text-black dark:text-white dark:text-slate-200 break-all sm:break-normal">
          {value}
        </span>
      ) : (
        <span className="text-sm text-black/40 dark:text-white/40 italic">
          {fallback || "Not specified"}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-2">
          <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-black dark:text-white">Meta Tag Checker</h2>
        <p className="text-sm text-black/50 dark:text-white/50 max-w-lg mx-auto">
          Instantly scan and extract SEO meta tags from any website URL.
        </p>
      </div>

      <form onSubmit={fetchMetaTags} className="max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-black/40 dark:text-white/40" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com"
            className="w-full pl-12 pr-32 py-4 bg-white dark:bg-neutral-950 border-2 border-black/10 dark:border-white/10 rounded-2xl text-black dark:text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
            required
          />
          <button
            type="submit"
            disabled={isProcessing || !url}
            className="absolute right-2 top-2 bottom-2 px-6 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 disabled:bg-black/10 dark:disabled:bg-white/10 disabled:text-black/40 dark:disabled:text-white/40 text-white dark:text-black font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            {isProcessing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Analyze"}
          </button>
        </div>
      </form>

      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl flex items-start gap-3 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {metaTags && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General SEO Tags */}
          <div className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <FileText className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-black dark:text-white">Basic SEO Tags</h3>
            </div>
            <div className="flex flex-col">
              <MetaItem label="Title" value={metaTags.title} />
              <MetaItem label="Description" value={metaTags.description} />
              <MetaItem label="Keywords" value={metaTags.keywords} />
              <MetaItem label="Author" value={metaTags.author} />
              <MetaItem label="Theme Color" value={metaTags.themeColor} />
            </div>
          </div>

          {/* Social Tags (OG & Twitter) */}
          <div className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Twitter className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-black dark:text-white">Social Media Tags</h3>
            </div>
            <div className="flex flex-col">
              <MetaItem label="OG Title" value={metaTags.ogTitle} fallback="Same as title" />
              <MetaItem label="OG Desc" value={metaTags.ogDescription} fallback="Same as description" />

              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-slate-100/50">
                <span className="text-xs font-bold text-black/50 dark:text-white/50 uppercase tracking-wider w-32 shrink-0 pt-0.5">
                  OG Image
                </span>
                {metaTags.ogImage ? (
                  <div className="space-y-2 w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={metaTags.ogImage} alt="OG Preview" className="w-full max-w-[200px] rounded-lg border border-black/10 dark:border-white/10 object-cover" />
                    <p className="text-[10px] text-black/40 dark:text-white/40 break-all">{metaTags.ogImage}</p>
                  </div>
                ) : (
                  <span className="text-sm text-black/40 dark:text-white/40 italic">No image specified</span>
                )}
              </div>

              <MetaItem label="Twitter Card" value={metaTags.twitterCard} fallback="summary" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
