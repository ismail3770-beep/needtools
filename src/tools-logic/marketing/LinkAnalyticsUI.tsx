"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  BarChart3,
  Plus,
  ArrowLeft,
  Copy,
  CheckCircle2,
  ExternalLink,
  MousePointerClick,
  Users,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Link2,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Query } from "appwrite";

// ─── Types ───────────────────────────────────────────────────

interface TrackedLink {
  $id: string;
  originalUrl: string;
  shortCode: string;
  title: string;
  createdBy: string;
  createdAt: string;
}

interface LinkEvent {
  $id: string;
  linkId: string;
  timestamp: string;
  referrer: string;
  country: string;
  device: string;
  userAgent: string;
}

interface LinkWithStats extends TrackedLink {
  totalClicks: number;
  uniqueClicks: number;
  lastClicked: string | null;
}

type View = "dashboard" | "create" | "detail";

// ─── Appwrite Config ─────────────────────────────────────────

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "6a789c5430b868b6d118";
const LINKS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_ANALYTICS_LINKS_COL_ID || "link_analytics_links";
const EVENTS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_ANALYTICS_EVENTS_COL_ID || "link_analytics_events";

// ─── Helpers ─────────────────────────────────────────────────

function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function truncateUrl(url: string, max = 40): string {
  if (url.length <= max) return url;
  return url.substring(0, max) + "...";
}

function getDeviceIcon(device: string) {
  switch (device.toLowerCase()) {
    case "mobile":
      return <Smartphone className="w-4 h-4" />;
    case "tablet":
      return <Tablet className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
}

function detectDevice(ua: string): string {
  if (/mobile|android|iphone|ipod/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  return "Desktop";
}

// ─── Skeleton Components ─────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-48 mb-2" />
              <div className="h-3 bg-black/5 dark:bg-white/5 rounded w-64" />
            </div>
            <div className="flex gap-6">
              <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-16" />
              <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-16" />
              <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-20 mb-3" />
            <div className="h-7 bg-black/10 dark:bg-white/10 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl h-64" />
    </div>
  );
}

// ─── Simple Bar Chart ────────────────────────────────────────

