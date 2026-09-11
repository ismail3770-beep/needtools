import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { locales } from "@/i18n/routing";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
import { Poppins, Noto_Sans_Bengali, Noto_Kufi_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { ToastProvider } from "@/components/ui/Toast";
import { ServiceWorkerRegistration } from "@/components/providers/ServiceWorkerRegistration";
import { Navbar } from "@/components/layout/Navbar";
import { HreflangTags } from "@/components/layout/HreflangTags";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { UsageLimitProvider } from "@/components/providers/UsageLimitProvider";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-primary",
});

const notoSansBengali = Noto_Sans_Bengali({
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali"],
  display: "swap",
  variable: "--font-primary",
});

const notoKufiArabic = Noto_Kufi_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-primary",
});

function getFontVariables(lang: string) {
  if (lang === 'bn') return notoSansBengali.variable;
  if (lang === 'ar') return notoKufiArabic.variable;
  return poppins.variable;
}

export const metadata: Metadata = {
  title: {
    default: "NeedTools — Free & Private Online Web Tools",
    template: "%s | NeedTools",
  },
  description:
    "Fast, zero-upload browser tools for everyday tasks. Compress images, generate QR codes, create secure passwords, analyze text, and format JSON with total privacy.",
  keywords: [
    "online web tools",
    "ai powered tools",
    "developer utilities",
    "image compressor",
    "qr code generator",
    "password generator",
    "word counter",
    "json formatter",
    "free developer tools",
    "privacy first tools",
    "zero upload tools",
    "pdf converter",
    "smart utility apps",
    "web-based ai tools",
  ],
  authors: [{ name: "NeedTools Team" }],
  creator: "NeedTools",
  publisher: "NeedTools",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://needtools.app"),
  manifest: "/site.webmanifest",
  openGraph: {
    title: "NeedTools — 100% Free & Private Online Web Tools",
    description: "Fast, zero-upload browser tools. Compress images, generate QR codes, create secure passwords, and format code.",
    url: "https://needtools.app",
    siteName: "NeedTools",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeedTools — 100% Free & Private Online Web Tools",
    description: "Fast, zero-upload browser tools for everyday tasks.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const resolvedParams = await params;
  const lang = resolvedParams?.locale || "en";
  let messages = {};
  try {
    messages = await getMessages();
  } catch (e) {
    // fallback if no messages are found
  }
  const fontVariables = getFontVariables(lang);

  return (
    <html lang={lang} className={fontVariables} suppressHydrationWarning>
      <head>
        <HreflangTags />
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
          />
        )}
      </head>
      <body className="flex flex-col min-h-screen font-sans bg-[#F8FAFC] dark:bg-[#0b0f19] text-[#0F172A] dark:text-slate-100 antialiased" suppressHydrationWarning>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            id="adsense-init"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          />
        )}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script id="google-analytics">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        {/* Global SEO: WebSite + Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "NeedTools",
              url: "https://needtools.app",
              inLanguage: lang,
              description:
                "Fast, zero-upload browser tools for everyday tasks. Compress images, generate QR codes, create secure passwords, and format JSON with total privacy.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://needtools.app/?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "NeedTools",
              url: "https://needtools.app",
              logo: "https://needtools.app/icon-512.png",
              sameAs: [],
            }),
          }}
        />
        <NextIntlClientProvider messages={messages} locale={lang}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ToastProvider>
              <AuthProvider>
                <UsageLimitProvider>
                  <Navbar />
                  <Breadcrumbs />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <AuthModal />
                  <CookieConsent />
                </UsageLimitProvider>
              </AuthProvider>
            </ToastProvider>
            <ServiceWorkerRegistration />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
