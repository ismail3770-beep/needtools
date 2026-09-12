import React from "react";
import { ToolItem } from "@/types/tool";
import { CATEGORIES } from "@/config/categories";

const BASE_URL = "https://needtools.app";

interface JsonLdSchemaProps {
  tool: ToolItem;
}

export function JsonLdSchema({ tool }: JsonLdSchemaProps) {
  const category = CATEGORIES.find((c) => c.id === tool.category);
  const catName = category?.name || "Tools";

  const ogImageUrl =
    `${BASE_URL}/api/og?title=${encodeURIComponent(tool.name)}` +
    `&category=${encodeURIComponent(catName)}`;

  const toolUrl = `${BASE_URL}/tools/${tool.slug}`;
  const categoryUrl = `${BASE_URL}/tools/${tool.category}`;

  // IMPORTANT: only emit AggregateRating when we actually have collected ratings.
  // Hardcoded or fabricated review markup violates Google's structured data
  // policy (review snippet spam) and can trigger a site-wide manual action,
  // so there is deliberately no fallback value here.
  const rating =
    tool.rating && Number(tool.rating.ratingCount) > 0 ? tool.rating : null;

  // WebApplication + SoftwareApplication schema
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": ["WebApplication", "SoftwareApplication"],
    name: tool.name,
    headline: tool.metaTitle || `${tool.name} Online Free`,
    url: toolUrl,
    description: tool.fullDescription,
    applicationCategory: "UtilitiesApplication",
    operatingSystem:
      "Web Browser (Windows, macOS, Linux, iOS, Android, ChromeOS)",
    browserRequirements:
      "Requires modern web browser with HTML5 and WebAssembly support",
    image: ogImageUrl,
    screenshot: ogImageUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    ...(rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(rating.ratingValue),
            ratingCount: String(rating.ratingCount),
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
    author: {
      "@type": "Organization",
      name: "NeedTools",
      url: BASE_URL,
      logo: `${BASE_URL}/icon-512.png`,
    },
    featureList: tool.features?.map((f) => f.title) || [],
  };

  // BreadcrumbList - enables rich breadcrumb rendering in Google search results
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: catName,
        item: categoryUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: toolUrl,
      },
    ],
  };

  // HowTo schema
  const howToSchema =
    tool.howToSteps && tool.howToSteps.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `How to use ${tool.name} online for free`,
          description: tool.shortDescription,
          step: tool.howToSteps.map((step, idx) => ({
            "@type": "HowToStep",
            position: idx + 1,
            name: step.title,
            text: step.description,
            url: `${toolUrl}#generator`,
          })),
        }
      : null;

  // FAQ schema
  const faqSchema =
    tool.faqs && tool.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: tool.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
