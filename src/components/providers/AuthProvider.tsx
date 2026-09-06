"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Models } from "appwrite";
import {
  getCurrentUser,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  logout as authLogout,
} from "@/lib/auth";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Optional hook that returns null instead of throwing when outside provider */
export function useOptionalAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  // Check session on mount
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    })();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    await loginWithEmail(email, password);
    await refreshUser();
  };

  const register = async (name: string, email: string, password: string) => {
    await registerWithEmail(name, email, password);
    await refreshUser();
  };

  const googleLogin = () => {
    loginWithGoogle();
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        refreshUser,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
