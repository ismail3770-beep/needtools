import React from "react";
import { ToolItem } from "@/types/tool";
import { CATEGORIES } from "@/config/categories";

interface JsonLdSchemaProps {
  tool: ToolItem;
}

export function JsonLdSchema({ tool }: JsonLdSchemaProps) {
  const category = CATEGORIES.find((c) => c.id === tool.category);
  const catName = category?.name || "Tools";

  // SoftwareApplication schema
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: `https://needtools.app/tools/${tool.slug}`,
    description: tool.fullDescription,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
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
          name: `How to use ${tool.name}`,
          description: tool.shortDescription,
          step: tool.howToSteps.map((step, idx) => ({
            "@type": "HowToStep",
            position: idx + 1,
            name: step.title,
            text: step.description,
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
