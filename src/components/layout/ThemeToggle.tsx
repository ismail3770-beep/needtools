"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative flex items-center gap-2 p-2 sm:px-2.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
        showLabel ? "w-full justify-between px-3 py-2.5" : ""
      }`}
      aria-label="Toggle Theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="flex items-center gap-2">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 fill-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
        )}
        {showLabel && (
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {isDark ? "Dark Mode" : "Light Mode"}
          </span>
        )}
      </div>

      {showLabel && (
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          Tap to switch
        </span>
      )}
    </button>
  );
}
