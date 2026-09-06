import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean; // Kept for compatibility if passed
}

export function Logo({ size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-28",
    md: "w-36 md:w-40",
    lg: "w-48",
  };

  return (
    <div className={`flex items-center group shrink-0 ${sizeClasses[size]} -ml-1`}>
      <img
        src="/logo.svg"
        alt="NeedTools Logo"
        className="w-full h-auto object-contain transition-opacity duration-300 hover:opacity-90"
      />
    </div>
  );
}
