"use client";

import React, { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

const CONSENT_KEY = "needtools_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Delay show for better UX
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] p-4 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#E2E8F0] dark:border-white/10 shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Cookie className="w-8 h-8 text-amber-500 shrink-0 hidden sm:block" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F172A] dark:text-white mb-1">
              We value your privacy 🍪
            </p>
            <p className="text-xs text-[#64748B] dark:text-white/60 leading-relaxed">
              We use cookies for analytics and to display relevant ads that keep NeedTools 100% free. No personal files or data are ever stored.{" "}
              <a href="/privacy-policy" className="underline hover:text-brand-600 transition-colors">
                Learn more
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-sm"
            >
              Accept
            </button>
          </div>
          <button
            onClick={handleDecline}
            className="absolute top-3 right-3 p-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white sm:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
