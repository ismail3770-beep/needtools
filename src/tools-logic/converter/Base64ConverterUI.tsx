"use client";

import React, { useState } from "react";
import { Copy, Check, ArrowRightLeft, Upload, FileText, Sparkles, Trash2 } from "lucide-react";

export default function Base64ConverterUI() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [inputText, setInputText] = useState("Hello needtools!");
  const [outputText, setOutputText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (!inputText) {
      setOutputText("");
      setErrorMsg(null);
      return;
    }

    try {
      if (mode === "encode") {
        // UTF-8 safe encode
        const encoded = btoa(
          encodeURIComponent(inputText).replace(/%([0-9A-F]{2})/g, (match, p1) =>
            String.fromCharCode(parseInt(p1, 16))
          )
        );
        setOutputText(encoded);
        setErrorMsg(null);
      } else {
        // Strip data URI prefix if present, then UTF-8 safe decode
        const cleanInput = inputText.trim().replace(/^data:[^;]+;base64,/, "");
        const decoded = decodeURIComponent(
          Array.prototype.map
            .call(atob(cleanInput), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        setOutputText(decoded);
        setErrorMsg(null);
      }
    } catch {
      setErrorMsg(mode === "decode" ? "Invalid Base64 encoded string" : "Encoding error");
      setOutputText("");
    }
  }, [inputText, mode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prevent browser crash from very large files
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      alert("File too large. Maximum size is 10MB for Base64 conversion.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      // Extract pure base64 payload from data URI
      const base64Payload = dataUri.replace(/^data:[^;]+;base64,/, "");
      setOutputText(dataUri);
      setInputText(base64Payload);
      setMode("encode");
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setMode("encode")}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              mode === "encode"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white dark:text-black shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Encode Text to Base64
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              mode === "decode"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white dark:text-black shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Decode Base64 to Text
          </button>
        </div>

        {/* File Upload Button for Base64 Data URI */}
        <label className="py-2 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm">
          <Upload className="w-3.5 h-3.5 text-brand-500" />
          <span>Upload File to Base64</span>
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {mode === "encode" ? "Plain Text / Data" : "Base64 Encoded Input"}
            </span>
            <button
              onClick={() => setInputText("")}
              className="text-zinc-400 hover:text-rose-500 p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            rows={10}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === "encode" ? "Type or paste text..." : "Paste Base64 string..."}
            className="w-full bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Output Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {mode === "encode" ? "Base64 Output" : "Decoded Plain Text"}
            </span>
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="py-1 px-3 rounded-lg bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-semibold text-xs flex items-center gap-1 disabled:opacity-40 transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
          </div>

          {errorMsg ? (
            <div className="h-[200px] flex items-center justify-center text-xs font-semibold text-rose-500 bg-rose-50/50 dark:bg-rose-950/30 rounded-xl border border-rose-200/50">
              {errorMsg}
            </div>
          ) : (
            <textarea
              rows={10}
              readOnly
              value={outputText}
              placeholder="Output will appear here..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none resize-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
