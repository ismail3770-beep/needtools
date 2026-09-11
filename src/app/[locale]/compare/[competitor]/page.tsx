import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPETITORS, getCompetitorBySlug } from "@/config/competitors";
import { CompareView } from "@/components/compare/CompareView";
import { locales } from "@/i18n/routing";

interface ComparePageProps {
  params: Promise<{
    competitor: string;
    locale: string;
  }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return COMPETITORS.map((c) => ({
    competitor: c.slug,
  }));
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { competitor: slug, locale } = await params;
  const comp = getCompetitorBySlug(slug);

  if (!comp) {
    return { title: "Not Found" };
  }

  const baseUrl = "https://needtools.app";
  const localePath = locale === "en" ? "" : `/${locale}`;

  const title = `NeedTools vs ${comp.name} - The 100% Free, Zero-Upload Alternative`;
  const description = `Looking for an alternative to ${comp.name}? NeedTools is a 100% free, zero-upload tool suite that processes files entirely in your browser for maximum privacy.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}${localePath}/compare/${comp.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${localePath}/compare/${comp.slug}`,
      type: "website",
      siteName: "NeedTools",
    },
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { competitor: slug } = await params;
  const comp = getCompetitorBySlug(slug);

  if (!comp) {
    notFound();
  }

  return <CompareView competitor={comp} />;
}