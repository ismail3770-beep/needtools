"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Clock, Star, User, LogOut, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProcessingHistory } from "@/components/dashboard/ProcessingHistory";
import { PinnedTools } from "@/components/dashboard/PinnedTools";
import { getPinnedTools, getUserTasks } from "@/lib/db";
import type { PinnedTool, UserTask } from "@/lib/db";

export default function DashboardPage() {
  const { user, isLoading, logout, setShowAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<"history" | "pinned" | "account">("history");
  const [pinnedTools, setPinnedTools] = useState<PinnedTool[]>([]);
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      (async () => {
        setDataLoading(true);
        const [pins, history] = await Promise.all([
          getPinnedTools(user.$id),
          getUserTasks(user.$id),
        ]);
        setPinnedTools(pins);
        setTasks(history);
        setDataLoading(false);
      })();
    }
  }, [user]);

  // Not logged in state
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-neutral-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50 flex items-center justify-center">
            <Shield className="w-8 h-8 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-white">Sign in to continue</h1>
            <p className="text-sm text-[#64748B] dark:text-white/60 mt-2">
              Access your processing history, pinned tools, and higher file limits.
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-sm"
          >
            <User className="w-4 h-4" /> Sign in
          </button>
          <Link href="/" className="block text-sm text-[#64748B] hover:text-brand-600 transition-colors">
            <ArrowLeft className="w-4 h-4 inline mr-1" /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "history" as const, label: "History", icon: Clock, count: tasks.length },
    { id: "pinned" as const, label: "Favorites", icon: Star, count: pinnedTools.length },
    { id: "account" as const, label: "Account", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-lg font-bold shadow-lg">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-white flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-brand-600" /> Dashboard
            </h1>
            <p className="text-sm text-[#64748B] dark:text-white/60">Welcome back, {user?.name || "User"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white dark:bg-neutral-900 rounded-xl border border-[#E2E8F0] dark:border-white/10 mb-8 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === t.id
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-[#64748B] dark:text-white/50 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === t.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-white/10 text-[#64748B]"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#E2E8F0] dark:border-white/10 p-6">
          {dataLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === "history" && <ProcessingHistory tasks={tasks} />}
              {activeTab === "pinned" && <PinnedTools pinnedTools={pinnedTools} />}
              {activeTab === "account" && (
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Name</label>
                    <p className="text-lg font-semibold text-[#0F172A] dark:text-white mt-1">{user?.name || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Email</label>
                    <p className="text-lg font-semibold text-[#0F172A] dark:text-white mt-1">{user?.email || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Member since</label>
                    <p className="text-sm text-[#64748B] mt-1">
                      {user?.$createdAt ? new Date(user.$createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E2E8F0] dark:border-white/10">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-[#E2E8F0] dark:border-white/10">
                        <p className="text-2xl font-extrabold text-brand-600">{tasks.length}</p>
                        <p className="text-xs text-[#64748B] font-medium mt-1">Files Processed</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-[#E2E8F0] dark:border-white/10">
                        <p className="text-2xl font-extrabold text-brand-600">{pinnedTools.length}</p>
                        <p className="text-xs text-[#64748B] font-medium mt-1">Favorite Tools</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
