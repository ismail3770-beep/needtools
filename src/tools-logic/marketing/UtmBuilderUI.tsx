"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Link2,
  Copy,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface UtmParams {
  websiteUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

interface RecentUrl {
  id: string;
  url: string;
  label: string;
  createdAt: number;
}

const STORAGE_KEY = "needtools_utm_recent";
const MAX_RECENT = 5;

function loadRecentUrls(): RecentUrl[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RecentUrl[];
  } catch {
    return [];
  }
}

function saveRecentUrls(urls: RecentUrl[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls.slice(0, MAX_RECENT)));
  } catch {
    // localStorage may be unavailable
  }
}

function isValidUrl(value: string): boolean {
  if (!value.trim()) return true; // empty is not "invalid", just incomplete
  try {
    const withProtocol =
      value.startsWith("http://") || value.startsWith("https://")
        ? value
        : "https://" + value;
    const url = new URL(withProtocol);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

function buildUtmUrl(params: UtmParams): string | null {
  const { websiteUrl, source, medium, campaign, term, content } = params;
  if (!websiteUrl.trim() || !source.trim() || !medium.trim() || !campaign.trim()) {
    return null;
  }

  let base = websiteUrl.trim();
  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    base = "https://" + base;
  }

  try {
    const url = new URL(base);
    url.searchParams.set("utm_source", source.trim());
    url.searchParams.set("utm_medium", medium.trim());
    url.searchParams.set("utm_campaign", campaign.trim());
    if (term.trim()) url.searchParams.set("utm_term", term.trim());
    if (content.trim()) url.searchParams.set("utm_content", content.trim());
    return url.toString();
  } catch {
    return null;
  }
}

export default function UtmBuilderUI() {
  const [params, setParams] = useState<UtmParams>({
    websiteUrl: "",
    source: "",
    medium: "",
    campaign: "",
    term: "",
    content: "",
  });
  const [copied, setCopied] = useState(false);
  const [recentUrls, setRecentUrls] = useState<RecentUrl[]>([]);
  const [copiedRecentId, setCopiedRecentId] = useState<string | null>(null);

  useEffect(() => {
    setRecentUrls(loadRecentUrls());
  }, []);

  const urlValid = useMemo(() => isValidUrl(params.websiteUrl), [params.websiteUrl]);
  const generatedUrl = useMemo(() => {
    if (!urlValid) return null;
    return buildUtmUrl(params);
  }, [params, urlValid]);

  const requiredFieldsFilled =
    params.websiteUrl.trim() !== "" &&
    params.source.trim() !== "" &&
    params.medium.trim() !== "" &&
    params.campaign.trim() !== "";

  const handleChange = useCallback(
    (field: keyof UtmParams) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setParams((prev) => ({ ...prev, [field]: e.target.value }));
      setCopied(false);
    },
    []
  );

  const handleCopy = useCallback(() => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Save to recent
    const entry: RecentUrl = {
      id: crypto.randomUUID(),
      url: generatedUrl,
      label: `${params.source} / ${params.medium} / ${params.campaign}`,
      createdAt: Date.now(),
    };
    const updated = [entry, ...recentUrls.filter((r) => r.url !== generatedUrl)].slice(
      0,
      MAX_RECENT
    );
    setRecentUrls(updated);
    saveRecentUrls(updated);
  }, [generatedUrl, params.source, params.medium, params.campaign, recentUrls]);

  const handleReset = useCallback(() => {
    setParams({
      websiteUrl: "",
      source: "",
      medium: "",
      campaign: "",
      term: "",
      content: "",
    });
    setCopied(false);
  }, []);

  const handleCopyRecent = useCallback(
    (url: string, id: string) => {
      navigator.clipboard.writeText(url);
      setCopiedRecentId(id);
      setTimeout(() => setCopiedRecentId(null), 2000);
    },
    []
  );

  const handleDeleteRecent = useCallback(
    (id: string) => {
      const updated = recentUrls.filter((r) => r.id !== id);
      setRecentUrls(updated);
      saveRecentUrls(updated);
    },
    [recentUrls]
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 mb-4">
          <Link2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Build your UTM link</h2>
        <p className="text-black/50 dark:text-white/50 max-w-lg mx-auto">
          UTM parameters are tags added to your URL so analytics tools like Google
          Analytics can track where your traffic comes from. Fill in the fields below to
          generate a tagged campaign link.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm p-6 sm:p-8 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Website URL */}
            <div>
              <label htmlFor="utm-url" className="block text-sm font-semibold mb-1.5">
                Website URL <span className="text-red-500">*</span>
              </label>
              <input
                id="utm-url"
                type="text"
                required
                placeholder="https://example.com/landing-page"
                value={params.websiteUrl}
                onChange={handleChange("websiteUrl")}
                className={`w-full h-12 px-4 bg-black/5 dark:bg-white/5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm ${
                  !urlValid
                    ? "border-red-400 dark:border-red-500"
                    : "border-black/10 dark:border-white/10"
                }`}
              />
              {!urlValid && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Please enter a valid URL (e.g. https://example.com)
                </p>
              )}
            </div>

            {/* Source + Medium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="utm-source" className="block text-sm font-semibold mb-1.5">
                  Campaign Source <span className="text-red-500">*</span>
                </label>
                <input
                  id="utm-source"
                  type="text"
                  required
                  placeholder="e.g. google, newsletter"
                  value={params.source}
                  onChange={handleChange("source")}
                  className="w-full h-12 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm"
                />
                <p className="mt-1 text-xs text-black/40 dark:text-white/40">
                  utm_source &mdash; identifies the traffic source
                </p>
              </div>
              <div>
                <label htmlFor="utm-medium" className="block text-sm font-semibold mb-1.5">
                  Campaign Medium <span className="text-red-500">*</span>
                </label>
                <input
                  id="utm-medium"
                  type="text"
                  required
                  placeholder="e.g. cpc, email, social"
                  value={params.medium}
                  onChange={handleChange("medium")}
                  className="w-full h-12 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm"
                />
                <p className="mt-1 text-xs text-black/40 dark:text-white/40">
                  utm_medium &mdash; identifies the marketing medium
                </p>
              </div>
            </div>

            {/* Campaign Name */}
            <div>
              <label htmlFor="utm-campaign" className="block text-sm font-semibold mb-1.5">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                id="utm-campaign"
                type="text"
                required
                placeholder="e.g. spring_sale, product_launch"
                value={params.campaign}
                onChange={handleChange("campaign")}
                className="w-full h-12 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm"
              />
              <p className="mt-1 text-xs text-black/40 dark:text-white/40">
                utm_campaign &mdash; identifies a specific campaign
              </p>
            </div>

            {/* Term + Content (optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="utm-term" className="block text-sm font-semibold mb-1.5">
                  Campaign Term{" "}
                  <span className="text-black/30 dark:text-white/30 font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="utm-term"
                  type="text"
                  placeholder="e.g. running+shoes"
                  value={params.term}
                  onChange={handleChange("term")}
                  className="w-full h-12 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm"
                />
                <p className="mt-1 text-xs text-black/40 dark:text-white/40">
                  utm_term &mdash; paid search keywords
                </p>
              </div>
              <div>
                <label htmlFor="utm-content" className="block text-sm font-semibold mb-1.5">
                  Campaign Content{" "}
                  <span className="text-black/30 dark:text-white/30 font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="utm-content"
                  type="text"
                  placeholder="e.g. banner_ad, text_link"
                  value={params.content}
                  onChange={handleChange("content")}
                  className="w-full h-12 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm"
                />
                <p className="mt-1 text-xs text-black/40 dark:text-white/40">
                  utm_content &mdash; differentiates ads or links
                </p>
              </div>
            </div>

            {/* Reset button */}
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 text-sm font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear all fields
            </button>
          </div>
        </div>

        {/* Right: Live Preview + Copy */}
        <div className="space-y-6">
          {/* Generated URL card */}
          <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm p-6 sm:p-8">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3 uppercase tracking-wider">
              Generated URL
            </p>

            {generatedUrl ? (
              <>
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl break-all">
                  <p className="text-sm font-mono text-black dark:text-white leading-relaxed">
                    {generatedUrl}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="mt-4 w-full h-12 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="p-4 bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 rounded-xl text-center">
                <p className="text-sm text-black/40 dark:text-white/40">
                  {!urlValid
                    ? "Fix the URL above to see a preview"
                    : !requiredFieldsFilled
                    ? "Fill in all required fields to generate your UTM link"
                    : "Generating..."}
                </p>
              </div>
            )}
          </div>

          {/* Parameter breakdown */}
          {generatedUrl && (
            <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm p-6">
              <p className="text-xs font-semibold text-black/50 dark:text-white/50 mb-3 uppercase tracking-wider">
                Parameter Breakdown
              </p>
              <div className="space-y-2">
                {[
                  { label: "utm_source", value: params.source },
                  { label: "utm_medium", value: params.medium },
                  { label: "utm_campaign", value: params.campaign },
                  ...(params.term.trim()
                    ? [{ label: "utm_term", value: params.term }]
                    : []),
                  ...(params.content.trim()
                    ? [{ label: "utm_content", value: params.content }]
                    : []),
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]"
                  >
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                      {item.label}
                    </span>
                    <span className="text-black/70 dark:text-white/70 truncate ml-4">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent URLs */}
          {recentUrls.length > 0 && (
            <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-black/40 dark:text-white/40" />
                <p className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                  Recent URLs
                </p>
              </div>
              <div className="space-y-2">
                {recentUrls.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 p-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-black/60 dark:text-white/60 truncate">
                        {entry.label}
                      </p>
                      <p className="text-xs font-mono text-black/40 dark:text-white/40 truncate">
                        {entry.url}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyRecent(entry.url, entry.id)}
                      className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
                      title="Copy URL"
                    >
                      {copiedRecentId === entry.id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-black/40 dark:text-white/40" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteRecent(entry.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-black/30 dark:text-white/30 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
