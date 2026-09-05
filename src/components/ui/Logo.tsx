import React from "react";
import { Sparkles, Zap, Layers, Wrench } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSizeClasses = {
    sm: "w-6 h-6",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const svgSizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const textClassPrimary = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  };

  const textClassSecondary = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  return (
    <div className="flex items-center gap-2.5 group shrink-0">
      <div
        className={`${iconSizeClasses[size]} rounded-xl relative flex items-center justify-center font-extrabold shadow-sm overflow-hidden bg-brand-600 dark:bg-brand-500 border border-brand-500/20`}
      >
        {/* Icon Layer */}
        <div className="relative z-10 text-white group-hover:scale-110 transition-transform duration-300">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${svgSizeClasses[size]}`}
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              fill="currentColor"
              fillOpacity="0.4"
            />
            <path
              d="M2 17L12 22L22 17M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 2L12 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-extrabold ${textClassPrimary[size]} tracking-tight text-black dark:text-white leading-none`}
          >
            need<span className="text-brand-600 dark:text-brand-400">tools</span>
          </span>
          {size !== "sm" && (
            <span
              className={`${textClassSecondary[size]} font-semibold text-black/40 dark:text-white/40 leading-tight mt-0.5 tracking-wide uppercase`}
            >
              Zero-upload utility
            </span>
          )}
        </div>
      )}
    </div>
  );
}
