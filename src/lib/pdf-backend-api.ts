/**
 * Helper API to communicate with the NeedTools PDF microservices.
 *
 * Backend URL resolution
 * ----------------------
 * There are two services, and historically three naming schemes were in use.
 * The canonical order is now resolved in ONE place (`resolveBackendUrl`):
 *
 *   1. NEXT_PUBLIC_PDF_EDIT_BACKEND_URL / NEXT_PUBLIC_PDF_COMPRESS_BACKEND_URL
 *      -- preferred, per-service.
 *   2. NEXT_PUBLIC_BACKEND_URL
 *      -- legacy single-host fallback, kept so existing deployments keep working.
 *   3. http://localhost:8001 (edit) / http://localhost:8002 (compress)
 *      -- local development default.
 *
 * Note: only NEXT_PUBLIC_* variables are readable in the browser. A bare
 * BACKEND_URL will NOT work here, which is why it is deliberately not read.
 *
 * Every server-dependent tool must call a helper from this file rather than
 * using fetch directly, so URLs, error unwrapping and form field names stay in
 * one place.
 */

/** Resolve a service URL from its per-service var, the legacy var, then a local default. */
function resolveBackendUrl(
  serviceUrl: string | undefined,
  localDefault: string
): string {
  const resolved = serviceUrl || process.env.NEXT_PUBLIC_BACKEND_URL || localDefault;
  // Trailing slashes would produce "//compress" style paths.
  return resolved.replace(/\/+$/, "");
}

const PDF_EDIT_URL = resolveBackendUrl(
  process.env.NEXT_PUBLIC_PDF_EDIT_BACKEND_URL,
  "http://localhost:8001"
);

const PDF_COMPRESS_URL = resolveBackendUrl(
  process.env.NEXT_PUBLIC_PDF_COMPRESS_BACKEND_URL,
  "http://localhost:8002"
);

/** Shared error unwrapping for every backend call. */
async function unwrapError(response: Response, fallback: string): Promise<never> {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(
    (errorData as { detail?: string }).detail || `${fallback}: ${response.status}`
  );
}

/**
 * Compress a PDF via the PDF Compress microservice.
 * @param file            The PDF File object from the browser.
 * @param imageQuality    JPEG quality 10–100 (lower = smaller file). Default 60.
 * @param resolutionScale Render scale 0.5–4.0 (lower = lower resolution). Default 1.5.
 */
export async function compressPdfWithBackend(
  file: File,
  imageQuality = 60,
  resolutionScale = 1.5
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const url = new URL(`${PDF_COMPRESS_URL}/compress`);
  url.searchParams.set("image_quality", String(Math.round(imageQuality)));
  url.searchParams.set("resolution_scale", String(resolutionScale));

  const response = await fetch(url.toString(), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return unwrapError(response, "Backend error");

  return response.blob();
}

/**
 * Encrypt a PDF with password protection via the PDF Compress microservice.
 * Uses PyMuPDF AES-256 encryption — preserves all original content.
 * @param file          The PDF File object from the browser.
 * @param userPassword  Password required to open the document.
 * @param permissions   Array of permission strings: "print", "modify", "copy", "annot-forms".
 */
export async function protectPdfWithBackend(
  file: File,
  userPassword: string,
  permissions: string[] = []
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_password", userPassword);
  if (permissions.length > 0) {
    formData.append("permissions", permissions.join(","));
  }

  const response = await fetch(`${PDF_COMPRESS_URL}/protect`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return unwrapError(response, "Backend error");

  return response.blob();
}

/**
 * Send a PDF file + edits payload to the PDF Edit microservice.
 *
 * The edits object is page-keyed with 1-based string keys, and coordinates are
 * in viewport pixels at the scale the editor rendered at:
 *
 *   {
 *     "__scale": 1.5,
 *     "1": {
 *       drawings:    [{ type, x, y, width, height, startX?, startY?, endX?, endY?, color? }],
 *       editedTexts: [{ x, y, width, height, newText, format: { fontFamily, fontSize, color } }],
 *       newTexts:    [{ x, y, text, format: { fontFamily, fontSize, color } }],
 *       images:      [{ x, y, width, height, dataUrl }],
 *     }
 *   }
 *
 * @param file   The original PDF File object from the browser.
 * @param edits  Page-keyed edits object (stringified as JSON).
 * @returns      The edited PDF as a Blob.
 */
export async function editPdfWithBackend(
  file: File,
  edits: Record<string, unknown>
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("edits", JSON.stringify(edits));

  const response = await fetch(`${PDF_EDIT_URL}/api/edit-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return unwrapError(response, "Backend error");

  return response.blob();
}

/**
 * Run OCR on a PDF or Image.
 */
export async function ocrPdfWithBackend(
  file: File,
  lang: string = "eng"
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("lang", lang);

  const response = await fetch(`${PDF_COMPRESS_URL}/ocr`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return unwrapError(response, "OCR failed");

  return response.blob();
}

/**
 * Convert PDF to Word
 */
export async function pdfToWordWithBackend(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${PDF_COMPRESS_URL}/convert/pdf-to-word`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return unwrapError(response, "Conversion failed");

  return response.blob();
}

/**
 * Convert Word to PDF
 */
export async function wordToPdfWithBackend(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${PDF_COMPRESS_URL}/convert/word-to-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return unwrapError(response, "Conversion failed");

  return response.blob();
}

/**
 * Convert PDF to Excel
 */
export async function pdfToExcelWithBackend(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${PDF_COMPRESS_URL}/convert/pdf-to-excel`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return unwrapError(response, "Conversion failed");

  return response.blob();
}

/**
 * Convert an Office / text document to PDF via LibreOffice headless.
 * Supports: .ppt .pptx .odp .xls .xlsx .ods .csv .doc .docx .odt .rtf .txt
 */
export async function officeToPdfWithBackend(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${PDF_COMPRESS_URL}/convert/office-to-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return unwrapError(response, "Conversion failed");

  return response.blob();
}

/**
 * Convert a PDF into a PowerPoint deck (one slide per page).
 * @param dpi Render resolution 72–300. Default 150.
 */
export async function pdfToPptWithBackend(file: File, dpi = 150): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("dpi", String(Math.round(dpi)));

  const response = await fetch(`${PDF_COMPRESS_URL}/convert/pdf-to-ppt`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return unwrapError(response, "Conversion failed");

  return response.blob();
}

/**
 * Convert a PDF into a single multi-page TIFF.
 * @param dpi Render resolution 72–300. Default 150.
 */
export async function pdfToTiffWithBackend(file: File, dpi = 150): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("dpi", String(Math.round(dpi)));

  const response = await fetch(`${PDF_COMPRESS_URL}/convert/pdf-to-tiff`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return unwrapError(response, "Conversion failed");

  return response.blob();
}

/**
 * Convert a single-page or multi-page TIFF into a PDF.
 */
export async function tiffToPdfWithBackend(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${PDF_COMPRESS_URL}/convert/tiff-to-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return unwrapError(response, "Conversion failed");

  return response.blob();
}

/**
 * Trigger a browser download of a file Blob.
 */
export function downloadFileBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Trigger a browser download of a PDF Blob.
 */
export function downloadPdfBlob(blob: Blob, originalFilename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const lastDot = originalFilename.lastIndexOf(".");
  const name = lastDot > 0 ? originalFilename.slice(0, lastDot) : originalFilename;
  const ext = lastDot > 0 ? originalFilename.slice(lastDot) : ".pdf";
  a.download = `${name}_compressed${ext}`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
