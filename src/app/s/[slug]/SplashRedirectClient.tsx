"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { SplashPage } from "./page";

interface Props {
  page: SplashPage;
}

export default function SplashRedirectClient({ page }: Props) {
  const [timeLeft, setTimeLeft] = useState(page.countdownSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      window.location.href = page.destinationUrl;
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, page.destinationUrl]);

  const handleSkip = () => {
    window.location.href = page.destinationUrl;
  };

  // Determine text color based on background darkness
  const isDarkBg = page.bgColor && parseInt(page.bgColor.replace('#', ''), 16) < 0xffffff / 2;
  const textColor = isDarkBg ? 'text-white' : 'text-slate-900';

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center p-6 text-center ${textColor}`}
      style={{ backgroundColor: page.bgColor || '#ffffff' }}
    >
      <div className="max-w-md w-full flex flex-col items-center">
        {page.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.logoUrl} alt="Logo" className="max-w-[200px] max-h-[120px] object-contain mb-10" />
        )}

        {page.headline && (
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{page.headline}</h1>
        )}

        {page.subtext && (
          <p className="text-base sm:text-lg opacity-80 mb-12">{page.subtext}</p>
        )}

        <div className="flex flex-col items-center mt-4">
          <div className="w-20 h-20 rounded-full border-[6px] border-current opacity-20 border-t-current flex items-center justify-center mb-6">
            <span className="text-3xl font-bold opacity-100">{timeLeft}</span>
          </div>
          <p className="text-sm font-semibold opacity-60 uppercase tracking-widest">
            Redirecting to destination...
          </p>
        </div>

        {page.skipAllowed && (
          <button
            onClick={handleSkip}
            className="mt-10 px-8 py-3 rounded-full border-2 border-current opacity-60 hover:opacity-100 transition-opacity text-sm font-bold uppercase tracking-wider"
          >
            Skip Now
          </button>
        )}

        {/* Branding Footer */}
        <div className="fixed bottom-6 inset-x-0 text-center">
          <Link href="/" className="inline-flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
            <span className="text-xs font-bold tracking-widest uppercase">
              Powered by NeedTools
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
