const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/layout.tsx', 'utf-8');

const s1 = 'export default function RootLayout({\n  children,\n}: Readonly<{\n  children: React.ReactNode;\n}>) {';
const r1 = `import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) { notFound(); }
  setRequestLocale(locale);
  const messages = await getMessages();`;

code = code.replace(s1, r1);
code = code.replace('<html lang="en"', '<html lang={locale}');
code = code.replace('<ThemeProvider', '<NextIntlClientProvider messages={messages} locale={locale}>\n        <ThemeProvider');
code = code.replace('</ThemeProvider>', '</ThemeProvider>\n        </NextIntlClientProvider>');
code = code.replace('import "./globals.css";', 'import "@/app/globals.css";');

fs.writeFileSync('src/app/[locale]/layout.tsx', code);
console.log('Layout updated successfully');
