"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  UserCircle,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  ExternalLink,
  Copy,
  LayoutTemplate,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Query } from "appwrite";

// ─── Types ───────────────────────────────────────────────────

interface BioLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

interface BioPage {
  $id: string;
  slug: string;
  ownerId: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  theme: string;
  links: string; // JSON string of BioLink[] in Appwrite
}

type Theme = "light" | "dark" | "blue" | "emerald" | "rose" | "purple";

const THEMES: { id: Theme; label: string; colors: string }[] = [
  { id: "light", label: "Minimal Light", colors: "bg-slate-50 text-slate-900" },
  { id: "dark", label: "Minimal Dark", colors: "bg-slate-900 text-white" },
  { id: "blue", label: "Ocean Blue", colors: "bg-blue-50 text-blue-900" },
  { id: "emerald", label: "Emerald Green", colors: "bg-emerald-50 text-emerald-900" },
  { id: "rose", label: "Soft Rose", colors: "bg-rose-50 text-rose-900" },
  { id: "purple", label: "Deep Purple", colors: "bg-purple-900 text-white" },
];

// ─── Appwrite Config ─────────────────────────────────────────

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "6a789c5430b868b6d118";
const BIO_PAGES_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_BIO_PAGES_COL_ID || "bio_pages";

// ─── Main Component ──────────────────────────────────────────

