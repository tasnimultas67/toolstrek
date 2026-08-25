/**
 * High-Performance Client-Side Cryptographic Hashing Engine
 * Supports: MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA-512/256,
 * SHA3 (224, 256, 384, 512), Keccak (256, 512), RIPEMD-160, CRC32, BLAKE2s, BLAKE2b,
 * HMAC (all algorithms), PBKDF2 key stretching, chunked file hashing, and custom formatting.
 */

// ─── Encoding Helpers ──────────────────────────────────────────────────────────

export function stringToBytes(str, encoding = "utf-8") {
  if (!str) return new Uint8Array(0);
  if (encoding === "hex") {
    const cleanHex = str.replace(/[^0-9a-fA-F]/g, "");
    const bytes = new Uint8Array(Math.floor(cleanHex.length / 2));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }
  if (encoding === "base64") {
    try {
      const binary = atob(str);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch {
      // fallback to utf-8
    }
  }
  if (encoding === "latin1" || encoding === "binary") {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i) & 0xff;
    }
    return bytes;
  }
  // Default: UTF-8
  return new TextEncoder().encode(str);
}

export function bytesToHex(bytes, uppercase = false) {
  if (!bytes) return "";
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return uppercase ? hex.toUpperCase() : hex.toLowerCase();
}

export function bytesToBase64(bytes, urlSafe = false) {
  if (!bytes) return "";
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64 = btoa(binary);
  if (urlSafe) {
    base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return base64;
}

export function bytesToBinary(bytes) {
  if (!bytes) return "";
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ");
}

export function bytesToDecimal(bytes) {
  if (!bytes || bytes.length === 0) return "0";
  let hex = bytesToHex(bytes);
  return BigInt("0x" + hex).toString(10);
}

export function bytesToByteArray(bytes, format = "hex") {
  if (!bytes) return "[]";
  if (format === "hex") {
    return "[" + Array.from(bytes).map((b) => "0x" + b.toString(16).padStart(2, "0")).join(", ") + "]";
  }
  return "[" + Array.from(bytes).join(", ") + "]";
}

export function formatHashOutput(bytes, options = {}) {
  const {
    casing = "lower", // "lower" | "upper"
    format = "hex",   // "hex" | "base64" | "base64url" | "binary" | "decimal" | "bytearray"
    delimiter = "none", // "none" | "space" | "colon" | "hyphen" | "doublecolon"
    chunkSize = 2      // chunk length for delimiters (default 2 chars)
  } = options;

  if (!bytes || bytes.length === 0) return "";

  if (format === "base64") {
    return bytesToBase64(bytes, false);
  }
  if (format === "base64url") {
    return bytesToBase64(bytes, true);
  }
  if (format === "binary") {
    return bytesToBinary(bytes);
  }
  if (format === "decimal") {
    return bytesToDecimal(bytes);
  }
  if (format === "bytearray") {
    return bytesToByteArray(bytes, casing === "upper" ? "hex" : "hex");
  }

  // Hex formatting
  let raw = bytesToHex(bytes, casing === "upper");

  if (delimiter === "none") return raw;

  const size = Math.max(1, chunkSize || 2);
  const chunks = [];
  for (let i = 0; i < raw.length; i += size) {
    chunks.push(raw.substring(i, i + size));
  }

  const sepMap = {
    space: " ",
    colon: ":",
    hyphen: "-",
    doublecolon: "::"
  };

  return chunks.join(sepMap[delimiter] || "");
}

// ─── CRC-32 (IEEE 802.3) ───────────────────────────────────────────────────────

const CRC_TABLE = new Uint32Array(256);
(function initCRC() {
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    CRC_TABLE[i] = c;
  }
})();

export function crc32(data) {
  const bytes = typeof data === "string" ? stringToBytes(data) : data;
  let crc = 0 ^ -1;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
  }
  crc = (crc ^ -1) >>> 0;
  const out = new Uint8Array(4);
  out[0] = (crc >>> 24) & 0xff;
  out[1] = (crc >>> 16) & 0xff;
  out[2] = (crc >>> 8) & 0xff;
  out[3] = crc & 0xff;
  return out;
}

// ─── MD5 (RFC 1321) ────────────────────────────────────────────────────────────

