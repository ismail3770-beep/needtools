/**
 * Minimal 24-bit BMP encoder.
 *
 * Browsers can DECODE bmp (via <img> / createImageBitmap) but canvas.toBlob
 * cannot ENCODE it — there is no "image/bmp" support anywhere. So the BMP
 * tools build the file bytes by hand instead of pulling in a dependency.
 *
 * Output is a standard BITMAPINFOHEADER bmp: 24 bits per pixel, BGR channel
 * order, rows stored bottom-up, each row padded to a 4-byte boundary.
 * Alpha is composited onto white, since 24-bit BMP has no alpha channel.
 */
export function encodeBmp(width: number, height: number, rgba: Uint8ClampedArray): Blob {
  const FILE_HEADER_SIZE = 14;
  const INFO_HEADER_SIZE = 40;

  const rowBytes = width * 3;
  const padding = (4 - (rowBytes % 4)) % 4;
  const paddedRowBytes = rowBytes + padding;
  const pixelDataSize = paddedRowBytes * height;
  const fileSize = FILE_HEADER_SIZE + INFO_HEADER_SIZE + pixelDataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // BITMAPFILEHEADER
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true); // reserved
  view.setUint32(10, FILE_HEADER_SIZE + INFO_HEADER_SIZE, true); // pixel offset

  // BITMAPINFOHEADER
  view.setUint32(14, INFO_HEADER_SIZE, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true); // colour planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(30, 0, true); // BI_RGB, no compression
  view.setUint32(34, pixelDataSize, true);
  view.setInt32(38, 2835, true); // ~72 DPI horizontal
  view.setInt32(42, 2835, true); // ~72 DPI vertical
  view.setUint32(46, 0, true); // palette colours used
  view.setUint32(50, 0, true); // important colours

  let offset = FILE_HEADER_SIZE + INFO_HEADER_SIZE;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const alpha = rgba[i + 3] / 255;
      // Composite onto white so transparent areas do not turn black.
      const r = Math.round(rgba[i] * alpha + 255 * (1 - alpha));
      const g = Math.round(rgba[i + 1] * alpha + 255 * (1 - alpha));
      const b = Math.round(rgba[i + 2] * alpha + 255 * (1 - alpha));
      bytes[offset++] = b;
      bytes[offset++] = g;
      bytes[offset++] = r;
    }
    for (let p = 0; p < padding; p++) bytes[offset++] = 0;
  }

  return new Blob([buffer], { type: "image/bmp" });
}
