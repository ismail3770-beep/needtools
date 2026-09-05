/* Image compression Web Worker
 * Receives { imageBitmap, quality (0-1), format } — returns compressed Blob.
 * Offloads Canvas work off the main thread so mobile UI stays responsive.
 */
self.onmessage = async (event) => {
  const { imageBitmap, quality, format } = event.data;

  try {
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      self.postMessage({ error: "2d-context-unavailable" });
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(imageBitmap, 0, 0);

    const blob = await canvas.convertToBlob({ type: format, quality });
    self.postMessage({ blob });

    imageBitmap.close();
  } catch (err) {
    self.postMessage({ error: String(err) });
  }
};
