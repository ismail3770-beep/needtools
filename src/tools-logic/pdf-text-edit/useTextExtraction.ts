/**
 * useTextExtraction — extracts text items from a PDF page using pdfjs
 *
 * Returns ExtractedTextItem[] for each page with bounding boxes in
 * both viewport (scaled) and native PDF coordinates.
 */

import { useCallback } from "react";
import type * as pdfjsLib from "pdfjs-dist";
import type { ExtractedTextItem } from "./types";
import { detectBold, detectItalic } from "./fontMapper";

/**
 * Extract all text items from a single PDF page.
 *
 * @param page   - The pdfjs page proxy
 * @param scale  - The viewport scale factor used for rendering
 * @returns      - Array of ExtractedTextItem with both viewport and PDF coords
 */
export async function extractTextFromPage(
  page: pdfjsLib.PDFPageProxy,
  pageNumber: number,
  scale: number
): Promise<ExtractedTextItem[]> {
  const viewport = page.getViewport({ scale });
  const textContent = await page.getTextContent();

  const items: ExtractedTextItem[] = [];

  for (let i = 0; i < textContent.items.length; i++) {
    const item = textContent.items[i] as any;

    // Skip empty text items and non-text items (e.g. marked content)
    if (!item.str || item.str.trim() === "") continue;

    // item.transform = [scaleX, skewY, skewX, scaleY, tx, ty]
    const tx = item.transform[4];
    const ty = item.transform[5];
    const scaleX = item.transform[0];
    const scaleY = Math.abs(item.transform[3]);

    // ── Native PDF coordinates (unscaled, for export) ──
    const pdfX = tx;
    const pdfY = ty;
    const pdfWidth = item.width;
    const pdfHeight = scaleY;

    // ── Viewport coordinates (scaled, for UI overlay) ──
    const [viewportX, viewportY] = viewport.convertToViewportPoint(tx, ty);
    const viewWidth = item.width * scale;
    const viewHeight = scaleY * scale;

    // Font analysis
    const fontName = item.fontName || "unknown";
    const style = textContent.styles ? textContent.styles[fontName] : null;
    const fontFamily = style?.fontFamily || fontName;

    const isBold = detectBold(fontName) || detectBold(fontFamily);
    const isItalic = detectItalic(fontName) || detectItalic(fontFamily);

    // Color extraction attempt (fallback to #000000)
    let color = "#000000";
    if (item.color && Array.isArray(item.color) && item.color.length === 3) {
      const r = item.color[0].toString(16).padStart(2, '0');
      const g = item.color[1].toString(16).padStart(2, '0');
      const b = item.color[2].toString(16).padStart(2, '0');
      color = `#${r}${g}${b}`;
    }

    items.push({
      id: `p${pageNumber}-t${i}`,
      pageNumber,
      text: item.str,
      // Viewport coords (Y is top-down after conversion)
      x: viewportX,
      y: viewportY - viewHeight, // baseline → top-left
      width: viewWidth,
      height: viewHeight,
      // PDF native coords
      pdfX,
      pdfY,
      pdfWidth,
      pdfHeight,
      // Font info
      fontName,
      fontFamily,
      fontSize: scaleY, // in PDF points
      isBold,
      isItalic,
      isUnderline: false,
      color, // Default black or extracted rgb
      alignment: 'left',
      lineGroupId: "", // Will be set by textGrouping
    });
  }

  return items;
}

/**
 * Check if a PDF page has any extractable text.
 * Returns false for scanned/image-only pages.
 */
export async function pageHasTextLayer(
  page: pdfjsLib.PDFPageProxy
): Promise<boolean> {
  const textContent = await page.getTextContent();
  const textItems = textContent.items.filter(
    (item: any) => item.str && item.str.trim() !== ""
  );
  return textItems.length > 0;
}

/**
 * Check if the entire PDF has extractable text on at least one page.
 */
export async function pdfHasTextLayer(
  pdfDoc: pdfjsLib.PDFDocumentProxy
): Promise<boolean> {
  // Check first 3 pages (or all if fewer) for efficiency
  const pagesToCheck = Math.min(pdfDoc.numPages, 3);
  for (let i = 1; i <= pagesToCheck; i++) {
    const page = await pdfDoc.getPage(i);
    if (await pageHasTextLayer(page)) return true;
  }
  return false;
}

/**
 * React hook wrapper for text extraction.
 * Returns a stable callback that extracts text from a page.
 */
export function useTextExtraction() {
  const extract = useCallback(
    async (
      page: pdfjsLib.PDFPageProxy,
      pageNumber: number,
      scale: number
    ) => {
      return extractTextFromPage(page, pageNumber, scale);
    },
    []
  );

  const checkTextLayer = useCallback(
    async (pdfDoc: pdfjsLib.PDFDocumentProxy) => {
      return pdfHasTextLayer(pdfDoc);
    },
    []
  );

  return { extract, checkTextLayer };
}
