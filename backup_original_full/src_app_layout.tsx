import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ServiceWorkerRegistration } from "@/components/providers/ServiceWorkerRegistration";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const poppins = Poppins({
weight: ["400", "500", "600", "700", "800"],
subsets: ["latin"],
display: "swap",
variable: "--font-poppins",
});

export const metadata: Metadata = {
title: {
default: "NeedTools — Free & Private Online Web Tools",
template: "%s | NeedTools",
},
description:
"Fast, zero-upload browser tools for everyday tasks. Compress images, generate QR codes, create secure passwords, analyze text, and format JSON with total privacy.",
keywords: [
"online web tools",
"image compressor",
"qr code generator",
"password generator",
"word counter",
"json formatter",
"free developer tools",
"privacy first tools",
"zero upload tools",
"pdf converter",
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

export default function RootLayout({
children,
}: Readonly<{
children: React.ReactNode;
}>) {
return (
<html lang="en" className={poppins.variable} suppressHydrationWarning>
<head>
{process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
<Script
id="adsense-init"
async
strategy="afterInteractive"
crossOrigin="anonymous"
src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
/>
)}
</head>
<body className="flex flex-col min-h-screen font-sans bg-slate-50/60 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased" suppressHydrationWarning>
<ThemeProvider