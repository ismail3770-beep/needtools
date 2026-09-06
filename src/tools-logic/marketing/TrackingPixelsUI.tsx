"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Activity,
  Edit2,
  Code2,
  X
} from "lucide-react";
import { Query } from "appwrite";

// ─── Types ───────────────────────────────────────────────────

type PixelProvider = "meta" | "ga4" | "tiktok" | "custom";

interface TrackingPixel {
  $id: string;
  ownerId: string;
  name: string;
  provider: PixelProvider;
  pixelId?: string;
  customScript?: string;
  active: boolean;
  createdAt: string;
}

const PROVIDERS: { id: PixelProvider; name: string; icon: string; placeholder: string; helper: string }[] = [
  { id: "meta", name: "Meta (Facebook) Pixel", icon: "Facebook", placeholder: "e.g. 123456789012345", helper: "Your 15-digit Meta Pixel ID" },
  { id: "ga4", name: "Google Analytics 4", icon: "LineChart", placeholder: "e.g. G-XXXXXXXXXX", helper: "Your GA4 Measurement ID (starts with G-)" },
  { id: "tiktok", name: "TikTok Pixel", icon: "Music2", placeholder: "e.g. C0XXXXXXX", helper: "Your TikTok Pixel ID" },
  { id: "custom", name: "Custom Script", icon: "Code2", placeholder: "<script>...</script>", helper: "Raw HTML/JS script tag to inject" },
];

// ─── Appwrite Config ─────────────────────────────────────────

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "6a789c5430b868b6d118";

// ─── Main Component ──────────────────────────────────────────

