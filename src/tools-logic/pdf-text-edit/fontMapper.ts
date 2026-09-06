/**
 * Font Mapper — maps PDF font names to pdf-lib StandardFonts
 *
 * PDF fonts come in many naming conventions (e.g. "ABCDEF+Arial-BoldMT",
 * "TimesNewRomanPSMT", "g_d0_f1"). This module normalises them to the
 * closest pdf-lib built-in font and picks the correct bold/italic variant.
 */

import { StandardFonts } from "pdf-lib";
import type { MappedFont } from "./types";

// ── Lookup tables ──────────────────────────────────────────────────

/** Serif font family keywords */
const SERIF_KEYWORDS = [
  "times", "georgia", "garamond", "palatino", "cambria",
  "book", "roman", "serif", "baskerville", "caslon",
];

/** Sans-serif font family keywords */
const SANS_KEYWORDS = [
  "arial", "helvetica", "verdana", "tahoma", "trebuchet",
  "calibri", "segoe", "roboto", "opensans", "lato", "inter",
  "noto", "source", "sans", "gothic", "gill",
];

/** Monospace font family keywords */
const MONO_KEYWORDS = [
  "courier", "consolas", "monaco", "menlo", "mono",
  "lucida console", "source code", "fira code",
];

// ── Style detection ────────────────────────────────────────────────

/** Check if the raw font name signals bold weight */
export function detectBold(rawName: string): boolean {
  const lower = rawName.toLowerCase();
  return (
    lower.includes("bold") ||
    lower.includes("heavy") ||
    lower.includes("black") ||
    lower.includes("-bd") ||
    /\bbd\b/.test(lower)
  );
}

/** Check if the raw font name signals italic / oblique */
export function detectItalic(rawName: string): boolean {
  const lower = rawName.toLowerCase();
  return (
    lower.includes("italic") ||
    lower.includes("oblique") ||
    lower.includes("-it") ||
    /\bit\b/.test(lower)
  );
}

// ── Family classification ──────────────────────────────────────────

type FontFamily = "serif" | "sans" | "mono";

function classifyFamily(rawName: string): FontFamily {
  // Strip the subset prefix (e.g. "ABCDEF+") that PDF fonts often carry
  const cleaned = rawName.replace(/^[A-Z]{6}\+/, "").toLowerCase();

  if (MONO_KEYWORDS.some((kw) => cleaned.includes(kw))) return "mono";
  if (SANS_KEYWORDS.some((kw) => cleaned.includes(kw))) return "sans";
  if (SERIF_KEYWORDS.some((kw) => cleaned.includes(kw))) return "serif";

  // Default to sans-serif (Helvetica) when we can't determine the family
  return "sans";
}

// ── Main mapper ────────────────────────────────────────────────────

/** Map tables: family × bold × italic → StandardFonts key */
const FONT_MAP: Record<FontFamily, Record<string, StandardFonts>> = {
  sans: {
    "normal-normal": StandardFonts.Helvetica,
    "bold-normal": StandardFonts.HelveticaBold,
    "normal-italic": StandardFonts.HelveticaOblique,
    "bold-italic": StandardFonts.HelveticaBoldOblique,
  },
  serif: {
    "normal-normal": StandardFonts.TimesRoman,
    "bold-normal": StandardFonts.TimesRomanBold,
    "normal-italic": StandardFonts.TimesRomanItalic,
    "bold-italic": StandardFonts.TimesRomanBoldItalic,
  },
  mono: {
    "normal-normal": StandardFonts.Courier,
    "bold-normal": StandardFonts.CourierBold,
    "normal-italic": StandardFonts.CourierOblique,
    "bold-italic": StandardFonts.CourierBoldOblique,
  },
};

/**
 * Map a raw PDF font name (+ optional explicit bold/italic flags)
 * to the closest pdf-lib StandardFont.
 */
export function mapFont(
  rawFontName: string,
  isBold?: boolean,
  isItalic?: boolean
): MappedFont {
  const family = classifyFamily(rawFontName);

  // Use explicit flags if provided, otherwise detect from name
  const bold = isBold ?? detectBold(rawFontName);
  const italic = isItalic ?? detectItalic(rawFontName);

  const styleKey = `${bold ? "bold" : "normal"}-${italic ? "italic" : "normal"}`;
  const standardFont = FONT_MAP[family][styleKey];

  // Check if the original font was likely one of the standard fonts
  const cleaned = rawFontName.replace(/^[A-Z]{6}\+/, "").toLowerCase();
  const isExactMatch =
    cleaned.includes("helvetica") ||
    cleaned.includes("times") ||
    cleaned.includes("courier");

  return {
    standardFont,
    isFallback: !isExactMatch,
    fallbackReason: isExactMatch
      ? undefined
      : `Font "${rawFontName}" mapped to ${standardFont} (${family} family)`,
  };
}

/**
 * Get all unique font fallback warnings for a set of edits.
 * Useful for showing a summary warning to the user before export.
 */
export function collectFontWarnings(
  mappings: MappedFont[]
): string[] {
  const warnings = new Set<string>();
  for (const m of mappings) {
    if (m.isFallback && m.fallbackReason) {
      warnings.add(m.fallbackReason);
    }
  }
  return Array.from(warnings);
}
