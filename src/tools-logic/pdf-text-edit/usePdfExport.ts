/**
 * usePdfExport — rebuilds the PDF with the user's paragraph edits (pdf-lib)
 *
 * For every changed paragraph:
 *  1. Cover the original glyph box with a rectangle painted in the background
 *     colour that was sampled from the rendered page (a hard-coded white mask
 *     is visible on coloured sidebars, dark headers and highlight bands).
 *  2. Re-wrap the new text to the paragraph width using real pdf-lib metrics.
 *  3. Draw the lines from the original first baseline, using the paragraph's
 *     measured line height, so the result matches what the editor showed.
 *  4. If the text needs more vertical room than exists before the next block,
 *     shrink the font down to `minFontScale`; warn if it still doesn't fit.
 *
 * Untouched paragraphs, images, vectors and annotations are left alone.
 */

import { useCallback } from "react";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { TextEdit, MappedFont } from "./types";
import { mapFont, collectFontWarnings } from "./fontMapper";

// ── Helpers ────────────────────────────────────────────────

/** Parse a hex colour string into pdf-lib channel values */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = (hex || "").replace("#", "").trim();
  if (clean.length !== 6) return { r: 1, g: 1, b: 1 };
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  if ([r, g, b].some((v) => Number.isNaN(v))) return { r: 1, g: 1, b: 1 };
  return { r, g, b };
}

/**
 * StandardFonts are WinAnsi-encoded and throw on anything outside Latin-1.
 * Anything else (Bengali, CJK, smart punctuation beyond Latin-1) is drawn
 * with the bundled Noto font instead.
 */
function requiresCustomFont(text: string): boolean {
  return /[^\u0000-\u00FF]/.test(normalisePunctuation(text));
}

/** Map typographic punctuation onto Latin-1 equivalents where possible */
function normalisePunctuation(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/\u2022/g, "\u00B7")
    .replace(/\t/g, "    ");
}

let customFontBytes: ArrayBuffer | null = null;
async function getCustomFontBytes(): Promise<ArrayBuffer> {
  if (!customFontBytes) {
    const res = await fetch("/fonts/NotoSansBengali-Regular.ttf");
    customFontBytes = await res.arrayBuffer();
  }
  return customFontBytes;
}

async function embedStandardFont(
  pdfDoc: PDFDocument,
  standardFont: string
): Promise<PDFFont> {
  const fontEnum = StandardFonts[standardFont as keyof typeof StandardFonts];
  return pdfDoc.embedFont(fontEnum);
}

function safeWidth(text: string, font: PDFFont, size: number): number {
  try {
    return font.widthOfTextAtSize(text, size);
  } catch {
    // Unsupported glyph — approximate so wrapping still terminates
    return text.length * size * 0.5;
  }
}

/**
 * Wrap text to `maxWidth`, honouring the user's explicit line breaks.
 * A single word wider than the box is kept on its own line rather than
 * looping forever.
 */
function wrapParagraph(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const out: string[] = [];

  for (const rawLine of text.split("\n")) {
    const words = rawLine.split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) {
      out.push("");
      continue;
    }

    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (!line || safeWidth(candidate, font, size) <= maxWidth) {
        line = candidate;
      } else {
        out.push(line);
        line = word;
      }
    }
    out.push(line);
  }

  return out;
}

interface FittedText {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  overflows: boolean;
}

/**
 * Choose the largest font size (down to `minFontScale` of the original) whose
 * wrapped height fits the space available to the paragraph.
 */
function fitParagraph(
  text: string,
  font: PDFFont,
  edit: TextEdit,
  minFontScale: number
): FittedText {
  const allowedHeight = edit.heightPt + Math.max(0, edit.availableHeightPt);
  const minSize = Math.max(4, edit.fontSize * minFontScale);
  const leadingRatio =
    edit.fontSize > 0 ? Math.max(1.05, edit.lineHeightPt / edit.fontSize) : 1.2;

  let fallback: FittedText | null = null;

  for (let size = edit.fontSize; size >= minSize - 0.001; size -= 0.5) {
    const lines = wrapParagraph(text, font, size, edit.width);
    const lineHeight = size * leadingRatio;
    const needed = (lines.length - 1) * lineHeight + size;

    if (!fallback) fallback = { lines, fontSize: size, lineHeight, overflows: true };
    if (needed <= allowedHeight + 0.5) {
      return { lines, fontSize: size, lineHeight, overflows: false };
    }
  }

  const lines = wrapParagraph(text, font, minSize, edit.width);
  return {
    lines,
    fontSize: minSize,
    lineHeight: minSize * leadingRatio,
    overflows: true,
  };
}

