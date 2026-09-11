import React from "react";
import Link from "next/link";
import { BLOG_POSTS } from "@/config/blogPosts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — NeedTools",
  description: "Read the latest articles on privacy, security, and web tools from the NeedTools team.",
};

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-white sm:text-5xl">
            NeedTools Blog
          </h1>
          <p className="text-xl text-black/60 dark:text-white/60">
            Insights on digital privacy, productivity, and the web.
          </p>
        </div>

        <div className="space-y-8">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 sm:p-8 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2 mb-4">
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                <time dateTime={post.date} className="text-sm text-black/50 dark:text-white/50 whitespace-nowrap">
                  {new Date(post.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                </time>
              </div>
              
              <p className="text-black/70 dark:text-white/70 mb-6">
                {post.description}
              </p>
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 text-xs font-medium text-black dark:text-white">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Read article &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
