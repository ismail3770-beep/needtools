"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  MonitorPlay,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Copy,
  AlertCircle,
  Eye,
  ArrowRight,
  Clock,
  Settings,
  Pencil,
  X
} from "lucide-react";
import { Query, ID } from "appwrite";

// ─── Types ───────────────────────────────────────────────────

interface SplashPage {
  $id: string;
  slug: string;
  ownerId: string;
  name: string;
  destinationUrl: string;
  headline: string;
  subtext: string;
  logoUrl: string;
  bgColor: string;
  countdownSeconds: number;
  skipAllowed: boolean;
  createdAt: string;
}

// ─── Appwrite Config ─────────────────────────────────────────

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "6a789c5430b868b6d118";
const SPLASH_PAGES_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_SPLASH_PAGES_COL_ID || "splash_pages_mock";

// ─── Main Component ──────────────────────────────────────────

export default function SplashPagesUI() {
  const { user, setShowAuthModal } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<SplashPage[]>([]);

  // View states: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');

  // Editor State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [subtext, setSubtext] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);
  const [skipAllowed, setSkipAllowed] = useState(true);

  // ─── Load Data ───────────────────────────────────────────

  const loadPages = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { databases } = await import("@/lib/appwrite");
      const res = await databases.listDocuments(DB_ID, SPLASH_PAGES_COL_ID, [
        Query.equal("ownerId", user.$id),
        Query.orderDesc("createdAt")
      ]);

      setPages(res.documents as unknown as SplashPage[]);
    } catch (err) {
      console.error("Error loading splash pages:", err);
      setError("Failed to load splash pages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPages();
    } else {
      setIsLoading(false);
      setPages([]);
    }
  }, [user, loadPages]);

  // ─── Handlers ────────────────────────────────────────────

  const resetForm = () => {
    setName("");
    setSlug(Math.random().toString(36).substring(2, 8)); // Random 6 char slug
    setDestinationUrl("");
    setHeadline("");
    setSubtext("");
    setLogoUrl("");
    setBgColor("#ffffff");
    setCountdownSeconds(5);
    setSkipAllowed(true);
    setEditingId(null);
    setError(null);
  };

  const handleCreateNew = () => {
    resetForm();
    setView('create');
  };

  const handleEdit = (page: SplashPage) => {
    setName(page.name || "");
    setSlug(page.slug);
    setDestinationUrl(page.destinationUrl);
    setHeadline(page.headline || "");
    setSubtext(page.subtext || "");
    setLogoUrl(page.logoUrl || "");
    setBgColor(page.bgColor || "#ffffff");
    setCountdownSeconds(page.countdownSeconds);
    setSkipAllowed(page.skipAllowed);
    setEditingId(page.$id);
    setView('edit');
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this splash page? This cannot be undone.")) return;

    try {
      const { databases } = await import("@/lib/appwrite");
      await databases.deleteDocument(DB_ID, SPLASH_PAGES_COL_ID, id);
      setPages(pages.filter(p => p.$id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Failed to delete splash page.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!name.trim() || !slug.trim() || !destinationUrl.trim()) {
      setError("Name, Slug, and Destination URL are required.");
      return;
    }

    try {
      new URL(destinationUrl);
    } catch {
      setError("Please enter a valid Destination URL (e.g., https://example.com).");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { databases, ID_GEN } = await import("@/lib/appwrite");

      const payload = {
        ownerId: user.$id,
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""),
        destinationUrl: destinationUrl.trim(),
        headline: headline.trim(),
        subtext: subtext.trim(),
        logoUrl: logoUrl.trim(),
        bgColor: bgColor,
        countdownSeconds: countdownSeconds,
        skipAllowed: skipAllowed,
      };

      if (view === 'create') {
        const doc = await databases.createDocument(
          DB_ID,
          SPLASH_PAGES_COL_ID,
          ID_GEN.unique(),
          { ...payload, createdAt: new Date().toISOString() }
        );
        setPages([doc as unknown as SplashPage, ...pages]);
      } else if (view === 'edit' && editingId) {
        const doc = await databases.updateDocument(
          DB_ID,
          SPLASH_PAGES_COL_ID,
          editingId,
          payload
        );
        setPages(pages.map(p => p.$id === editingId ? (doc as unknown as SplashPage) : p));
      }

      setView('list');
    } catch (err: any) {
      console.error("Error saving splash page:", err);
      if (err.code === 409) {
        setError("This slug is already taken. Please choose another one.");
      } else {
        setError(err.message || "An error occurred while saving.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (slug: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Render: Not Logged In ─────────────────────────────────

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <MonitorPlay className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Create Custom Splash Pages</h2>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
          Sign in to design branded interstitial pages, configure countdowns, and direct traffic.
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  // ─── Render: Loading ───────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-black dark:border-slate-800 dark:border-t-white rounded-full animate-spin mb-4" />
        <p>Loading your splash pages...</p>
      </div>
    );
  }

  // ─── Render: Editor (Create / Edit) ────────────────────────

  if (view === 'create' || view === 'edit') {
    const isDarkBg = bgColor && parseInt(bgColor.replace('#', ''), 16) < 0xffffff / 2;
    const previewTextColor = isDarkBg ? 'text-white' : 'text-slate-900';

    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setView('list')}
          className="flex items-center text-sm text-slate-500 hover:text-black dark:hover:text-white mb-6"
        >
          <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              {view === 'create' ? 'Create Splash Page' : 'Edit Splash Page'}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-start text-sm">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">

              <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-neutral-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Basic Info</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Internal Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Summer Sale Promo"
                    className="w-full rounded-lg border border-slate-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Slug (URL)</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-9 w-12 rounded cursor-pointer border border-slate-200 dark:border-neutral-800 p-0"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-sm outline-none uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-neutral-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Content</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Destination URL</label>
                  <input
                    type="url"
                    required
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="https://example.com/target"
                    className="w-full rounded-lg border border-slate-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Logo URL (Optional)</label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded-lg border border-slate-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Special Offer Inside"
                    className="w-full rounded-lg border border-slate-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Subtext</label>
                  <textarea
                    value={subtext}
                    onChange={(e) => setSubtext(e.target.value)}
                    placeholder="You are being redirected to our partner site."
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4 pb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Behavior</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Countdown (seconds)</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={countdownSeconds}
                      onChange={(e) => setCountdownSeconds(parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors border border-transparent">
                      <input
                        type="checkbox"
                        checked={skipAllowed}
                        onChange={(e) => setSkipAllowed(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black"
                      />
                      <span className="text-sm font-medium">Allow Skip</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save Splash Page</>
                )}
              </button>
            </form>
          </div>

          {/* Live Preview */}
          <div className="hidden lg:block sticky top-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Live Preview
            </h3>
            <div
              className="w-full aspect-[9/16] max-h-[600px] border-[8px] border-slate-900 rounded-[2rem] overflow-hidden relative shadow-xl"
              style={{ backgroundColor: bgColor }}
            >
              <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-xl mx-auto w-1/3" />

              <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center ${previewTextColor}`}>
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="max-w-[120px] max-h-[80px] object-contain mb-8" />
                )}

                {headline && (
                  <h1 className="text-2xl font-bold mb-3">{headline}</h1>
                )}

                {subtext && (
                  <p className="text-sm opacity-80 mb-10 max-w-xs">{subtext}</p>
                )}

                <div className="flex flex-col items-center mt-4">
                  <div className="w-12 h-12 rounded-full border-4 border-current opacity-20 border-t-current flex items-center justify-center mb-4">
                    <span className="text-lg font-bold opacity-100">{countdownSeconds}</span>
                  </div>
                  <p className="text-xs font-semibold opacity-60 uppercase tracking-widest">
                    Redirecting...
                  </p>
                </div>

                {skipAllowed && (
                  <button className="mt-8 px-6 py-2 rounded-full border border-current opacity-60 text-xs font-bold uppercase tracking-wider">
                    Skip Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Dashboard List ────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Your Splash Pages</h2>
          <p className="text-sm text-slate-500">Manage interstitial redirects and branding.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <MonitorPlay className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold mb-2">No splash pages yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Create your first branded interstitial page to display before redirecting visitors to their destination.
          </p>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 px-6 py-2 rounded-xl text-sm font-bold shadow-sm hover:border-black dark:hover:border-white transition-colors"
          >
            <Plus className="w-4 h-4" /> Let's Go
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map((page) => {
            const isCopied = copiedId === page.slug;
            const url = typeof window !== 'undefined' ? `${window.location.origin}/s/${page.slug}` : `/s/${page.slug}`;

            return (
              <div key={page.$id} className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm group hover:border-slate-300 dark:hover:border-neutral-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center border border-slate-100 dark:border-neutral-800"
                      style={{ backgroundColor: page.bgColor || '#f1f5f9' }}
                    >
                      {page.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={page.logoUrl} alt="" className="w-6 h-6 object-contain" />
                      ) : (
                        <MonitorPlay className="w-5 h-5 text-black/50" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base truncate">{page.name}</h3>
                      <a href={page.destinationUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-indigo-600 truncate flex items-center">
                        {page.destinationUrl.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3 ml-1 inline" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(page)}
                      className="p-2 text-slate-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(page.$id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-xs text-slate-500 bg-slate-50 dark:bg-neutral-800 px-2 py-1 rounded">
                      <Clock className="w-3 h-3 mr-1" /> {page.countdownSeconds}s
                    </div>
                    {page.skipAllowed && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Skip</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(page.slug)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {isCopied ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Copied</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> /s/{page.slug}</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
