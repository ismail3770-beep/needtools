"use client";

import React, { useState } from "react";
import { Copy, Check, Sparkles, Sliders, Palette } from "lucide-react";

const PRESETS = [
  { name: "Hyper", color1: "#ec4899", color2: "#8b5cf6", angle: 90 },
  { name: "Ocean", color1: "#06b6d4", color2: "#3b82f6", angle: 135 },
  { name: "Sunset", color1: "#f59e0b", color2: "#ef4444", angle: 45 },
  { name: "Emerald", color1: "#10b981", color2: "#047857", angle: 120 },
  { name: "Neon Glow", color1: "#8b5cf6", color2: "#06b6d4", angle: 270 },
  { name: "Midnight", color1: "#1e1b4b", color2: "#312e81", angle: 180 },
];

export default function GradientGeneratorUI() {
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [color1, setColor1] = useState("#6366f1");
  const [color2, setColor2] = useState("#ec4899");
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);

  const gradientRule =
    type === "linear"
      ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
      : `radial-gradient(circle, ${color1}, ${color2})`;

  const cssOutput = `background: ${color1};
background: ${gradientRule};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Controls (Left) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
          {/* Gradient Type */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <button
              onClick={() => setType("linear")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === "linear"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white dark:text-black shadow-sm"
                  : "text-zinc-500"
              }`}
            >
              Linear Gradient
            </button>
            <button
              onClick={() => setType("radial")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === "radial"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white dark:text-black shadow-sm"
                  : "text-zinc-500"
              }`}
            >
              Radial Gradient
            </button>
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Starting Color
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-full text-xs font-mono bg-transparent uppercase text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Ending Color
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-full text-xs font-mono bg-transparent uppercase text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Angle Slider (Linear only) */}
          {type === "linear" && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span>Gradient Angle</span>
                <span className="font-mono">{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>
          )}
        </div>

        {/* Curated Presets */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Curated Color Palettes
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  setColor1(p.color1);
                  setColor2(p.color2);
                  setAngle(p.angle);
                  setType("linear");
                }}
                className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-transform hover:scale-105 shadow-sm"
                style={{
                  background: `linear-gradient(${p.angle}deg, ${p.color1}, ${p.color2})`,
                }}
                title={p.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Live Preview (Right) */}
      <div className="lg:col-span-6 space-y-6">
        <div
          className="w-full h-64 rounded-3xl shadow-xl flex items-center justify-center p-6 transition-all duration-200 border border-white/20"
          style={{ background: gradientRule }}
        >
          <span className="py-2 px-4 rounded-xl bg-black/40 backdrop-blur-md text-white dark:text-black font-bold text-xs">
            Live Gradient Preview
          </span>
        </div>

        {/* CSS Output */}
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
            {cssOutput}
          </pre>
        </div>
      </div>
    </div>
  );
}
