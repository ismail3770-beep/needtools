'use client';

import { usePathname } from 'next/navigation';

const locales = ['en', 'es', 'fr', 'de', 'pt', 'hi', 'ar', 'zh', 'bn', 'ru', 'ja', 'ko', 'it', 'nl', 'tr'];

export function HreflangTags() {
  const pathname = usePathname();
  const baseUrl = 'https://needtools.app';
  
  if (!pathname) return null;

  // Strip locale from pathname if present
  const segments = pathname.split('/');
  if (locales.includes(segments[1])) {
    segments.splice(1, 1);
  }
  const unlocalizedPathname = segments.join('/') || '/';

  return (
    <>
      <link rel="alternate" hrefLang="x-default" href={baseUrl + (unlocalizedPathname === '/' ? '' : unlocalizedPathname)} />
      {locales.map((locale) => {
        const href = locale === 'en' 
          ? baseUrl + (unlocalizedPathname === '/' ? '' : unlocalizedPathname)
          : baseUrl + '/' + locale + (unlocalizedPathname === '/' ? '' : unlocalizedPathname);
        
        return (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={href}
          />
        );
      })}
    </>
  );
}
