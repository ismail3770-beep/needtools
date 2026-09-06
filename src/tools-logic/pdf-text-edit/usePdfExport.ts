/**
 * usePdfExport — rebuilds the PDF with user edits using pdf-lib
 *
 * Strategy for each changed text block:
 *  1. Draw a white rectangle over the original text bounding box (mask)
 *  2. Draw the new text at the same position with matched font
 *
 * Unchanged text blocks are left completely untouched.
 * All non-text content (images, vectors, annotations) is preserved.
 */

import { useCallback } from "react";
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { TextEdit, MappedFont } from "./types";
import { mapFont, collectFontWarnings } from "./fontMapper";

// ── Helpers ────────────────────────────────────────────────────────

/** Parse hex color string to pdf-lib rgb() */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return { r, g, b };
}

/** Check if text contains non-Latin characters (like Bengali) */
function requiresCustomFont(text: string): boolean {
  // Bengali block: 0980–09FF
  const bengaliRegex = /[ঀ-৿]/;
  return bengaliRegex.test(text);
}

let customFontBytes: ArrayBuffer | null = null;
async function getCustomFontBytes(): Promise<ArrayBuffer> {
  if (!customFontBytes) {
    const res = await fetch('/fonts/NotoSansBengali-Regular.ttf');
    customFontBytes = await res.arrayBuffer();
  }
  return customFontBytes;
}

/** Embed a StandardFont into the PDF document */
async function embedStandardFont(
  pdfDoc: PDFDocument,
  standardFont: string
): Promise<PDFFont> {
  const fontEnum = StandardFonts[standardFont as keyof typeof StandardFonts];
  return pdfDoc.embedFont(fontEnum);
}

/**
 * Measure the width of text at a given font size.
 * Uses pdf-lib font metrics.
 */
function measureTextWidth(
  text: string,
  font: PDFFont,
  fontSize: number
): number {
  return font.widthOfTextAtSize(text, fontSize);
}

/**
 * Fit text into a bounding box width by:
 *  1. Trying original font size
 *  2. Shrinking down to minScale * originalSize
 *  3. If still doesn't fit, wrapping to multiple lines
 *
 * Returns lines of text and the effective font size.
 */