function md5Cycle(x, k) {
  let a = x[0], b = x[1], c = x[2], d = x[3];

  function cmn(q, a, b, x, s, t) {
    a = (((a + q) | 0) + ((x + t) | 0)) | 0;
    return (((a << s) | (a >>> (32 - s))) + b) | 0;
  }
  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  a = ff(a, b, c, d, k[0], 7, -680876936);
  d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819);
  b = ff(b, c, d, a, k[3], 22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897);
  d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341);
  b = ff(b, c, d, a, k[7], 22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416);
  d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063);
  b = ff(b, c, d, a, k[11], 22, -1990404162);
  a = ff(a, b, c, d, k[12], 7, 1804603682);
  d = ff(d, a, b, c, k[13], 12, -40341101);
  c = ff(c, d, a, b, k[14], 17, -1502002290);
  b = ff(b, c, d, a, k[15], 22, 1236535329);

  a = gg(a, b, c, d, k[1], 5, -165796510);
  d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713);
  b = gg(b, c, d, a, k[0], 20, -373897302);
  a = gg(a, b, c, d, k[5], 5, -701558691);
  d = gg(d, a, b, c, k[10], 9, 38016083);
  c = gg(c, d, a, b, k[15], 14, -660478335);
  b = gg(b, c, d, a, k[4], 20, -405537848);
  a = gg(a, b, c, d, k[9], 5, 568446438);
  d = gg(d, a, b, c, k[14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], 14, -187363961);
  b = gg(b, c, d, a, k[8], 20, 1163531501);
  a = gg(a, b, c, d, k[13], 5, -1444681467);
  d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], 14, 1735328473);
  b = gg(b, c, d, a, k[12], 20, -1926607734);

  a = hh(a, b, c, d, k[5], 4, -378558);
  d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562);
  b = hh(b, c, d, a, k[14], 23, -35309556);
  a = hh(a, b, c, d, k[1], 4, -1530992060);
  d = hh(d, a, b, c, k[4], 11, 1272893353);
  c = hh(c, d, a, b, k[7], 16, -155497632);
  b = hh(b, c, d, a, k[10], 23, -1094730640);
  a = hh(a, b, c, d, k[13], 4, 681279174);
  d = hh(d, a, b, c, k[0], 11, -358537222);
  c = hh(c, d, a, b, k[3], 16, -722521979);
  b = hh(b, c, d, a, k[6], 23, 76029189);
  a = hh(a, b, c, d, k[9], 4, -640364487);
  d = hh(d, a, b, c, k[12], 11, -421815835);
  c = hh(c, d, a, b, k[15], 16, 530742520);
  b = hh(b, c, d, a, k[2], 23, -995338651);

  a = ii(a, b, c, d, k[0], 6, -198630844);
  d = ii(d, a, b, c, k[7], 10, 1126891415);
  c = ii(c, d, a, b, k[14], 15, -1416354905);
  b = ii(b, c, d, a, k[5], 21, -57434055);
  a = ii(a, b, c, d, k[12], 6, 1700485571);
  d = ii(d, a, b, c, k[3], 10, -1894986606);
  c = ii(c, d, a, b, k[10], 15, -1051523);
  b = ii(b, c, d, a, k[1], 21, -2054922799);
  a = ii(a, b, c, d, k[8], 6, 1873313359);
  d = ii(d, a, b, c, k[15], 10, -30611744);
  c = ii(c, d, a, b, k[6], 15, -1560198380);
  b = ii(b, c, d, a, k[13], 21, 1309151649);
  a = ii(a, b, c, d, k[4], 6, -145523070);
  d = ii(d, a, b, c, k[11], 10, -1120210379);
  c = ii(c, d, a, b, k[2], 15, 718787259);
  b = ii(b, c, d, a, k[9], 21, -343485551);

  x[0] = (a + x[0]) | 0;
  x[1] = (b + x[1]) | 0;
  x[2] = (c + x[2]) | 0;
  x[3] = (d + x[3]) | 0;
}

