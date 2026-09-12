import { describe, expect, it } from "vitest";
import { encodeBmp } from "./bmp";

const FILE_HEADER_SIZE = 14;
const INFO_HEADER_SIZE = 40;
const HEADER_SIZE = FILE_HEADER_SIZE + INFO_HEADER_SIZE;

async function readBytes(blob: Blob): Promise<DataView> {
  return new DataView(await blob.arrayBuffer());
}

/** Solid RGBA pixel buffer helper. */
function solid(
  width: number,
  height: number,
  [r, g, b, a]: [number, number, number, number]
): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = a;
  }
  return data;
}

describe("encodeBmp", () => {
  it("writes a valid BITMAPINFOHEADER", async () => {
    const blob = encodeBmp(2, 2, solid(2, 2, [255, 0, 0, 255]));
    const view = await readBytes(blob);

    expect(blob.type).toBe("image/bmp");
    expect(view.getUint8(0)).toBe(0x42); // 'B'
    expect(view.getUint8(1)).toBe(0x4d); // 'M'
    expect(view.getUint32(2, true)).toBe(blob.size);
    expect(view.getUint32(10, true)).toBe(HEADER_SIZE);
    expect(view.getUint32(14, true)).toBe(INFO_HEADER_SIZE);
    expect(view.getInt32(18, true)).toBe(2);
    expect(view.getInt32(22, true)).toBe(2);
    expect(view.getUint16(28, true)).toBe(24); // bits per pixel
    expect(view.getUint32(30, true)).toBe(0); // BI_RGB
  });

  it("pads each row to a 4-byte boundary", () => {
    // 3px wide => 9 bytes per row => 3 bytes of padding => 12 per row.
    const blob = encodeBmp(3, 2, solid(3, 2, [0, 0, 0, 255]));
    expect(blob.size).toBe(HEADER_SIZE + 12 * 2);

    // 4px wide => 12 bytes per row => already aligned, no padding.
    const aligned = encodeBmp(4, 1, solid(4, 1, [0, 0, 0, 255]));
    expect(aligned.size).toBe(HEADER_SIZE + 12);
  });

  it("stores pixels as BGR", async () => {
    const blob = encodeBmp(1, 1, solid(1, 1, [10, 20, 30, 255]));
    const view = await readBytes(blob);

    expect(view.getUint8(HEADER_SIZE)).toBe(30); // blue
    expect(view.getUint8(HEADER_SIZE + 1)).toBe(20); // green
    expect(view.getUint8(HEADER_SIZE + 2)).toBe(10); // red
  });

  it("composites transparency onto white", async () => {
    const blob = encodeBmp(1, 1, solid(1, 1, [0, 0, 0, 0]));
    const view = await readBytes(blob);

    expect(view.getUint8(HEADER_SIZE)).toBe(255);
    expect(view.getUint8(HEADER_SIZE + 1)).toBe(255);
    expect(view.getUint8(HEADER_SIZE + 2)).toBe(255);
  });

  it("writes rows bottom-up", async () => {
    // Two rows: top row red, bottom row blue.
    const data = new Uint8ClampedArray(1 * 2 * 4);
    data.set([255, 0, 0, 255], 0); // y=0 (top)
    data.set([0, 0, 255, 255], 4); // y=1 (bottom)

    const blob = encodeBmp(1, 2, data);
    const view = await readBytes(blob);

    // First stored row must be the bottom one (blue).
    expect(view.getUint8(HEADER_SIZE)).toBe(255); // B
    expect(view.getUint8(HEADER_SIZE + 2)).toBe(0); // R
  });
});