function BarChartSimple({
  data,
  label,
}: {
  data: { label: string; value: number }[];
  label: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <p className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider mb-4">
        {label}
      </p>
      <div className="flex items-end gap-1 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-[10px] font-medium text-black/50 dark:text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
              {d.value}
            </span>
            <div
              className="w-full bg-emerald-500 dark:bg-emerald-400 rounded-t-sm transition-all duration-300 hover:bg-emerald-600 dark:hover:bg-emerald-300 min-h-[2px]"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
            <span className="text-[9px] text-black/40 dark:text-white/40 mt-1 truncate w-full text-center">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Horizontal Bar List ─────────────────────────────────────

function HorizontalBarList({
  items,
  title,
  icon,
}: {
  items: { label: string; count: number }[];
  title: string;
  icon: React.ReactNode;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <p className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
          {title}
        </p>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-black/30 dark:text-white/30">No data yet</p>
        )}
        {items.slice(0, 5).map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm text-black/70 dark:text-white/70 w-28 truncate shrink-0">
              {item.label || "Direct"}
            </span>
            <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-full h-5 overflow-hidden">
              <div
                className="h-full bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                style={{ width: `${Math.max((item.count / max) * 100, 10)}%` }}
              >
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  {item.count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function LinkAnalyticsUI() {
  const { user, setShowAuthModal } = useAuth();

  const [view, setView] = useState<View>("dashboard");
  const [links, setLinks] = useState<LinkWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Detail view state
  const [selectedLink, setSelectedLink] = useState<LinkWithStats | null>(null);
  const [events, setEvents] = useState<LinkEvent[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ─── Fetch Links ─────────────────────────────────────────

  const fetchLinks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const { databases } = await import("@/lib/appwrite");

      const linksRes = await databases.listDocuments(DB_ID, LINKS_COL_ID, [
        Query.equal("createdBy", user.$id),
        Query.orderDesc("createdAt"),
        Query.limit(100),
      ]);

      const linksWithStats: LinkWithStats[] = await Promise.all(
        linksRes.documents.map(async (doc) => {
          try {
            const eventsRes = await databases.listDocuments(DB_ID, EVENTS_COL_ID, [
              Query.equal("linkId", doc.$id),
              Query.limit(5000),
            ]);

            const uniqueUAs = new Set(eventsRes.documents.map((e) => e.userAgent));
            const sorted = eventsRes.documents.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

            return {
              $id: doc.$id,
              originalUrl: doc.originalUrl,
              shortCode: doc.shortCode,
              title: doc.title,
              createdBy: doc.createdBy,
              createdAt: doc.createdAt || doc.$createdAt,
              totalClicks: eventsRes.documents.length,
              uniqueClicks: uniqueUAs.size,
              lastClicked: sorted.length > 0 ? sorted[0].timestamp : null,
            };
          } catch {
            return {
              $id: doc.$id,
              originalUrl: doc.originalUrl,
              shortCode: doc.shortCode,
              title: doc.title,
              createdBy: doc.createdBy,
              createdAt: doc.createdAt || doc.$createdAt,
              totalClicks: 0,
              uniqueClicks: 0,
              lastClicked: null,
            };
          }
        })
      );

      setLinks(linksWithStats);
    } catch (err) {
      console.error("Failed to fetch links:", err);
      setError("Failed to load your links. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchLinks();
  }, [user, fetchLinks]);

  // ─── Create Link ─────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newUrl) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      let url = newUrl.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      const shortCode = generateShortCode();
      const { databases, ID_GEN } = await import("@/lib/appwrite");

      await databases.createDocument(DB_ID, LINKS_COL_ID, ID_GEN.unique(), {
        originalUrl: url,
        shortCode,
        title: newTitle.trim() || new URL(url).hostname,
        createdBy: user.$id,
        createdAt: new Date().toISOString(),
      });

      setNewUrl("");
      setNewTitle("");
      setView("dashboard");
      await fetchLinks();
    } catch (err: unknown) {
      console.error("Create link error:", err);
      const appwriteErr = err as { code?: number };
      if (appwriteErr.code === 409) {
        setCreateError("A link with this short code already exists. Please try again.");
      } else {
        setCreateError("Failed to create tracked link. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  // ─── View Detail ─────────────────────────────────────────

  const openDetail = async (link: LinkWithStats) => {
    setSelectedLink(link);
    setView("detail");
    setIsLoadingDetail(true);

    try {
      const { databases } = await import("@/lib/appwrite");
      const eventsRes = await databases.listDocuments(DB_ID, EVENTS_COL_ID, [
        Query.equal("linkId", link.$id),
        Query.orderDesc("timestamp"),
        Query.limit(5000),
      ]);

      setEvents(
        eventsRes.documents.map((d) => ({
          $id: d.$id,
          linkId: d.linkId,
          timestamp: d.timestamp,
          referrer: d.referrer || "",
          country: d.country || "Unknown",
          device: d.device || detectDevice(d.userAgent || ""),
          userAgent: d.userAgent || "",
        }))
      );
    } catch (err) {
      console.error("Failed to load events:", err);
      setEvents([]);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ─── Delete Link ─────────────────────────────────────────

  const handleDelete = async (linkId: string) => {
    if (!confirm("Delete this tracked link and all its analytics data?")) return;

    try {
      const { databases } = await import("@/lib/appwrite");

      // Delete events first
      const eventsRes = await databases.listDocuments(DB_ID, EVENTS_COL_ID, [
        Query.equal("linkId", linkId),
        Query.limit(5000),
      ]);
      await Promise.all(
        eventsRes.documents.map((e) => databases.deleteDocument(DB_ID, EVENTS_COL_ID, e.$id))
      );

      // Delete the link
      await databases.deleteDocument(DB_ID, LINKS_COL_ID, linkId);

      setLinks((prev) => prev.filter((l) => l.$id !== linkId));
      if (selectedLink?.$id === linkId) {
        setView("dashboard");
        setSelectedLink(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete link. Please try again.");
    }
  };

  // ─── Copy short link ────────────────────────────────────

  const copyShortLink = (shortCode: string, id: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://needtools.app";
    navigator.clipboard.writeText(`${baseUrl}/t/${shortCode}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Analytics Derivations ─────────────────────────────

  function getClicksOverTime(evts: LinkEvent[]): { label: string; value: number }[] {
    const buckets: Record<string, number> = {};
    const now = new Date();

    // Last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      buckets[key] = 0;
    }

    evts.forEach((e) => {
      const d = new Date(e.timestamp);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (key in buckets) buckets[key]++;
    });

    return Object.entries(buckets).map(([label, value]) => ({ label, value }));
  }

  function getTopReferrers(evts: LinkEvent[]): { label: string; count: number }[] {
    const counts: Record<string, number> = {};
    evts.forEach((e) => {
      const ref = e.referrer ? new URL(e.referrer).hostname : "Direct";
      counts[ref] = (counts[ref] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  function getDeviceBreakdown(evts: LinkEvent[]): { label: string; count: number }[] {
    const counts: Record<string, number> = {};
    evts.forEach((e) => {
      const dev = e.device || "Unknown";
      counts[dev] = (counts[dev] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  function getCountryBreakdown(evts: LinkEvent[]): { label: string; count: number }[] {
    const counts: Record<string, number> = {};
    evts.forEach((e) => {
      const c = e.country || "Unknown";
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  // ─── Auth Gate ─────────────────────────────────────────

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 mb-4">
          <BarChart3 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Link Analytics</h2>
        <p className="text-black/50 dark:text-white/50 mb-6">
          Sign in to create tracked links and view analytics.
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

  // ─── Create View ───────────────────────────────────────

  if (view === "create") {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <button
          onClick={() => setView("dashboard")}
          className="flex items-center gap-2 text-sm font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 mb-4">
            <Plus className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Create Tracked Link</h2>
          <p className="text-black/50 dark:text-white/50">
            Paste a URL to generate a trackable short link with full analytics.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 blur-3xl rounded-full pointer-events-none" />

          <form onSubmit={handleCreate} className="relative z-10 space-y-5">
            <div>
              <label htmlFor="la-url" className="block text-sm font-semibold mb-2">
                Destination URL
              </label>
              <input
                id="la-url"
                type="url"
                required
                placeholder="https://example.com/your-page"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full h-14 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="la-title" className="block text-sm font-semibold mb-2">
                Link Title <span className="text-black/30 dark:text-white/30">(optional)</span>
              </label>
              <input
                id="la-title"
                type="text"
                placeholder="My Campaign Link"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full h-12 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating || !newUrl}
              className="w-full h-12 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-black/80 dark:hover:bg-white/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <Link2 className="w-4 h-4" /> Create Tracked Link
                </>
              )}
            </button>
          </form>

          {createError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center font-medium flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> {createError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Detail View ───────────────────────────────────────

  if (view === "detail" && selectedLink) {
    const shortUrl = `${typeof window !== "undefined" ? window.location.origin : "https://needtools.app"}/t/${selectedLink.shortCode}`;

    return (
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={() => {
            setView("dashboard");
            setSelectedLink(null);
          }}
          className="flex items-center gap-2 text-sm font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight mb-1">{selectedLink.title}</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={selectedLink.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              {truncateUrl(selectedLink.originalUrl, 60)}
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => copyShortLink(selectedLink.shortCode, selectedLink.$id)}
              className="text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              {copiedId === selectedLink.$id ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> {shortUrl}
                </>
              )}
            </button>
          </div>
        </div>

        {isLoadingDetail ? (
          <DetailSkeleton />
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 text-black/50 dark:text-white/50 mb-2">
                  <MousePointerClick className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Clicks</span>
                </div>
                <p className="text-3xl font-bold">{selectedLink.totalClicks}</p>
              </div>
              <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 text-black/50 dark:text-white/50 mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Unique Clicks</span>
                </div>
                <p className="text-3xl font-bold">{selectedLink.uniqueClicks}</p>
              </div>
              <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 text-black/50 dark:text-white/50 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Last Clicked</span>
                </div>
                <p className="text-lg font-bold">
                  {selectedLink.lastClicked ? timeAgo(selectedLink.lastClicked) : "Never"}
                </p>
              </div>
            </div>

            {/* Clicks Over Time Chart */}
            <div className="p-6 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl mb-6">
              <BarChartSimple data={getClicksOverTime(events)} label="Clicks — Last 14 Days" />
            </div>

            {/* Breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
                <HorizontalBarList
                  items={getTopReferrers(events)}
                  title="Top Referrers"
                  icon={<ExternalLink className="w-4 h-4 text-black/40 dark:text-white/40" />}
                />
              </div>
              <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
                <HorizontalBarList
                  items={getDeviceBreakdown(events)}
                  title="Devices"
                  icon={<Monitor className="w-4 h-4 text-black/40 dark:text-white/40" />}
                />
              </div>
              <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
                <HorizontalBarList
                  items={getCountryBreakdown(events)}
                  title="Countries"
                  icon={<Globe className="w-4 h-4 text-black/40 dark:text-white/40" />}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── Dashboard View ────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 mb-3">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Your Tracked Links</h2>
          <p className="text-black/50 dark:text-white/50 text-sm mt-1">
            Click any link to view detailed analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLinks}
            disabled={isLoading}
            className="p-2.5 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setView("create")}
            className="px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> New Link
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : links.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <Link2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No tracked links yet</h3>
          <p className="text-sm text-black/50 dark:text-white/50 max-w-sm mb-6">
            Create your first tracked link to start collecting click analytics.
          </p>
          <button
            onClick={() => setView("create")}
            className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Create Your First Link
          </button>
        </div>
      ) : (
        /* Links List */
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.$id}
              className="group p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-300 cursor-pointer"
              onClick={() => openDetail(link)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-xs text-black/40 dark:text-white/40 truncate">
                    {truncateUrl(link.originalUrl, 50)}
                  </p>
                </div>
                <div className="flex items-center gap-5 shrink-0">
                  <div className="text-center">
                    <p className="text-lg font-bold">{link.totalClicks}</p>
                    <p className="text-[10px] text-black/40 dark:text-white/40 uppercase tracking-wider">
                      Clicks
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{link.uniqueClicks}</p>
                    <p className="text-[10px] text-black/40 dark:text-white/40 uppercase tracking-wider">
                      Unique
                    </p>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs font-medium text-black/60 dark:text-white/60">
                      {link.lastClicked ? timeAgo(link.lastClicked) : "—"}
                    </p>
                    <p className="text-[10px] text-black/40 dark:text-white/40 uppercase tracking-wider">
                      Last Click
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyShortLink(link.shortCode, link.$id);
                      }}
                      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Copy short link"
                    >
                      {copiedId === link.$id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-black/40 dark:text-white/40" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(link.$id);
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete link"
                    >
                      <Trash2 className="w-4 h-4 text-black/40 dark:text-white/40 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