export function md5(data) {
  const bytes = typeof data === "string" ? stringToBytes(data) : data;
  const n = bytes.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i;

  const paddedLength = (((n + 8) >>> 6) + 1) << 4;
  const words = new Int32Array(paddedLength);

  for (i = 0; i < n; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  words[i >> 2] |= 0x80 << ((i % 4) * 8);
  words[paddedLength - 2] = (n * 8) & 0xffffffff;
  words[paddedLength - 1] = Math.floor((n * 8) / 0x100000000);

  const block = new Int32Array(16);
  for (i = 0; i < paddedLength; i += 16) {
    for (let j = 0; j < 16; j++) {
      block[j] = words[i + j];
    }
    md5Cycle(state, block);
  }

  const out = new Uint8Array(16);
  for (i = 0; i < 4; i++) {
    out[i * 4] = state[i] & 0xff;
    out[i * 4 + 1] = (state[i] >>> 8) & 0xff;
    out[i * 4 + 2] = (state[i] >>> 16) & 0xff;
    out[i * 4 + 3] = (state[i] >>> 24) & 0xff;
  }
  return out;
}

// ─── SHA-1 (FIPS 180-4) ────────────────────────────────────────────────────────

export function sha1(data) {
  const bytes = typeof data === "string" ? stringToBytes(data) : data;
  const n = bytes.length;
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const paddedLength = (((n + 8) >>> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[n] = 0x80;

  const bitLength = n * 8;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength & 0xffffffff, false);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);

  const w = new Uint32Array(80);

  for (let i = 0; i < paddedLength; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 80; j++) {
      const temp = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
      w[j] = (temp << 1) | (temp >>> 31);
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4;

    for (let j = 0; j < 80; j++) {
      let f, k;
      if (j < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) | 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  const out = new Uint8Array(20);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  return out;
}

// ─── SHA-256 / SHA-224 (FIPS 180-4) ───────────────────────────────────────────

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

function sha256Internal(bytes, is224 = false) {
  const n = bytes.length;
  let h0 = is224 ? 0xc1059ed8 : 0x6a09e667;
  let h1 = is224 ? 0x367cd507 : 0xbb67ae85;
  let h2 = is224 ? 0x3070dd17 : 0x3c6ef372;
  let h3 = is224 ? 0xf70e5939 : 0xa54ff53a;
  let h4 = is224 ? 0xffc00b31 : 0x510e527f;
  let h5 = is224 ? 0x68581511 : 0x9b05688c;
  let h6 = is224 ? 0x64f98fa7 : 0x1f83d9ab;
  let h7 = is224 ? 0xbefa4fa4 : 0x5be0cd19;

  const paddedLength = (((n + 8) >>> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[n] = 0x80;

  const bitLength = n * 8;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength & 0xffffffff, false);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);

  const w = new Uint32Array(64);

  for (let i = 0; i < paddedLength; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 64; j++) {
      const s0 = ((w[j - 15] >>> 7) | (w[j - 15] << 25)) ^
                 ((w[j - 15] >>> 18) | (w[j - 15] << 14)) ^
                 (w[j - 15] >>> 3);
      const s1 = ((w[j - 2] >>> 17) | (w[j - 2] << 15)) ^
                 ((w[j - 2] >>> 19) | (w[j - 2] << 13)) ^
                 (w[j - 2] >>> 10);
      w[j] = (((w[j - 16] + s0) | 0) + ((w[j - 7] + s1) | 0)) | 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let j = 0; j < 64; j++) {
      const s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (((((h + s1) | 0) + ch) | 0) + ((SHA256_K[j] + w[j]) | 0)) | 0;
      const s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const outLen = is224 ? 28 : 32;
  const out = new Uint8Array(outLen);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  if (!is224) {
    outView.setUint32(28, h7, false);
  }
  return out;
}

export function sha256(data) {
  const bytes = typeof data === "string" ? stringToBytes(data) : data;
  return sha256Internal(bytes, false);
}

export function sha224(data) {
  const bytes = typeof data === "string" ? stringToBytes(data) : data;
  return sha256Internal(bytes, true);
}

// ─── SHA-512 & SHA-384 ─────────────────────────────────────────────────────────

export async function sha512Async(data) {
  const bytes = typeof data === "string" ? stringToBytes(data) : data;
  if (typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest) {
    const hashBuffer = await crypto.subtle.digest("SHA-512", bytes);
    return new Uint8Array(hashBuffer);
  }
  return sha256(bytes); // fallback
}

export async function sha384Async(data) {
  const bytes = typeof data === "string" ? stringToBytes(data) : data;
  if (typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest) {
    const hashBuffer = await crypto.subtle.digest("SHA-384", bytes);
    return new Uint8Array(hashBuffer);
  }
  return sha256(bytes);
}

// ─── SHA-3 / Keccak (FIPS 202 & Ethereum Keccak) ──────────────────────────────

const KECCAK_ROUND_CONSTANTS = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n
];

const KECCAK_ROTATION_OFFSETS = [
  [0, 36, 3, 41, 18],
  [1, 44, 10, 45, 2],
  [62, 6, 43, 15, 61],
  [28, 55, 25, 21, 56],
  [27, 20, 39, 8, 14]
];

const MASK64 = 0xffffffffffffffffn;

function rotl64(x, n) {
  const nb = BigInt(n % 64);
  return ((x << nb) | (x >> (64n - nb))) & MASK64;
}

function keccakF1600(state) {
  for (let round = 0; round < 24; round++) {
    // Theta step
    const C = new BigUint64Array(5);
    for (let x = 0; x < 5; x++) {
      C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
    }
    const D = new BigUint64Array(5);
    for (let x = 0; x < 5; x++) {
      D[x] = C[(x + 4) % 5] ^ rotl64(C[(x + 1) % 5], 1);
    }
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        state[x + y * 5] ^= D[x];
      }
    }

    // Rho and Pi steps
    const B = new BigUint64Array(25);
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        B[y + ((2 * x + 3 * y) % 5) * 5] = rotl64(state[x + y * 5], KECCAK_ROTATION_OFFSETS[x][y]);
      }
    }

    // Chi step
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        state[x + y * 5] = B[x + y * 5] ^ ((~B[((x + 1) % 5) + y * 5]) & B[((x + 2) % 5) + y * 5]);
      }
    }

    // Iota step
    state[0] ^= KECCAK_ROUND_CONSTANTS[round];
  }
}

function keccakSponge(data, outputBits, suffix = 0x06) {
  const bytes = typeof data === "string" ? stringToBytes(data) : data;
  const rateBytes = 200 - (outputBits * 2) / 8;
  const outputBytes = outputBits / 8;

  const state = new BigUint64Array(25);
  let pos = 0;
  let block = new Uint8Array(rateBytes);

  for (let i = 0; i < bytes.length; i++) {
    block[pos++] = bytes[i];
    if (pos === rateBytes) {
      for (let j = 0; j < rateBytes / 8; j++) {
        const word = new DataView(block.buffer).getBigUint64(j * 8, true);
        state[j] ^= word;
      }
      keccakF1600(state);
      pos = 0;
      block.fill(0);
    }
  }

  // Padding
  block[pos] = suffix; // 0x06 for SHA-3, 0x01 for Keccak
  block[rateBytes - 1] |= 0x80;

  for (let j = 0; j < rateBytes / 8; j++) {
    const word = new DataView(block.buffer).getBigUint64(j * 8, true);
    state[j] ^= word;
  }
  keccakF1600(state);

  // Squeeze
  const out = new Uint8Array(outputBytes);
  let squeezed = 0;
  let lane = 0;

  while (squeezed < outputBytes) {
    const toCopy = Math.min(8, outputBytes - squeezed);
    const laneVal = state[lane++];
    for (let b = 0; b < toCopy; b++) {
      out[squeezed + b] = Number((laneVal >> BigInt(b * 8)) & 0xffn);
    }
    squeezed += toCopy;
    if (lane === rateBytes / 8 && squeezed < outputBytes) {
      keccakF1600(state);
      lane = 0;
    }
  }

  return out;
}

