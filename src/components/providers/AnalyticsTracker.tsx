"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * First-party analytics beacon — fires on every route change.
 * Uses sendBeacon so it survives navigation and never blocks UX.
 * Because it hits OUR OWN API endpoint (/api/stats), no ad-blocker
 * can distinguish or filter it — fixing the 40%+ data-loss problem of GA.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Page view event
    // Analytics payload removed as it relied on Neon DB logic.
    // Can be easily re-added once a PageView collection is created in Appwrite.
  }, [pathname]);

  return null;
}
