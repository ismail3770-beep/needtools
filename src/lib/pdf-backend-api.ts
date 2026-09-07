/**
 * Helper API to communicate with the NeedTools PDF Microservices.
 *
 * Two separate backend services:
 *   - PDF Edit Service   → NEXT_PUBLIC_PDF_EDIT_BACKEND_URL   (port 8001 locally)
 *   - PDF Compress Service → NEXT_PUBLIC_PDF_COMPRESS_BACKEND_URL (port 8002 locally)
 *
 * Falls back to the legacy single NEXT_PUBLIC_BACKEND_URL if the new vars are not set.
 */

const PDF_EDIT_URL =
  process.env.NEXT_PUBLIC_PDF_EDIT_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8001";

const PDF_COMPRESS_URL =
  process.env.NEXT_PUBLIC_PDF_COMPRESS_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8002";

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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { detail?: string }).detail ||
        `Backend error: ${response.status}`
    );
  }

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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { detail?: string }).detail ||
        `Backend error: ${response.status}`
    );
  }

  return response.blob();
}

/**
 * Send a PDF file + edits payload to the PDF Edit microservice.
 * Uploads the actual file as FormData along with the edits JSON.
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { detail?: string }).detail ||
        `Backend error: ${response.status}`
    );
  }

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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error((errorData as any).detail || `OCR failed: ${response.status}`);
  }

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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error((errorData as any).detail || `Conversion failed: ${response.status}`);
  }

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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error((errorData as any).detail || `Conversion failed: ${response.status}`);
  }

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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error((errorData as any).detail || `Conversion failed: ${response.status}`);
  }

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
