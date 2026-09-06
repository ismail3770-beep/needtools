/**
 * Types for PDF Text Edit feature
 * "detect → mask → replace" strategy using pdfjs + pdf-lib
 */

/** Raw text item extracted from a single PDF page via pdfjs getTextContent() */
export interface ExtractedTextItem {
  /** Unique ID within the page (index-based) */
  id: string;
  /** Page number (1-based) */
  pageNumber: number;
  /** Original text string */
  text: string;
  /** Bounding box in viewport coordinates (scaled) */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Bounding box in native PDF points (unscaled) — used for export */
  pdfX: number;
  pdfY: number;
  pdfWidth: number;
  pdfHeight: number;
  /** Font information */
  fontName: string;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  /** Text color as hex string (default #000000) */
  color: string;
  alignment: 'left' | 'center' | 'right';
  /** Line group ID — items on the same line share a groupId */
  lineGroupId: string;
}

/** A group of text items that belong to the same visual line */
export interface TextLineGroup {
  id: string;
  pageNumber: number;
  items: ExtractedTextItem[];
  /** Combined bounding box of the whole line */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Combined text of the line (items joined by space) */
  fullText: string;
}

/** Tracks user edits to a text line group */
export interface TextEdit {
  /** The line group ID being edited */
  lineGroupId: string;
  /** Page number (1-based) */
  pageNumber: number;
  /** Original text (for comparison) */
  originalText: string;
  /** New text entered by user */
  newText: string;
  /** Whether this edit is "dirty" (different from original) */
  isDirty: boolean;
  /** Original bounding box in PDF points */
  pdfX: number;
  pdfY: number;
  pdfWidth: number;
  pdfHeight: number;
  /** Font info from original */
  fontName: string;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  color: string;
  alignment: 'left' | 'center' | 'right';
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

/** Configuration for PDF export */
export interface ExportConfig {
  /** Minimum font scale factor (e.g. 0.7 = don't shrink below 70%) */
  minFontScale: number;
  /** Whether to show preview before download */
  showPreview: boolean;
}

/** Overall editor state */
export interface EditorState {
  /** The loaded PDF file */
  file: File | null;
  /** Current page being viewed (1-based) */
  currentPage: number;
  /** Total pages in PDF */
  totalPages: number;
  /** Viewport scale for rendering */
  scale: number;
  /** All edits indexed by lineGroupId */
  edits: Record<string, TextEdit>;
  /** Processing states */
  isLoading: boolean;
  isExporting: boolean;
  /** Whether the PDF has extractable text */
  hasTextLayer: boolean;
  /** Error message if any */
  error: string | null;
}

/** Limits for the feature */
export const FEATURE_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_PAGES: 20,
  MIN_FONT_SCALE: 0.7,
} as const;
