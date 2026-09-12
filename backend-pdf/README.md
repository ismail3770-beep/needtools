# NeedTools — Unified PDF Backend

One FastAPI service that powers **all** server-side PDF tools on NeedTools.
Merged from the old `backend-pdf-edit` + `backend-pdf-compress` folders
(those are kept for reference and can be deleted once this is deployed).

| Endpoint | Tool |
|---|---|
| `POST /api/edit-pdf` | PDF Editor (text / image / shapes / highlight) |
| `POST /compress` | PDF Compress |
| `POST /protect` | PDF Protect (AES-256 password) |
| `POST /ocr` | OCR → searchable PDF (`eng` / `ben` / `eng+ben`) |
| `POST /convert/word-to-pdf` | Word → PDF (LibreOffice) |
| `POST /convert/pdf-to-word` | PDF → Word (pdf2docx) |
| `POST /convert/pdf-to-excel` | PDF → Excel (camelot) |

---

## Deploy on Railway (recommended)

1. Railway → **New Project → Deploy from GitHub repo** → select `needtools`.
2. In the service settings set **Root Directory** to `backend-pdf`.
   Railway auto-detects the included `Dockerfile` and `railway.toml`.
3. Add a variable:
   - `ALLOWED_ORIGINS` = `https://needtools.app` (your real frontend domain;
     add more comma-separated origins if needed)
4. Deploy, then copy the public URL (e.g. `https://xxx.up.railway.app`).

## Deploy on Render (free tier)

1. Render → **New → Web Service** → connect the `needtools` repo.
2. Root Directory: `backend-pdf`, Runtime: **Docker**.
3. Add the same `ALLOWED_ORIGINS` env var.
4. Deploy and copy the URL.
   (Free tier sleeps after ~15 min idle — the first request after idle takes ~30s.)

## Connect the frontend

In Appwrite Sites (or wherever the frontend is hosted), set:

```
NEXT_PUBLIC_PDF_BACKEND_URL=https://your-unified-service-url
```

The frontend helper `src/lib/pdf-backend-api.ts` reads this single variable
for compress / protect / OCR / convert **and** edit calls.

> The visual PDF Editor (`PdfEditorUI`) reads `NEXT_PUBLIC_PDF_EDIT_BACKEND_URL`
> directly — until that component is migrated, also set
> `NEXT_PUBLIC_PDF_EDIT_BACKEND_URL` to the **same** unified URL.

Then **rebuild + redeploy** the frontend — `NEXT_PUBLIC_*` vars are inlined
at build time, so changing them without a rebuild has no effect.

## Local development

```bash
cd backend-pdf
pip install -r requirements.txt
# system deps for OCR/convert: ghostscript, tesseract-ocr, libreoffice
uvicorn main:app --reload --port 8000
```

## Optional env vars (hourly storage cleanup)

```
APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=...
APPWRITE_API_KEY=...
APPWRITE_STORAGE_BUCKET_ID=...
```

If these are missing the service still works — only the Appwrite bucket
cleanup is skipped.
