import React from "react";
import type { Metadata } from "next";
import { ShieldCheck, Lock, EyeOff, ServerOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — 100% Zero-Upload Guarantee",
  description: "Learn how needtools protects your privacy with 100% client-side computing and zero server storage.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-4 text-center pb-10 border-b border-zinc-200 dark:border-zinc-800">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" /> Zero-Data Collection Guarantee
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">
          <ServerOff className="w-8 h-8 text-emerald-500 mb-2" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No Server Uploads</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Images, text, and files are processed strictly in browser RAM.</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">
          <Lock className="w-8 h-8 text-indigo-500 mb-2" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No Account Needed</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">No registration, login, or personal emails requested.</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">
          <EyeOff className="w-8 h-8 text-amber-500 mb-2" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No Tracking Pixels</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">We do not sell, rent, or trade your analytical usage data.</p>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">1. Information We Do Not Collect</h2>
          <p>
            When you use <strong>needtools</strong> (e.g. compressing an image, formatting JSON, creating a QR code, or generating a password), all underlying data transformation is handled 100% locally by your web browser using HTML5 Canvas, Web Crypto, and Web Worker APIs.
          </p>
          <p>
            At no point are your uploaded photos, documents, passwords, or text snippets sent over the internet or saved to our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">2. Cookies and Local Storage</h2>
          <p>
            We use your browser's native <code>localStorage</code> purely to remember your theme preference (Dark/Light mode) and display your "Recently Used Tools" list for personal convenience. This data stays entirely on your physical device.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3. Third-Party Advertising and Analytics</h2>
          <p>
            We may partner with third-party advertising networks such as Google AdSense to serve non-personalized advertisements. These providers may use cookies to serve ads based on your visits to this and other websites. You may opt out of personalized advertising by visiting Google Ad Settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">4. Contact Us</h2>
          <p>
            If you have any questions regarding this Privacy Policy, please reach out to our team at{" "}
            <a href="mailto:support@needtools.app" className="text-brand-600 dark:text-brand-400 underline">
              support@needtools.app
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
