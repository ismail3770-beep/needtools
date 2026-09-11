'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { Globe, X } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  
  { code: 'ar', name: 'عربي', flag: '🇸🇦' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-transparent text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <Globe className="w-4 h-4 text-[#64748B] dark:text-white/60" />
        <span className="font-semibold text-[#64748B] dark:text-white/60">Language</span>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="bg-white dark:bg-neutral-900 rounded-[20px] shadow-2xl w-full max-w-[440px] p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-center mb-6">
              <h2 className="text-[15px] font-bold text-[#0F172A] dark:text-white">
                Select language
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute right-0 text-[#64748B] dark:text-white/60 hover:text-[#0F172A] dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              {languages.map((lang) => {
                const isActive = locale === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-3 text-left transition-colors hover:opacity-75 ${
                      isActive
                        ? 'text-brand-600 dark:text-brand-400 font-bold'
                        : 'text-[#334155] dark:text-white/80 font-medium'
                    }`}
                  >
                    <span className="text-[18px] leading-none drop-shadow-sm" aria-hidden="true">{lang.flag}</span>
                    <span className="text-[13px]">{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Backdrop click to close */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
        </div>,
        document.body
      )}
    </>
  );
}
