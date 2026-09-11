"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, Clock, Star, User, LogOut, 
  Search, Menu, X, Settings, Link as LinkIcon, 
  FileText, Image as ImageIcon, Share2, Wrench, Code2, ArrowRightLeft,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProcessingHistory } from "@/components/dashboard/ProcessingHistory";
import { PinnedTools } from "@/components/dashboard/PinnedTools";
import { VisualInsights } from "@/components/dashboard/VisualInsights";
import { getPinnedTools, getUserHistory } from "@/lib/db";
import type { PinnedTool, UserHistory } from "@/lib/db";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { CATEGORIES } from "@/config/categories";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  image: ImageIcon,
  marketing: Share2,
  utility: Wrench,
  developer: Code2,
  converter: ArrowRightLeft,
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [pinnedTools, setPinnedTools] = useState<PinnedTool[]>([]);
  const [tasks, setTasks] = useState<UserHistory[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      (async () => {
        setDataLoading(true);
        const [pins, history] = await Promise.all([
          getPinnedTools(user.$id),
          getUserHistory(user.$id),
        ]);
        setPinnedTools(pins);
        setTasks(history);
        setDataLoading(false);
      })();
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAFC] dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    if (dataLoading) {
      return (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      );
    }

    if (activeTab === "overview") {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Dashboard Overview</h2>
              <p className="text-[#64748B] dark:text-white/60 text-sm mt-1">Track your tool usage and favorite features.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E2E8F0] dark:border-white/10 shadow-sm flex flex-col justify-center items-center">
               <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mb-3">
                 <Clock className="w-6 h-6" />
               </div>
               <p className="text-3xl font-extrabold text-[#0F172A] dark:text-white">{tasks.length}</p>
               <p className="text-sm font-medium text-[#64748B] dark:text-white/60">Files Processed</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E2E8F0] dark:border-white/10 shadow-sm flex flex-col justify-center items-center">
               <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-3">
                 <Star className="w-6 h-6" />
               </div>
               <p className="text-3xl font-extrabold text-[#0F172A] dark:text-white">{pinnedTools.length}</p>
               <p className="text-sm font-medium text-[#64748B] dark:text-white/60">Pinned Tools</p>
            </div>
          </div>

          {tasks.length > 0 && <VisualInsights tasks={tasks} />}
        </div>
      );
    }

    if (activeTab === "history") {
      return (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-6">Processing History</h2>
          <ProcessingHistory tasks={tasks} />
        </div>
      );
    }

    if (activeTab === "pinned") {
      return (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-6">Favorite Tools</h2>
          <PinnedTools pinnedTools={pinnedTools} />
        </div>
      );
    }

    if (activeTab === "account") {
      return (
        <div className="animate-fade-in space-y-6 max-w-lg bg-white dark:bg-neutral-900 p-8 rounded-2xl border border-[#E2E8F0] dark:border-white/10 shadow-sm">
           <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2">Account Settings</h2>
           <div className="space-y-6 mt-6">
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
           </div>
           
           <div className="pt-8 border-t border-[#E2E8F0] dark:border-white/10 mt-8">
             <button
               onClick={logout}
               className="flex items-center justify-center w-full gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
             >
               <LogOut className="w-4 h-4" /> Sign out
             </button>
           </div>
        </div>
      );
    }

    const category = CATEGORIES.find(c => c.id === activeTab);
    if (category) {
      return (
        <div className="animate-fade-in">
           <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2">{category.name}</h2>
           <p className="text-[#64748B] dark:text-white/60 text-sm mb-6">{category.description}</p>
           
           <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#E2E8F0] dark:border-white/10 p-12 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                 <LinkIcon className="w-8 h-8 text-[#64748B] dark:text-white/40" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">Browse {category.name}</h3>
              <p className="text-sm text-[#64748B] dark:text-white/60 mb-6">Explore all tools available in this category.</p>
              <Link
                href={`/tools/${category.id}`}
                className="inline-flex items-center px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Go to {category.name} <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
           </div>
        </div>
      );
    }

    return null;
  };

  const NavButton = ({ id, icon: Icon, label, badge }: { id: string, icon: any, label: string, badge?: number }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => { setActiveTab(id); setIsMobileSidebarOpen(false); }}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-semibold text-[13px] ${
          isActive 
            ? "bg-black text-white dark:bg-white dark:text-black"
            : "text-[#64748B] dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${isActive ? "" : "opacity-70"}`} />
          {label}
        </div>
        {badge !== undefined && badge > 0 && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isActive ? "bg-white/20" : "bg-slate-200 dark:bg-white/10 text-black dark:text-white"
          }`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#F8FAFC] dark:bg-neutral-950 font-sans">
      {/* Overlay for mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-neutral-900 border-r border-[#E2E8F0] dark:border-white/10
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        md:relative
      `}>
        {/* Sidebar Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#E2E8F0] dark:border-white/10 shrink-0">
          <Logo size="md" />
          <button className="md:hidden text-[#64748B]" onClick={() => setIsMobileSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          <div>
             <h4 className="text-[10px] font-extrabold text-[#94A3B8] dark:text-white/30 uppercase tracking-widest px-3 mb-2">Overview</h4>
             <div className="space-y-1">
               <NavButton id="overview" icon={LayoutDashboard} label="Dashboard" />
             </div>
          </div>

          <div>
             <h4 className="text-[10px] font-extrabold text-[#94A3B8] dark:text-white/30 uppercase tracking-widest px-3 mb-2">My Tools</h4>
             <div className="space-y-1">
               {CATEGORIES.map(cat => (
                 <NavButton 
                   key={cat.id} 
                   id={cat.id} 
                   icon={CATEGORY_ICONS[cat.id] || FileText} 
                   label={cat.name} 
                 />
               ))}
             </div>
          </div>

          <div>
             <h4 className="text-[10px] font-extrabold text-[#94A3B8] dark:text-white/30 uppercase tracking-widest px-3 mb-2">Activity</h4>
             <div className="space-y-1">
               <NavButton id="history" icon={Clock} label="History" badge={tasks.length} />
               <NavButton id="pinned" icon={Star} label="Favorites" badge={pinnedTools.length} />
             </div>
          </div>
          
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-white/10 shrink-0">
           <NavButton id="account" icon={Settings} label="Account Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC] dark:bg-[#0b0f19]">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-[#E2E8F0] dark:border-white/10 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
             <button 
               className="md:hidden p-2 -ml-2 text-[#64748B] hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"
               onClick={() => setIsMobileSidebarOpen(true)}
             >
               <Menu className="w-5 h-5" />
             </button>
             
             {/* Search Bar */}
             <div className="hidden sm:flex items-center relative w-full max-w-xs">
                <Search className="w-4 h-4 absolute left-3 text-[#64748B] dark:text-white/40" />
                <input 
                  type="text" 
                  placeholder="Search tools..." 
                  className="w-full pl-9 pr-14 py-2 bg-slate-50 dark:bg-black/50 border border-[#E2E8F0] dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all text-[#0F172A] dark:text-white placeholder:text-[#94A3B8]"
                  onClick={() => {
                    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true });
                    window.dispatchEvent(event);
                  }}
                  readOnly
                />
                <div className="absolute right-2 flex items-center">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white dark:bg-neutral-800 border border-[#E2E8F0] dark:border-white/10 rounded text-[#64748B] dark:text-white/50">CTRL K</kbd>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <ThemeToggle />
             <div className="w-px h-6 bg-[#E2E8F0] dark:bg-white/10 mx-1 hidden sm:block" />
             <div className="flex items-center gap-2 pl-1 cursor-pointer" onClick={() => setActiveTab("account")}>
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="text-sm font-bold text-[#0F172A] dark:text-white hidden sm:block truncate max-w-[120px]">
                  {user?.name || "admin"}
                </span>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-5xl mx-auto pb-20">
             {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