export default function BioPagesUI() {
  const { user, setShowAuthModal } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasExistingPage, setHasExistingPage] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const [links, setLinks] = useState<BioLink[]>([]);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // ─── Load Data ───────────────────────────────────────────

  const loadBioPage = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { databases } = await import("@/lib/appwrite");
      const res = await databases.listDocuments(DB_ID, BIO_PAGES_COL_ID, [
        Query.equal("ownerId", user.$id),
        Query.limit(1),
      ]);

      if (res.documents.length > 0) {
        const doc = res.documents[0];
        setHasExistingPage(true);
        setPageId(doc.$id);
        setSlug(doc.slug);
        setDisplayName(doc.displayName || "");
        setAvatarUrl(doc.avatarUrl || "");
        setBio(doc.bio || "");
        setTheme((doc.theme as Theme) || "light");

        try {
          setLinks(JSON.parse(doc.links || "[]"));
        } catch {
          setLinks([]);
        }
      } else {
        // Set defaults for new page
        setDisplayName(user.name || "");
        // Simple default slug from name
        const defaultSlug = (user.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        setSlug(defaultSlug);
        setLinks([{ id: "1", title: "My Website", url: "https://" }]);
      }
    } catch (err) {
      console.error("Failed to load bio page:", err);
      // Fallback/ignore if collection doesn't exist yet
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadBioPage();
  }, [user, loadBioPage]);

  // ─── Actions ─────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!slug) {
      setError("Slug is required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { databases, ID_GEN } = await import("@/lib/appwrite");

      const payload = {
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
        ownerId: user.$id,
        displayName,
        avatarUrl,
        bio,
        theme,
        links: JSON.stringify(links.filter((l) => l.title && l.url)),
      };

      if (hasExistingPage && pageId) {
        await databases.updateDocument(DB_ID, BIO_PAGES_COL_ID, pageId, payload);
      } else {
        const res = await databases.createDocument(DB_ID, BIO_PAGES_COL_ID, ID_GEN.unique(), payload);
        setPageId(res.$id);
        setHasExistingPage(true);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Save error:", err);
      const appwriteErr = err as { code?: number };
      if (appwriteErr.code === 409) {
        setError("That unique URL (slug) is already taken. Please choose another one.");
      } else {
        setError("Failed to save your bio page. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const addLink = () => {
    setLinks([...links, { id: Date.now().toString(), title: "", url: "https://" }]);
  };

  const updateLink = (id: string, field: keyof BioLink, value: string) => {
    setLinks(links.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const moveLink = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const newLinks = [...links];
      [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
      setLinks(newLinks);
    } else if (direction === "down" && index < links.length - 1) {
      const newLinks = [...links];
      [newLinks[index + 1], newLinks[index]] = [newLinks[index], newLinks[index + 1]];
      setLinks(newLinks);
    }
  };

  const getPublicUrl = () => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://needtools.app";
    return `${base}/bio/${slug}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getPublicUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Auth Gate ─────────────────────────────────────────

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 mb-4">
          <UserCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Bio Pages</h2>
        <p className="text-black/50 dark:text-white/50 mb-6">
          Sign in to create and manage your free link-in-bio page.
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
        >
          Sign In to Get Started
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Mobile Preview Toggle */}
      <div className="md:hidden flex justify-end mb-4">
        <button
          onClick={() => setShowMobilePreview(!showMobilePreview)}
          className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-lg text-sm font-semibold"
        >
          {showMobilePreview ? (
            <>Hide Preview</>
          ) : (
            <><Eye className="w-4 h-4" /> Show Preview</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* ─── EDITOR SIDE ─── */}
        <div className={`space-y-6 ${showMobilePreview ? 'hidden md:block' : 'block'}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Your Bio Page</h2>
            <p className="text-black/50 dark:text-white/50 text-sm">
              Customize your profile and add your links.
            </p>
          </div>

          {hasExistingPage && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-4">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  Your Public URL
                </p>
                <a
                  href={getPublicUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-emerald-900 dark:text-emerald-100 hover:underline truncate block"
                >
                  {getPublicUrl()}
                </a>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 bg-white dark:bg-neutral-900 rounded-lg shadow-sm shrink-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            {/* Profile Section */}
            <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <UserCircle className="w-5 h-5" /> Profile Settings
              </h3>

              <div>
                <label className="block text-sm font-semibold mb-1">Unique URL Slug</label>
                <div className="flex">
                  <div className="px-3 py-2.5 bg-black/5 dark:bg-white/5 border border-r-0 border-black/10 dark:border-white/10 rounded-l-xl text-black/50 dark:text-white/50 text-sm">
                    needtools.app/bio/
                  </div>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase())}
                    placeholder="my-name"
                    required
                    className="flex-1 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-r-xl px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name or Brand"
                  className="w-full h-11 px-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full h-11 px-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Bio (Optional)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short description about you..."
                  rows={3}
                  className="w-full p-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                />
              </div>
            </div>

            {/* Theme Section */}
            <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5" /> Appearance
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      theme === t.id
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 ring-1 ring-indigo-600"
                        : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border border-black/10 ${t.colors}`} />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Links Section */}
            <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" /> Your Links
                </h3>
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <Plus className="w-4 h-4" /> Add Link
                </button>
              </div>

              <div className="space-y-3">
                {links.length === 0 && (
                  <p className="text-sm text-black/40 dark:text-white/40 text-center py-4">
                    No links added yet. Click "Add Link" above.
                  </p>
                )}

                {links.map((link, index) => (
                  <div key={link.id} className="flex items-start gap-3 p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                    <div className="flex flex-col gap-1 text-black/30 dark:text-white/30 pt-1">
                      <button type="button" onClick={() => moveLink(index, "up")} disabled={index === 0} className="hover:text-black dark:hover:text-white disabled:opacity-30">
                        <GripVertical className="w-4 h-4 rotate-90" />
                      </button>
                      <button type="button" onClick={() => moveLink(index, "down")} disabled={index === links.length - 1} className="hover:text-black dark:hover:text-white disabled:opacity-30">
                        <GripVertical className="w-4 h-4 rotate-90" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Link Title (e.g. My Portfolio)"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, "title", e.target.value)}
                        required
                        className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                      />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateLink(link.id, "url", e.target.value)}
                        required
                        className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLink(link.id)}
                      className="p-2 text-black/40 dark:text-white/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Saved successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>

        {/* ─── PREVIEW SIDE ─── */}
        <div className={`sticky top-24 ${showMobilePreview ? 'block' : 'hidden md:block'}`}>
          <div className="flex items-center justify-center">
            {/* Phone Mockup Wrapper */}
            <div className="relative w-[320px] h-[650px] border-[12px] border-black rounded-[40px] shadow-2xl overflow-hidden bg-white">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-b-2xl mx-16 z-20" />

              {/* Preview Content */}
              <div className={`w-full h-full overflow-y-auto ${THEMES.find(t => t.id === theme)?.colors || 'bg-white text-black'}`}>
                <div className="flex flex-col items-center p-6 pt-12 min-h-full">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={displayName} className="w-24 h-24 rounded-full object-cover mb-4 shadow-sm border-2 border-black/5" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-black/10 flex items-center justify-center mb-4">
                      <UserCircle className="w-12 h-12 opacity-50" />
                    </div>
                  )}

                  <h1 className="text-xl font-bold mb-1 text-center">
                    {displayName || "Your Name"}
                  </h1>

                  {bio && (
                    <p className="text-sm text-center mb-6 opacity-80 max-w-[250px]">
                      {bio}
                    </p>
                  )}

                  {!bio && <div className="h-4" />}

                  <div className="w-full space-y-3 mt-2">
                    {links.filter(l => l.title).length === 0 ? (
                      <div className="h-12 border-2 border-dashed border-current opacity-20 rounded-xl flex items-center justify-center text-sm font-medium">
                        Your Links Appear Here
                      </div>
                    ) : (
                      links.filter(l => l.title).map((link) => (
                        <div
                          key={link.id}
                          className="w-full p-4 rounded-xl text-center text-sm font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-black/10 transition-colors shadow-sm"
                          style={{
                            backgroundColor: theme === 'dark' || theme === 'purple' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                          }}
                        >
                          {link.title}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-auto pt-10 pb-4">
                    <p className="text-[10px] font-medium opacity-50 tracking-widest uppercase">
                      NeedTools Bio
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
