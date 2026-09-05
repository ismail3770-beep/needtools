import React from "react";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPostBySlug } from "@/config/blogPosts";
import { Metadata } from "next";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: `${post.title} — NeedTools Blog`,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Schema Markup for the Article
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    datePublished: post.date,
    dateModified: post.date,
  };

  return (
    <article className="min-h-screen bg-white dark:bg-neutral-950 py-20 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-4 border-b border-black/10 dark:border-white/10 pb-8">
          <div className="flex flex-wrap items-center gap-4 text-sm text-black/60 dark:text-white/60">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
            </time>
            <span>&bull;</span>
            <span>{post.author}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black dark:text-white">
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-xs font-medium text-black/80 dark:text-white/80">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none text-black/80 dark:text-white/80">
          {/* In a real app, you would render MDX or fetch HTML. For now, we mock the content of the first post. */}
          {post.slug === "zero-upload-tools-future-privacy" && (
            <>
              <p>
                In an era where massive data breaches make headlines every week, digital privacy is no longer just a luxury—it is a fundamental necessity. We are constantly sharing our files, photos, and personal data with third-party servers to convert, compress, or edit them.
              </p>
              <h2>The Problem with Cloud Tools</h2>
              <p>
                When you use a traditional online PDF compressor or image converter, your file is uploaded to an external server. It sits there while it is processed, and then you download it back. During this process, you are essentially trusting a faceless entity with your personal data.
              </p>
              <h2>The Zero-Upload Solution</h2>
              <p>
                At NeedTools, we believe in a better way. By leveraging modern web technologies like WebAssembly (Wasm) and the HTML5 Canvas API, we process all your files <strong>directly inside your browser</strong>. 
              </p>
              <ul>
                <li><strong>No Uploads:</strong> Your data never leaves your device.</li>
                <li><strong>Lightning Fast:</strong> No waiting for slow upload or download speeds.</li>
                <li><strong>Total Privacy:</strong> Even we cannot see what you are processing.</li>
              </ul>
              <p>
                Start using client-side tools today and take back control of your digital footprint.
              </p>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
