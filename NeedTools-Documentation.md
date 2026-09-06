# NeedTools — Project Documentation

## Tech Stack

```
Frontend:    Next.js 15.3 (App Router) + React 19 + TypeScript 5.9
Styling:     Tailwind CSS 3.4 (class-based dark mode, Poppins font, indigo brand)
Backend:     Python FastAPI + Uvicorn + PyMuPDF (PDF processing)
BaaS:        Appwrite (SGP region) — Database, Storage, Auth, Functions
Hosting:     Appwrite Hosting (static export) + Railway (Python backend)
```

### Key Dependencies

```json
{
  "pdf-lib": "^1.17.1",
  "pdfjs-dist": "^6.2.108",
  "jspdf": "^4.2.1",
  "jszip": "^3.10.1",
  "fabric": "^7.4.0",
  "qr-code-styling": "^1.9.2",
  "qrcode": "^1.5.4",
  "lucide-react": "^0.475.0",
  "next-themes": "^0.4.4",
  "appwrite": "^26.2.0",
  "node-appwrite": "^27.1.0",
  "canvas-confetti": "^1.9.4",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.0.1",
  "zod": "^3.24.2"
}
```

### Python Backend Dependencies

```
fastapi>=0.115.0
uvicorn>=0.27.1
PyMuPDF>=1.28.0
pydantic>=2.6.1
python-multipart>=0.0.9
```

---

## All Tools (26)

### PDF Tools (9)
| # | ID               | Slug            | Name                  | Client-Side |
|---|------------------|-----------------|-----------------------|-------------|
| 1 | pdf-editor       | edit-pdf        | PDF Editor            | Hybrid      |
| 2 | pdf-text-edit    | pdf-text-edit   | PDF Text Editor       | Yes         |
| 3 | pdf-compressor   | pdf-compressor  | PDF Compressor        | Yes         |
| 4 | pdf-to-jpg       | pdf-to-jpg      | PDF to JPG Converter  | Yes         |
| 5 | image-to-pdf     | image-to-pdf    | JPG to PDF Converter  | Yes         |
| 6 | pdf-merge        | pdf-merge       | PDF Merge             | Yes         |
| 7 | pdf-split        | pdf-split       | PDF Split & Organize  | Yes         |
| 8 | protect-pdf      | protect-pdf     | Protect PDF           | Yes         |
| 9 | sign-pdf         | sign-pdf        | Fill & Sign PDF       | Yes         |

### Image Tools (3)
| # | ID               | Slug             | Name                  | Client-Side |
|---|------------------|------------------|-----------------------|-------------|
| 1 | image-compressor | image-compressor | Image Compressor      | Yes         |
| 2 | image-resizer    | image-resizer    | Image Resizer         | Yes         |
| 3 | jpg-to-png       | jpg-to-png       | JPG to PNG Converter  | Yes         |

### Developer Tools (4)
| # | ID                   | Slug                 | Name                    | Client-Side |
|---|----------------------|----------------------|-------------------------|-------------|
| 1 | json-formatter       | json-formatter       | JSON Formatter          | Yes         |
| 2 | gradient-generator   | gradient-generator   | CSS Gradient Generator  | Yes         |
| 3 | box-shadow-generator | box-shadow-generator | Box Shadow Generator    | Yes         |
| 4 | markdown-previewer   | markdown-previewer   | Markdown Previewer      | Yes         |

### Converter Tools (3)
| # | ID                   | Slug                 | Name                      | Client-Side |
|---|----------------------|----------------------|---------------------------|-------------|
| 1 | color-converter      | color-converter      | Color Converter           | Yes         |
| 2 | timestamp-converter  | timestamp-converter  | Unix Timestamp Converter  | Yes         |
| 3 | base64-converter     | base64-converter     | Base64 Encoder/Decoder    | Yes         |

