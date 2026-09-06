import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { CATEGORIES } from "@/config/categories";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-neutral-950 transition-colors mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3.5">
            <Link href="/" className="inline-block">
              <Logo size="md" showText={true} />
            </Link>
            <p className="text-sm text-[#64748B] dark:text-white/60 leading-relaxed max-w-sm mt-3">
              High-performance, privacy-first web utilities for creators and developers. Compress images, convert PDFs, and process data with zero files uploaded to servers.
            </p>
            <div className="flex items-center gap-2 pt-1 text-sm text-[#64748B] dark:text-white/50">
              <span className="w-2 h-2 rounded-full bg-black/30 dark:bg-white/30" />
              <span>100% In-Browser Execution • Zero Server Latency</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider mb-3">
              Tool Categories
            </h5>
            <ul className="space-y-2 text-sm font-medium text-[#64748B] dark:text-white/60">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/tools/${cat.id}`} className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h5 className="text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider mb-3">
              Trust & Support
            </h5>
            <ul className="space-y-2 text-sm font-medium text-[#64748B] dark:text-white/60">
              <li>
                <Link href="/about" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
                  Contact & Feedback
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-[#E2E8F0] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#64748B] dark:text-white/50">
          <p>© {new Date().getFullYear()} NeedTools. Free for personal and commercial use.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#0F172A] dark:text-white/70 font-semibold">
              <Lock className="w-3.5 h-3.5" /> 100% Client-Side Safe
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
