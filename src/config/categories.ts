import { CategoryInfo } from "@/types/tool";

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "pdf",
    name: "PDF Tools",
    description: "Convert, merge, split, and organize PDF documents seamlessly.",
    iconName: "CustomPdf",
    colorClass: "text-rose-600 dark:text-rose-400",
    bgGradientClass: "from-rose-500 to-red-600",
    borderClass: "border-rose-200 dark:border-rose-900/50",
  },
  {
    id: "image",
    name: "Image Tools",
    description: "Compress, convert, resize, and optimize photos with zero quality loss.",
    iconName: "Image",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgGradientClass: "from-emerald-500 to-teal-600",
    borderClass: "border-emerald-200 dark:border-emerald-900/50",
  },
  {
    id: "marketing",
    name: "Marketing Tools",
    description: "Generate QR codes and shorten URLs for your marketing campaigns.",
    iconName: "Share2",
    colorClass: "text-indigo-600 dark:text-indigo-400",
    bgGradientClass: "from-indigo-500 to-blue-600",
    borderClass: "border-indigo-200 dark:border-indigo-900/50",
  },
  {
    id: "utility",
    name: "Utility Tools",
    description: "Generate unbreakable passwords and count words for everyday tasks.",
    iconName: "Wrench",
    colorClass: "text-blue-600 dark:text-blue-400",
    bgGradientClass: "from-blue-500 to-cyan-600",
    borderClass: "border-blue-200 dark:border-blue-900/50",
  },
  {
    id: "seo",
    name: "SEO Tools",
    description: "Analyze meta tags and check basic website SEO scores.",
    iconName: "Search",
    colorClass: "text-amber-600 dark:text-amber-400",
    bgGradientClass: "from-amber-500 to-orange-600",
    borderClass: "border-amber-200 dark:border-amber-900/50",
  },
  {
    id: "ai",
    name: "AI",
    description: "Summarize large texts using advanced artificial intelligence.",
    iconName: "Sparkles",
    colorClass: "text-purple-600 dark:text-purple-400",
    bgGradientClass: "from-purple-500 to-fuchsia-600",
    borderClass: "border-purple-200 dark:border-purple-900/50",
  },
  {
    id: "developer",
    name: "Developer Tools",
    description: "Format JSON, generate CSS shadows, gradients, and timestamps.",
    iconName: "Code2",
    colorClass: "text-cyan-600 dark:text-cyan-400",
    bgGradientClass: "from-cyan-500 to-blue-600",
    borderClass: "border-cyan-200 dark:border-cyan-900/50",
  },
  {
    id: "converter",
    name: "Converters",
    description: "Convert colors, text casing, and encode/decode Base64.",
    iconName: "ArrowRightLeft",
    colorClass: "text-pink-600 dark:text-pink-400",
    bgGradientClass: "from-pink-500 to-rose-600",
    borderClass: "border-pink-200 dark:border-pink-900/50",
  },
];

export const CATEGORY_THEMES: Record<
  string,
  {
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconColor: string;
    activeBorder: string;
    glow: string;
  }
> = {
  pdf: {
    badgeBg: "bg-rose-50 dark:bg-rose-950/50",
    badgeText: "text-rose-700 dark:text-rose-300",
    iconBg: "bg-rose-50 dark:bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    activeBorder: "border-rose-500",
    glow: "",
  },
  image: {
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/50",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    activeBorder: "border-emerald-500",
    glow: "",
  },
  marketing: {
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/50",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    activeBorder: "border-indigo-500",
    glow: "",
  },
  utility: {
    badgeBg: "bg-blue-50 dark:bg-blue-950/50",
    badgeText: "text-blue-700 dark:text-blue-300",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    activeBorder: "border-blue-500",
    glow: "",
  },
  seo: {
    badgeBg: "bg-amber-50 dark:bg-amber-950/50",
    badgeText: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    activeBorder: "border-amber-500",
    glow: "",
  },
  ai: {
    badgeBg: "bg-purple-50 dark:bg-purple-950/50",
    badgeText: "text-purple-700 dark:text-purple-300",
    iconBg: "bg-purple-50 dark:bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    activeBorder: "border-purple-500",
    glow: "",
  },
  developer: {
    badgeBg: "bg-cyan-50 dark:bg-cyan-950/50",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    activeBorder: "border-cyan-500",
    glow: "",
  },
  converter: {
    badgeBg: "bg-pink-50 dark:bg-pink-950/50",
    badgeText: "text-pink-700 dark:text-pink-300",
    iconBg: "bg-pink-50 dark:bg-pink-500/10",
    iconColor: "text-pink-600 dark:text-pink-400",
    activeBorder: "border-pink-500",
    glow: "",
  },
};
