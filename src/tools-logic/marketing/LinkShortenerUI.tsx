"use client";

import React, { useState } from "react";
import { Link2, Settings2, ShieldCheck, Clock, Copy, CheckCircle2 } from "lucide-react";

export default function LinkShortenerUI() {
  const [longUrl, setLongUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;

    setIsLoading(true);
    setError(null);
    try {
      let targetUrl = longUrl;
      if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = "https://" + targetUrl;
      }

      // Generate a random 6-character alias if none provided
      const finalAlias = alias || Math.random().toString(36).substring(2, 8);
      
      const { databases } = await import("@/lib/appwrite");
      
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "6a789c5430b868b6d118";
      const colId = process.env.NEXT_PUBLIC_APPWRITE_LINKS_COL_ID || "6a9b34076dad77e641a1"; // From setup-links output

      await databases.createDocument(
        dbId,
        colId,
        "unique()",
        {
          alias: finalAlias,
          url: targetUrl,
          createdAt: new Date().toISOString()
        }
      );

      // The frontend URL would depend on the deployment, e.g., window.location.origin
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://needtools.app';
      setShortUrl(`${baseUrl}/l/${finalAlias}`);
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 409) {
        setError("Alias already exists. Please choose another one.");
      } else {
        setError("Failed to shorten link. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setCopied(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 mb-4">
          <Link2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Shorten a long URL</h2>
        <p className="text-black/50 dark:text-white/50">
          Paste your long link below to create a trackable, custom short link.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Background glow similar to screenshot */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-400/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <form onSubmit={handleShorten} className="relative z-10 space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-semibold mb-2">
              Destination URL
            </label>
            <div className="relative">
              <input
                id="url"
                type="url"
                required
                placeholder="https://example.com/very/long/url/path..."
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="w-full h-14 pl-4 pr-32 bg-black/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
              />
              <div className="absolute right-2 top-2 bottom-2">
                <button
                  type="submit"
                  disabled={isLoading || !longUrl}
                  className="h-full px-6 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-black/80 dark:bg-white/10 dark:hover:bg-black/20 dark:hover:bg-white/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
                  ) : (
                    "Shorten"
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            {isAdvancedOpen ? "Hide Advanced Options" : "Show Advanced Options"}
          </button>

          {isAdvancedOpen && (
            <div className="p-5 bg-black/5 border border-slate-100 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div>
                <label htmlFor="alias" className="block text-sm font-semibold mb-1">
                  Custom Alias (Optional)
                </label>
                <div className="flex">
                  <div className="px-4 py-3 bg-black/10 dark:bg-white/10 border border-r-0 border-black/10 dark:border-white/10 rounded-l-xl text-black/50 dark:text-white/50 flex items-center text-sm font-medium">
                    needtools.app/
                  </div>
                  <input
                    id="alias"
                    type="text"
                    placeholder="my-brand"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
                    className="flex-1 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-r-xl px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                 <div className="flex items-center gap-3 p-3 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-950 cursor-not-allowed opacity-60">
                   <ShieldCheck className="w-5 h-5 text-black/40 dark:text-white/40" />
                   <div>
                     <p className="text-sm font-semibold">Password</p>
                     <p className="text-xs text-black/50 dark:text-white/50">Premium only</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3 p-3 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-950 cursor-not-allowed opacity-60">
                   <Clock className="w-5 h-5 text-black/40 dark:text-white/40" />
                   <div>
                     <p className="text-sm font-semibold">Expiration</p>
                     <p className="text-xs text-black/50 dark:text-white/50">Premium only</p>
                   </div>
                 </div>
              </div>
            </div>
          )}
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {shortUrl && (
          <div className="mt-8 p-5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-300">
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">
                Your short link is ready
              </p>
              <a
                href={`https://${shortUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-lg font-bold text-black dark:text-white hover:underline flex items-center gap-2"
              >
                {shortUrl}
              </a>
            </div>
            <button
              onClick={handleCopy}
              className="p-3 bg-white rounded-lg shadow-sm border border-black/10 dark:border-white/10 hover:bg-black/5 dark:bg-white/5 transition-colors group"
            >
              {copied ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Copy className="w-5 h-5 text-black/50 dark:text-white/50 group-hover:text-indigo-600" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
