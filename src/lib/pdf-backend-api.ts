/**
 * Helper API to communicate with the Python FastAPI Backend (Heroku)
 * Handles heavy PDF processing: Ghostscript compression and PyMuPDF editing.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Compress a PDF via the Heroku backend.
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

  const url = new URL(`${BACKEND_URL}/compress`);
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
 * Send a PDF file + edits payload to the Heroku backend for native PyMuPDF editing.
 * The backend downloads the file from Appwrite, applies edits, and re-uploads it.
 * @param fileId  The Appwrite storage fileId of the uploaded original PDF.
 * @param edits   Page-keyed edits object.
 * @returns       The newFileId of the processed PDF in Appwrite storage.
 */
export async function editPdfWithBackend(
  fileId: string,
  edits: Record<string, unknown>
): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/edit-pdf`, {
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
