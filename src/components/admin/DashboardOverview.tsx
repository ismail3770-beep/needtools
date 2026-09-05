"use client";

import { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Users, MessageSquare, Star, LogOut, BarChart3, Loader2 } from "lucide-react";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const CONTACT_COL = process.env.NEXT_PUBLIC_APPWRITE_CONTACT_COL_ID!;
const FEEDBACK_COL = process.env.NEXT_PUBLIC_APPWRITE_FEEDBACK_COL_ID!;

export function DashboardOverview({ onLogout }: { onLogout: () => void }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    contacts: 0,
    feedbacks: 0,
    recentContacts: [] as any[],
  });

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsResponse, feedbackResponse] = await Promise.all([
          databases.listDocuments(DB_ID, CONTACT_COL, [Query.orderDesc("$createdAt"), Query.limit(5)]),
          databases.listDocuments(DB_ID, FEEDBACK_COL, [Query.limit(1)]), // Just for total count
        ]);

        setStats({
          contacts: contactsResponse.total,
          feedbacks: feedbackResponse.total,
          recentContacts: contactsResponse.documents,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Messages</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.contacts}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Feedbacks</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.feedbacks}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Tools</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">12</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">Recent Messages</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {stats.recentContacts.length > 0 ? (
            stats.recentContacts.map((contact) => (
              <div key={contact.$id} className="p-6">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium text-slate-900 dark:text-white">{contact.name}</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(contact.$createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">{contact.email}</p>
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                  {contact.message}
                </p>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              No messages found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
