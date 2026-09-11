import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Query } from "appwrite";
import { UserCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────

interface BioLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

interface BioPage {
  $id: string;
  slug: string;
  ownerId: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  theme: string;
  links: string;
}

type Theme = "light" | "dark" | "blue" | "emerald" | "rose" | "purple";

const THEMES: Record<Theme, string> = {
  light: "bg-slate-50 text-slate-900",
  dark: "bg-slate-900 text-white",
  blue: "bg-blue-50 text-blue-900",
  emerald: "bg-emerald-50 text-emerald-900",
  rose: "bg-rose-50 text-rose-900",
  purple: "bg-purple-900 text-white",
};

// ─── Fetch Helper ────────────────────────────────────────────

async function getBioPage(slug: string): Promise<BioPage | null> {
  try {
    const { databases } = await import("@/lib/appwrite");
    const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "6a789c5430b868b6d118";
    const BIO_PAGES_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_BIO_PAGES_COL_ID || "bio_pages";

    const res = await databases.listDocuments(DB_ID, BIO_PAGES_COL_ID, [
      Query.equal("slug", slug),
      Query.limit(1),
    ]);

    if (res.documents.length === 0) return null;
    return res.documents[0] as unknown as BioPage;
  } catch (err) {
    console.error("Error fetching bio page:", err);
    return null;
  }
}

// ─── Metadata ────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getBioPage(slug);

  if (!page) {
    return {
      title: "Bio Not Found — NeedTools",
    };
  }

  return {
    title: `${page.displayName} — Bio Links`,
    description: page.bio || `Check out ${page.displayName}'s links on NeedTools.`,
    openGraph: {
      title: `${page.displayName} — Bio Links`,
      description: page.bio || `Check out ${page.displayName}'s links.`,
      images: page.avatarUrl ? [{ url: page.avatarUrl }] : undefined,
    },
    alternates: {
      canonical: `https://needtools.app/bio/${page.slug}`,
    },
  };
}

// ─── Page Component ──────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const { databases } = await import("@/lib/appwrite");
    const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "6a789c5430b868b6d118";
    const BIO_PAGES_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_BIO_PAGES_COL_ID || "bio_pages";

    const res = await databases.listDocuments(DB_ID, BIO_PAGES_COL_ID);
    if (res.documents.length === 0) {
      return [{ slug: "demo" }];
    }
    return res.documents.map((doc) => ({
      slug: doc.slug,
    }));
  } catch (err) {
    console.error("Error fetching bio pages for static params:", err);
    return [{ slug: "demo" }];
  }
}

export const dynamicParams = true;

export default async function BioPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getBioPage(slug);

  if (!page) {
    notFound();
  }

  const themeClass = THEMES[(page.theme as Theme)] || THEMES.light;

  let links: BioLink[] = [];
  try {
    links = JSON.parse(page.links || "[]");
  } catch {
    // Ignore parse errors
  }

  // Determine button styles based on theme
  const isDark = page.theme === "dark" || page.theme === "purple";
  const btnClass = isDark
    ? "bg-white/10 hover:bg-white/20 border-white/10"
    : "bg-black/5 hover:bg-black/10 border-black/10";

  return (
    <div className={`min-h-screen w-full flex flex-col items-center py-12 px-4 sm:px-6 ${themeClass}`}>
      <div className="w-full max-w-lg flex flex-col items-center">

        {/* Avatar */}
        {page.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.avatarUrl}
            alt={page.displayName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mb-4 shadow-md border-2 border-current/10"
          />
        ) : (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-current/10 flex items-center justify-center mb-4 border-2 border-current/10">
            <UserCircle className="w-12 h-12 opacity-50" />
          </div>
        )}

        {/* Profile Info */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
          {page.displayName}
        </h1>

        {page.bio && (
          <p className="text-base text-center mb-8 opacity-80 max-w-md leading-relaxed">
            {page.bio}
          </p>
        )}

        {!page.bio && <div className="h-6" />}

        {/* Links List */}
        <div className="w-full space-y-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center justify-between w-full p-4 sm:p-5 rounded-2xl text-center font-semibold border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${btnClass}`}
            >
              <div className="w-6" /> {/* Spacer for centering */}
              <span className="text-base sm:text-lg text-center flex-1">{link.title}</span>
              <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
            </a>
          ))}
        </div>

        {/* Branding Footer */}
        <div className="mt-16 pt-8 pb-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <span className="text-xs font-bold tracking-widest uppercase">
              Made with NeedTools
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
