"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Palette, Sparkles, RefreshCw } from "lucide-react";

export default function ColorConverterUI() {
  const [hexColor, setHexColor] = useState("#6366f1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // HEX to RGB helper
  const colorModels = useMemo(() => {
    let hex = hexColor.replace("#", "");
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const r = parseInt(hex.substring(0, 2) || "0", 16) || 0;
    const g = parseInt(hex.substring(2, 4) || "0", 16) || 0;
    const b = parseInt(hex.substring(4, 6) || "0", 16) || 0;

    // RGB to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h = Math.round(h * 60);
    }

    const sPercent = Math.round(s * 100);
    const lPercent = Math.round(l * 100);

    // RGB to CMYK
    let c = 0, m = 0, y = 0, k = 0;
    if (r === 0 && g === 0 && b === 0) {
      k = 100;
    } else {
      c = Math.round((1 - rNorm - (1 - Math.max(rNorm, gNorm, bNorm))) / Math.max(rNorm, gNorm, bNorm) * 100) || 0;
      m = Math.round((1 - gNorm - (1 - Math.max(rNorm, gNorm, bNorm))) / Math.max(rNorm, gNorm, bNorm) * 100) || 0;
      y = Math.round((1 - bNorm - (1 - Math.max(rNorm, gNorm, bNorm))) / Math.max(rNorm, gNorm, bNorm) * 100) || 0;
      k = Math.round((1 - Math.max(rNorm, gNorm, bNorm)) * 100) || 0;
    }

    return [
      { key: "hex", label: "HEX", value: `#${hex.toUpperCase()}` },
      { key: "rgb", label: "RGB", value: `rgb(${r}, ${g}, ${b})` },
      { key: "rgba", label: "RGBA", value: `rgba(${r}, ${g}, ${b}, 1)` },
      { key: "hsl", label: "HSL", value: `hsl(${h}, ${sPercent}%, ${lPercent}%)` },
      { key: "cmyk", label: "CMYK", value: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)` },
      { key: "css", label: "CSS Var", value: `--color: #${hex};` },
    ];
  }, [hexColor]);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Color Picker & Visual Swatch */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm text-center">
        <div
          className="w-full aspect-video rounded-2xl border border-black/10 shadow-lg flex items-center justify-center transition-all duration-300"
          style={{ backgroundColor: hexColor }}
        >
          <span className="px-3.5 py-1.5 rounded-xl bg-black/40 backdrop-blur-md text-white font-mono font-bold text-sm">
            {hexColor.toUpperCase()}
          </span>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Pick Color or Type HEX
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={hexColor}
              onChange={(e) => setHexColor(e.target.value)}
              className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent shrink-0"
            />
            <input
              type="text"
              value={hexColor}
              onChange={(e) => setHexColor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm text-zinc-900 dark:text-zinc-100 uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Quick Palette presets */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6", "#0ea5e9", "#18181b"].map((c) => (
            <button
              key={c}
              onClick={() => setHexColor(c)}
              className="w-7 h-7 rounded-lg border border-black/10 shadow-sm transition-transform hover:scale-110"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Output Code Models */}
      <div className="md:col-span-7 space-y-3">
        {colorModels.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {item.label}
              </span>
              <div className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {item.value}
              </div>
            </div>

            <button
              onClick={() => handleCopy(item.key, item.value)}
              className="py-1.5 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === item.key ? (
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
        ))}
      </div>
    </div>
  );
}