### Utility Tools (4)
| # | ID                  | Slug                | Name               | Client-Side |
|---|---------------------|---------------------|---------------------|-------------|
| 1 | password-generator  | password-generator  | Password Generator  | Yes         |
| 2 | word-counter        | word-counter        | Word Counter        | Yes         |
| 3 | hash-generator      | hash-generator      | Hash Generator      | Yes         |
| 4 | case-converter      | case-converter      | Case Converter      | Yes         |

### SEO Tools (1)
| # | ID               | Slug             | Name             | Client-Side |
|---|------------------|------------------|------------------|-------------|
| 1 | meta-tag-checker | meta-tag-checker | Meta Tag Checker | Yes         |

### Marketing Tools (2)
| # | ID             | Slug           | Name           | Client-Side | Notes  |
|---|----------------|----------------|----------------|-------------|--------|
| 1 | qr-generator   | qr-codes       | QR Codes       | Yes         |        |
| 2 | link-shortener | link-shortener | Link Shortener | Yes         | Hidden |

---

## Categories (8)

```
pdf, image, marketing, utility, seo, ai (no tools yet), developer, converter
```

---

## Pages & Routes (13)

```
/                              → Home page
/tools                         → All tools listing
/tools/[slug]                  → Individual tool page (dynamic)
/admin                         → Admin dashboard
/blog                          → Blog listing
/blog/[slug]                   → Blog post (dynamic)
/contact                       → Contact form
/about                         → About page
/dashboard                     → User dashboard
/privacy-policy                → Privacy policy
/terms                         → Terms of service
/test-icons                    → Icon test page
/tools/qr-codes/dashboard      → QR code analytics dashboard
```

Additional: `sitemap.ts`, `robots.ts`, `not-found.tsx`, `error.tsx`, `layout.tsx`

---

## Project Structure

