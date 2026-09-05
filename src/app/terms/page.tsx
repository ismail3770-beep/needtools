import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using the needtools web utility suite.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-4 text-center pb-10 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mt-10">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">1. Acceptance of Terms</h2>
          <p>
            By accessing or using <strong>needtools</strong>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">2. Free Commercial and Personal License</h2>
          <p>
            All tools, generated QR codes, compressed images, hashes, and text outputs produced using needtools are 100% royalty-free for both personal and commercial use without attribution requirements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3. Disclaimer of Warranties</h2>
          <p>
            The services are provided "as is" and "as available" without warranties of any kind. While our tools undergo rigorous testing, needtools shall not be liable for any incidental or consequential damages resulting from the use or inability to use the tools.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">4. Modifications</h2>
          <p>
            We reserve the right to modify or discontinue any tool at any time without prior notice.
          </p>
        </section>
      </div>
    </div>
  );
}
