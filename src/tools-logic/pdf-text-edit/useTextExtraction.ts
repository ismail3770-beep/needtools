/**
 * useTextExtraction — extracts text items from a PDF page using pdfjs
 *
 * Everything is returned in PDF points at scale 1. Two coordinate spaces are
 * produced per item: top-down (for CSS) and raw PDF user space (for pdf-lib).
 *
 * Per-font ascent/descent metrics are read from pdfjs `textContent.styles`,
 * which is what makes the overlay line up with the rendered glyphs. Using the
 * full em box instead of the ascent (the previous behaviour) pushed every
 * editable box a few points off the real baseline.
 */

import { useCallback } from "react";
import type * as pdfjsLib from "pdfjs-dist";
import type { ExtractedTextItem } from "./types";
import { detectBold, detectItalic } from "./fontMapper";

/** Fallback vertical metrics when the font program doesn't expose them */
const FALLBACK_ASCENT = 0.78;
const FALLBACK_DESCENT = 0.22;

export interface PageExtraction {
  items: ExtractedTextItem[];
  pageWidth: number;
  pageHeight: number;
  /** True when the page carries a /Rotate entry (editing is best-effort) */
  isRotated: boolean;
}

/** Map a pdfjs font family hint to a usable CSS font stack */
function toCssFontStack(family: string, rawName: string): string {
  const hint = `${family} ${rawName}`.toLowerCase();
  if (hint.includes("mono") || hint.includes("courier")) {
    return '"Courier New", Courier, monospace';
  }
  if (
    hint.includes("serif") &&
    !hint.includes("sans")
  ) {
    return '"Times New Roman", Times, Georgia, serif';
  }
  if (hint.includes("times") || hint.includes("georgia") || hint.includes("roman")) {
    return '"Times New Roman", Times, Georgia, serif';
  }
  return 'Arial, "Helvetica Neue", Helvetica, sans-serif';
}

function finiteOr(value: unknown, fallback: number): number {
  const num = typeof value === "number" ? value : NaN;
  return Number.isFinite(num) && num !== 0 ? num : fallback;
}

/**
 * Extract all text items from a single PDF page.
 */
export async function extractTextFromPage(
  page: pdfjsLib.PDFPageProxy,
  pageNumber: number
): Promise<PageExtraction> {
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();

  const pageWidth = viewport.width;
  const pageHeight = viewport.height;
  const items: ExtractedTextItem[] = [];

  for (let i = 0; i < textContent.items.length; i++) {
    const item = textContent.items[i] as any;

    // Skip empty text items and non-text items (e.g. marked content)
    if (!item.str || item.str.trim() === "") continue;
    if (!Array.isArray(item.transform) || item.transform.length < 6) continue;

    // item.transform = [a, b, c, d, tx, ty]
    const [a, b, c, d, tx, ty] = item.transform as number[];

    // Em size: use the vertical scale magnitude of the text matrix
    const fontSize = Math.hypot(c, d) || Math.abs(d) || 1;

    // Rotated / skewed runs cannot be represented by an axis-aligned CSS box
    const rotated = Math.abs(b) > 0.01 * Math.abs(a) + 0.01;

    // ── Top-down coordinates for the overlay ──
    const [viewX, viewBaselineY] = viewport.convertToViewportPoint(tx, ty);

    // Font analysis
    const fontName: string = item.fontName || "unknown";
    const style = textContent.styles ? (textContent.styles as any)[fontName] : null;
    const fontFamily: string = style?.fontFamily || fontName;

    const ascentRatio = Math.abs(finiteOr(style?.ascent, FALLBACK_ASCENT));
    const descentRatio = Math.abs(finiteOr(style?.descent, FALLBACK_DESCENT));

    const isBold = detectBold(fontName) || detectBold(fontFamily);
    const isItalic = detectItalic(fontName) || detectItalic(fontFamily);

    // Colour extraction attempt (fallback to black)
    let color = "#000000";
    if (item.color && Array.isArray(item.color) && item.color.length === 3) {
      const hex = item.color
        .map((channel: number) =>
          Math.max(0, Math.min(255, Math.round(channel)))
            .toString(16)
            .padStart(2, "0")
        )
        .join("");
      color = `#${hex}`;
    }

    items.push({
      id: `p${pageNumber}-t${i}`,
      pageNumber,
      text: item.str,

      x: viewX,
      baselineTop: viewBaselineY,
      width: Math.abs(item.width) || fontSize * 0.5 * item.str.length,

      pdfX: tx,
      pdfBaselineY: ty,

      fontSize,
      ascent: ascentRatio * fontSize,
      descent: descentRatio * fontSize,

      fontName,
      fontFamily,
      cssFontFamily: toCssFontStack(fontFamily, fontName),
      isBold,
      isItalic,
      color,
      rotated,
    });
  }

  return {
    items,
    pageWidth,
    pageHeight,
    isRotated: ((page as any).rotate ?? 0) % 360 !== 0,
  };
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
 */
export function useTextExtraction() {
  const extract = useCallback(
    async (page: pdfjsLib.PDFPageProxy, pageNumber: number) =>
      extractTextFromPage(page, pageNumber),
    []
  );

  const checkTextLayer = useCallback(
    async (pdfDoc: pdfjsLib.PDFDocumentProxy) => pdfHasTextLayer(pdfDoc),
    []
  );

  return { extract, checkTextLayer };
}
