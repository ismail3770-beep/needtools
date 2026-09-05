"use client";

import React from "react";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryCard } from "@/components/home/CategoryCard";
import { FeaturesZigZag } from "@/components/home/FeaturesZigZag";
import { CATEGORIES } from "@/config/categories";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <section id="categories" className="bg-black/5 dark:bg-white/5 py-20 sm:py-32 border-b border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white">
              Browse Tools by Category
            </h2>
            <p className="text-base text-black/60 dark:text-white/60">
              Free, fast, and secure tools for your everyday tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-xl bg-black dark:bg-white px-8 py-3.5 text-sm font-semibold text-white dark:text-black shadow-sm hover:bg-black/90 dark:hover:bg-white/90 transition-all hover:-translate-y-0.5"
            >
              See All Tools
            </Link>
          </div>
          
        </div>
      </section>

      {/* Features Zig-Zag Layout */}
      <FeaturesZigZag />
      
    </div>
  );
}
