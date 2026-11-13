"use strict";

/**
 * Exact original keyless cumulative-GP29 -> base28 compressed-byte hypothesis.
 * The 2014 chain actually used bzip2/gzip transport, and near-absence of
 * identical successive LP2 runes makes nonzero GP29 steps -> base28 natural.
 * A source-free key must produce a complete compressed header to count as a
 * decoding; arbitrary byte alignment/key/rotation fitting is prohibited.
 *
 * SFT: node sims/lp2_delta28_direct_compression_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const root = path.resolve(__dirname, "..");
const c = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = c.pages.filter(p => p.page >= 0 && p.page <= 55 &&
  p.runic_count > 0);
const full = pages.flatMap(p => p.indices);
assert.equal(full.length, 12956);
const lengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(lengths.reduce((a, b) => a + b, 0), full.length);
const groups = [{ name: "complete-unknown", seq: full }];
let cursor = 0;
for (const [i, len] of lengths.entries()) {
  groups.push({ name: "source-chapter-" + i,
    seq: full.slice(cursor, cursor + len) });
  cursor += len;
}
const floral = full.slice(-3316);
assert.equal(floral.length, 3316);
groups.push({ name: "floral-p40-p55", seq: floral });
for (const p of pages) {
  if (p.indices.length >= 160)
    groups.push({ name: "physical-p" + p.page, seq: p.indices });
}
assert.equal(groups.length, 59);

/** @param {number} n @returns {number} */
function mod29(n) {
  return (n % 29 + 29) % 29;
}

/**
 * For nonzero forward GP29 steps, map 1..28 to 0..27; a zero step is
 * provisionally a marker/escape. Reverse and sign are frozen finite controls.
 * @param {number[]} seq
 * @param {1 | -1} sign
 * @param {boolean} reversed
 */
function decode(seq, sign, reversed) {
  const input = reversed ? seq.slice().reverse() : seq;
  let value = 0n, symbols = 0, repeats = 0;
  for (let i = 1; i < input.length; i++) {
    const step = mod29(sign * (input[i] - input[i - 1]));
    if (step === 0) {
      repeats++;
      continue;
    }
    value = value * 28n + BigInt(step - 1);
    symbols++;
  }
  let hex = value.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  const bytes = Buffer.from(hex, "hex");
  return { bytes, repeats, symbols };
}

/** @param {Buffer} bytes */
function headers(bytes) {
  const out = [];
  for (let i = 0; i < bytes.length; i++) {
    if (i + 3 < bytes.length && bytes[i] === 0x42 &&
        bytes[i + 1] === 0x5a && bytes[i + 2] === 0x68 &&
        bytes[i + 3] >= 0x31 && bytes[i + 3] <= 0x39)
      out.push({ codec: "bzip2", at: i });
    if (i + 2 < bytes.length && bytes[i] === 0x1f &&
        bytes[i + 1] === 0x8b && bytes[i + 2] === 0x08)
      out.push({ codec: "gzip", at: i });
    if (i + 5 < bytes.length &&
        bytes.subarray(i, i + 6).equals(Buffer.from("fd377a585a00", "hex")))
      out.push({ codec: "xz", at: i });
    if (i + 3 < bytes.length &&
        bytes.subarray(i, i + 4).equals(Buffer.from("504b0304", "hex")))
      out.push({ codec: "zip", at: i });
  }
  return out;
}

/**
 * Plant a real compressed byte member into precisely the original floral
 * repeat-marker topology. Each nonzero step is a GP29 permutation and all
 * original marker positions remain repeated runes. No secret key is needed.
 * @param {Buffer} payload
 * @param {number[]} original
 * @returns {number[]}
 */
function plant(payload, original) {
  const count = original.slice(1).filter((x, i) => x !== original[i]).length;
  let val = BigInt("0x" + payload.toString("hex"));
  const digits = new Array(count).fill(0);
  for (let i = count - 1; i >= 0 && val > 0n; i--) {
    digits[i] = Number(val % 28n);
    val /= 28n;
  }
  assert.equal(val, 0n, "payload fits the GP28 source-length capacity");
  const out = [original[0]];
  let j = 0;
  for (let i = 1; i < original.length; i++) {
    out.push(original[i] === original[i - 1] ? out[i - 1] :
      (out[i - 1] + digits[j++] + 1) % 29);
  }
  assert.equal(j, count);
  return out;
}
const native = Buffer.from(
  "LIBER PRIMUS IS THE WAY ITS WORDS ARE THE MAP", "ascii");
const gzip = zlib.gzipSync(native);
const bz2 = Buffer.from(
  "425a683931415926535926fa936800000c160040003666dea0200031434d3000354fd4d18a6d34c9c16b25098d5c2c13ba13961459e53948b56f0e31dc06f0bb9229c2848137d49b40",
  "hex");
assert.equal(bz2[0], 0x42);
assert.equal(bz2[1], 0x5a);
assert.equal(bz2[2], 0x68);
assert(zlib.gunzipSync(gzip).equals(native));
for (const [name, packed] of [["gzip", gzip], ["bzip2", bz2]]) {
  const synthetic = plant(packed, floral);
  const recovered = decode(synthetic, 1, false);
  assert.equal(recovered.repeats,
    floral.slice(1).filter((x, i) => x === floral[i]).length);
  assert(recovered.bytes.equals(packed), name + " exact binary positive");
  assert(headers(recovered.bytes).some(h => h.codec === name && h.at === 0));
  console.log("POSITIVE", name, "bytes=" + packed.length,
    "full-source-reconstruction=" + synthetic.length, "PASS");
}
let cases = 0, hits = 0;
for (const g of groups) {
  for (const sign of [1, -1]) {
    for (const reversed of [false, true]) {
      const d = decode(g.seq, /** @type {1 | -1} */(sign), reversed);
      const magic = headers(d.bytes);
      cases++;
      hits += magic.length;
      if (magic.length > 0)
        console.log("CANDIDATE", JSON.stringify({
          name: g.name, sign, reversed, found: magic
        }));
      if (g.name === "complete-unknown")
        console.log("WHOLE", JSON.stringify({
          sign, reversed, runes: g.seq.length, repeatMarkers: d.repeats,
          symbols: d.symbols, bytes: d.bytes.length,
          head: d.bytes.subarray(0, 16).toString("hex")
        }));
    }
  }
}
assert.equal(cases, 236);
assert.equal(hits, 0,
  "source-direct compressed-data signatures absent in all 236 cases");
console.log("DECISION", JSON.stringify({
  originalCases: cases, compressedHeadersFound: hits,
  hypothesis: "direct GP29-delta28-to-bzip2/gzip/xz/zip bytes",
  limitation: "keyed, reordered or framed binary transport remains open",
  unknownPlaintextRecovered: false
}));
