"use client";

import React, { useState } from "react";
import { Copy, Check, Sparkles, Sliders, Box } from "lucide-react";

export default function BoxShadowGeneratorUI() {
  const [hOffset, setHOffset] = useState(0);
  const [vOffset, setVOffset] = useState(15);
  const [blur, setBlur] = useState(30);
  const [spread, setSpread] = useState(-5);
  const [color, setColor] = useState("#6366f1");
  const [opacity, setOpacity] = useState(35);
  const [isInset, setIsInset] = useState(false);
  const [boxColor, setBoxColor] = useState("#ffffff");
  const [copied, setCopied] = useState(false);

  // Convert hex + opacity to rgba
  const hexToRgba = (hex: string, op: number) => {
    let clean = hex.replace("#", "");
    if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
    const r = parseInt(clean.substring(0, 2), 16) || 0;
    const g = parseInt(clean.substring(2, 4), 16) || 0;
    const b = parseInt(clean.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${(op / 100).toFixed(2)})`;
  };

  const shadowCss = `${isInset ? "inset " : ""}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${hexToRgba(
    color,
    opacity
  )}`;

  const fullCssRule = `box-shadow: ${shadowCss};
-webkit-box-shadow: ${shadowCss};
-moz-box-shadow: ${shadowCss};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCssRule);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Controls Box (Left) */}
      <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          <Sliders className="w-4 h-4" /> Shadow Parameters
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              <span>Horizontal Offset (X)</span>
              <span className="font-mono">{hOffset}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={hOffset}
              onChange={(e) => setHOffset(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              <span>Vertical Offset (Y)</span>
              <span className="font-mono">{vOffset}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={vOffset}
              onChange={(e) => setVOffset(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              <span>Blur Radius</span>
              <span className="font-mono">{blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              <span>Spread Radius</span>
              <span className="font-mono">{spread}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={spread}
              onChange={(e) => setSpread(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              <span>Shadow Opacity</span>
              <span className="font-mono">{opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
          </div>
        </div>

        {/* Color & Inset Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Shadow Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono">{color}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Box Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={boxColor}
                onChange={(e) => setBoxColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono">{boxColor}</span>
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={isInset}
                onChange={(e) => setIsInset(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Inset Shadow</span>
            </label>
          </div>
        </div>
      </div>

      {/* Live Preview Card (Right) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-8 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center min-h-[260px]">
          <div
            className="w-44 h-44 rounded-2xl flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300 transition-all duration-150"
            style={{
              backgroundColor: boxColor,
              boxShadow: shadowCss,
            }}
          >
            Preview Box
          </div>
        </div>

        {/* Code Output Card */}
        <div className="p-4 rounded-2xl bg-zinc-900 text-zinc-100 border border-zinc-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              CSS Code
            </span>
            <button
              onClick={handleCopy}
              className="py-1 px-3 rounded-lg bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy CSS
                </>
              )}
            </button>
          </div>
          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            {fullCssRule}
          </pre>
        </div>
      </div>
    </div>
  );
}
