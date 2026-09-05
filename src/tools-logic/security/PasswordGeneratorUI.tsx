"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Copy, RefreshCw, Check, ShieldCheck, ShieldAlert, Key, Sparkles, Lock, Sliders } from "lucide-react";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const WORD_LIST = [
  "falcon", "orbit", "prism", "shadow", "galaxy", "timber", "summit", "beacon",
  "vortex", "quantum", "crystal", "phoenix", "aurora", "breeze", "dynamo", "echo",
  "glacier", "horizon", "ignite", "javelin", "kinetic", "lumens", "meteor", "nebula",
  "oasis", "pioneer", "quasar", "ripple", "solaris", "titan", "unity", "zenith"
];

export default function PasswordGeneratorUI() {
  const [mode, setMode] = useState<"random" | "passphrase">("random");
  const [length, setLength] = useState<number>(18);
  const [wordCount, setWordCount] = useState<number>(4);
  const [separator, setSeparator] = useState<string>("-");

  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);

  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [clipboardError, setClipboardError] = useState(false);
  const hasMounted = React.useRef(false);

  const generatePassword = useCallback(() => {
    if (mode === "passphrase") {
      const selectedWords: string[] = [];
      const array = new Uint32Array(wordCount);
      window.crypto.getRandomValues(array);

      for (let i = 0; i < wordCount; i++) {
        const index = array[i] % WORD_LIST.length;
        selectedWords.push(WORD_LIST[index]);
      }
      setPassword(selectedWords.join(separator));
      return;
    }

    let charset = "";
    if (useUpper) charset += UPPERCASE;
    if (useLower) charset += LOWERCASE;
    if (useNumbers) charset += NUMBERS;
    if (useSymbols) charset += SYMBOLS;

    if (excludeAmbiguous) {
      charset = charset.replace(/[0O1lI|]/g, "");
    }

    if (!charset) {
      setPassword("Please select at least one character type");
      return;
    }

    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }

    setPassword(result);
  }, [mode, length, wordCount, separator, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous]);

  useEffect(() => {
    // First mount: generate password. Subsequent re-renders are user-triggered.
    if (!hasMounted.current) {
      hasMounted.current = true;
      generatePassword();
    }
  }, [generatePassword]);

  const handleCopy = async () => {
    if (!password) return;
    setClipboardError(false);
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers denying clipboard permission
      setCopied(true);
      setClipboardError(true);
      setTimeout(() => {
        setCopied(false);
        setClipboardError(false);
      }, 2000);
    }
  };

  // Estimate Entropy & Strength
  const strengthInfo = React.useMemo(() => {
    if (mode === "passphrase") {
      const entropy = Math.round(wordCount * Math.log2(WORD_LIST.length));
      return {
        label: entropy > 50 ? "Ultra Strong" : "Moderate",
        color: "text-emerald-500",
        barColor: "bg-emerald-500",
        percent: Math.min(100, (entropy / 60) * 100),
        crackTime: "Centuries",
      };
    }

    let pool = 0;
    if (useUpper) pool += 26;
    if (useLower) pool += 26;
    if (useNumbers) pool += 10;
    if (useSymbols) pool += 32;

    const entropy = pool > 0 ? Math.round(length * Math.log2(pool)) : 0;

    if (entropy >= 80) {
      return { label: "Very Strong", color: "text-emerald-500", barColor: "bg-emerald-500", percent: 100, crackTime: "Trillions of Years" };
    } else if (entropy >= 60) {
      return { label: "Strong", color: "text-brand-500", barColor: "bg-brand-500", percent: 75, crackTime: "Thousands of Years" };
    } else if (entropy >= 40) {
      return { label: "Fair", color: "text-amber-500", barColor: "bg-amber-500", percent: 50, crackTime: "Few Months" };
    } else {
      return { label: "Weak", color: "text-rose-500", barColor: "bg-rose-500", percent: 25, crackTime: "Seconds" };
    }
  }, [mode, wordCount, length, useUpper, useLower, useNumbers, useSymbols]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Generated Password Display Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900 text-white border-2 border-brand-500/40 shadow-2xl relative space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-brand-400">
            <Lock className="w-3.5 h-3.5" /> Web Crypto CSPRNG
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side
          </span>
        </div>

        {/* The Password String */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <span className="font-mono text-base sm:text-xl font-bold tracking-wider break-all text-zinc-100 selection:bg-brand-500">
            {password}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={generatePassword}
              className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all active:rotate-180"
              title="Generate New"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="py-2.5 px-4 rounded-xl bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Strength Progress Bar */}
        {clipboardError && (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            Password was not copied to clipboard (browser permission denied). Please select and copy manually.
          </div>
        )}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-400">Security Score:</span>
            <span className={strengthInfo.color}>
              {strengthInfo.label} (Crack time: {strengthInfo.crackTime})
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${strengthInfo.barColor}`}
              style={{ width: `${strengthInfo.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setMode("random")}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === "random"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white dark:text-black shadow-sm"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          Custom Characters Mode
        </button>
        <button
          onClick={() => setMode("passphrase")}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === "passphrase"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white dark:text-black shadow-sm"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          Memorable Passphrase Mode
        </button>
      </div>

      {/* Settings Panel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
        {mode === "random" ? (
          <>
            {/* Length Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand-500" /> Password Length
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-mono font-bold text-sm">
                  {length} characters
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>

            {/* Character Set Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { label: "Uppercase Letters (A-Z)", state: useUpper, set: setUseUpper },
                { label: "Lowercase Letters (a-z)", state: useLower, set: setUseLower },
                { label: "Numbers (0-9)", state: useNumbers, set: setUseNumbers },
                { label: "Special Symbols (!@#$)", state: useSymbols, set: setUseSymbols },
                { label: "Exclude Ambiguous (0, O, 1, l)", state: excludeAmbiguous, set: setExcludeAmbiguous },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.set(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-zinc-300 dark:border-zinc-700"
                  />
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</span>
                </label>
              ))}
            </div>
          </>
        ) : (
          /* Passphrase Mode Controls */
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <span>Number of Words</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold">
                  {wordCount} words
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Word Separator
              </label>
              <div className="flex gap-2">
                {["-", "_", ".", " ", "#"].map((sep) => (
                  <button
                    key={sep}
                    onClick={() => setSeparator(sep)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      separator === sep
                        ? "bg-black dark:bg-white text-white border-brand-600 shadow-sm"
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {sep === " " ? "[space]" : sep}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
