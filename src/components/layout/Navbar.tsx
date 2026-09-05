"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, Shield } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";
import { CATEGORIES } from "@/config/categories";
import { Logo } from "@/components/ui/Logo";

export function Navbar() {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-black/10 dark:border-white/10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Brand Logo with Authentic Icon Badge */}
          <Link href="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>


          {/* Quick Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <button
              onClick={() => setIsCommandOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Search className="w-4 h-4 text-black/40 dark:text-white/40 group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors" />
                <span className="truncate">Search 14 tools (e.g. compress photo, qr code)...</span>
              </div>
              <kbd className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold text-black/50 dark:text-white/50 bg-white dark:bg-neutral-900 rounded-md border border-black/10 dark:border-white/10 shadow-sm shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="p-2 rounded-xl md:hidden text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10"
              aria-label="Search tools"
            >
              <Search className="w-4 h-4" />
            </button>

            <nav className="hidden lg:flex items-center gap-1.5">
              <Link
                href="/#popular"
                className="px-3 py-1.5 text-sm font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                Popular
              </Link>
              <Link
                href="/tools"
                className="px-3 py-1.5 text-sm font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                All Tools
              </Link>
              <Link
                href="/contact"
                className="px-3 py-1.5 text-sm font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                Contact
              </Link>
            </nav>

            <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1 hidden lg:block" />

            {/* Light / Dark Mode Toggle Button */}
            <ThemeToggle />

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl lg:hidden text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-black/5 dark:border-white/10 bg-white dark:bg-neutral-950 p-4 space-y-4 animate-fade-in shadow-2xl">
            {/* Theme Toggle row for Mobile */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 px-1">
                Appearance
              </span>
              <ThemeToggle showLabel />
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50">
              <Shield className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              100% Free & In-Browser • Zero Server Uploads
            </div>

            <div className="font-bold text-sm text-black/40 dark:text-white/40 uppercase tracking-wider px-1">
              Browse Categories
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/tools/${cat.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cat.colorClass.replace("text-", "bg-")}`} />
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-black/5 dark:border-white/10 flex justify-between text-sm font-medium text-black/50 dark:text-white/50">
              <Link href="/privacy-policy" onClick={() => setIsMobileMenuOpen(false)} className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" onClick={() => setIsMobileMenuOpen(false)} className="hover:underline">
                Terms of Service
              </Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:underline">
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
