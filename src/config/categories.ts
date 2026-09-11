import { CategoryInfo } from "@/types/tool";

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "pdf",
    name: "PDF Tools",
    description: "Convert, merge, split, and organize PDF documents seamlessly.",
    iconName: "CustomPdf",
    colorClass: "text-red-600 dark:text-red-400",
    bgGradientClass: "from-red-500 to-rose-600",
        borderClass: "border-red-200 dark:border-red-900/50",
    faqs: [
      {
        question: "Are these PDF tools really 100% free and private?",
        answer: "Yes. All of our PDF tools process your files directly in your browser. Your sensitive documents are never uploaded to our servers, ensuring absolute privacy and zero risk of data leaks."
      },
      {
        question: "Do I need to install any software to edit PDFs?",
        answer: "No installation is required. NeedTools runs entirely in your web browser (Chrome, Safari, Edge, Firefox) on Windows, Mac, Linux, and mobile devices."
      },
      {
        question: "Is there a limit on how many PDFs I can process?",
        answer: "There are no usage limits. You can merge, split, compress, and convert as many PDF files as you want completely free without creating an account."
      }
    ]
  },
  {
    id: "image",
    name: "Image Tools",
    description: "Compress, convert, resize, and optimize photos with zero quality loss.",
    iconName: "Image",
    colorClass: "text-amber-600 dark:text-amber-400",
    bgGradientClass: "from-amber-500 to-orange-600",
        borderClass: "border-amber-200 dark:border-amber-900/50",
    faqs: [
      {
        question: "Do my images get uploaded to a server for compression?",
        answer: "No. Unlike other tools, our Image Compressors and Converters use client-side JavaScript. Your photos never leave your device, meaning 100% privacy and blazing fast processing speeds."
      },
      {
        question: "Will compressing an image reduce its quality?",
        answer: "Our smart compression algorithms reduce file size significantly while preserving the visual quality. You can also manually adjust the quality slider to find the perfect balance."
      }
    ]
  },
  {
    id: "marketing",
    name: "Marketing Tools",
    description: "Generate QR codes and shorten URLs for your marketing campaigns.",
    iconName: "Share2",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgGradientClass: "from-emerald-500 to-teal-600",
        borderClass: "border-emerald-200 dark:border-emerald-900/50",
    faqs: [
      {
        question: "Do QR codes generated here expire?",
        answer: "No, our standard QR codes are static and never expire. You can use them on printed materials forever without worrying about dead links."
      },
      {
        question: "Can I customize the QR codes?",
        answer: "Yes, you can customize colors, add your brand logo, and change the dot styles before downloading your high-resolution QR code."
      }
    ]
  },
  {
    id: "utility",
    name: "Utility Tools",
    description: "Generate unbreakable passwords and count words for everyday tasks.",
    iconName: "Wrench",
    colorClass: "text-blue-600 dark:text-blue-400",
    bgGradientClass: "from-blue-500 to-indigo-600",
        borderClass: "border-blue-200 dark:border-blue-900/50",
    faqs: [
      {
        question: "Are the passwords generated securely?",
        answer: "Yes. The password generator uses cryptographically secure random number generators running locally in your browser. We never track or store the passwords you generate."
      }
    ]
  },
  {
    id: "developer",
    name: "Developer Tools",
    description: "Format JSON, generate CSS shadows, gradients, and timestamps.",
    iconName: "Code2",
    colorClass: "text-cyan-600 dark:text-cyan-400",
    bgGradientClass: "from-cyan-500 to-teal-600",
        borderClass: "border-cyan-200 dark:border-cyan-900/50",
    faqs: [
      {
        question: "Is my JSON data safe?",
        answer: "Absolutely. When you paste JSON data into our formatter, it is processed entirely on your local machine. No data is sent over the internet."
      }
    ]
  },
  {
    id: "converter",
    name: "Converters",
    description: "Convert colors, text casing, and encode/decode Base64.",
    iconName: "ArrowRightLeft",
    colorClass: "text-pink-600 dark:text-pink-400",
    bgGradientClass: "from-pink-500 to-rose-600",
        borderClass: "border-pink-200 dark:border-pink-900/50",
    faqs: [
      {
        question: "How fast are the converters?",
        answer: "Because our converters run 100% client-side without network uploads, the conversion is practically instantaneous."
      }
    ]
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
    badgeBg: "bg-red-50 dark:bg-red-950/50",
    badgeText: "text-red-700 dark:text-red-300",
    iconBg: "bg-red-50 dark:bg-red-500/10",
    iconColor: "text-red-600 dark:text-red-400",
    activeBorder: "border-red-500",
    glow: "",
  },
  image: {
    badgeBg: "bg-amber-50 dark:bg-amber-950/50",
    badgeText: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    activeBorder: "border-amber-500",
    glow: "",
  },
  marketing: {
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/50",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    activeBorder: "border-emerald-500",
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

