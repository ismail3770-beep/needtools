"use client";

import React from "react";
import { AdBanner } from "./AdBanner";
import { Loader2 } from "lucide-react";

interface ProcessingAdProps {
  toolName?: string;
  className?: string;
}

/**
 * Ad unit displayed during tool processing/conversion loading state.
 * Shows a friendly "processing" message alongside a 300x250 ad unit.
 * Only shows when AdSense is configured.
 */
export function ProcessingAd({ toolName = "your file", className = "" }: ProcessingAdProps) {
  return (
    <div className={`w-full max-w-xl mx-auto my-8 ${className}`}>
      {/* Processing status message */}
      <div className="flex items-center justify-center gap-3 mb-4 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/50">
        <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
          Processing {toolName}... This may take a moment.
        </p>
      </div>

      {/* Ad unit */}
      <AdBanner variant="processing" />
    </div>
  );
}