```
NeedTools/
├── appwrite/
│   └── functions/
│       ├── compress-pdf/          # Appwrite Function: PDF compression
│       ├── storage-cleanup/       # Appwrite Function: hourly file cleanup
│       └── url-redirector/        # Appwrite Function: short URL redirect
│
├── backend/                       # Legacy monolithic backend (deprecated)
│
├── backend-pdf-edit/              # Microservice: PDF Edit (port 8001)
│   ├── main.py                    # /api/edit-pdf endpoint
│   ├── pdf_processor.py           # PyMuPDF edit logic (drawings, text, images)
│   ├── requirements.txt           # Python dependencies
│   ├── runtime.txt                # Python 3.11.9
│   ├── Procfile                   # Railway start command
│   └── railway.toml               # Railway deployment config
│
├── backend-pdf-compress/          # Microservice: PDF Compress (port 8002)
│   ├── main.py                    # /compress endpoint + inline compress logic
│   ├── requirements.txt           # Python dependencies
│   ├── runtime.txt                # Python 3.11.9
│   ├── Procfile                   # Railway start command
│   └── railway.toml               # Railway deployment config
│
├── Branding/                      # Logo concepts, style guide PDFs
│
├── scripts/                       # 23 utility/setup scripts
│   ├── setup-appwrite.cjs         # Initialize Appwrite collections
│   ├── setup-qrcodes.cjs          # QR code collection setup
│   ├── setup-pdf-bucket.cjs       # Storage bucket setup
│   ├── setup-links.cjs            # Link shortener setup
│   ├── generate_icons.js          # Icon generation
│   ├── hide_coming_soon.js        # Hide unfinished tools
│   ├── update_seo_data.js         # SEO metadata updater
│   └── ... (16 more utility scripts)
│
├── public/
│   ├── logo.svg / logo.png        # Site logo
│   ├── icon-192.png / icon-512.png # PWA icons
│   ├── site.webmanifest           # PWA manifest
│   ├── sw.js                      # Service worker
│   └── workers/
│       ├── pdf.worker.min.mjs     # pdfjs web worker
│       └── image-compressor.worker.js
│
├── src/
│   ├── app/                       # Next.js App Router (13 pages)
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Home
│   │   ├── globals.css            # Global styles + Tailwind
│   │   ├── admin/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── privacy-policy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── tools/page.tsx
│   │   ├── tools/[slug]/
│   │   │   ├── page.tsx
│   │   │   ├── CategoryView.tsx
│   │   │   ├── ToolView.tsx
│   │   │   └── PremiumQrCodeViewUpdated.tsx
│   │   ├── tools/qr-codes/dashboard/page.tsx
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   │
│   ├── components/                # ~40 reusable components
│   │   ├── admin/
│   │   │   ├── AdminLogin.tsx
│   │   │   └── DashboardOverview.tsx
│   │   ├── ads/
│   │   │   └── AdBanner.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── ToolCard.tsx
│   │   │   ├── FeaturesZigZag.tsx
│   │   │   ├── RecentTools.tsx
│   │   │   └── StatsBanner.tsx
│   │   ├── icons/
│   │   │   ├── DynamicIcon.tsx
│   │   │   └── IlovePdfIcons.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── CategorySidebar.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── providers/
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── AnalyticsTracker.tsx
│   │   │   └── ServiceWorkerRegistration.tsx
│   │   ├── seo/
│   │   │   ├── JsonLdSchema.tsx
│   │   │   └── GeoContentSection.tsx
│   │   ├── tools/
│   │   │   ├── ToolDispatcher.tsx      # Routes tool.id → component
│   │   │   ├── FaqAccordion.tsx
│   │   │   ├── HowToUseSection.tsx
│   │   │   ├── RelatedTools.tsx
│   │   │   ├── ShareButton.tsx
│   │   │   ├── ToolFeedbackWidget.tsx
│   │   │   ├── ToolFocusWrapper.tsx
│   │   │   ├── ToolHeroMockup.tsx
│   │   │   └── ToolSwitcher.tsx
│   │   └── ui/
│   │       ├── Logo.tsx
│   │       └── Toast.tsx
│   │
│   ├── config/
│   │   ├── toolsRegistry.ts       # All 26 tools registered here
│   │   ├── categories.ts          # 8 tool categories
│   │   └── blogPosts.ts           # Blog post data
│   │
│   ├── lib/
│   │   ├── appwrite.ts            # Appwrite client init
│   │   ├── db.ts                  # Database helpers (usage stats, feedback)
│   │   ├── storage.ts             # LocalStorage helpers (recent tools)
│   │   ├── pdf-backend-api.ts     # Backend API helpers (compress, edit)
│   │   ├── rateLimit.ts           # Rate limiting utility
│   │   ├── md5.ts                 # MD5 hash utility
│   │   └── utils.ts               # General utilities
│   │
│   ├── tools-logic/               # 26 tool UI implementations
│   │   ├── converter/
│   │   │   ├── Base64ConverterUI.tsx
│   │   │   ├── ColorConverterUI.tsx
│   │   │   ├── ImageToPdfUI.tsx
│   │   │   ├── PdfToJpgUI.tsx
│   │   │   └── TimestampConverterUI.tsx
│   │   ├── developer/
│   │   │   ├── BoxShadowGeneratorUI.tsx
│   │   │   ├── GradientGeneratorUI.tsx
│   │   │   ├── JsonFormatterUI.tsx
│   │   │   └── MarkdownPreviewerUI.tsx
│   │   ├── image/
│   │   │   ├── ImageCompressorUI.tsx
│   │   │   ├── ImageResizerUI.tsx
│   │   │   └── JpgToPngUI.tsx
│   │   ├── marketing/
│   │   │   └── LinkShortenerUI.tsx
│   │   ├── pdf/
│   │   │   ├── FillAndSignPdfUI.tsx
│   │   │   ├── PdfCompressorUI.tsx
│   │   │   ├── PdfMergeUI.tsx
│   │   │   ├── PdfSplitOrganizeUI.tsx
│   │   │   └── ProtectPdfUI.tsx
│   │   ├── pdf-editor/
│   │   │   └── PdfEditorUI.tsx         # Full PDF editor (shapes, images, text)
│   │   ├── pdf-text-edit/              # NEW: Inline text editor
│   │   │   ├── types.ts
│   │   │   ├── fontMapper.ts
│   │   │   ├── textGrouping.ts
│   │   │   ├── useTextExtraction.ts
│   │   │   ├── usePdfExport.ts
│   │   │   └── PdfTextEditUI.tsx
│   │   ├── security/
│   │   │   ├── HashGeneratorUI.tsx
│   │   │   ├── PasswordGeneratorUI.tsx
│   │   │   └── QrCodeGeneratorUI.tsx
│   │   ├── seo/
│   │   │   └── MetaTagCheckerUI.tsx
│   │   └── text/
│   │       ├── CaseConverterUI.tsx
│   │       └── WordCounterUI.tsx
│   │
│   └── types/
│       └── tool.ts                # ToolItem interface
│
├── .env.local                     # Local env vars
├── .env.production                # Production env vars
├── .env.example                   # Template
├── appwrite.config.json           # Appwrite project config
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

---

## Appwrite Configuration

### Database Collections (7)
```
Contact          → name, email, subject, message
Feedback         → toolSlug, isHelpful, comment
Stats            → toolSlug, usageCount, lastUsedAt
QR Codes         → userId, name, url, shortCode, styling
QR Scans         → qrCodeId, timestamp, userAgent, referrer
Links            → userId, originalUrl, shortCode, clicks
Link Stats       → linkId, timestamp, userAgent, referrer
```

### Storage Bucket
```
Bucket ID: 6a8f4c4f0482bf2aa92d (PDF files for editor)
```

### Appwrite Functions (3)
```
compress-pdf      → On-demand PDF compression via Appwrite Storage
storage-cleanup   → Hourly cron: deletes expired files
url-redirector    → Short URL redirect handler
```

---

## Backend API Endpoints (Microservices)

### PDF Edit Service
```
Base URL: NEXT_PUBLIC_PDF_EDIT_BACKEND_URL (Railway — separate service)
Local:    http://localhost:8001

