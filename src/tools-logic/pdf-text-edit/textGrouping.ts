/**
 * Text Grouping — turns raw pdfjs text spans into editable paragraphs.
 *
 * Two passes:
 *  1. spans → lines   (same baseline, no large horizontal gap)
 *  2. lines → paragraphs (same alignment, font size and line spacing)
 *
 * Why paragraphs matter: a paragraph is rendered as ONE contenteditable, so
 * pressing Enter or typing a long word re-wraps inside the block and the
 * following blocks are pushed down. With one box per line (the previous
 * model) a growing line simply overlapped its neighbour.
 *
 * IDs are derived from geometry, never from array indices. Index-based IDs
 * shifted whenever the span order changed, which made edits reappear on the
 * wrong line.
 */

import type { ExtractedTextItem, TextLine, TextParagraph } from "./types";

/** Two spans share a line when their baselines are within this many points */
const BASELINE_TOLERANCE_PT = 1.5;
/** Break a line when the horizontal gap exceeds this multiple of the em size */
const LINE_BREAK_GAP_EM = 1.6;
/** Insert a space when the gap is wider than this fraction of a char */
const SPACE_GAP_FACTOR = 0.28;
/** Max baseline-to-baseline distance for two lines of one paragraph */
const PARAGRAPH_MAX_LEADING_EM = 2.1;
/** Alignment tolerance between paragraph lines (points) */
const ALIGN_TOLERANCE_PT = 2.5;
/** Font-size tolerance between paragraph lines (points) */
const SIZE_TOLERANCE_PT = 0.9;

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function avgCharWidth(item: ExtractedTextItem): number {
  if (item.text.length > 0 && item.width > 0) return item.width / item.text.length;
  return item.fontSize * 0.5;
}

/**
 * Sort spans top-down then left-to-right.
 *
 * The comparator only looks at rounded values, so it is transitive. The old
 * comparator compared against a per-item tolerance, which is not a valid
 * ordering and made Array.prototype.sort produce unstable results.
 */
function sortReadingOrder(items: ExtractedTextItem[]): ExtractedTextItem[] {
  return [...items].sort((a, b) => {
    const ay = Math.round(a.baselineTop * 2);
    const by = Math.round(b.baselineTop * 2);
    if (ay !== by) return ay - by;
    return a.x - b.x;
  });
}

/** Pass 1: spans → lines */
function buildLines(items: ExtractedTextItem[]): TextLine[] {
  const editable = items.filter((it) => !it.rotated && it.text.trim() !== "");
  if (editable.length === 0) return [];

  const sorted = sortReadingOrder(editable);
  const buckets: ExtractedTextItem[][] = [];
  let current: ExtractedTextItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = current[current.length - 1];
    const curr = sorted[i];

    const sameBaseline =
      Math.abs(curr.baselineTop - prev.baselineTop) <=
      Math.max(BASELINE_TOLERANCE_PT, prev.fontSize * 0.22);

    const gap = curr.x - (prev.x + prev.width);
    const closeEnough =
      gap <= Math.max(avgCharWidth(prev) * 3, prev.fontSize * LINE_BREAK_GAP_EM);

    if (sameBaseline && closeEnough) {
      current.push(curr);
    } else {
      buckets.push(current);
      current = [curr];
    }
  }
  buckets.push(current);

  return buckets.map((group) => {
    const first = group[0];
    const x = Math.min(...group.map((it) => it.x));
    const right = Math.max(...group.map((it) => it.x + it.width));
    const fontSize = Math.max(...group.map((it) => it.fontSize));
    const ascent = Math.max(...group.map((it) => it.ascent));
    const descent = Math.max(...group.map((it) => it.descent));

    let text = "";
    for (let i = 0; i < group.length; i++) {
      if (i > 0) {
        const prev = group[i - 1];
        const gap = group[i].x - (prev.x + prev.width);
        if (gap > avgCharWidth(prev) * SPACE_GAP_FACTOR) text += " ";
      }
      text += group[i].text;
    }

    return {
      id: `p${first.pageNumber}-l${round(first.baselineTop)}-${round(x)}`,
      pageNumber: first.pageNumber,
      items: group,
      text,
      x,
      right,
      baselineTop: first.baselineTop,
      pdfBaselineY: first.pdfBaselineY,
      pdfX: Math.min(...group.map((it) => it.pdfX)),
      fontSize,
      ascent,
      descent,
    };
  });
}

function centerOf(line: TextLine): number {
  return (line.x + line.right) / 2;
}

