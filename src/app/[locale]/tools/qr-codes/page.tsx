import React from "react";
import UnifiedPage, { generateMetadata as slugGenerateMetadata } from "../[slug]/page";

interface QrCodesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: QrCodesPageProps) {
  const { locale } = await params;
  return slugGenerateMetadata({ params: Promise.resolve({ slug: "qr-codes", locale }) });
}

export default async function QrCodesPage({ params }: QrCodesPageProps) {
  const { locale } = await params;
  return <UnifiedPage params={Promise.resolve({ slug: "qr-codes", locale })} />;
}
