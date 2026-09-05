"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Hash, ShieldCheck, ShieldAlert, Lock } from "lucide-react";
import { computeMd5 } from "@/lib/md5";

export default function HashGeneratorUI() {
  const [text, setText] = useState("Hello needtools!");
  const [hashes, setHashes] = useState<{ [algo: string]: string }>({});
  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null);

  useEffect(() => {
    async function computeHashes() {
      if (!text) {
        setHashes({});
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      const algos = ["SHA-256", "SHA-512", "SHA-384", "SHA-1"];
      const results: { [algo: string]: string } = {};

      for (const algo of algos) {
        try {
          const hashBuffer = await window.crypto.subtle.digest(algo, data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          results[algo] = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        } catch {
          results[algo] = "Unsupported";
        }
      }

      // MD5 — Web Crypto API does not support MD5.
      // Compute using a public-domain JS implementation (MIT-licensed, inline).
      results["MD5"] = computeMd5(text);

      setHashes(results);
    }

    computeHashes();
  }, [text]);

  const handleCopy = (algo: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedAlgo(algo);
    setTimeout(() => setCopiedAlgo(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Input String to Hash
        </label>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste any text..."
          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono"
        />
      </div>

      {/* Computed Hashes */}
      <div className="space-y-3">
        {["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"].map((algo) => {
          const hashVal = hashes[algo];
          if (!hashVal && hashVal !== "") return null; // not yet computed

          const isMd5 = algo === "MD5";
          return (
            <div
              key={algo}
              className={`p-4 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm space-y-2 ${
                isMd5
                  ? "border-amber-300 dark:border-amber-800/50" // MD5 visual distinction
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isMd5 ? "text-amber-600 dark:text-amber-400" : "text-brand-600 dark:text-brand-400"
                  }`}
                >
                  {algo} Digest
                </span>
                <button
                  onClick={() => handleCopy(algo, hashVal)}
                  className="py-1 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedAlgo === algo ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
              {isMd5 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Legacy checksum — not for security use
                </p>
              )}
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all select-all border border-zinc-100 dark:border-zinc-800">
                {hashVal}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
