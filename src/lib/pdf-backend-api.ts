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
 * Send a PDF file + edits payload to the PDF Edit microservice.
 * @param fileId  The Appwrite storage fileId of the uploaded original PDF.
 * @param edits   Page-keyed edits object.
 * @returns       The newFileId of the processed PDF in Appwrite storage.
 */
export async function editPdfWithBackend(
  fileId: string,
  edits: Record<string, unknown>
): Promise<string> {
  const response = await fetch(`${PDF_EDIT_URL}/api/edit-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId, edits }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { detail?: string }).detail ||
        `Backend error: ${response.status}`
    );
  }

  const data = await response.json();
  return data.newFileId as string;
}

/**
 * Trigger a browser download of a PDF Blob.
 */
export function downloadPdfBlob(blob: Blob, originalFilename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const nameParts = originalFilename.split(".");
  const ext = nameParts.pop();
  const name = nameParts.join(".");
  a.download = `${name}_compressed.${ext}`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
