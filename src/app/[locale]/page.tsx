"use client";

import React from "react";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryCard } from "@/components/home/CategoryCard";
import { FeaturesZigZag } from "@/components/home/FeaturesZigZag";
import { CATEGORIES } from "@/config/categories";

import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-neutral-950">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <section id="categories" className="bg-white dark:bg-neutral-900 py-20 sm:py-32 border-y border-[#E2E8F0] dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
              {t('title')}
            </h2>
            <p className="text-base text-[#64748B] dark:text-white/60">
              {t('description')}
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
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5"
            >
              {t('seeAll')}
            </Link>
          </div>
          
        </div>
      </section>

      {/* Features Zig-Zag Layout */}
      <FeaturesZigZag />
      
    </div>
  );
}
