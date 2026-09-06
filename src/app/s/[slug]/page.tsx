import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Query } from "appwrite";
import SplashRedirectClient from "./SplashRedirectClient";

// ─── Types ───────────────────────────────────────────────────

export interface SplashPage {
  $id: string;
  slug: string;
  ownerId: string;
  name: string;
  destinationUrl: string;
  headline: string;
  subtext: string;
  logoUrl: string;
  bgColor: string;
  countdownSeconds: number;
  skipAllowed: boolean;
}

// ─── Fetch Helper ────────────────────────────────────────────

async function getSplashPage(slug: string): Promise<SplashPage | null> {
  try {
    const { databases } = await import("@/lib/appwrite");
    const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "6a789c5430b868b6d118";
    const SPLASH_PAGES_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_SPLASH_PAGES_COL_ID || "splash_pages_mock";

    const res = await databases.listDocuments(DB_ID, SPLASH_PAGES_COL_ID, [
      Query.equal("slug", slug),
      Query.limit(1),
    ]);

    if (res.documents.length === 0) return null;
    return res.documents[0] as unknown as SplashPage;
  } catch (err) {
    console.error("Error fetching splash page:", err);
    return null;
  }
}

// ─── Metadata ────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getSplashPage(slug);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: page.headline || "Redirecting...",
    description: page.subtext || "You are being redirected to the destination.",
    openGraph: {
      title: page.headline || "Redirecting...",
      description: page.subtext || "You are being redirected to the destination.",
      images: page.logoUrl ? [{ url: page.logoUrl }] : undefined,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

// ─── Static Generation ────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const { databases } = await import("@/lib/appwrite");
    const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "6a789c5430b868b6d118";
    const SPLASH_PAGES_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_SPLASH_PAGES_COL_ID || "splash_pages_mock";

    const res = await databases.listDocuments(DB_ID, SPLASH_PAGES_COL_ID);
    if (res.documents.length === 0) {
      return [{ slug: "demo" }];
    }
    return res.documents.map((doc) => ({
      slug: doc.slug,
    }));
  } catch (err) {
    console.error("Error fetching splash pages for static params:", err);
    return [{ slug: "demo" }];
  }
}

export const dynamicParams = false;

// ─── Page Component ──────────────────────────────────────────

export default async function SplashPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getSplashPage(slug);

  if (!page) {
    notFound();
  }

  return <SplashRedirectClient page={page} />;
}
