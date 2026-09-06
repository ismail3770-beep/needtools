/**
 * Text Grouping — groups extracted text items into visual lines
 *
 * pdfjs returns individual text "spans" which can be single words or
 * character runs. This module merges items that sit on the same
 * horizontal baseline into a single editable line group.
 */

import type { ExtractedTextItem, TextLineGroup } from "./types";

/**
 * Y-tolerance factor — two items are considered "same line" if their
 * Y-coordinates differ by less than this fraction of the average height.
 * 0.5 means half the text height.
 */
const Y_TOLERANCE_FACTOR = 0.5;

/**
 * X-gap factor — if the horizontal gap between two items on the same
 * line exceeds this multiple of the average character width, they are
 * treated as separate groups (e.g. two columns).
 */
const X_GAP_FACTOR = 3.0;

/**
 * Group extracted text items into lines.
 *
 * Algorithm:
 * 1. Sort items top-to-bottom, left-to-right
 * 2. Walk through sorted items; if current item's Y is close enough
 *    to the previous item AND the X gap isn't too large, merge into
 *    the same line group
 * 3. Assign a stable group ID to each group
 */
export function groupTextItemsIntoLines(
  items: ExtractedTextItem[]
): TextLineGroup[] {
  if (items.length === 0) return [];

  // Sort: top-to-bottom (Y ascending), then left-to-right (X ascending)
  const sorted = [...items].sort((a, b) => {
    if (Math.abs(a.y - b.y) > a.height * Y_TOLERANCE_FACTOR) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });

  const groups: ExtractedTextItem[][] = [];
  let currentGroup: ExtractedTextItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = currentGroup[currentGroup.length - 1];
    const curr = sorted[i];

    const avgHeight = (prev.height + curr.height) / 2;
    const yClose = Math.abs(curr.y - prev.y) < avgHeight * Y_TOLERANCE_FACTOR;

    // Estimate average char width from previous item
    const avgCharWidth =
      prev.text.length > 0 ? prev.width / prev.text.length : prev.height * 0.6;
    const xGap = curr.x - (prev.x + prev.width);
    const xClose = xGap < avgCharWidth * X_GAP_FACTOR;

    if (yClose && xClose) {
      currentGroup.push(curr);
    } else {
      groups.push(currentGroup);
      currentGroup = [curr];
    }
  }
  groups.push(currentGroup);

  // Convert raw groups into TextLineGroup objects
  return groups.map((groupItems, idx) => {
    const minX = Math.min(...groupItems.map((it) => it.x));
    const minY = Math.min(...groupItems.map((it) => it.y));
    const maxRight = Math.max(...groupItems.map((it) => it.x + it.width));
    const maxBottom = Math.max(...groupItems.map((it) => it.y + it.height));

    // Use the font info from the first (leftmost) item as representative
    const representative = groupItems[0];

    const groupId = `p${representative.pageNumber}-line${idx}`;

    // Update each item's lineGroupId
    for (const item of groupItems) {
      item.lineGroupId = groupId;
    }

    // Join text with spaces, but skip adding space if items are
    // immediately adjacent (the gap is very small)
    let fullText = "";
    for (let i = 0; i < groupItems.length; i++) {
      if (i > 0) {
        const gap =
          groupItems[i].x - (groupItems[i - 1].x + groupItems[i - 1].width);
        const charW =
          groupItems[i - 1].text.length > 0
            ? groupItems[i - 1].width / groupItems[i - 1].text.length
            : 5;
        // Add space only if gap is wider than ~30% of a character
        fullText += gap > charW * 0.3 ? " " : "";
      }
      fullText += groupItems[i].text;
    }

    return {
      id: groupId,
      pageNumber: representative.pageNumber,
      items: groupItems,
      x: minX,
      y: minY,
      width: maxRight - minX,
      height: maxBottom - minY,
      fullText,
    };
  });
}

/**
 * Get line groups for a specific page.
 */
export function getLineGroupsForPage(
  allGroups: TextLineGroup[],
  pageNumber: number
): TextLineGroup[] {
  return allGroups.filter((g) => g.pageNumber === pageNumber);
}
