"use client";

import React, { useState, useRef } from "react";
import { ThumbsUp, ThumbsDown, Check, Send } from "lucide-react";

interface ToolFeedbackWidgetProps {
  toolSlug: string;
}

const VOTE_COOLDOWN_MS = 30_000; // 30 seconds between votes

export function ToolFeedbackWidget({ toolSlug }: ToolFeedbackWidgetProps) {
  const [voted, setVoted] = useState<boolean | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const lastVoteRef = useRef<number>(0);

  const handleVote = async (isHelpful: boolean) => {
    // Rate limit check
    const now = Date.now();
    if (now - lastVoteRef.current < VOTE_COOLDOWN_MS) return;
    lastVoteRef.current = now;

    setVoted(isHelpful);
    setShowCommentBox(true);

    try {
      const { saveToolFeedback } = await import("@/lib/db");
      await saveToolFeedback({ toolSlug, isHelpful });
    } catch {
      // Ignore background errors
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const { saveToolFeedback } = await import("@/lib/db");
      await saveToolFeedback({ toolSlug, isHelpful: voted ?? true, comment });
    } catch {
      // Ignore background errors
    }

    setSubmitted(true);
  };

  return (
    <div className="my-8 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-center space-y-3">
      {voted === null ? (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-slate-200">
            Was this tool helpful to you?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote(true)}
              className="py-1.5 px-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-[#E2E8F0] dark:border-slate-700 hover:border-emerald-500/50 text-[#64748B] dark:text-slate-300 hover:text-emerald-600 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ThumbsUp className="w-3.5 h-3.5" /> Yes
            </button>
            <button
              onClick={() => handleVote(false)}
              className="py-1.5 px-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-[#E2E8F0] dark:border-slate-700 hover:border-rose-500/50 text-[#64748B] dark:text-slate-300 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ThumbsDown className="w-3.5 h-3.5" /> No
            </button>
          </div>
        </div>
      ) : submitted ? (
        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 animate-fade-in">
          <Check className="w-4 h-4" /> Thank you for helping us improve!
        </div>
      ) : (
        <form onSubmit={handleCommentSubmit} className="max-w-md mx-auto space-y-2 animate-fade-in">
          <span className="text-xs font-medium text-[#64748B] dark:text-slate-400 block">
            {voted ? "Awesome! Any suggestions for making it even better?" : "Sorry about that! What can we improve?"}
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a quick note (optional)..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-xs text-[#0F172A] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="py-1.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <Send className="w-3 h-3" /> Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
