"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, Chrome } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, register, googleLogin } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        await register(name, email, password);
      }
      setShowAuthModal(false);
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const switchTab = (t: "login" | "register") => {
    setTab(t);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => { setShowAuthModal(false); resetForm(); }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-white/10 overflow-hidden animate-fade-in">
        {/* Close */}
        <button
          onClick={() => { setShowAuthModal(false); resetForm(); }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:text-white/50 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-[#0F172A] dark:text-white">
              {tab === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-[#64748B] dark:text-white/60 mt-1">
              {tab === "login"
                ? "Sign in to access your dashboard"
                : "Join NeedTools for free — unlock processing history & favorites"}
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={() => { googleLogin(); }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-[#0F172A] dark:text-white font-semibold text-sm transition-all"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-white/10" />
            <span className="text-xs text-[#64748B] dark:text-white/40 font-medium">or</span>
            <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-white/10" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl mb-6">
            <button
              onClick={() => switchTab("login")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === "login"
                  ? "bg-white dark:bg-neutral-800 text-[#0F172A] dark:text-white shadow-sm"
                  : "text-[#64748B] dark:text-white/50 hover:text-[#0F172A] dark:hover:text-white"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === "register"
                  ? "bg-white dark:bg-neutral-800 text-[#0F172A] dark:text-white shadow-sm"
                  : "text-[#64748B] dark:text-white/50 hover:text-[#0F172A] dark:hover:text-white"
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-[#64748B]/60"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-[#64748B]/60"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 8 characters)"
                required
                minLength={8}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-[#64748B]/60"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 px-4 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Please wait..." : tab === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-xs text-center text-[#64748B] dark:text-white/40 mt-6">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-brand-600">Terms</a> and{" "}
            <a href="/privacy-policy" className="underline hover:text-brand-600">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
