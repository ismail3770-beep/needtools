/**
 * Types for PDF Text Edit
 *
 * Strategy: "detect → group into paragraphs → mask → reflow → replace"
 * using pdfjs (extraction) + pdf-lib (export).
 *
 * IMPORTANT geometry rule
 * -----------------------
 * Every measurement in this module is stored in **PDF points at scale 1**.
 * The UI multiplies by the current viewport scale at render time, so zooming
 * can never desync the HTML overlay from the rendered canvas.
 *
 * Two coordinate spaces are kept side by side:
 *  - `x` / `baselineTop`   → top-down page coordinates (origin = page top-left),
 *                            used for CSS positioning.
 *  - `pdfX` / `pdfBaselineY` → raw PDF user space (origin = page bottom-left),
 *                            used when drawing with pdf-lib on export.
 */

/** Raw text item extracted from a single PDF page via pdfjs getTextContent() */
export interface ExtractedTextItem {
  /** Unique ID within the page (index-based; only used for debugging) */
  id: string;
  /** Page number (1-based) */
  pageNumber: number;
  /** Original text string */
  text: string;

  // ── Top-down coordinates (points) — for the CSS overlay ──
  /** Left edge, measured from the page left edge */
  x: number;
  /** Text baseline, measured from the page TOP edge */
  baselineTop: number;
  /** Advance width */
  width: number;

  // ── Raw PDF user space (points) — for pdf-lib export ──
  pdfX: number;
  pdfBaselineY: number;

  /** Em size in points */
  fontSize: number;
  /** Ascent above the baseline, in points (already multiplied by fontSize) */
  ascent: number;
  /** Descent below the baseline, in points (positive number) */
  descent: number;

  /** Font information */
  fontName: string;
  fontFamily: string;
  /** Font stack usable directly in CSS */
  cssFontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  /** Text color as hex string (default #000000) */
  color: string;
  /** True for rotated / skewed text — excluded from editing */
  rotated: boolean;
}

/** A group of text items that sit on the same visual baseline */
export interface TextLine {
  id: string;
  pageNumber: number;
  items: ExtractedTextItem[];
  /** Combined text of the line */
  text: string;
  /** Left edge (points, top-down space) */
  x: number;
  /** Right edge (points, top-down space) */
  right: number;
  /** Baseline measured from the page top (points) */
  baselineTop: number;
  /** Baseline in raw PDF user space (points) */
  pdfBaselineY: number;
  pdfX: number;
  fontSize: number;
  ascent: number;
  descent: number;
}

/**
 * A paragraph — one or more consecutive lines that share the same left (or
 * centre) alignment, font size and line spacing. This is the unit the user
 * edits, which is what makes reflow possible: the browser re-wraps the text
 * inside a single contenteditable and we shift the blocks below by the delta.
 */
export interface TextParagraph {
  /** Stable, geometry-derived ID (safe across re-extraction) */
  id: string;
  pageNumber: number;
  /** Page size in points */
  pageWidth: number;
  pageHeight: number;

  lines: TextLine[];
  /** Lines joined with "\n" */
  text: string;

  // ── Box in top-down points ──
  x: number;
  right: number;
  width: number;
  /** Top edge of the glyph box (first baseline minus ascent) */
  topPt: number;
  /** Full glyph-box height across all lines */
  heightPt: number;
  /** Distance between consecutive baselines (points) */
  lineHeightPt: number;
  /**
   * Vertical room between this paragraph's bottom and whatever sits below it.
   * Used to decide how much a paragraph may grow before it needs shrinking.
   */
  availableHeightPt: number;

  // ── Raw PDF user space ──
  pdfX: number;
  /** Baseline of the FIRST line, in raw PDF user space */
  pdfFirstBaselineY: number;

  fontSize: number;
  ascent: number;
  descent: number;
  fontName: string;
  fontFamily: string;
  cssFontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  color: string;
  alignment: "left" | "center" | "right";
}

/** Tracks a user edit to one paragraph */
export interface TextEdit {
  paragraphId: string;
  pageNumber: number;
  originalText: string;
  newText: string;
  /** Whether this edit differs from the original */
  isDirty: boolean;

  // Geometry copied from the paragraph (points)
  pdfX: number;
  pdfFirstBaselineY: number;
  width: number;
  topPt: number;
  heightPt: number;
  lineHeightPt: number;
  availableHeightPt: number;
  pageHeight: number;

  // Styling
  fontName: string;
  fontFamily: string;
  fontSize: number;
  ascent: number;
  descent: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  color: string;
  alignment: "left" | "center" | "right";
  /**
   * Background colour sampled from the rendered page, used to mask the
   * original glyphs. A hard-coded white mask would be visible on coloured
   * backgrounds (sidebars, highlight bands, dark headers).
   */
  maskColor: string;
}

/** Result of font mapping — what pdf-lib should use */
export interface MappedFont {
  /** pdf-lib StandardFonts enum key, e.g. "Helvetica", "TimesRoman" */
  standardFont: string;
  /** Whether this is a fallback (original font couldn't be matched exactly) */
  isFallback: boolean;
  /** Human-readable description of what happened */
  fallbackReason?: string;
}

/** Limits for the feature */
export const FEATURE_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_PAGES: 20,
  MIN_FONT_SCALE: 0.7,
} as const;