/** Do two lines belong to the same paragraph? */
function continuesParagraph(
  prev: TextLine,
  curr: TextLine,
  leading: number
): { ok: boolean; centered: boolean } {
  const sizeMatches = Math.abs(prev.fontSize - curr.fontSize) <= SIZE_TOLERANCE_PT;
  const verticalGap = curr.baselineTop - prev.baselineTop;
  const spacingOk =
    verticalGap > 0 &&
    verticalGap <= Math.max(leading * 1.35, prev.fontSize * PARAGRAPH_MAX_LEADING_EM);
  const overlapsHorizontally =
    Math.min(prev.right, curr.right) - Math.max(prev.x, curr.x) > 0;

  const leftAligned = Math.abs(prev.x - curr.x) <= ALIGN_TOLERANCE_PT;
  const centerAligned =
    Math.abs(centerOf(prev) - centerOf(curr)) <= ALIGN_TOLERANCE_PT;

  return {
    ok: sizeMatches && spacingOk && overlapsHorizontally && (leftAligned || centerAligned),
    centered: !leftAligned && centerAligned,
  };
}

/** Pass 2: lines → paragraphs */
function buildParagraphs(
  lines: TextLine[],
  pageWidth: number,
  pageHeight: number
): TextParagraph[] {
  if (lines.length === 0) return [];

  const ordered = [...lines].sort((a, b) => {
    const ay = Math.round(a.baselineTop * 2);
    const by = Math.round(b.baselineTop * 2);
    if (ay !== by) return ay - by;
    return a.x - b.x;
  });

  const buckets: { lines: TextLine[]; centered: boolean }[] = [];
  let current: TextLine[] = [ordered[0]];
  let currentCentered = false;
  let currentLeading = 0;

  for (let i = 1; i < ordered.length; i++) {
    const prev = current[current.length - 1];
    const curr = ordered[i];
    const { ok, centered } = continuesParagraph(
      prev,
      curr,
      currentLeading || prev.fontSize * 1.2
    );

    if (ok) {
      if (!currentLeading) currentLeading = curr.baselineTop - prev.baselineTop;
      currentCentered = currentCentered || centered;
      current.push(curr);
    } else {
      buckets.push({ lines: current, centered: currentCentered });
      current = [curr];
      currentCentered = false;
      currentLeading = 0;
    }
  }
  buckets.push({ lines: current, centered: currentCentered });

  const paragraphs: TextParagraph[] = buckets.map(({ lines: group, centered }) => {
    const first = group[0];
    const representative = first.items[0];

    const x = Math.min(...group.map((l) => l.x));
    const right = Math.max(...group.map((l) => l.right));
    const fontSize = Math.max(...group.map((l) => l.fontSize));
    const ascent = Math.max(...group.map((l) => l.ascent));
    const descent = Math.max(...group.map((l) => l.descent));

    // Median baseline-to-baseline distance, falling back to 1.2em
    const leadings: number[] = [];
    for (let i = 1; i < group.length; i++) {
      leadings.push(group[i].baselineTop - group[i - 1].baselineTop);
    }
    leadings.sort((a, b) => a - b);
    const lineHeightPt =
      leadings.length > 0
        ? leadings[Math.floor(leadings.length / 2)]
        : fontSize * 1.2;

    const topPt = first.baselineTop - ascent;
    const heightPt = (group.length - 1) * lineHeightPt + ascent + descent;

    return {
      id: `p${first.pageNumber}-x${round(x)}-y${round(first.baselineTop)}`,
      pageNumber: first.pageNumber,
      pageWidth,
      pageHeight,
      lines: group,
      text: group.map((l) => l.text).join("\n"),
      x,
      right,
      width: Math.max(right - x, fontSize),
      topPt,
      heightPt,
      lineHeightPt,
      availableHeightPt: 0, // filled in below
      pdfX: first.pdfX,
      pdfFirstBaselineY: first.pdfBaselineY,
      fontSize,
      ascent,
      descent,
      fontName: representative.fontName,
      fontFamily: representative.fontFamily,
      cssFontFamily: representative.cssFontFamily,
      isBold: representative.isBold,
      isItalic: representative.isItalic,
      isUnderline: false,
      color: representative.color,
      alignment: centered ? "center" : "left",
    };
  });

  // How much room does each paragraph have before it collides with the next
  // block underneath it (only counting horizontally overlapping blocks)?
  for (const para of paragraphs) {
    const paraBottom = para.topPt + para.heightPt;
    let nearest = pageHeight - paraBottom;
    for (const other of paragraphs) {
      if (other === para) continue;
      const overlaps =
        Math.min(para.right, other.right) - Math.max(para.x, other.x) > 0;
      if (!overlaps) continue;
      if (other.topPt < paraBottom) continue;
      nearest = Math.min(nearest, other.topPt - paraBottom);
    }
    para.availableHeightPt = Math.max(0, nearest);
  }

  return paragraphs;
}

/**
 * Full pipeline: raw spans of ONE page → editable paragraphs.
 */
export function groupTextItemsIntoParagraphs(
  items: ExtractedTextItem[],
  pageWidth: number,
  pageHeight: number
): TextParagraph[] {
  const lines = buildLines(items);
  return buildParagraphs(lines, pageWidth, pageHeight);
}

/** Filter paragraphs down to one page, in reading order. */
export function getParagraphsForPage(
  all: TextParagraph[],
  pageNumber: number
): TextParagraph[] {
  return all
    .filter((p) => p.pageNumber === pageNumber)
    .sort((a, b) => a.topPt - b.topPt || a.x - b.x);
}
