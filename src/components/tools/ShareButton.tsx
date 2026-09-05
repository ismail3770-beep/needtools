"use client";

import React from "react";

interface ShareButtonProps {
  toolName: string;
}

export function ShareButton({ toolName }: ShareButtonProps) {
  return (
    <button
      onClick={() => {
        if (navigator.share) {
          navigator.share({ title: toolName, url: window.location.href });
        } else {
          navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
        }
      }}
      className="inline-flex items-center justify-center rounded-lg bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-semibold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm"
    >
      Share Tool
    </button>
  );
}
