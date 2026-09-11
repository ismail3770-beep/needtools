// Invalidate server cache
import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOOLS_REGISTRY, getToolBySlug } from "@/config/toolsRegistry";
import { CATEGORIES } from "@/config/categories";
import { locales } from "@/i18n/routing";
import { CategoryView } from "./CategoryView";
import { ToolView } from "./ToolView";
import { JsonLdSchema } from "@/components/seo/JsonLdSchema";
import { ALL_PSEO_VARIANTS, parsePseoSlug } from "@/config/pseoRegistry";

interface UnifiedPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

// Allow dynamic routing for tool pages in SSR mode
export const dynamicParams = true;

export async function generateStaticParams() {
  const toolParams = TOOLS_REGISTRY.map((tool) => ({
    slug: tool.slug,
  }));
  
  const categoryParams = CATEGORIES.map((category) => ({
    slug: category.id,
  }));

  const pseoParams: {slug: string}[] = [];
  TOOLS_REGISTRY.forEach(tool => {
    ALL_PSEO_VARIANTS.forEach(variant => {
      if (variant.type === "profession") {
        pseoParams.push({ slug: `${tool.slug}-for-${variant.slug}` });
      } else {
        pseoParams.push({ slug: `${tool.slug}-on-${variant.slug}` });
      }
    });
  });

  return [...toolParams, ...categoryParams, ...pseoParams];
}

// Generate metadata for EITHER a tool or a category
export async function generateMetadata({ params }: UnifiedPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const baseUrl = "https://needtools.app";
  const localePath = locale === "en" ? "" : `/${locale}`;

  // Helper for hreflang alternates
  const buildHreflang = (path: string) => {
    const languages: Record<string, string> = {};
    locales.forEach((loc) => {
      languages[loc] = loc === "en" ? `${baseUrl}${path}` : `${baseUrl}/${loc}${path}`;
    });
    languages["x-default"] = `${baseUrl}${path}`;
    return languages;
  };
  
  // 1. Check if it's a Category
  const category = CATEGORIES.find((c) => c.id === slug);
  if (category) {
    const canonicalUrl = `${baseUrl}${localePath}/tools/${category.id}`;
    const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(category.name)}&desc=${encodeURIComponent(category.description)}&category=Category&badge=All%20Free%20Tools`;
    return {
      title: `${category.name} - Free Online Utilities & Productivity Apps | NeedTools`,
      description: category.description,
      alternates: {
        canonical: canonicalUrl,
        languages: buildHreflang(`/tools/${category.id}`),
      },
      openGraph: {
        title: `${category.name} — NeedTools`,
        description: category.description,
        url: canonicalUrl,
        siteName: "NeedTools",
        locale: locale,
        type: "website",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${category.name} on NeedTools`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${category.name} — NeedTools`,
        description: category.description,
        images: [ogImageUrl],
        creator: "@needtools",
      },
    };
  }

  // 2. Check if it's a Tool
  const tool = getToolBySlug(slug);
  if (tool) {
    const toolCat = CATEGORIES.find((c) => c.id === tool.category);
    const catName = toolCat?.name || "Online Tools";
    const canonicalUrl = `${baseUrl}${localePath}/tools/${tool.slug}`;
    const title = tool.metaTitle || `${tool.name} Online Free - Zero Upload, 100% Client-Side | NeedTools`;
    const description = tool.metaDescription || `Free online ${tool.name}. ${tool.shortDescription}. 100% privacy with zero server uploads—all processing runs securely in your browser.`;
    const badge = tool.marketingBadges?.[0] || "100% Free & No Sign-up";
    const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(tool.name)}&desc=${encodeURIComponent(tool.shortDescription)}&category=${encodeURIComponent(catName)}&badge=${encodeURIComponent(badge)}`;

    return {
      title,
      description,
      keywords: [...tool.intentKeywords, ...tool.tags, "needtools", "free online tools", "no upload privacy"],
      alternates: {
        canonical: canonicalUrl,
        languages: buildHreflang(`/tools/${tool.slug}`),
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "NeedTools",
        locale: locale,
        type: "website",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${tool.name} - Free Online Tool`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImageUrl],
        creator: "@needtools",
      },
    };
  }

  // 3. Check pSEO Pattern
  const pseoMatch = parsePseoSlug(slug);
  if (pseoMatch) {
    const { baseToolSlug, variant } = pseoMatch;
    const baseTool = getToolBySlug(baseToolSlug);
    if (baseTool) {
      const canonicalUrl = `${baseUrl}${localePath}/tools/${slug}`;
      const title = `Best ${baseTool.name} ${variant.modifierText} - Free & Zero Upload`;
      const description = `The fastest and most secure ${baseTool.name} specifically optimized ${variant.modifierText}. 100% private, client-side processing.`;
      
      return {
        title,
        description,
        alternates: {
          canonical: canonicalUrl,
          languages: buildHreflang(`/tools/${slug}`),
        },
      };
    }
  }

  return {
    title: "Not Found",
  };
}

export default async function UnifiedPage({ params }: UnifiedPageProps) {
  const { slug } = await params;

  // 1. Check if slug matches a Category
  const category = CATEGORIES.find((c) => c.id === slug);
  if (category) {
    return <CategoryView categoryId={category.id} />;
  }

  // 2. Check if slug matches a Tool
  const tool = getToolBySlug(slug);
  if (tool) {
    if (tool.slug === "qr-codes") {
      // Lazy load to avoid circular dependencies or bloating standard pages
      const { PremiumQrCodeView } = await import("./PremiumQrCodeViewUpdated");
      return (
        <>
          <JsonLdSchema tool={tool} />
          <PremiumQrCodeView tool={tool} />
        </>
      );
    }

    return (
      <>
        <JsonLdSchema tool={tool} />
        <ToolView toolSlug={tool.slug} />
      </>
    );
  }

  // 3. Check pSEO Pattern
  const pseoMatch = parsePseoSlug(slug);
  if (pseoMatch) {
    const { baseToolSlug, variant } = pseoMatch;
    const baseTool = getToolBySlug(baseToolSlug);
    if (baseTool) {
      return (
        <>
          <JsonLdSchema tool={baseTool} />
          <ToolView toolSlug={baseTool.slug} pseoVariant={variant} />
        </>
      );
    }
  }

  // 4. Not Found
  notFound();
}