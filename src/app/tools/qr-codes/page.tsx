import React from "react";
import UnifiedPage, { generateMetadata as slugGenerateMetadata } from "../[slug]/page";

export async function generateMetadata() {
  return slugGenerateMetadata({ params: Promise.resolve({ slug: "qr-codes" }) });
}

export default async function QrCodesPage() {
  return <UnifiedPage params={Promise.resolve({ slug: "qr-codes" })} />;
}
