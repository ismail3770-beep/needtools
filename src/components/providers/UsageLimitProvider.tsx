"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

interface UsageLimitContextType {
  usageCount: number;
  isLimitReached: boolean;
  showPremiumModal: boolean;
  setShowPremiumModal: (show: boolean) => void;
}

const UsageLimitContext = createContext<UsageLimitContextType | null>(null);

export function useUsageLimit() {
  const ctx = useContext(UsageLimitContext);
  if (!ctx) throw new Error("useUsageLimit must be used within Provider");
  return ctx;
}

export function UsageLimitProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [usageCount, setUsageCount] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("guest_usage_count");
    if (stored) setUsageCount(parseInt(stored, 10));

    const handleToolProcessed = () => {
      // If user is authenticated, do not increment guest usage
      if (user) return;
      
      setUsageCount(prev => {
        const next = prev + 1;
        localStorage.setItem("guest_usage_count", next.toString());
        if (next >= 5) {
          setShowPremiumModal(true);
        }
        return next;
      });
    };

    window.addEventListener("tool_processed", handleToolProcessed);
    return () => {
      window.removeEventListener("tool_processed", handleToolProcessed);
    };
  }, [user]);

  const isLimitReached = !isLoading && !user && usageCount >= 5;

  useEffect(() => {
    if (isLimitReached) {
      setShowPremiumModal(true);
    }
  }, [isLimitReached, user]);

  return (
    <UsageLimitContext.Provider value={{ usageCount, isLimitReached, showPremiumModal, setShowPremiumModal }}>
      {children}
    </UsageLimitContext.Provider>
  );
}