function fitTextInBox(
  text: string,
  font: PDFFont,
  originalFontSize: number,
  boxWidth: number,
  minFontScale: number
): { lines: string[]; effectiveFontSize: number; overflows: boolean } {
  // Try original size first
  let fontSize = originalFontSize;
  let textWidth = measureTextWidth(text, font, fontSize);

  if (textWidth <= boxWidth) {
    return { lines: [text], effectiveFontSize: fontSize, overflows: false };
  }

  // Try shrinking
  const minSize = originalFontSize * minFontScale;
  fontSize = minSize;
  textWidth = measureTextWidth(text, font, fontSize);

  if (textWidth <= boxWidth) {
    // Find the largest font size that fits
    let lo = minSize;
    let hi = originalFontSize;
    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2;
      if (measureTextWidth(text, font, mid) <= boxWidth) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return { lines: [text], effectiveFontSize: lo, overflows: false };
  }

  // Wrap text into multiple lines at the minimum font size
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (measureTextWidth(testLine, font, fontSize) <= boxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Check if wrapped lines overflow vertically (more than 2 lines is suspect)
  const overflows = lines.length > 3;

  return { lines, effectiveFontSize: fontSize, overflows };
}

// ── Main export function ───────────────────────────────────────────

export interface ExportResult {
  /** The edited PDF as a Uint8Array */
  pdfBytes: Uint8Array;
  /** Font fallback warnings */
  fontWarnings: string[];
  /** Text blocks that overflow their bounding box */
  overflowWarnings: string[];
}

/**
 * Apply all text edits to the original PDF and return the modified bytes.
 *
 * @param originalPdfBytes - The original PDF file as ArrayBuffer
 * @param edits            - Map of lineGroupId → TextEdit (only dirty ones)
 * @param minFontScale     - Minimum font scale factor (default 0.7)
 */
export async function exportEditedPdf(
  originalPdfBytes: ArrayBuffer,
  edits: Record<string, TextEdit>,
  minFontScale: number = 0.7
): Promise<ExportResult> {
  const pdfDoc = await PDFDocument.load(originalPdfBytes);
  pdfDoc.registerFontkit(fontkit);
  const pages = pdfDoc.getPages();

  // Collect only dirty edits
  const dirtyEdits = Object.values(edits).filter((e) => e.isDirty);

  if (dirtyEdits.length === 0) {
    return {
      pdfBytes: await pdfDoc.save(),
      fontWarnings: [],
      overflowWarnings: [],
    };
  }

  // Group edits by page
  const editsByPage: Record<number, TextEdit[]> = {};
  for (const edit of dirtyEdits) {
    const pageIdx = edit.pageNumber - 1;
    if (!editsByPage[pageIdx]) editsByPage[pageIdx] = [];
    editsByPage[pageIdx].push(edit);
  }

  // Font cache to avoid re-embedding
  const fontCache: Record<string, PDFFont> = {};
  let customFont: PDFFont | null = null;
  const allMappings: MappedFont[] = [];
  const overflowWarnings: string[] = [];

  for (const [pageIdxStr, pageEdits] of Object.entries(editsByPage)) {
    const pageIdx = parseInt(pageIdxStr);
    if (pageIdx < 0 || pageIdx >= pages.length) continue;

    const page = pages[pageIdx];
    const { height: pageHeight } = page.getSize();

    for (const edit of pageEdits) {
      // 1. Resolve Font (Standard vs Custom for non-Latin)
      let font: PDFFont;
      if (requiresCustomFont(edit.newText)) {
        if (!customFont) {
          const fontBytes = await getCustomFontBytes();
          customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
        }
        font = customFont;
      } else {
        const mapped = mapFont(edit.fontName, edit.isBold, edit.isItalic);
        allMappings.push(mapped);
        const fontKey = mapped.standardFont;
        if (!fontCache[fontKey]) {
          fontCache[fontKey] = await embedStandardFont(pdfDoc, fontKey);
        }
        font = fontCache[fontKey];
      }

      // 3. Calculate PDF coordinates
      // pdfY is the baseline Y in PDF coords (bottom-up)
      // We need to mask the area and redraw
      const maskX = edit.pdfX;
      const maskWidth = edit.pdfWidth;
      const maskHeight = edit.pdfHeight * 1.3; // Add some padding
      // PDF Y: baseline is pdfY, top of text is pdfY + height
      const maskY = edit.pdfY - edit.pdfHeight * 0.15; // Slight padding below baseline

      // 4. Draw white mask rectangle
      const color = hexToRgb(edit.color);
      page.drawRectangle({
        x: maskX,
        y: maskY,
        width: maskWidth + 2, // Small padding
        height: maskHeight,
        color: rgb(1, 1, 1), // White mask
        borderWidth: 0,
      });

      // 5. Fit text and draw
      const { lines, effectiveFontSize, overflows } = fitTextInBox(
        edit.newText,
        font,
        edit.fontSize,
        edit.pdfWidth,
        minFontScale
      );

      if (overflows) {
        overflowWarnings.push(
          `Page ${edit.pageNumber}: "${edit.newText.substring(0, 30)}..." overflows its bounding box`
        );
      }

      // Draw each line
      const lineHeight = effectiveFontSize * 1.2;
      for (let i = 0; i < lines.length; i++) {
        const lineText = lines[i];
        const drawY = edit.pdfY - i * lineHeight;

        let drawX = edit.pdfX;
        const lineWidth = measureTextWidth(lineText, font, effectiveFontSize);

        if (edit.alignment === 'center') {
          drawX = edit.pdfX + (edit.pdfWidth - lineWidth) / 2;
        } else if (edit.alignment === 'right') {
          drawX = edit.pdfX + edit.pdfWidth - lineWidth;
        }

        page.drawText(lineText, {
          x: drawX,
          y: drawY,
          size: effectiveFontSize,
          font,
          color: rgb(color.r, color.g, color.b),
        });

        if (edit.isUnderline) {
          page.drawLine({
            start: { x: drawX, y: drawY - effectiveFontSize * 0.1 },
            end: { x: drawX + lineWidth, y: drawY - effectiveFontSize * 0.1 },
            thickness: effectiveFontSize * 0.05,
            color: rgb(color.r, color.g, color.b),
          });
        }
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const fontWarnings = collectFontWarnings(allMappings);

  return { pdfBytes, fontWarnings, overflowWarnings };
}

// ── React hook ─────────────────────────────────────────────────────

export function usePdfExport() {
  const doExport = useCallback(
    async (
      originalFile: File,
      edits: Record<string, TextEdit>,
      minFontScale: number = 0.7
    ): Promise<ExportResult> => {
      const arrayBuffer = await originalFile.arrayBuffer();

      return new Promise((resolve, reject) => {
        const worker = new Worker(new URL('./exportWorker.ts', import.meta.url));

        worker.onmessage = (e) => {
          if (e.data.success) {
            resolve(e.data.result);
          } else {
            reject(new Error(e.data.error));
          }
          worker.terminate();
        };

        worker.onerror = (err) => {
          reject(err);
          worker.terminate();
        };

        worker.postMessage(
          { originalPdfBytes: arrayBuffer, edits, minFontScale },
          [arrayBuffer]
        );
      });
    },
    []
  );

  return { doExport };
}
