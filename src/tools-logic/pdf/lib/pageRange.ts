/**
 * Shared page-range parsing for the PDF page tools.
 *
 * Accepts human input like "1,3,5-7" and returns ZERO-BASED page indices,
 * de-duplicated and sorted ascending. Out-of-range and malformed parts are
 * ignored rather than throwing, so a typo never hard-fails the whole run.
 */
export function parsePageRange(input: string, pageCount: number): number[] {
  const indices = new Set<number>();

  for (const rawPart of input.split(",")) {
    const part = rawPart.trim();
    if (!part) continue;

    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      let start = parseInt(rangeMatch[1], 10);
      let end = parseInt(rangeMatch[2], 10);
      if (start > end) [start, end] = [end, start];
      for (let p = start; p <= end; p++) {
        if (p >= 1 && p <= pageCount) indices.add(p - 1);
      }
      continue;
    }

    const single = parseInt(part, 10);
    if (!Number.isNaN(single) && single >= 1 && single <= pageCount) {
      indices.add(single - 1);
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

/** Strip the extension from a filename, e.g. "report.pdf" -> "report". */
export function baseName(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.slice(0, lastDot) : filename;
}
