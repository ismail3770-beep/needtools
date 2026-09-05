import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOOLS_REGISTRY, getToolBySlug } from "@/config/toolsRegistry";
import { CATEGORIES } from "@/config/categories";
import { CategoryView } from "./CategoryView";
import { ToolView } from "./ToolView";

interface UnifiedPageProps {
params: Promise<{
slug: string;
}>;
}

// Generate static routes for BOTH tools and categories
export async function generateStaticParams() {
const toolParams = TOOLS_REGISTRY.map((tool) => ({
slug: tool.slug,
}));

const categoryParams = CATEGORIES.map((category) => ({
slug: category.id,
}));

return [...toolParams, ...categoryParams];
}

// Generate metadata for EITHER a tool or a category
export async function generateMetadata({ params }: UnifiedPageProps): Promise<Metadata> {
const { slug } = await params;

// 1. Check if it's a Category
const category = CATEGORIES.find((c) => c.id === slug);
if (category) {
return {
title: `${category.name} — NeedTools`,
description: category.description,
alternates: {
canonical: `https://needtools.app/tools/${category.id}`,
},
};
}

// 2. Check if it's a Tool
const tool = getToolBySlug(slug);
if (tool) {
return {
title: `${tool.name} — 100% Free & Private Online Tool`,
description: tool.fullDescription,
keywords: [...tool.tags, ...tool.intentKeywords],
alternates: {
canonical: `https://needtools.app/tools/${tool.slug}`,
},
openGraph: {
title: `${tool.name} — NeedTools`,
description: tool.shortDescription,
url: `https://needtools.app/tools/${tool.slug}`,
type: "website",
},
};
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
return <ToolView toolSlug={tool.slug} />;
}

// 3. Not Found
notFound();
}
