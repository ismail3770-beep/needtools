/**
 * Minimal MD5 implementation (public domain, self-contained, TypeScript strict).
 * MD5 is not supported by Web Crypto API for security reasons —
 * this is required to fulfill the product specification in toolsRegistry.ts.
 * Only suitable for non-security purposes (checksums, deduplication).
 */

function rotateLeft(x: number, n: number): number {
  return (x << n) | (x >>> (32 - n));
}

function add32(a: number, b: number): number {
  return (a + b) & 0xffffffff;
}

// MD5 shift amounts
const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

// MD5 constants (K table)
const K: number[] = [];
for (let i = 0; i < 64; i++) {
  K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
}

function toLittleEndianBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes.push(code & 0xff);
    if (code > 0xff) bytes.push((code >> 8) & 0xff); // UTF-16LE lower surrogate
  }
  return bytes;
}

export function computeMd5(input: string): string {
  // Convert UTF-16 string to UTF-8 bytes
  const utf8 = unescape(encodeURIComponent(input));
  const bytes = toLittleEndianBytes(utf8);

  const bitLen = bytes.length * 8;

  // Padding: append 0x80, then 0x00 until length ≡ 56 mod 64
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) {
    bytes.push(0);
  }

  // Append original length in bits as 64-bit little-endian
  for (let i = 0; i < 8; i++) {
    bytes.push((bitLen >>> (i * 8)) & 0xff);
  }

  // Initialize hash
  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  // Process each 64-byte block
  for (let offset = 0; offset < bytes.length; offset += 64) {
    const M: number[] = [];
    for (let i = 0; i < 16; i++) {
      M[i] =
        bytes[offset + i * 4] |
        (bytes[offset + i * 4 + 1] << 8) |
        (bytes[offset + i * 4 + 2] << 16) |
        (bytes[offset + i * 4 + 3] << 24);
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;

      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }

      F = add32(add32(add32(F, A), K[i]), M[g]);
      A = D;
      D = C;
      C = B;
      B = add32(B, rotateLeft(F, S[i]));
    }

    a0 = add32(a0, A);
    b0 = add32(b0, B);
    c0 = add32(c0, C);
    d0 = add32(d0, D);
  }

  // Produce hex digest (little-endian per MD5 spec)
  const hex: string[] = [];
  for (const word of [a0, b0, c0, d0]) {
    for (let i = 0; i < 4; i++) {
      hex.push(((word >>> (i * 8)) & 0xff).toString(16).padStart(2, "0"));
    }
  }
  return hex.join("");
}
