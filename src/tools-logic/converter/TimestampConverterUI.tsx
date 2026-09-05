"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Clock, Calendar } from "lucide-react";

export default function TimestampConverterUI() {
  const [currentSec, setCurrentSec] = useState(Math.floor(Date.now() / 1000));
  const [isLive, setIsLive] = useState(true);

  const [inputTs, setInputTs] = useState(Math.floor(Date.now() / 1000).toString());
  const [tsResult, setTsResult] = useState<{ local: string; utc: string; relative: string } | null>(null);

  const [inputDate, setInputDate] = useState(new Date().toISOString().slice(0, 16));
  const [dateResult, setDateResult] = useState<{ sec: number; ms: number } | null>(null);

  const [copied, setCopied] = useState<string | null>(null);

  // Live Clock Ticker
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      setCurrentSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [isLive]);

  // Convert Timestamp -> Date
  useEffect(() => {
    const raw = Number(inputTs.trim());
    if (isNaN(raw) || raw <= 0) {
      setTsResult(null);
      return;
    }

    const ms = inputTs.length > 11 ? raw : raw * 1000;
    const date = new Date(ms);

    if (isNaN(date.getTime())) {
      setTsResult(null);
      return;
    }

    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    let relative = "";
    if (Math.abs(diff) < 60) relative = "Just now";
    else if (Math.abs(diff) < 3600) relative = `${Math.floor(Math.abs(diff) / 60)}m ${diff > 0 ? "ago" : "from now"}`;
    else if (Math.abs(diff) < 86400) relative = `${Math.floor(Math.abs(diff) / 3600)}h ${diff > 0 ? "ago" : "from now"}`;
    else relative = `${Math.floor(Math.abs(diff) / 86400)}d ${diff > 0 ? "ago" : "from now"}`;

    setTsResult({
      local: date.toLocaleString(),
      utc: date.toUTCString(),
      relative,
    });
  }, [inputTs]);

  // Convert Date -> Timestamp
  useEffect(() => {
    if (!inputDate) return;
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
      setDateResult(null);
      return;
    }
    setDateResult({
      sec: Math.floor(date.getTime() / 1000),
      ms: date.getTime(),
    });
  }, [inputDate]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Live Current Epoch Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Current Epoch Timestamp</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
            {currentSec}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy(currentSec.toString(), "live")}
            className="py-1.5 px-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 text-white dark:text-zinc-900 font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            {copied === "live" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy</span>
          </button>
          <button
            onClick={() => setIsLive(!isLive)}
            className="py-1.5 px-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
          >
            {isLive ? "Pause" : "Resume"}
          </button>
        </div>
      </div>

      {/* Converters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timestamp -> Human Date */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5" /> Epoch to Date
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Timestamp (Seconds or Milliseconds)
            </label>
            <input
              type="text"
              value={inputTs}
              onChange={(e) => setInputTs(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          {tsResult ? (
            <div className="space-y-2 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-0.5">
                <span className="text-[11px] text-zinc-500 font-medium block">Local:</span>
                <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                  <span className="truncate mr-2">{tsResult.local}</span>
                  <button
                    onClick={() => handleCopy(tsResult.local, "local")}
                    className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 shrink-0"
                  >
                    {copied === "local" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-0.5">
                <span className="text-[11px] text-zinc-500 font-medium block">UTC / GMT:</span>
                <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                  <span className="truncate mr-2">{tsResult.utc}</span>
                  <button
                    onClick={() => handleCopy(tsResult.utc, "utc")}
                    className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 shrink-0"
                  >
                    {copied === "utc" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500">
                Relative: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{tsResult.relative}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-rose-500 font-semibold">
              Invalid timestamp format
            </div>
          )}
        </div>

        {/* Human Date -> Timestamp */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            <Calendar className="w-3.5 h-3.5" /> Date to Epoch
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Select Date & Time
            </label>
            <input
              type="datetime-local"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          {dateResult && (
            <div className="space-y-2 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-0.5">
                <span className="text-[11px] text-zinc-500 font-medium block">Epoch (Seconds):</span>
                <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                  <span>{dateResult.sec}</span>
                  <button
                    onClick={() => handleCopy(dateResult.sec.toString(), "sec")}
                    className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    {copied === "sec" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-0.5">
                <span className="text-[11px] text-zinc-500 font-medium block">Epoch (Milliseconds):</span>
                <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                  <span>{dateResult.ms}</span>
                  <button
                    onClick={() => handleCopy(dateResult.ms.toString(), "ms")}
                    className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    {copied === "ms" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