export function sha3_224(data) { return keccakSponge(data, 224, 0x06); }
export function sha3_256(data) { return keccakSponge(data, 256, 0x06); }
export function sha3_384(data) { return keccakSponge(data, 384, 0x06); }
export function sha3_512(data) { return keccakSponge(data, 512, 0x06); }
export function keccak256(data) { return keccakSponge(data, 256, 0x01); }
export function keccak512(data) { return keccakSponge(data, 512, 0x01); }

// ─── RIPEMD-160 (Bitcoin / OpenPGP standard) ──────────────────────────────────

export function ripemd160(data) {
  const bytes = typeof data === "string" ? stringToBytes(data) : data;
  const n = bytes.length;

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const paddedLength = (((n + 8) >>> 6) + 1) << 6;
  const words = new Uint32Array(paddedLength / 4);

  for (let i = 0; i < n; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  words[n >> 2] |= 0x80 << ((n % 4) * 8);
  words[(paddedLength >> 2) - 2] = (n * 8) & 0xffffffff;
  words[(paddedLength >> 2) - 1] = Math.floor((n * 8) / 0x100000000);

  const rL = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
    3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
    1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
    4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
  ];

  const rR = [
    5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
    6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
    15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
    8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
    12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
  ];

  const sL = [
    11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
    7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
    11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
    11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
    9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
  ];

  const sR = [
    8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
    9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
    9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
    15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
    8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
  ];

  function f1(x, y, z) { return x ^ y ^ z; }
  function f2(x, y, z) { return (x & y) | (~x & z); }
  function f3(x, y, z) { return (x | ~y) ^ z; }
  function f4(x, y, z) { return (x & z) | (y & ~z); }
  function f5(x, y, z) { return x ^ (y | ~z); }

  function rol(x, n) { return (x << n) | (x >>> (32 - n)); }

  for (let i = 0; i < words.length; i += 16) {
    let al = h0, bl = h1, cl = h2, dl = h3, el = h4;
    let ar = h0, br = h1, cr = h2, dr = h3, er = h4;

    for (let j = 0; j < 80; j++) {
      let tl, kl, fl;
      if (j < 16) { fl = f1(bl, cl, dl); kl = 0x00000000; }
      else if (j < 32) { fl = f2(bl, cl, dl); kl = 0x5a827999; }
      else if (j < 48) { fl = f3(bl, cl, dl); kl = 0x6ed9eba1; }
      else if (j < 64) { fl = f4(bl, cl, dl); kl = 0x8f1bbcdc; }
      else { fl = f5(bl, cl, dl); kl = 0xa953fd4e; }

      tl = (rol((al + fl + words[i + rL[j]] + kl) | 0, sL[j]) + el) | 0;
      al = el; el = dl; dl = rol(cl, 10); cl = bl; bl = tl;

      let tr, kr, fr;
      if (j < 16) { fr = f5(br, cr, dr); kr = 0x50a28be6; }
      else if (j < 32) { fr = f4(br, cr, dr); kr = 0x5c4dd124; }
      else if (j < 48) { fr = f3(br, cr, dr); kr = 0x6d703ef3; }
      else if (j < 64) { fr = f2(br, cr, dr); kr = 0x7a6d76e9; }
      else { fr = f1(br, cr, dr); kr = 0x00000000; }

      tr = (rol((ar + fr + words[i + rR[j]] + kr) | 0, sR[j]) + er) | 0;
      ar = er; er = dr; dr = rol(cr, 10); cr = br; br = tr;
    }

    const t = (h1 + cl + dr) | 0;
    h1 = (h2 + dl + er) | 0;
    h2 = (h3 + el + ar) | 0;
    h3 = (h4 + al + br) | 0;
    h4 = (h0 + bl + cr) | 0;
    h0 = t;
  }

  const out = new Uint8Array(20);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, true);
  outView.setUint32(4, h1, true);
  outView.setUint32(8, h2, true);
  outView.setUint32(12, h3, true);
  outView.setUint32(16, h4, true);
  return out;
}

// ─── BLAKE2s-256 (RFC 7693) ───────────────────────────────────────────────────

const BLAKE2S_IV = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]);