// ── Main export function ──────────────────────────────────────

export interface ExportResult {
  pdfBytes: Uint8Array;
  fontWarnings: string[];
  overflowWarnings: string[];
}

export async function exportEditedPdf(
  originalPdfBytes: ArrayBuffer,
  edits: Record<string, TextEdit>,
  minFontScale: number = 0.7
): Promise<ExportResult> {
  const pdfDoc = await PDFDocument.load(originalPdfBytes);
  pdfDoc.registerFontkit(fontkit);
  const pages = pdfDoc.getPages();

  const dirtyEdits = Object.values(edits).filter((e) => e.isDirty);

  if (dirtyEdits.length === 0) {
    return {
      pdfBytes: await pdfDoc.save(),
      fontWarnings: [],
      overflowWarnings: [],
    };
  }

  const fontCache: Record<string, PDFFont> = {};
  let customFont: PDFFont | null = null;
  const allMappings: MappedFont[] = [];
  const overflowWarnings: string[] = [];

  for (const edit of dirtyEdits) {
    const pageIdx = edit.pageNumber - 1;
    if (pageIdx < 0 || pageIdx >= pages.length) continue;
    const page = pages[pageIdx];

    // 1. Resolve the font
    const newText = normalisePunctuation(edit.newText);
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
      if (!fontCache[mapped.standardFont]) {
        fontCache[mapped.standardFont] = await embedStandardFont(
          pdfDoc,
          mapped.standardFont
        );
      }
      font = fontCache[mapped.standardFont];
    }

    // 2. Mask the original glyph box using the sampled background colour
    const mask = hexToRgb(edit.maskColor || "#ffffff");
    const glyphTopY = edit.pdfFirstBaselineY + edit.ascent;
    page.drawRectangle({
      x: edit.pdfX - 1,
      y: glyphTopY - edit.heightPt - 1,
      width: edit.width + 2,
      height: edit.heightPt + 2,
      color: rgb(mask.r, mask.g, mask.b),
      borderWidth: 0,
    });

    // 3. Re-wrap and fit
    const fitted = fitParagraph(newText, font, edit, minFontScale);
    if (fitted.overflows) {
      const preview = edit.newText.replace(/\s+/g, " ").substring(0, 40);
      overflowWarnings.push(
        `Page ${edit.pageNumber}: "${preview}…" needs more space than the original block — it may overlap the content below.`
      );
    }

    // 4. Draw
    const color = hexToRgb(edit.color);
    for (let i = 0; i < fitted.lines.length; i++) {
      const lineText = fitted.lines[i];
      if (!lineText) continue;

      const lineWidth = safeWidth(lineText, font, fitted.fontSize);
      let drawX = edit.pdfX;
      if (edit.alignment === "center") {
        drawX = edit.pdfX + (edit.width - lineWidth) / 2;
      } else if (edit.alignment === "right") {
        drawX = edit.pdfX + edit.width - lineWidth;
      }
      const drawY = edit.pdfFirstBaselineY - i * fitted.lineHeight;

      try {
        page.drawText(lineText, {
          x: drawX,
          y: drawY,
          size: fitted.fontSize,
          font,
          color: rgb(color.r, color.g, color.b),
        });
      } catch {
        // A glyph the chosen font cannot encode — skip this line instead of
        // failing the whole export.
        overflowWarnings.push(
          `Page ${edit.pageNumber}: some characters could not be drawn with the matched font.`
        );
        continue;
      }

      if (edit.isUnderline) {
        page.drawLine({
          start: { x: drawX, y: drawY - fitted.fontSize * 0.12 },
          end: { x: drawX + lineWidth, y: drawY - fitted.fontSize * 0.12 },
          thickness: Math.max(0.4, fitted.fontSize * 0.05),
          color: rgb(color.r, color.g, color.b),
        });
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const fontWarnings = collectFontWarnings(allMappings);

  return { pdfBytes, fontWarnings, overflowWarnings };
}

// ── React hook ─────────────────────────────────────────────

export function usePdfExport() {
  const doExport = useCallback(
    async (
      originalFile: File,
      edits: Record<string, TextEdit>,
      minFontScale: number = 0.7
    ): Promise<ExportResult> => {
      const arrayBuffer = await originalFile.arrayBuffer();

      return new Promise((resolve, reject) => {
        const worker = new Worker(new URL("./exportWorker.ts", import.meta.url));

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
