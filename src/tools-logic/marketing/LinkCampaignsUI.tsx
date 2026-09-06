"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  FolderKanban,
  Plus,
  ArrowLeft,
  MousePointerClick,
  Users,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Trash2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Settings,
  Pencil,
  BarChart3
} from "lucide-react";
import { Query } from "appwrite";

// ─── Types ───────────────────────────────────────────────────

interface Campaign {
  $id: string;
  ownerId: string;
  name: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  linkIds: string[];
  createdAt: string;
}

interface TrackedLink {
  $id: string;
  originalUrl: string;
  shortCode: string;
  title: string;
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

interface CampaignWithStats extends Campaign {
  totalClicks: number;
  uniqueClicks: number;
  lastClicked: string | null;
}

type View = "dashboard" | "create" | "edit" | "detail";

// ─── Appwrite Config ─────────────────────────────────────────

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "6a789c5430b868b6d118";
const CAMPAIGNS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_CAMPAIGNS_COL_ID || "campaigns_mock";
const LINKS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_ANALYTICS_LINKS_COL_ID || "link_analytics_links";
const EVENTS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_ANALYTICS_EVENTS_COL_ID || "link_analytics_events";

// ─── Helpers ─────────────────────────────────────────────────

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

function detectDevice(ua: string): string {
  if (/mobile|android|iphone|ipod/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  return "Desktop";
}

// ─── Simple Bar Chart ────────────────────────────────────────

function BarChartSimple({ data, label }: { data: { label: string; value: number }[]; label: string }) {
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

function HorizontalBarList({ items, title, icon }: { items: { label: string; count: number }[]; title: string; icon: React.ReactNode }) {
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

export default function LinkCampaignsUI() {
  const { user, setShowAuthModal } = useAuth();

  const [view, setView] = useState<View>("dashboard");
  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);
  const [userLinks, setUserLinks] = useState<TrackedLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Detail view state
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithStats | null>(null);
  const [events, setEvents] = useState<LinkEvent[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // ─── Load Data ───────────────────────────────────────────

  const loadInitialData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const { databases } = await import("@/lib/appwrite");

      // 1. Fetch user's links
      const linksRes = await databases.listDocuments(DB_ID, LINKS_COL_ID, [
        Query.equal("createdBy", user.$id),
        Query.limit(500),
      ]);
      setUserLinks(linksRes.documents as unknown as TrackedLink[]);

      // 2. Fetch user's campaigns
      const campaignsRes = await databases.listDocuments(DB_ID, CAMPAIGNS_COL_ID, [
        Query.equal("ownerId", user.$id),
        Query.orderDesc("createdAt"),
        Query.limit(100),
      ]);

      const campaignsWithStats: CampaignWithStats[] = await Promise.all(
        campaignsRes.documents.map(async (doc) => {
          let totalClicks = 0;
          let uniqueClicks = 0;
          let lastClicked: string | null = null;

          const linkIds = doc.linkIds || [];

          if (linkIds.length > 0) {
            try {
              // Appwrite querying with multiple values using Query.equal array
              const evRes = await databases.listDocuments(DB_ID, EVENTS_COL_ID, [
                Query.equal("linkId", linkIds),
                Query.limit(5000),
              ]);

              const evts = evRes.documents;
              const uniqueUAs = new Set(evts.map((e) => e.userAgent));
              const sorted = [...evts].sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );

              totalClicks = evts.length;
              uniqueClicks = uniqueUAs.size;
              if (sorted.length > 0) lastClicked = sorted[0].timestamp;
            } catch (e) {
              console.error("Error fetching stats for campaign", doc.$id, e);
            }
          }

          return {
            $id: doc.$id,
            ownerId: doc.ownerId,
            name: doc.name,
            description: doc.description || "",
            startDate: doc.startDate || null,
            endDate: doc.endDate || null,
            linkIds: doc.linkIds || [],
            createdAt: doc.createdAt || doc.$createdAt,
            totalClicks,
            uniqueClicks,
            lastClicked,
          };
        })
      );

      setCampaigns(campaignsWithStats);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
      setError("Failed to load campaigns. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadInitialData();
  }, [user, loadInitialData]);

  // ─── Handlers ────────────────────────────────────────────

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setSelectedLinkIds([]);
    setEditingId(null);
    setError(null);
  };

  const handleCreateNew = () => {
    resetForm();
    setView("create");
  };

  const handleEdit = (campaign: CampaignWithStats) => {
    setName(campaign.name);
    setDescription(campaign.description || "");
    setStartDate(campaign.startDate ? campaign.startDate.split("T")[0] : "");
    setEndDate(campaign.endDate ? campaign.endDate.split("T")[0] : "");
    setSelectedLinkIds(campaign.linkIds || []);
    setEditingId(campaign.$id);
    setView("edit");
  };

  const toggleLinkSelection = (linkId: string) => {
    setSelectedLinkIds(prev =>
      prev.includes(linkId)
        ? prev.filter(id => id !== linkId)
        : [...prev, linkId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      setError("Campaign Name is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { databases, ID_GEN } = await import("@/lib/appwrite");

      const payload = {
        ownerId: user.$id,
        name: name.trim(),
        description: description.trim(),
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        linkIds: selectedLinkIds,
      };

      if (view === "create") {
        await databases.createDocument(
          DB_ID,
          CAMPAIGNS_COL_ID,
          ID_GEN.unique(),
          { ...payload, createdAt: new Date().toISOString() }
        );
      } else if (view === "edit" && editingId) {
        await databases.updateDocument(
          DB_ID,
          CAMPAIGNS_COL_ID,
          editingId,
          payload
        );
      }

      await loadInitialData();
      setView("dashboard");
    } catch (err: any) {
      console.error("Error saving campaign:", err);
      setError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign? The links and analytics data will NOT be deleted.")) return;
    try {
      const { databases } = await import("@/lib/appwrite");
      await databases.deleteDocument(DB_ID, CAMPAIGNS_COL_ID, id);
      setCampaigns(prev => prev.filter(c => c.$id !== id));
      if (selectedCampaign?.$id === id) {
        setView("dashboard");
        setSelectedCampaign(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete campaign.");
    }
  };

  // ─── Detail View Handlers ───────────────────────────────

  const openDetail = async (campaign: CampaignWithStats) => {
    setSelectedCampaign(campaign);
    setView("detail");
    setIsLoadingDetail(true);

    try {
      const { databases } = await import("@/lib/appwrite");
      let allEvents: LinkEvent[] = [];

      if (campaign.linkIds && campaign.linkIds.length > 0) {
        const eventsRes = await databases.listDocuments(DB_ID, EVENTS_COL_ID, [
          Query.equal("linkId", campaign.linkIds),
          Query.orderDesc("timestamp"),
          Query.limit(5000),
        ]);

        allEvents = eventsRes.documents.map((d) => ({
          $id: d.$id,
          linkId: d.linkId,
          timestamp: d.timestamp,
          referrer: d.referrer || "",
          country: d.country || "Unknown",
          device: d.device || detectDevice(d.userAgent || ""),
          userAgent: d.userAgent || "",
        }));
      }
      setEvents(allEvents);
    } catch (err) {
      console.error("Failed to load events:", err);
      setEvents([]);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ─── Analytics Derivations ─────────────────────────────

  function getClicksOverTime(evts: LinkEvent[]): { label: string; value: number }[] {
    const buckets: Record<string, number> = {};
    const now = new Date();
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
    return Object.entries(counts).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }

  function getDeviceBreakdown(evts: LinkEvent[]): { label: string; count: number }[] {
    const counts: Record<string, number> = {};
    evts.forEach((e) => {
      const dev = e.device || "Unknown";
      counts[dev] = (counts[dev] || 0) + 1;
    });
    return Object.entries(counts).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }

  function getCountryBreakdown(evts: LinkEvent[]): { label: string; count: number }[] {
    const counts: Record<string, number> = {};
    evts.forEach((e) => {
      const c = e.country || "Unknown";
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }

  function getLinkPerformanceBreakdown(evts: LinkEvent[], linkIds: string[]) {
    const counts: Record<string, number> = {};
    linkIds.forEach(id => counts[id] = 0);
    evts.forEach(e => {
      if (e.linkId in counts) counts[e.linkId]++;
    });

    return linkIds.map(id => {
      const link = userLinks.find(l => l.$id === id);
      return {
        id,
        title: link?.title || 'Unknown Link',
        shortCode: link?.shortCode || '-',
        url: link?.originalUrl || '#',
        clicks: counts[id] || 0
      };
    }).sort((a, b) => b.clicks - a.clicks);
  }

  // ─── Auth Gate ─────────────────────────────────────────

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 mb-4">
          <FolderKanban className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Link Campaigns</h2>
        <p className="text-black/50 dark:text-white/50 mb-6">
          Sign in to group tracked links and view aggregate performance.
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

  // ─── Loading State ─────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p>Loading campaigns...</p>
      </div>
    );
  }

  // ─── Editor View (Create / Edit) ───────────────────────

  if (view === "create" || view === "edit") {
    return (
      <div className="max-w-3xl mx-auto py-4">
        <button
          onClick={() => setView("dashboard")}
          className="flex items-center gap-2 text-sm font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">
            {view === "create" ? "Create Campaign" : "Edit Campaign"}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center text-sm">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q3 Summer Promo"
                  className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes about this campaign..."
                  rows={2}
                  className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Select Links for this Campaign</h3>
              {userLinks.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm">
                  You haven't created any tracked links yet. Go to the Link Analytics tool to create some first.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto border border-black/10 dark:border-white/10 rounded-lg divide-y divide-black/10 dark:divide-white/10">
                  {userLinks.map(link => (
                    <label key={link.$id} className="flex items-center p-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedLinkIds.includes(link.$id)}
                        onChange={() => toggleLinkSelection(link.$id)}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{link.title}</p>
                        <p className="text-xs text-black/50 dark:text-white/50 truncate">{link.originalUrl}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Campaign"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Detail View ─────────────────────────────────────────

  if (view === "detail" && selectedCampaign) {
    const linkPerformance = getLinkPerformanceBreakdown(events, selectedCampaign.linkIds);

    return (
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={() => {
            setView("dashboard");
            setSelectedCampaign(null);
          }}
          className="flex items-center gap-2 text-sm font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">{selectedCampaign.name}</h2>
            <p className="text-sm text-black/50 dark:text-white/50 max-w-xl">
              {selectedCampaign.description || "No description provided."}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-black/40 dark:text-white/40">
              {selectedCampaign.startDate && (
                <span>Started: {new Date(selectedCampaign.startDate).toLocaleDateString()}</span>
              )}
              {selectedCampaign.endDate && (
                <span>Ends: {new Date(selectedCampaign.endDate).toLocaleDateString()}</span>
              )}
              <span>{selectedCampaign.linkIds.length} Links Attached</span>
            </div>
          </div>
          <button
            onClick={() => handleEdit(selectedCampaign)}
            className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
        </div>

        {isLoadingDetail ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl h-24" />
              ))}
            </div>
            <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl h-64" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 text-black/50 dark:text-white/50 mb-2">
                  <MousePointerClick className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Clicks</span>
                </div>
                <p className="text-3xl font-bold">{selectedCampaign.totalClicks}</p>
              </div>
              <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 text-black/50 dark:text-white/50 mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Unique Clicks</span>
                </div>
                <p className="text-3xl font-bold">{selectedCampaign.uniqueClicks}</p>
              </div>
              <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 text-black/50 dark:text-white/50 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Last Clicked</span>
                </div>
                <p className="text-lg font-bold">
                  {selectedCampaign.lastClicked ? timeAgo(selectedCampaign.lastClicked) : "Never"}
                </p>
              </div>
            </div>

            {/* Clicks Over Time Chart */}
            <div className="p-6 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl mb-6">
              <BarChartSimple data={getClicksOverTime(events)} label="Campaign Clicks — Last 14 Days" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Link Performance Table */}
              <div className="lg:col-span-2 p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
                <h3 className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider mb-4">Link Performance Breakdown</h3>
                <div className="space-y-3">
                  {linkPerformance.map((lp, idx) => (
                    <div key={lp.id} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{lp.title}</p>
                          <a href={lp.url} target="_blank" rel="noreferrer" className="text-xs text-black/50 dark:text-white/50 hover:underline truncate block">
                            {lp.url}
                          </a>
                        </div>
                      </div>
                      <div className="text-right pl-4 shrink-0">
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{lp.clicks}</p>
                        <p className="text-[10px] text-black/40 uppercase tracking-wider">Clicks</p>
                      </div>
                    </div>
                  ))}
                  {linkPerformance.length === 0 && (
                    <p className="text-sm text-black/50 text-center py-4">No links added to this campaign.</p>
                  )}
                </div>
              </div>

              {/* Breakdowns */}
              <div className="space-y-6">
                <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
                  <HorizontalBarList items={getTopReferrers(events)} title="Top Referrers" icon={<ExternalLink className="w-4 h-4 text-black/40 dark:text-white/40" />} />
                </div>
                <div className="p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl">
                  <HorizontalBarList items={getCountryBreakdown(events)} title="Countries" icon={<Globe className="w-4 h-4 text-black/40 dark:text-white/40" />} />
                </div>
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
            <FolderKanban className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Your Campaigns</h2>
          <p className="text-black/50 dark:text-white/50 text-sm mt-1">
            Group links together and view aggregate performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadInitialData}
            disabled={isLoading}
            className="p-2.5 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No campaigns yet</h3>
          <p className="text-sm text-black/50 dark:text-white/50 max-w-sm mb-6">
            Group your tracked links into campaigns to see aggregate clicks and compare performance.
          </p>
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.$id}
              className="group p-5 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl hover:shadow-lg hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 cursor-pointer"
              onClick={() => openDetail(camp)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base mb-1 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {camp.name}
                  </h3>
                  <p className="text-xs text-black/50 dark:text-white/50 truncate">
                    {camp.linkIds.length} link{camp.linkIds.length !== 1 && 's'} grouped
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{camp.totalClicks}</p>
                    <p className="text-[10px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">Total Clicks</p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(camp); }}
                      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
                      title="Edit Campaign"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(camp.$id); }}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-black/50 hover:text-red-500"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
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
