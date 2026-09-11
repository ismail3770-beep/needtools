import { MetadataRoute } from "next";
import { TOOLS_REGISTRY } from "@/config/toolsRegistry";
import { CATEGORIES } from "@/config/categories";
import { BLOG_POSTS } from "@/config/blogPosts";
import { locales } from "@/i18n/routing";

export const dynamic = "force-static";

const baseUrl = "https://needtools.app";

function getAlternates(path: string) {
  const languages: Record<string, string> = {};
  locales.forEach((locale) => {
    languages[locale] = locale === "en" ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`;
  });
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: { languages: getAlternates("") },
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: { languages: getAlternates("/privacy-policy") },
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: { languages: getAlternates("/terms") },
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: { languages: getAlternates("/contact") },
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: { languages: getAlternates("/blog") },
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: getAlternates("/about") },
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: { languages: getAlternates("/tools") },
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: { languages: getAlternates("/login") },
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: { languages: getAlternates("/signup") },
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/tools/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: { languages: getAlternates(`/tools/${cat.id}`) },
  }));

  const toolPages: MetadataRoute.Sitemap = TOOLS_REGISTRY.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
    alternates: { languages: getAlternates(`/tools/${tool.slug}`) },
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
    alternates: { languages: getAlternates(`/blog/${post.slug}`) },
  }));

  return [...staticPages, ...categoryPages, ...toolPages, ...blogPages];
}
