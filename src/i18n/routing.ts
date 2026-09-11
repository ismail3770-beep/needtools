import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const locales = ['en', 'es', 'fr', 'de', 'pt', 'hi', 'ar', 'zh', 'bn', 'ru', 'ja', 'ko', 'it', 'nl', 'tr'];

export const routing = defineRouting({
  locales: locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);
