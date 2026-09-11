import React from "react";
import { ToolItem } from "@/types/tool";
import { CATEGORIES } from "@/config/categories";

interface JsonLdSchemaProps {
  tool: ToolItem;
}

export function JsonLdSchema({ tool }: JsonLdSchemaProps) {
  const category = CATEGORIES.find((c) => c.id === tool.category);
  const catName = category?.name || "Tools";

  // WebApplication + SoftwareApplication schema with ASO social proof ratings
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": ["WebApplication", "SoftwareApplication"],
    name: tool.name,
    headline: tool.metaTitle || `${tool.name} Online Free`,
    url: `https://needtools.app/tools/${tool.slug}`,
    description: tool.fullDescription,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser (Windows, macOS, Linux, iOS, Android, ChromeOS)",
    browserRequirements: "Requires modern web browser with HTML5 and WebAssembly support",
    softwareVersion: "2.5.0",
    image: `https://needtools.app/api/og?title=${encodeURIComponent(tool.name)}&category=${encodeURIComponent(catName)}`,
    screenshot: `https://needtools.app/api/og?title=${encodeURIComponent(tool.name)}&category=${encodeURIComponent(catName)}`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (tool.rating?.ratingValue || 4.9).toString(),
      ratingCount: (tool.rating?.ratingCount || 1500).toString(),
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Organization",
      name: "NeedTools",
      url: "https://needtools.app",
      logo: "https://needtools.app/icon-512.png",
    },
    featureList: tool.features?.map((f) => f.title) || [],
  };

  // BreadcrumbList — enables rich breadcrumb rendering in Google search results
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://needtools.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: catName,
        item: `https://needtools.app/tools/${tool.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `https://needtools.app/tools/${tool.slug}`,
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
            url: `https://needtools.app/tools/${tool.slug}#generator`,
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
