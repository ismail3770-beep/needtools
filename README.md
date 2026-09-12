# NeedTools

A multilingual suite of free, mostly browser-based utilities — PDF tools, image
converters, QR generators and marketing/link tools.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 3, `next-themes` for dark mode |
| i18n | `next-intl` — 14 locales via the `[locale]` route segment |
| Data / auth | Appwrite (`appwrite` in the browser, `node-appwrite` on the server) |
| PDF (client) | `pdf-lib`, `pdfjs-dist`, `jspdf` |
| Heavy PDF (server) | Python microservices on Railway (Ghostscript, Tesseract, LibreOffice) |
| Charts | `recharts` |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Other scripts:

```bash
npm run build       # production build
npm run start       # serve the production build
npm run typecheck   # tsc --noEmit
npm run lint
npm run clean       # remove .next
```

## Repository layout

```
src/
  app/
    [locale]/         # all user-facing routes (tools, blog, compare, dashboard, bio, ...)
    api/og/           # dynamic OpenGraph image generation
    sitemap.ts        # generated sitemap
    robots.ts         # robots.txt
  components/
    tools/            # ToolDispatcher + shared tool chrome (FAQ, how-to, related, feedback)
    layout/ ui/ seo/ home/ dashboard/ admin/ auth/ compare/ ads/ icons/ providers/
  config/
    toolsRegistry.ts  # single source of truth for every tool (slug, category, SEO copy, FAQ)
    categories.ts     # category + subcategory tree
    pseoRegistry.ts   # programmatic-SEO page definitions
    competitors.ts    # data behind the /compare pages
    blogPosts.ts
  tools-logic/        # the actual per-tool UI components, lazy-loaded by ToolDispatcher
  i18n/               # next-intl routing + request config
  lib/                # appwrite, auth, db, storage, rateLimit, md5, pdf-backend-api
  middleware.ts       # next-intl locale middleware
messages/             # translation catalogues, one JSON per locale
appwrite/             # Appwrite functions + resource definitions
backend-pdf-compress/ # Railway microservice: PDF compression
backend-pdf-edit/     # Railway microservice: PDF edit, OCR, Office conversions
scripts/              # maintenance / Appwrite setup scripts (see below)
public/               # static assets
Branding/             # logo and brand assets
marketing_vault/      # marketing copy and assets
```

## Adding a new tool

1. Add an entry to `src/config/toolsRegistry.ts` (slug, category, titles, SEO copy, FAQ).
2. Create the UI component under `src/tools-logic/<category>/<Name>UI.tsx`.
3. Register a dynamic import for it in `src/components/tools/ToolDispatcher.tsx`.
4. Add translation keys to `messages/en.json` (and the other locales).

The tool page, metadata, sitemap entry and related-tools links are all derived
from the registry — no new route file is needed.

## Deployment surfaces

There are three independent deployments:

1. **Frontend** — this Next.js app.
2. **`backend-pdf-compress`** — Railway service, URL in `NEXT_PUBLIC_PDF_COMPRESS_BACKEND_URL`.
3. **`backend-pdf-edit`** — Railway service, URL in `NEXT_PUBLIC_PDF_EDIT_BACKEND_URL`.
   Built from a custom Dockerfile because it needs Ghostscript, Tesseract and
   LibreOffice. Exposes long-running async endpoints: `/ocr`,
   `/convert/word-to-pdf`, `/convert/pdf-to-word`, `/convert/pdf-to-excel`.

Appwrite provides the database, storage bucket and auth used by the dashboard,
feedback widget, link/QR tools and the PDF editor.

## Environment variables

See `.env.example` for the full list. Summary:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_PDF_EDIT_BACKEND_URL` | PDF edit / OCR / conversion microservice |
| `NEXT_PUBLIC_PDF_COMPRESS_BACKEND_URL` | PDF compression microservice |
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite API endpoint |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite project |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | Appwrite database |
| `NEXT_PUBLIC_APPWRITE_CONTACT_COL_ID` | Contact form submissions |
| `NEXT_PUBLIC_APPWRITE_FEEDBACK_COL_ID` | Tool feedback widget |
| `NEXT_PUBLIC_APPWRITE_STATS_COL_ID` | Tool usage stats |
| `NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID` | Uploads for the PDF editor |
| `NEXT_PUBLIC_APPWRITE_SPLASH_PAGES_COL_ID` | Splash pages tool |
| `NEXT_PUBLIC_APPWRITE_CAMPAIGNS_COL_ID` | Link campaigns tool |

## Scripts

`scripts/setup-*.cjs` are one-time Appwrite provisioning helpers (collections,
buckets, attributes) and are safe to re-run. The remaining scripts are
codemods that were used for past migrations; they are kept for reference and
are not part of the build.

## Documentation

- `NeedTools-Documentation.md` — product and tool documentation
- `needtools-seo-growth-agent-brief.md` — SEO / growth operating brief