export default function TrackingPixelsUI() {
  const { user, setShowAuthModal } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [pixels, setPixels] = useState<TrackingPixel[]>([]);

  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [provider, setProvider] = useState<PixelProvider>("meta");
  const [name, setName] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [customScript, setCustomScript] = useState("");
  const [active, setActive] = useState(true);

  // ─── Load Data ───────────────────────────────────────────

  const loadPixels = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { databases } = await import("@/lib/appwrite");
      const colId = process.env.NEXT_PUBLIC_APPWRITE_TRACKING_PIXELS_COL_ID;
      if (!colId) {
        setIsLoading(false);
        return; // Collection might not exist yet
      }

      const res = await databases.listDocuments(DB_ID, colId, [
        Query.equal("ownerId", user.$id),
        Query.orderDesc("createdAt"),
        Query.limit(50),
      ]);
      setPixels(res.documents as unknown as TrackingPixel[]);
    } catch (err) {
      console.error("Failed to load tracking pixels:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadPixels();
  }, [user, loadPixels]);

  // ─── Actions ─────────────────────────────────────────────

  const handleOpenAdd = () => {
    setEditId(null);
    setProvider("meta");
    setName("");
    setPixelId("");
    setCustomScript("");
    setActive(true);
    setIsAdding(true);
    setError(null);
  };

  const handleOpenEdit = (pixel: TrackingPixel) => {
    setEditId(pixel.$id);
    setProvider(pixel.provider);
    setName(pixel.name);
    setPixelId(pixel.pixelId || "");
    setCustomScript(pixel.customScript || "");
    setActive(pixel.active);
    setIsAdding(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      setError("Please provide a name for this pixel.");
      return;
    }

    if (provider !== "custom" && !pixelId.trim()) {
      setError("Pixel ID is required.");
      return;
    }

    if (provider === "custom" && !customScript.trim()) {
      setError("Custom script is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { databases, ID_GEN } = await import("@/lib/appwrite");
      const colId = process.env.NEXT_PUBLIC_APPWRITE_TRACKING_PIXELS_COL_ID;
      if (!colId) throw new Error("Database not configured yet.");

      const payload = {
        ownerId: user.$id,
        name: name.trim(),
        provider,
        pixelId: provider === "custom" ? null : pixelId.trim(),
        customScript: provider === "custom" ? customScript : null,
        active,
        createdAt: new Date().toISOString(),
      };

      if (editId) {
        // Drop createdAt on update
        const { createdAt, ...updatePayload } = payload;
        await databases.updateDocument(DB_ID, colId, editId, updatePayload);
      } else {
        await databases.createDocument(DB_ID, colId, ID_GEN.unique(), payload);
      }

      await loadPixels();
      setIsAdding(false);
      setEditId(null);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save pixel. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tracking pixel?")) return;

    try {
      const { databases } = await import("@/lib/appwrite");
      const colId = process.env.NEXT_PUBLIC_APPWRITE_TRACKING_PIXELS_COL_ID;
      if (colId) {
        await databases.deleteDocument(DB_ID, colId, id);
        setPixels(pixels.filter((p) => p.$id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete pixel.");
    }
  };

  const handleToggleActive = async (pixel: TrackingPixel) => {
    try {
      const { databases } = await import("@/lib/appwrite");
      const colId = process.env.NEXT_PUBLIC_APPWRITE_TRACKING_PIXELS_COL_ID;
      if (colId) {
        setPixels(pixels.map(p => p.$id === pixel.$id ? { ...p, active: !p.active } : p));
        await databases.updateDocument(DB_ID, colId, pixel.$id, { active: !pixel.active });
      }
    } catch (err) {
      console.error("Toggle error:", err);
      setPixels(pixels.map(p => p.$id === pixel.$id ? { ...p, active: pixel.active } : p));
    }
  };

  // ─── Render ────────────────────────────────────────────

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 mb-4">
          <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Tracking Pixels</h2>
        <p className="text-black/50 dark:text-white/50 mb-6">
          Sign in to manage and deploy tracking pixels for your campaigns.
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

  const selectedProviderInfo = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 mb-4">
          <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Tracking Pixels</h2>
        <p className="text-black/50 dark:text-white/50 max-w-lg mx-auto">
          Manage your Meta, GA4, TikTok, and custom tracking pixels. These pixels can be attached to your shortened links and bio pages to track conversions.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none" />

        <div className="p-6 sm:p-8 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold">Your Pixels</h3>
              <p className="text-sm text-black/50 dark:text-white/50">
                You have {pixels.length} active pixel{pixels.length === 1 ? '' : 's'}
              </p>
            </div>

            {!isAdding && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Pixel
              </button>
            )}
          </div>

          {isAdding && (
            <div className="mb-8 p-5 bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">{editId ? "Edit Pixel" : "Add New Pixel"}</h4>
                <button onClick={handleCancel} className="p-1 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Pixel Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Main Website GA4"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-4 bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Provider</label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value as PixelProvider)}
                      className="w-full h-11 px-4 bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm"
                    >
                      {PROVIDERS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {provider !== "custom" ? (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">{selectedProviderInfo.name} ID</label>
                    <input
                      type="text"
                      required
                      placeholder={selectedProviderInfo.placeholder}
                      value={pixelId}
                      onChange={(e) => setPixelId(e.target.value)}
                      className="w-full h-11 px-4 bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm"
                    />
                    <p className="mt-1.5 text-xs text-black/50 dark:text-white/50">{selectedProviderInfo.helper}</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Custom Script Code</label>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 text-xs rounded-lg mb-2 flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>Warning: Only add scripts from trusted sources. This code will be injected directly into your pages.</p>
                    </div>
                    <textarea
                      required
                      placeholder={selectedProviderInfo.placeholder}
                      value={customScript}
                      onChange={(e) => setCustomScript(e.target.value)}
                      rows={5}
                      className="w-full p-4 font-mono bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm resize-y"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="active-toggle"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                  />
                  <label htmlFor="active-toggle" className="text-sm font-medium">Active (fire this pixel on my links)</label>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {editId ? "Update Pixel" : "Save Pixel"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : pixels.length === 0 ? (
            !isAdding && (
              <div className="text-center py-12 px-4 border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl">
                <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Code2 className="w-6 h-6 text-black/40 dark:text-white/40" />
                </div>
                <h4 className="font-semibold mb-1">No tracking pixels yet</h4>
                <p className="text-sm text-black/50 dark:text-white/50 mb-4">Add your first pixel to start tracking conversions.</p>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
                >
                  Add Pixel
                </button>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {pixels.map((pixel) => {
                const provInfo = PROVIDERS.find(p => p.id === pixel.provider) || PROVIDERS[0];
                return (
                  <div key={pixel.$id} className={`p-4 rounded-xl border transition-colors flex items-center justify-between gap-4 ${pixel.active ? 'bg-white dark:bg-neutral-900 border-black/10 dark:border-white/10' : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent opacity-60'}`}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${pixel.active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40'}`}>
                        {pixel.provider === 'meta' && <Target className="w-5 h-5" />}
                        {pixel.provider === 'ga4' && <Activity className="w-5 h-5" />}
                        {pixel.provider === 'tiktok' && <Target className="w-5 h-5" />}
                        {pixel.provider === 'custom' && <Code2 className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm truncate">{pixel.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
                          <span className="font-medium">{provInfo.name}</span>
                          <span>•</span>
                          <span className="font-mono truncate">{pixel.provider === 'custom' ? 'Custom Script' : pixel.pixelId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleActive(pixel)}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${pixel.active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40' : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10'}`}
                      >
                        {pixel.active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(pixel)}
                        className="p-1.5 text-black/40 hover:text-emerald-600 dark:text-white/40 dark:hover:text-emerald-400 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pixel.$id)}
                        className="p-1.5 text-black/40 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 mt-6 border-t border-black/5 dark:border-white/5">
                <p className="text-xs text-black/40 dark:text-white/40 text-center">
                  💡 Active pixels will be automatically injected into your generated short links and bio pages.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
