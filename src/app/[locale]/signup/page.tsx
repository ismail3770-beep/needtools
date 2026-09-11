"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Logo } from "@/components/ui/Logo";

export default function SignupPage() {
  const router = useRouter();
  const { user, isLoading, register, googleLogin } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !success) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim()) {
      setError("Please enter your name.");
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || (user && !success)) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-neutral-950">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-[#E2E8F0] dark:border-white/10 overflow-hidden animate-fade-in p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] dark:text-white mb-2">Check your email</h2>
          <p className="text-sm text-[#64748B] dark:text-white/60 mb-6">
            We've sent a verification link to <strong>{email}</strong>. Please verify your email to secure your account.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex w-full">
      {/* Left Column: Form */}
      <div className="w-full md:w-1/2 flex flex-col relative bg-white dark:bg-neutral-950">
        <div className="absolute top-8 left-8 hidden md:block">
          <Link href="/">
            <Logo size="md" />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-[400px] animate-fade-in">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-[28px] font-extrabold text-[#0F172A] dark:text-white">
                Create account
              </h2>
            </div>

            <div className="mb-4 text-center">
               <span className="text-[10px] font-bold text-[#64748B] dark:text-white/40 uppercase tracking-widest">SIGN UP WITH</span>
            </div>

            {/* Google OAuth Button */}
            <div className="mb-8 relative group">
              <button
                onClick={() => { googleLogin(); }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-white/5 text-[#0F172A] dark:text-white font-bold text-sm transition-all relative overflow-hidden shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-white/10" />
              <span className="text-[11px] text-[#64748B] dark:text-white/40 font-bold uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-white/10" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-extrabold text-[#0F172A] dark:text-white block">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-[#64748B]/40 font-medium shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-extrabold text-[#0F172A] dark:text-white block">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-[#64748B]/40 font-medium shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-extrabold text-[#0F172A] dark:text-white block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-[#64748B]/40 font-medium font-sans shadow-sm"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 px-4 py-2.5 rounded-xl border border-red-100 dark:border-red-900/50 mt-4">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 rounded-xl bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black font-extrabold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Create account"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Mobile alternative link */}
        <div className="md:hidden text-center pb-8 text-sm text-[#64748B] dark:text-white/60">
          Already have an account?{" "}
          <Link href="/login" className="text-black dark:text-white font-bold hover:underline">
            Log in
          </Link>
        </div>

        <div className="p-8 text-center text-xs font-semibold text-[#64748B] dark:text-white/40 hidden md:block">
          © {new Date().getFullYear()} Premium. All Rights Reserved
        </div>
      </div>

      {/* Right Column: Promo */}
      <div className="hidden md:flex md:w-1/2 bg-black items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-[360px] text-center animate-fade-in flex flex-col items-center relative z-10">
          <h2 className="text-[32px] font-extrabold text-white mb-4 tracking-tight">Already have an account?</h2>
          <p className="text-[#A1A1AA] text-[15px] mb-10 leading-relaxed font-medium">
            Sign in to access your tools, history, and favorites.
          </p>
          <Link
            href="/login"
            className="inline-flex px-10 py-3.5 rounded-xl bg-white text-black font-extrabold text-[15px] hover:bg-neutral-200 transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
