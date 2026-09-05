"use client";

import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface AdBannerProps {
  slotId?: string;
  format?: "horizontal" | "rectangle" | "responsive";
  className?: string;
}

export function AdBanner({ slotId = "default-slot", format = "horizontal", className = "" }: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const [isAdBlocked, setIsAdBlocked] = useState(false);

  // Height hint to prevent CLS when ad blocker is detected
  const minHeight = format === "rectangle" ? "min-h-[250px]" : "min-h-[90px]";

  useEffect(() => {
    // Detect AdBlocker by attempting to fetch the AdSense script
    // AdBlockers will block this network request at the browser level
    const checkAdBlocker = async () => {
      try {
        await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        });
        setIsAdBlocked(false);
      } catch (error) {
        // Fetch throws an error if the request is blocked by the browser (AdBlocker)
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

  // If AdSense is not configured in env, don't show anything (useful for dev)
  if (!clientId) {
    return null;
  }

  // Soft Request for AdBlock Users
  if (isAdBlocked) {
    return (
      <div
        className={`w-full max-w-4xl mx-auto my-8 overflow-hidden rounded-2xl border border-dashed border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20 flex flex-col items-center justify-center p-6 text-center ${minHeight} ${className}`}
      >
        <Heart className="w-6 h-6 text-red-500 mb-3 animate-pulse" />
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-red-100 mb-1.5">
          Using an AdBlocker? No problem!
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-red-200/80 max-w-lg font-medium leading-relaxed">
          NeedTools is 100% free and privacy-focused. If you find our tools useful, please consider whitelisting us to support our work.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto my-8 overflow-hidden rounded-2xl ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format === "responsive" ? "auto" : format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
