"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

/**
 * Registers /sw.js and shows a friendly "New update available" banner
 * when a fresh service worker is waiting — solves the classic PWA
 * stale-cache trap (users stuck on old code forever).
 */
export function ServiceWorkerRegistration() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // dev uses turbopack, SW conflicts

    let registration: ServiceWorkerRegistration | null = null;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;

        if (reg.waiting) {
          setWaiting(reg.waiting);
          setShowUpdate(true);
        }

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setWaiting(newWorker);
              setShowUpdate(true);
            }
          });
        });
      })
      .catch(() => {
        /* SW registration failure must never break the app */
      });

    // Reload once the new SW takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    return () => {
      registration?.update?.().catch(() => {});
    };
  }, []);

  const applyUpdate = () => {
    waiting?.postMessage("SKIP_WAITING");
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl text-xs sm:text-sm font-semibold animate-fade-in">
      <RefreshCw className="w-4 h-4 shrink-0" />
      <span>New version available!</span>
      <button
        onClick={applyUpdate}
        className="px-3 py-1 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-bold hover:bg-blue-500 transition-colors"
      >
        Update
      </button>
      <button onClick={() => setShowUpdate(false)} aria-label="Dismiss update prompt" className="p-1 opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
