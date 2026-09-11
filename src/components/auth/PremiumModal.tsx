"use client";

import React from "react";
import Link from "next/link";
import { X, Lock, Sparkles, Zap } from "lucide-react";
import { useUsageLimit } from "@/components/providers/UsageLimitProvider";

export function PremiumModal() {
  const { showPremiumModal, setShowPremiumModal } = useUsageLimit();

  if (!showPremiumModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowPremiumModal(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-white/10 overflow-hidden animate-fade-in">
        {/* Close */}
        <button
          onClick={() => setShowPremiumModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:text-white/50 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-brand-200 dark:border-brand-800/50">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-[#0F172A] dark:text-white mb-2">
            Free limit reached
          </h2>
          <p className="text-sm text-[#64748B] dark:text-white/60 mb-8">
            Log in or Sign up to get unlimited access and premium features for free!
          </p>

          <div className="space-y-3">
            <Link
              href="/login"
              onClick={() => setShowPremiumModal(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-sm"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setShowPremiumModal(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[#0F172A] dark:text-white font-semibold text-sm transition-all"
            >
              Sign up
            </Link>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-4 text-xs font-medium text-[#64748B] dark:text-white/40">
             <div className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Unlimited usage</div>
             <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Faster processing</div>
          </div>
        </div>
      </div>
    </div>
  );
}
