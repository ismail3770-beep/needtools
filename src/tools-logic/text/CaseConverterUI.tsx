"use client";

import React, { useState } from "react";
import { Copy, Check, Type, Trash2, ArrowRight } from "lucide-react";

export default function CaseConverterUI() {
  const [text, setText] = useState("the quick brown fox jumps over the lazy dog");
  const [copied, setCopied] = useState(false);

  const applyCase = (fn: (s: string) => string) => {
    setText(fn(text));
  };

  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  };

  const toSentenceCase = (str: string) => {
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  const toCamelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
      .replace(/\s+/g, "");
  };

  const toSnakeCase = (str: string) => {
    return str
      .trim()
      // Insert underscore between lowercase→uppercase boundaries (camelCase → camel_Case)
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "_")
      .replace(/^-+|-+$/g, "");
  };

  const toKebabCase = (str: string) => {
    return str
      .trim()
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Title Case", fn: toTitleCase },
          { label: "Sentence case", fn: toSentenceCase },
          { label: "UPPERCASE", fn: (s: string) => s.toUpperCase() },
          { label: "lowercase", fn: (s: string) => s.toLowerCase() },
          { label: "camelCase", fn: toCamelCase },
          { label: "snake_case", fn: toSnakeCase },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => applyCase(item.fn)}
            className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:border-brand-500/50 transition-all shadow-sm"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Editor Textarea */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Live Text Preview
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setText("")}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="py-1.5 px-3 rounded-xl bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Text
                </>
              )}
            </button>
          </div>
        </div>

        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text here..."
          className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 text-sm leading-relaxed focus:outline-none resize-y"
        />
      </div>
    </div>
  );
}