POST /api/edit-pdf
  - Body: FormData { file: PDF, edits: JSON string }
  - Returns: edited PDF blob
  - Used by: PDF Editor (pdf-editor)

GET /
  - Health check
  - Returns: { status: "ok", service: "pdf-edit" }
```

### PDF Compress Service
```
Base URL: NEXT_PUBLIC_PDF_COMPRESS_BACKEND_URL (Railway/Render — separate service)
Local:    http://localhost:8002

POST /compress
  - Body: FormData { file: PDF }
  - Query: image_quality (10-100), resolution_scale (0.5-4.0)
  - Returns: compressed PDF blob
  - Used by: PDF Compressor

GET /
  - Health check
  - Returns: { status: "ok", service: "pdf-compress" }
```

---

## Environment Variables

```bash
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6a786172001351dc68bf
NEXT_PUBLIC_APPWRITE_DATABASE_ID=6a789c5430b868b6d118
NEXT_PUBLIC_APPWRITE_CONTACT_COL_ID=6a789c550d30b26daadf
NEXT_PUBLIC_APPWRITE_FEEDBACK_COL_ID=6a789c55de7b155b5a0f
NEXT_PUBLIC_APPWRITE_STATS_COL_ID=6a789c569c0e6f0c9714
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=6a8f4c4f0482bf2aa92d
NEXT_PUBLIC_APPWRITE_QR_COL_ID=6a88a2e1ec9f98d098a2
NEXT_PUBLIC_APPWRITE_QR_SCANS_COL_ID=6a88a2e6ae3ecb40d4aa
NEXT_PUBLIC_APPWRITE_LINKS_COL_ID=6a9b34076dad77e641a1
NEXT_PUBLIC_APPWRITE_LINK_STATS_COL_ID=6a9b340c04d1b328786f

# PDF Microservices (separate deployments)
NEXT_PUBLIC_PDF_EDIT_BACKEND_URL=https://your-pdf-edit-service.up.railway.app
NEXT_PUBLIC_PDF_COMPRESS_BACKEND_URL=https://your-pdf-compress-service.up.railway.app
```
