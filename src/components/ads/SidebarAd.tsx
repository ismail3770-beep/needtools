"use client";

import React from "react";
import { AdBanner } from "./AdBanner";

interface SidebarAdProps {
  className?: string;
}

/**
 * Sticky sidebar rail ad for widescreen desktop viewports (≥1280px).
 * Hidden on mobile/tablet to comply with AdSense responsive policies.
 */
export function SidebarAd({ className = "" }: SidebarAdProps) {
  return (
    <div className={`hidden xl:block w-[160px] shrink-0 ${className}`}>
      <div className="sticky top-24">
        <AdBanner variant="sidebar" className="w-[160px]" />
      </div>
    </div>
  );
}
