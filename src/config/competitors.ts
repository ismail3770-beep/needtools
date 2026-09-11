export interface Competitor {
  slug: string;
  name: string;
  description: string;
  vsNeedTools: {
    feature: string;
    needTools: string;
    competitor: string;
  }[];
  verdict: string;
}

export const COMPETITORS: Competitor[] = [
  {
    slug: "smallpdf",
    name: "Smallpdf",
    description: "Smallpdf is a popular cloud-based PDF editor. While easy to use, it uploads your sensitive files to external servers and strictly limits daily free usage.",
    vsNeedTools: [
      { feature: "Privacy & Security", needTools: "100% Client-Side. Files never leave your device.", competitor: "Uploads files to cloud servers." },
      { feature: "Usage Limits", needTools: "Unlimited. No daily caps.", competitor: "Strict daily limits (usually 2 tasks/day free)." },
      { feature: "Speed", needTools: "Instant. No upload/download waiting.", competitor: "Depends on internet upload speed." },
      { feature: "Cost", needTools: "100% Free.", competitor: "Requires \-\/month subscription for Pro." },
    ],
    verdict: "If you prioritize privacy, speed, and unlimited free access without limits, NeedTools is the superior alternative to Smallpdf."
  },
  {
    slug: "ilovepdf",
    name: "iLovePDF",
    description: "iLovePDF offers many tools but processes all files on their servers, posing potential privacy risks for sensitive documents and enforcing batch limits on free users.",
    vsNeedTools: [
      { feature: "File Processing", needTools: "Local browser processing via WebAssembly.", competitor: "Cloud-based server processing." },
      { feature: "Data Privacy", needTools: "Zero-upload architecture. 100% secure.", competitor: "Files are stored on their servers temporarily." },
      { feature: "Batch Processing", needTools: "No limits on free tier.", competitor: "Heavily restricted on the free tier." },
      { feature: "Ads & Trackers", needTools: "Minimal, unintrusive.", competitor: "Heavy advertising on free tier." },
    ],
    verdict: "For users handling sensitive financial or legal documents, NeedTools provides a much safer, zero-upload alternative to iLovePDF."
  }
];

export function getCompetitorBySlug(slug: string) {
  return COMPETITORS.find(c => c.slug === slug);
}
