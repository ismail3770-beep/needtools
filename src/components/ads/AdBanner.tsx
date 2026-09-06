"use client";

import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";

type AdVariant = "header" | "processing" | "result" | "sidebar" | "inline" | "responsive";

interface AdBannerProps {
  slotId?: string;
  variant?: AdVariant;
  className?: string;
}

const VARIANT_CONFIG: Record<AdVariant, { format: string; minHeight: string; label: string }> = {
  header: { format: "horizontal", minHeight: "min-h-[90px]", label: "Advertisement" },
  processing: { format: "rectangle", minHeight: "min-h-[250px]", label: "Advertisement" },
  result: { format: "rectangle", minHeight: "min-h-[250px]", label: "Advertisement" },
  sidebar: { format: "vertical", minHeight: "min-h-[600px]", label: "Advertisement" },
  inline: { format: "auto", minHeight: "min-h-[90px]", label: "Sponsored" },
  responsive: { format: "auto", minHeight: "min-h-[90px]", label: "Advertisement" },
};

export function AdBanner({ slotId = "default-slot", variant = "responsive", className = "" }: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const config = VARIANT_CONFIG[variant];

  useEffect(() => {
    const checkAdBlocker = async () => {
      try {
        await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        });
        setIsAdBlocked(false);
      } catch {
        setIsAdBlocked(true);
      }
    };

    if (clientId) {
      checkAdBlocker();
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId && !isAdBlocked && typeof window !== "undefined") {
      try {
        // @ts-expect-error - Google AdSense push queue
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense Error:", e);
      }
    }
  }, [clientId, isAdBlocked]);

  // Dev mode: show nothing if no AdSense configured
  if (!clientId) {
    return null;
  }

  // AdBlocker detected — soft request
  if (isAdBlocked) {
    return (
      <div
        className={`w-full overflow-hidden rounded-2xl border border-dashed border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col items-center justify-center p-6 text-center ${config.minHeight} ${className}`}
      >
        <Heart className="w-6 h-6 text-amber-500 mb-3 animate-pulse" />
        <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-amber-100 mb-1.5">
          Support Free Tools ❤️
        </h3>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-amber-200/80 max-w-md font-medium leading-relaxed">
          NeedTools is 100% free and privacy-focused. We use non-intrusive ads to keep the lights on. Please consider whitelisting us — it really helps!
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      {/* AdSense Policy: Clear label separated from content */}
      <p className="text-[10px] text-[#64748B]/60 dark:text-white/30 text-center mb-1 font-medium uppercase tracking-wider">
        {config.label}
      </p>
      <div className={`w-full rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-[#E2E8F0]/50 dark:border-white/5 ${config.minHeight} flex items-center justify-center`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format={config.format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