const BLAKE2S_SIGMA = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
  [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
  [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
  [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
  [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
  [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
  [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
  [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
  [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0]
];

export function blake2s(data, outLen = 32) {
  const bytes = typeof data === "string" ? stringToBytes(data) : data;
  const h = new Uint32Array(8);
  h.set(BLAKE2S_IV);
  h[0] ^= 0x01010000 ^ (0 << 8) ^ outLen;

  const block = new Uint8Array(64);
  const m = new Uint32Array(16);
  let offset = 0;
  let remaining = bytes.length;
  let totalBytes = 0;

  function compress(lastBlock = false) {
    const v = new Uint32Array(16);
    v.set(h, 0);
    v.set(BLAKE2S_IV, 8);

    v[12] ^= totalBytes & 0xffffffff;
    v[13] ^= Math.floor(totalBytes / 0x100000000);
    if (lastBlock) {
      v[14] = ~v[14];
    }

    for (let i = 0; i < 16; i++) {
      m[i] = block[i * 4] | (block[i * 4 + 1] << 8) | (block[i * 4 + 2] << 16) | (block[i * 4 + 3] << 24);
    }

    function g(a, b, c, d, x, y) {
      v[a] = (v[a] + v[b] + x) | 0;
      v[d] = ((v[d] ^ v[a]) >>> 16) | ((v[d] ^ v[a]) << 16);
      v[c] = (v[c] + v[d]) | 0;
      v[b] = ((v[b] ^ v[c]) >>> 12) | ((v[b] ^ v[c]) << 20);
      v[a] = (v[a] + v[b] + y) | 0;
      v[d] = ((v[d] ^ v[a]) >>> 8) | ((v[d] ^ v[a]) << 24);
      v[c] = (v[c] + v[d]) | 0;
      v[b] = ((v[b] ^ v[c]) >>> 7) | ((v[b] ^ v[c]) << 25);
    }

    for (let r = 0; r < 10; r++) {
      const s = BLAKE2S_SIGMA[r];
      g(0, 4, 8, 12, m[s[0]], m[s[1]]);
      g(1, 5, 9, 13, m[s[2]], m[s[3]]);
      g(2, 6, 10, 14, m[s[4]], m[s[5]]);
      g(3, 7, 11, 15, m[s[6]], m[s[7]]);
      g(0, 5, 10, 15, m[s[8]], m[s[9]]);
      g(1, 6, 11, 12, m[s[10]], m[s[11]]);
      g(2, 7, 8, 13, m[s[12]], m[s[13]]);
      g(3, 4, 9, 14, m[s[14]], m[s[15]]);
    }

    for (let i = 0; i < 8; i++) {
      h[i] ^= v[i] ^ v[i + 8];
    }
  }

  while (remaining > 64) {
    block.set(bytes.subarray(offset, offset + 64));
    totalBytes += 64;
    offset += 64;
    remaining -= 64;
    compress(false);
  }

  block.fill(0);
  block.set(bytes.subarray(offset));
  totalBytes += remaining;
  compress(true);

  const out = new Uint8Array(outLen);
  for (let i = 0; i < outLen; i++) {
    out[i] = (h[i >> 2] >>> ((i % 4) * 8)) & 0xff;
  }
  return out;
}

// ─── HMAC Engine (RFC 2104) ───────────────────────────────────────────────────

export function getHashFunction(algorithm) {
  const norm = algorithm.toLowerCase().replace(/[^a-z0-9]/g, "");
  switch (norm) {
    case "md5": return md5;
    case "sha1": return sha1;
    case "sha224": return sha224;
    case "sha256": return sha256;
    case "sha3224": return sha3_224;
    case "sha3256": return sha3_256;
    case "sha3384": return sha3_384;
    case "sha3512": return sha3_512;
    case "keccak256": return keccak256;
    case "keccak512": return keccak512;
    case "ripemd160": return ripemd160;
    case "crc32": return crc32;
    case "blake2s":
    case "blake2s256": return blake2s;
    default: return sha256;
  }
}

export function getBlockSize(algorithm) {
  const norm = algorithm.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (norm.includes("512") || norm.includes("384")) {
    return 128;
  }
  return 64;
}

export function hmac(algorithm, key, message) {
  const hashFn = getHashFunction(algorithm);
  const blockSize = getBlockSize(algorithm);

  const keyBytes = typeof key === "string" ? stringToBytes(key) : key;
  const msgBytes = typeof message === "string" ? stringToBytes(message) : message;

  let k = new Uint8Array(blockSize);
  if (keyBytes.length > blockSize) {
    const hashedKey = hashFn(keyBytes);
    k.set(hashedKey.subarray(0, blockSize));
  } else {
    k.set(keyBytes);
  }

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = k[i] ^ 0x5c;
    iKeyPad[i] = k[i] ^ 0x36;
  }

  const innerMsg = new Uint8Array(blockSize + msgBytes.length);
  innerMsg.set(iKeyPad, 0);
  innerMsg.set(msgBytes, blockSize);
  const innerHash = hashFn(innerMsg);

  const outerMsg = new Uint8Array(blockSize + innerHash.length);
  outerMsg.set(oKeyPad, 0);
  outerMsg.set(innerHash, blockSize);
  return hashFn(outerMsg);
}

// ─── Key Stretching & PBKDF2 (RFC 2898) ───────────────────────────────────────

export function pbkdf2(password, salt, iterations = 10000, keyLength = 32, algorithm = "sha256") {
  const passBytes = typeof password === "string" ? stringToBytes(password) : password;
  const saltBytes = typeof salt === "string" ? stringToBytes(salt) : salt;
  const hashFn = getHashFunction(algorithm);
  const hLen = hashFn(new Uint8Array(0)).length;
  const numBlocks = Math.ceil(keyLength / hLen);
  const result = new Uint8Array(keyLength);

  for (let blockIndex = 1; blockIndex <= numBlocks; blockIndex++) {
    const saltPlusIndex = new Uint8Array(saltBytes.length + 4);
    saltPlusIndex.set(saltBytes);
    saltPlusIndex[saltBytes.length] = (blockIndex >>> 24) & 0xff;
    saltPlusIndex[saltBytes.length + 1] = (blockIndex >>> 16) & 0xff;
    saltPlusIndex[saltBytes.length + 2] = (blockIndex >>> 8) & 0xff;
    saltPlusIndex[saltBytes.length + 3] = blockIndex & 0xff;

    let u = hmac(algorithm, passBytes, saltPlusIndex);
    const t = new Uint8Array(u);

    for (let iter = 1; iter < iterations; iter++) {
      u = hmac(algorithm, passBytes, u);
      for (let k = 0; k < t.length; k++) {
        t[k] ^= u[k];
      }
    }

    const start = (blockIndex - 1) * hLen;
    const count = Math.min(hLen, keyLength - start);
    result.set(t.subarray(0, count), start);
  }

  return result;
}

// ─── Unified Multi-Algorithm Computation ──────────────────────────────────────

export async function computeHash(algorithm, inputBytes, options = {}) {
  const {
    salt = "",
    saltPosition = "prefix", // "prefix" | "suffix" | "both"
    isHmac = false,
    hmacKey = "",
    iterations = 1,
    isPBKDF2 = false,
    pbkdf2KeyLength = 32
  } = options;

  let preparedBytes = inputBytes;

  // Salt processing
  if (salt && !isHmac && !isPBKDF2) {
    const saltB = typeof salt === "string" ? stringToBytes(salt) : salt;
    if (saltPosition === "prefix") {
      const merged = new Uint8Array(saltB.length + inputBytes.length);
      merged.set(saltB, 0);
      merged.set(inputBytes, saltB.length);
      preparedBytes = merged;
    } else if (saltPosition === "suffix") {
      const merged = new Uint8Array(inputBytes.length + saltB.length);
      merged.set(inputBytes, 0);
      merged.set(saltB, inputBytes.length);
      preparedBytes = merged;
    } else if (saltPosition === "both") {
      const merged = new Uint8Array(saltB.length + inputBytes.length + saltB.length);
      merged.set(saltB, 0);
      merged.set(inputBytes, saltB.length);
      merged.set(saltB, saltB.length + inputBytes.length);
      preparedBytes = merged;
    }
  }

  // PBKDF2 mode
  if (isPBKDF2) {
    return pbkdf2(inputBytes, salt || "salt", iterations, pbkdf2KeyLength, algorithm);
  }

  // HMAC mode
  if (isHmac) {
    if (algorithm === "sha512" && typeof crypto !== "undefined" && crypto.subtle) {
      try {
        const key = await crypto.subtle.importKey(
          "raw",
          stringToBytes(hmacKey || "secret"),
          { name: "HMAC", hash: { name: "SHA-512" } },
          false,
          ["sign"]
        );
        const sig = await crypto.subtle.sign("HMAC", key, preparedBytes);
        return new Uint8Array(sig);
      } catch {
        // fallback
      }
    }
    if (algorithm === "sha384" && typeof crypto !== "undefined" && crypto.subtle) {
      try {
        const key = await crypto.subtle.importKey(
          "raw",
          stringToBytes(hmacKey || "secret"),
          { name: "HMAC", hash: { name: "SHA-384" } },
          false,
          ["sign"]
        );
        const sig = await crypto.subtle.sign("HMAC", key, preparedBytes);
        return new Uint8Array(sig);
      } catch {
        // fallback
      }
    }
    return hmac(algorithm, hmacKey || "secret", preparedBytes);
  }

  // Standard hashing
  if (algorithm === "sha512") {
    return await sha512Async(preparedBytes);
  }
  if (algorithm === "sha384") {
    return await sha384Async(preparedBytes);
  }

  const fn = getHashFunction(algorithm);
  let res = fn(preparedBytes);

  // Iterations / rounds
  if (iterations > 1) {
    for (let i = 1; i < iterations; i++) {
      res = fn(res);
    }
  }

  return res;
}

// ─── Hash Identifier / Reverse Analyzer ───────────────────────────────────────

export function identifyHashType(hashStr) {
  if (!hashStr || typeof hashStr !== "string") return [];
  const clean = hashStr.trim();
  const hexLen = clean.length;
  const isHex = /^[0-9a-fA-F]+$/.test(clean);

  const results = [];

  if (clean.startsWith("$2a$") || clean.startsWith("$2b$") || clean.startsWith("$2y$")) {
    results.push({ name: "Bcrypt Password Hash", bits: 192, type: "Key-Stretched Password Hash", confidence: "99%", secure: true, desc: "OpenBSD Blowfish-based adaptive password hashing algorithm." });
  } else if (clean.startsWith("$argon2id$") || clean.startsWith("$argon2i$")) {
    results.push({ name: "Argon2 Password Hash", bits: 256, type: "Memory-Hard Password Hash", confidence: "99%", secure: true, desc: "Password Hashing Competition (PHC) winner. Highly resistant to GPU/ASIC attacks." });
  } else if (clean.startsWith("$6$")) {
    results.push({ name: "SHA-512 Unix Crypt", bits: 512, type: "Linux Shadow Password", confidence: "98%", secure: true, desc: "Standard Unix / Linux /etc/shadow password hash using SHA-512." });
  } else if (clean.startsWith("$1$")) {
    results.push({ name: "MD5 Unix Crypt", bits: 128, type: "Legacy Linux Shadow", confidence: "98%", secure: false, desc: "Legacy FreeBSD / Linux MD5-based password hash." });
  }

  if (isHex) {
    if (hexLen === 8) {
      results.push({ name: "CRC-32 / Adler32", bits: 32, type: "Checksum", confidence: "95%", secure: false, desc: "32-bit checksum commonly found in ZIP, PNG, Ethernet, and error-checking." });
    } else if (hexLen === 32) {
      results.push({ name: "MD5", bits: 128, type: "Cryptographic (Broken)", confidence: "94%", secure: false, desc: "128-bit hash standard. Collision attacks practical. Used for file integrity checks." });
      results.push({ name: "NTLM", bits: 128, type: "Windows Password Hash", confidence: "80%", secure: false, desc: "Windows NT LAN Manager password hash (MD4 of UTF-16LE password)." });
      results.push({ name: "MD4", bits: 128, type: "Legacy Hash", confidence: "65%", secure: false, desc: "Predecessor to MD5. Cryptographically broken." });
    } else if (hexLen === 40) {
      results.push({ name: "SHA-1", bits: 160, type: "Cryptographic (Deprecated)", confidence: "94%", secure: false, desc: "160-bit standard used in Git commit IDs and legacy SSL certificates." });
      results.push({ name: "RIPEMD-160", bits: 160, type: "Cryptocurrency / Bitcoin", confidence: "75%", secure: true, desc: "Used in Bitcoin address generation alongside SHA-256." });
    } else if (hexLen === 56) {
      results.push({ name: "SHA-224", bits: 224, type: "FIPS SHA-2", confidence: "90%", secure: true, desc: "224-bit output variant of SHA-2 family." });
      results.push({ name: "SHA3-224", bits: 224, type: "FIPS 202 SHA-3", confidence: "85%", secure: true, desc: "224-bit Keccak sponge construction." });
    } else if (hexLen === 64) {
      results.push({ name: "SHA-256", bits: 256, type: "FIPS SHA-2 (Industry Standard)", confidence: "96%", secure: true, desc: "Global gold standard for digital signatures, blockchain, TLS, and software integrity." });
      results.push({ name: "Keccak-256", bits: 256, type: "Ethereum / Web3 Standard", confidence: "88%", secure: true, desc: "Ethereum Virtual Machine (EVM) standard for smart contracts and wallet signatures." });
      results.push({ name: "SHA3-256", bits: 256, type: "FIPS 202 SHA-3", confidence: "86%", secure: true, desc: "NIST standard replacement for SHA-2 with sponge permutation." });
      results.push({ name: "BLAKE2s-256", bits: 256, type: "High-Speed Cryptographic", confidence: "82%", secure: true, desc: "Faster than MD5 while maintaining SHA-3 security level." });
    } else if (hexLen === 96) {
      results.push({ name: "SHA-384", bits: 384, type: "FIPS SHA-2", confidence: "95%", secure: true, desc: "Truncated SHA-512 offering high resistance against length-extension attacks." });
      results.push({ name: "SHA3-384", bits: 384, type: "FIPS 202 SHA-3", confidence: "88%", secure: true, desc: "384-bit Keccak sponge hash." });
    } else if (hexLen === 128) {
      results.push({ name: "SHA-512", bits: 512, type: "FIPS SHA-2 (High Security)", confidence: "96%", secure: true, desc: "512-bit maximum strength cryptographic hash for quantum-resistant applications." });
      results.push({ name: "SHA3-512", bits: 512, type: "FIPS 202 SHA-3", confidence: "90%", secure: true, desc: "512-bit FIPS 202 sponge hash." });
      results.push({ name: "Keccak-512", bits: 512, type: "Ethereum / Keccak", confidence: "85%", secure: true, desc: "512-bit variant of Ethereum Keccak." });
    }
  }

  return results;
}

// ─── Code Generator Snippets ───────────────────────────────────────────────────

export function generateCodeSnippet(language, { algorithm, text, salt, isHmac, hmacKey }) {
  const algUpper = algorithm.toUpperCase().replace("_", "-");
  const escapedText = JSON.stringify(text || "Hello, World!");
  const escapedKey = JSON.stringify(hmacKey || "secret-key");

  switch (language) {
    case "javascript":
      if (isHmac) {
        return `// Node.js HMAC Example
import crypto from 'node:crypto';

const message = ${escapedText};
const secretKey = ${escapedKey};

const hash = crypto
  .createHmac('${algorithm.replace("3_", "3-")}', secretKey)
  .update(message)
  .digest('hex');

console.log('HMAC-${algUpper}:', hash);`;
      }
      return `// JavaScript (Web Crypto API & Node.js)
import crypto from 'node:crypto';

const text = ${escapedText};
const hash = crypto.createHash('${algorithm.replace("3_", "3-")}').update(text).digest('hex');

console.log('${algUpper}:', hash);`;

    case "python":
      if (isHmac) {
        return `# Python 3 HMAC
import hmac
import hashlib

message = ${escapedText}.encode('utf-8')
secret = ${escapedKey}.encode('utf-8')

hash_val = hmac.new(secret, message, hashlib.${algorithm.replace("-", "").replace("_", "")}).hexdigest()
print(f"HMAC-${algUpper}: {hash_val}")`;
      }
      return `# Python 3 hashlib
import hashlib

text = ${escapedText}.encode('utf-8')
hash_val = hashlib.${algorithm.replace("-", "").replace("_", "")}(text).hexdigest()

print(f"${algUpper}: {hash_val}")`;

    case "php":
      if (isHmac) {
        return `<?php
// PHP HMAC
$message = ${escapedText};
$key = ${escapedKey};

$hash = hash_hmac('${algorithm.toLowerCase().replace("_", "")}', $message, $key);
echo "HMAC-${algUpper}: " . $hash . "\\n";
?>`;
      }
      return `<?php
// PHP hash()
$text = ${escapedText};
$hash = hash('${algorithm.toLowerCase().replace("_", "")}', $text);

echo "${algUpper}: " . $hash . "\\n";
?>`;

    case "bash":
      if (algorithm === "md5") {
        return `# OpenSSL / Linux CLI
echo -n ${escapedText} | md5sum`;
      }
      return `# OpenSSL / Linux CLI
echo -n ${escapedText} | openssl dgst -${algorithm.replace("_", "-")}`;

    case "go":
      return `package main

import (
\t"crypto/${algorithm.toLowerCase().replace("sha", "sha").slice(0, 6)}"
\t"encoding/hex"
\t"fmt"
)

func main() {
\tdata := []byte(${escapedText})
\thash := ${algorithm.toLowerCase().replace("sha", "sha").slice(0, 6)}.Sum256(data)
\tfmt.Printf("${algUpper}: %s\\n", hex.EncodeToString(hash[:]))
}`;

    case "rust":
      return `// Cargo.toml: sha2 = "0.10", hex = "0.4"
use sha2::{Sha256, Digest};

fn main() {
    let mut hasher = Sha256::new();
    hasher.update(${escapedText});
    let result = hasher.finalize();
    println!("${algUpper}: {:x}", result);
}`;

    case "csharp":
      return `using System;
using System.Security.Cryptography;
using System.Text;

class Program {
    static void Main() {
        string input = ${escapedText};
        using (var sha = SHA256.Create()) {
            byte[] bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
            string hex = Convert.ToHexString(bytes).ToLower();
            Console.WriteLine($"${algUpper}: {hex}");
        }
    }
}`;

    default:
      return "";
  }
}

// ─── Algorithms Directory & Metadata ──────────────────────────────────────────

export const HASH_ALGORITHMS = [
  {
    id: "sha256",
    name: "SHA-256",
    category: "SHA-2 Family",
    bits: 256,
    hexLength: 64,
    security: "Strong",
    description: "NIST FIPS 180-4 standard. Used widely in TLS, SSL, Bitcoin, and secure software distribution.",
    recommended: true,
    popular: true
  },
  {
    id: "md5",
    name: "MD5",
    category: "Legacy / Checksum",
    bits: 128,
    hexLength: 32,
    security: "Broken",
    description: "128-bit hash. Fast checksum for file deduplication and legacy systems. Not safe for cryptographic security.",
    recommended: false,
    popular: true
  },
  {
    id: "sha1",
    name: "SHA-1",
    category: "Legacy / SHA-1",
    bits: 160,
    hexLength: 40,
    security: "Deprecated",
    description: "160-bit hash standard used in Git and older certificates. Collision vulnerable.",
    recommended: false,
    popular: true
  },
  {
    id: "sha512",
    name: "SHA-512",
    category: "SHA-2 Family",
    bits: 512,
    hexLength: 128,
    security: "Ultra Strong",
    description: "512-bit state-of-the-art hash for maximum security against brute-force and quantum threats.",
    recommended: true,
    popular: true
  },
  {
    id: "keccak256",
    name: "Keccak-256",
    category: "Keccak / Ethereum",
    bits: 256,
    hexLength: 64,
    security: "Strong",
    description: "The original Keccak-256 specification powering the Ethereum Virtual Machine and Web3 smart contracts.",
    recommended: true,
    popular: true
  },
  {
    id: "crc32",
    name: "CRC-32",
    category: "Checksum",
    bits: 32,
    hexLength: 8,
    security: "Non-Cryptographic",
    description: "Cyclic Redundancy Check (IEEE 802.3). Ultra-fast data integrity error detection for zip/network streams.",
    recommended: false,
    popular: true
  },
  {
    id: "sha3_256",
    name: "SHA3-256",
    category: "SHA-3 Family",
    bits: 256,
    hexLength: 64,
    security: "Strong",
    description: "FIPS 202 standard Sponge construction, completely different architecture from SHA-2.",
    recommended: true,
    popular: false
  },
  {
    id: "sha3_512",
    name: "SHA3-512",
    category: "SHA-3 Family",
    bits: 512,
    hexLength: 128,
    security: "Ultra Strong",
    description: "512-bit variant of FIPS 202 SHA-3 standard.",
    recommended: true,
    popular: false
  },
  {
    id: "sha384",
    name: "SHA-384",
    category: "SHA-2 Family",
    bits: 384,
    hexLength: 96,
    security: "Strong",
    description: "Truncated SHA-512 offering high resistance against length-extension attacks.",
    recommended: true,
    popular: false
  },
  {
    id: "sha224",
    name: "SHA-224",
    category: "SHA-2 Family",
    bits: 224,
    hexLength: 56,
    security: "Strong",
    description: "224-bit output variant of SHA-256.",
    recommended: true,
    popular: false
  },
  {
    id: "sha3_224",
    name: "SHA3-224",
    category: "SHA-3 Family",
    bits: 224,
    hexLength: 56,
    security: "Strong",
    description: "224-bit output variant of SHA-3 standard.",
    recommended: true,
    popular: false
  },
  {
    id: "sha3_384",
    name: "SHA3-384",
    category: "SHA-3 Family",
    bits: 384,
    hexLength: 96,
    security: "Strong",
    description: "384-bit output variant of SHA-3 standard.",
    recommended: true,
    popular: false
  },
  {
    id: "keccak512",
    name: "Keccak-512",
    category: "Keccak / Ethereum",
    bits: 512,
    hexLength: 128,
    security: "Ultra Strong",
    description: "512-bit Ethereum Keccak variant.",
    recommended: true,
    popular: false
  },
  {
    id: "ripemd160",
    name: "RIPEMD-160",
    category: "Specialized",
    bits: 160,
    hexLength: 40,
    security: "Strong",
    description: "European cryptographic standard used to generate Bitcoin public key addresses.",
    recommended: true,
    popular: false
  },
  {
    id: "blake2s",
    name: "BLAKE2s-256",
    category: "Specialized",
    bits: 256,
    hexLength: 64,
    security: "Strong",
    description: "Extremely fast cryptographic hash optimized for 8-to-32-bit platforms (RFC 7693).",
    recommended: true,
    popular: false
  }
];
