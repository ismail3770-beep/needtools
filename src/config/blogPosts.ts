export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "zero-upload-tools-future-privacy",
    title: "Why Zero-Upload Tools Are the Future of Digital Privacy",
    description: "Discover how client-side processing tools protect your data from leaks and hacks by processing everything securely in your browser.",
    date: "2026-08-27",
    author: "NeedTools Team",
    tags: ["Privacy", "Security", "Web Tools"],
  },
  {
    slug: "how-to-compress-pdf-without-losing-quality",
    title: "How to Compress a PDF Without Losing Quality (100% Free)",
    description: "Learn the best methods to reduce your PDF file size for email attachments and web uploads without sacrificing text clarity or image resolution.",
    date: "2026-09-01",
    author: "NeedTools Team",
    tags: ["PDF", "Compression", "Guide"],
  },
  {
    slug: "generate-secure-passwords-locally",
    title: "The Dangers of Online Password Generators and How to Stay Safe",
    description: "Why you should never use server-side password generators, and how to create cryptographically secure passwords locally in your browser.",
    date: "2026-09-03",
    author: "NeedTools Team",
    tags: ["Security", "Passwords", "Privacy"],
  },
  {
    slug: "ultimate-guide-to-qr-codes-marketing",
    title: "The Ultimate Guide to Using QR Codes for Marketing in 2026",
    description: "How to generate, customize, and track QR codes to boost your offline-to-online marketing campaigns effectively.",
    date: "2026-09-05",
    author: "NeedTools Team",
    tags: ["Marketing", "QR Codes", "Business"],
  }
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
