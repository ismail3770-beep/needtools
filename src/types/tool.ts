export type ToolCategory =
  | "pdf"
  | "image"
  | "marketing"
  | "utility"
  | "seo"
  | "ai"
  | "developer"
  | "converter";

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolHowToStep {
  title: string;
  description: string;
}

export interface ToolFeature {
  title: string;
  description: string;
}

export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: ToolCategory;
  subCategory?: string;
  iconName: string;
  tags: string[];
  intentKeywords: string[];
  isPopular?: boolean;
  isNew?: boolean;
  isHidden?: boolean;
  isClientSide: boolean;
  maxFileSizeMB?: number;
  howToSteps: ToolHowToStep[];
  features: ToolFeature[];
  faqs: ToolFaq[];
  // SEO & ASO Metadata Enhancements
  metaTitle?: string;
  metaDescription?: string;
  rating?: {
    ratingValue: number;
    ratingCount: number;
  };
  marketingBadges?: string[];
  prosComparison?: {
    feature: string;
    needTools: string;
    others: string;
  }[];
  seoGuide?: {
    title: string;
    content: string;
  }[];
}

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  iconName: string;
  colorClass: string;
  bgGradientClass: string;
  borderClass: string;
  faqs?: ToolFaq[];
}
