"use client";

import React from "react";
import Link from "next/link";
import { Clock, FileText, Download, AlertCircle } from "lucide-react";
import type { UserTask } from "@/lib/db";
import { getToolBySlug } from "@/config/toolsRegistry";

function formatBytes(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

interface ProcessingHistoryProps {
  tasks: UserTask[];
}

export function ProcessingHistory({ tasks }: ProcessingHistoryProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-10 h-10 mx-auto text-[#64748B]/50 mb-3" />
        <p className="text-sm font-medium text-[#64748B]">No processing history yet</p>
        <p className="text-xs text-[#64748B]/70 mt-1">Start using tools to see your history here</p>
        <Link href="/tools" className="inline-block mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700">
          Browse Tools →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task, i) => {
        const tool = getToolBySlug(task.toolSlug);
        const expired = isExpired(task.expiresAt);

        return (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-[#E2E8F0] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors"
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-[#64748B]" />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] dark:text-white truncate">{task.fileName}</p>
              <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-white/50 mt-0.5">
                <span>{tool?.name || task.toolSlug}</span>
                <span>•</span>
                <span>{formatBytes(task.fileSize)}</span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{timeAgo(task.createdAt)}</span>
              </div>
            </div>

            {/* Status / Download */}
            {expired ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold shrink-0">
                <AlertCircle className="w-3.5 h-3.5" /> Expired
              </span>
            ) : (
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 text-xs font-semibold hover:bg-brand-100 dark:hover:bg-brand-950/50 transition-colors shrink-0">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
