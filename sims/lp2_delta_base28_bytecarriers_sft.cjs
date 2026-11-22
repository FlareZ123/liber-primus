"use strict";
/**
 * Original LP2 predecessor-difference base28 binary decoder gate.
 * Node.js 22/CommonJS on Windows 11:
 *   node sims/lp2_delta_base28_bytecarriers_sft.cjs
 * A source-motivated exploratory hypothesis, NOT an authenticated cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const cipher = pages.flatMap((p) => p.indices);
assert.equal(cipher.length, 12956);
/** @param {number} v */
const mod29 = (v) => ((v % 29) + 29) % 29;

/**
 * @param {boolean} reverse Predecessor minus current instead of current minus predecessor.
 * @param {boolean} pageReset Reset predecessor before each physical page.
 * @returns {number[]}
 */
function deltas(reverse, pageReset) {
  const out = [];
  let previous = 0;
  for (const page of pages) {
    if (pageReset) previous = 0;
    for (const current of page.indices) {
      out.push(mod29(reverse ? previous - current : current - previous));
      previous = current;
    }
  }
  return out;
}
/** @param {number[]} input */
function splitZero(input) {
  const out = [];
  let current = [];
  for (const value of input) {
    if (value === 0) {
      if (current.length) out.push(current);
      current = [];
    } else {
      current.push(value - 1);
    }
  }
  if (current.length) out.push(current);
  return out;
}
/** @param {number[]} digits @param {number} base */
function decode(digits, base) {
  let n = 0n;
  for (const v of digits) {
    assert(Number.isInteger(v) && v >= 0 && v < base);
    n = n * BigInt(base) + BigInt(v);
  }
  const bytes = [];
  while (n) {
    bytes.push(Number(n & 255n));
    n >>= 8n;
  }
  return Buffer.from(bytes.reverse());
}
/** @param {Buffer} bytes @param {number} base */
function encode(bytes, base) {
  let n = 0n;
  for (const v of bytes) n = 256n * n + BigInt(v);
  const digits = [];
  while (n) {
    digits.push(Number(n % BigInt(base)));
    n /= BigInt(base);
  }
  return digits.reverse();
}
/** @param {Buffer} b */
function headers(b) {
  if (b.length < 2) return [];
  const hex = b.subarray(0, 8).toString("hex");
  const hits = [];
  if (hex.startsWith("1f8b08")) hits.push("gzip");
  if (hex.startsWith("504b0304")) hits.push("zip");
  if (hex.startsWith("25504446")) hits.push("pdf");
  if (hex.startsWith("89504e47")) hits.push("png");
  if (hex.startsWith("425a68")) hits.push("bzip2");
  if (hex.startsWith("fd377a585a00")) hits.push("xz");
  if (hex.startsWith("47494638")) hits.push("gif");
  if ((b[0] & 15) === 8 && (b[0] >> 4) <= 7 &&
    ((b[0] * 256 + b[1]) % 31) === 0) hits.push("zlib");
  return hits;
}
/** @param {Buffer} b */
function printableFraction(b) {
  if (!b.length) return 0;
  let n = 0;
  for (const x of b) if (x === 9 || x === 10 || x === 13 ||
    (x >= 32 && x <= 126)) n++;
  return n / b.length;
}
/** @param {Buffer} input */
function decompress(input) {
  if (input.length < 8) return [];
  const candidates = [
    ["gzip", zlib.gunzipSync],
    ["zlib", zlib.inflateSync],
    ["rawDeflate", zlib.inflateRawSync],
    ["brotli", zlib.brotliDecompressSync]
  ];
  const hits = [];
  for (const [name, action] of candidates) {
    try {
      const result = action(input, { info: true, maxOutputLength: 1 << 20 });
      const data = result.buffer;
      if (result.engine.bytesWritten === input.length &&
        data.length >= 64 && printableFraction(data) >= 0.8) {
        hits.push({
          codec: name, bytes: data.length,
          printable: +printableFraction(data).toFixed(5),
          excerpt: data.toString("utf8", 0, 120)
        });
      }
    } catch {
      // Incorrect compressed data is an ordinary tested outcome.
    }
  }
  return hits;
}
/** @param {number[]} digits @param {number} base @param {string} id @param {object} result */
function scan(digits, base, id, result) {
  for (const backwardDigits of [false, true]) {
    const seq = backwardDigits ? digits.slice().reverse() : digits;
    const body = decode(seq, base);
    for (const reverseBytes of [false, true]) {
      const b = reverseBytes ? Buffer.from(body).reverse() : body;
      const label = { id, base, backwardDigits, reverseBytes, bytes: b.length };
      result.carriers++;
      const sig = headers(b);
      if (sig.length) {
        result.headers.push({ ...label, signatures: sig, prefix: b.subarray(0, 8).toString("hex") });
      }
      for (const hit of decompress(b)) result.plaintexts.push({ ...label, ...hit });
    }
  }
}
/** @param {Buffer} source */
function plantedControl(source) {
  const zip = zlib.deflateSync(source);
  const digits = encode(zip, 28);
  assert.deepEqual(decode(digits, 28), zip);
  let last = 0;
  const ciphertext = digits.map((d) => (last = mod29(last + 1 + d)));
  last = 0;
  const restored = ciphertext.map((c) => {
    const d = mod29(c - last);
    last = c;
    assert(d !== 0);
    return d - 1;
  });
  const recovered = decode(restored, 28);
  assert.deepEqual(recovered, zip);
  assert.deepEqual(zlib.inflateSync(recovered), source);
  assert.ok(decompress(recovered).some((x) => x.codec === "zlib"));
  return { compressedBytes: zip.length, radixDigits: digits.length };
}
function run() {
  const plant = plantedControl(Buffer.from(
    "IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE. ".repeat(12), "utf8"));
  const result = {carriers: 0, headers: [], plaintexts: [], configurations: []};
  for (const reverse of [false, true]) {
    for (const pageReset of [false, true]) {
      const d = deltas(reverse, pageReset);
      const pieces = splitZero(d);
      const config = {
        reverse, pageReset,
        zeroDifferences: d.filter((x) => x === 0).length,
        segments: pieces.length,
        maxSegment: Math.max(...pieces.map((s) => s.length))
      };
      result.configurations.push(config);
      const label = "reverse=" + reverse + ";pageReset=" + pageReset;
      scan(d, 29, label + ";base29", result);
      scan(d.filter((x) => x !== 0).map((x) => x - 1), 28,
        label + ";dropzero-base28", result);
      pieces.forEach((piece, i) => scan(piece, 28,
        label + ";segment=" + i, result));
    }
  }
  assert.equal(result.configurations[0].zeroDifferences, 86);
  assert.equal(result.configurations[2].zeroDifferences, 86);
  return {
    status: "EXPLORATORY ORIGINAL-CIPHER BYTE-CARRIER GATE",
    sourceRunes: cipher.length, plantedPositive: plant, ...result,
    caveat: "No first-party source selects this radix28 differential serialization or binary codec. A negative is confined to these byte orders, clocks, orientations and formats."
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run };
