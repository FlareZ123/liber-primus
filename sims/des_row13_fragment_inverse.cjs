"use strict";

/**
 * Original-source, lossless 32 row × 13-dot-fragment 64-bit-block cipher test.
 * This is a finite, source-guided hypothesis, not a claimed Cicada cipher.
 * Usage: node sims/des_row13_fragment_inverse.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const data = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = data("resources/liber-primus/lp2-corpus.json");
const ink = data("resources/liber-primus/lp2-ink-annotations.json");
const grid = data("resources/liber-primus/base60-grid.json").byte_rows;
assert.equal(grid.length, 32);
assert.ok(grid.every(row => row.length === 8 && row.every(b => Number.isInteger(b) && b >= 0 && b <= 255)));

const all = [];
const starts = new Map();
for (const page of corpus.pages) {
  starts.set(page.page, all.length);
  all.push(...(page.indices || []));
}
assert.equal(all.length, 13136);
const marks = ink.pages.flatMap(page => (page.large_punctuation || [])
  .filter(mark => mark[1] === 13)
  .map(mark => starts.get(page.page) + mark[0])).sort((a, b) => a - b);
assert.equal(marks.length, 31);
const cuts = [0, ...marks, all.length];
const fragments = cuts.slice(0, -1).map((begin, i) => all.slice(begin, cuts[i + 1]));
assert.equal(fragments.length, 32);
assert.equal(fragments.slice(0, 28).reduce((n, a) => n + a.length, 0), 12956);

function widthForRunes(len) {
  let capacity = 1n, size = 0;
  const bound = 29n ** BigInt(len);
  while (capacity < bound) { capacity *= 256n; size++; }
  return size;
}
function pack29(runes) {
  let n = 0n;
  for (const x of runes) {
    assert.ok(Number.isInteger(x) && x >= 0 && x <= 28);
    n = n * 29n + BigInt(x);
  }
  const buf = Buffer.alloc(widthForRunes(runes.length));
  for (let i = buf.length - 1; i >= 0; --i) {
    buf[i] = Number(n & 255n);
    n >>= 8n;
  }
  assert.equal(n, 0n);
  return buf;
}
function unpack29(buf, len) {
  let n = 0n;
  for (const b of buf) n = (n << 8n) | BigInt(b);
  assert.ok(n < 29n ** BigInt(len));
  const out = Array(len);
  for (let i = len - 1; i >= 0; --i) {
    out[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n);
  return out;
}

const variants = [
  { label: "DES-row-key-CTR-zero", triple: false, rowCounter: false },
  { label: "DES-row-key-CTR-row", triple: false, rowCounter: true },
  { label: "3DES-three-adjacent-rows-CTR-zero", triple: true, rowCounter: false },
  { label: "3DES-three-adjacent-rows-CTR-row", triple: true, rowCounter: true }
];
function xorDesCtr(buf, row, variant) {
  const keys = variant.triple
    ? [0, 1, 2].map(k => Buffer.from(grid[(row + k) % 32]))
    : [0, 0, 0].map(() => Buffer.from(grid[row]));
  const key = Buffer.concat(keys);
  assert.equal(key.length, 24);
  const init = variant.rowCounter
    ? Buffer.from(grid[row]).readBigUInt64BE(0) : 0n;
  const cipher = crypto.createCipheriv("des-ede3", key, null);
  cipher.setAutoPadding(false);
  const out = Buffer.alloc(buf.length);
  const modulus = (1n << 64n) - 1n;
  for (let at = 0, block = 0n; at < buf.length; at += 8, block++) {
    const ctr = Buffer.alloc(8);
    ctr.writeBigUInt64BE((init + block) & modulus, 0);
    const mask = cipher.update(ctr);
    assert.equal(mask.length, 8);
    for (let j = 0; j < 8 && at + j < buf.length; j++) {
      out[at + j] = buf[at + j] ^ mask[j];
    }
  }
  assert.equal(cipher.final().length, 0);
  return out;
}
const allowed = new Set([9, 10, 13, ...Array.from({length:95}, (_, i) => i + 32)]);
function metrics(buf) {
  const counts = Array(256).fill(0);
  let printable = 0, alpha = 0, longest = 0, run = 0;
  for (const b of buf) {
    counts[b]++;
    if (allowed.has(b)) { printable++; run++; longest = Math.max(longest, run); }
    else run = 0;
    if (b >= 65 && b <= 90 || b >= 97 && b <= 122) alpha++;
  }
  let entropy = 0;
  for (const count of counts) if (count) {
    const p = count / buf.length;
    entropy -= p * Math.log2(p);
  }
  return {
    bytes: buf.length,
    entropy_bits: entropy,
    printable_fraction: printable / buf.length,
    letter_fraction: alpha / buf.length,
    longest_printable_run: longest,
    first32_hex: buf.subarray(0, 32).toString("hex"),
    first80_ascii: [...buf.subarray(0, 80)].map(b => allowed.has(b) ? String.fromCharCode(b) : ".").join("")
  };
}
function runOriginal(variant) {
  const bytes = [];
  const individual = [];
  let exact = 0;
  for (let row = 0; row < 28; row++) {
    const source = fragments[row];
    const packed = pack29(source);
    assert.deepEqual(unpack29(packed, source.length), source);
    const decrypted = xorDesCtr(packed, row, variant);
    assert.deepEqual(xorDesCtr(decrypted, row, variant), packed);
    exact += source.length;
    bytes.push(decrypted);
    individual.push({row, runes:source.length, bytes:packed.length,
      printable:decrypted.length ? metrics(decrypted).printable_fraction : null});
  }
  assert.equal(exact, 12956);
  return {variant:variant.label, reencoded_runes:exact, statistics:metrics(Buffer.concat(bytes)),
    fragments:individual};
}
function runPlant(variant) {
  const plain = [];
  let recovered = 0, source = [];
  const alphabet = Buffer.from("THESE SOURCES MUST HELP A PILGRIM SEEK TRUE KNOWLEDGE ", "ascii");
  for (let row = 0; row < 28; row++) {
    const len = fragments[row].length;
    const size = widthForRunes(len);
    const sourceText = Buffer.alloc(size);
    for (let i = 0; i < size; ++i) sourceText[i] = alphabet[(i + row * 13) % alphabet.length];
    let cipher = xorDesCtr(sourceText, row, variant);
    if (size > 0) {
      // Preserve 29^len capacity by making the leading ciphertext byte zero.
      sourceText[0] ^= cipher[0];
      cipher = xorDesCtr(sourceText, row, variant);
      assert.equal(cipher[0], 0);
    }
    let digits = unpack29(cipher, len);
    assert.deepEqual(pack29(digits), cipher);
    const decoded = xorDesCtr(pack29(digits), row, variant);
    assert.deepEqual(decoded, sourceText);
    recovered += digits.length;
    source.push(decoded);
    plain.push(sourceText);
  }
  assert.equal(recovered, 12956);
  return {recovered_runes:recovered, synthetic_original_bytes:metrics(Buffer.concat(plain)),
    synthetic_decoded_bytes:metrics(Buffer.concat(source))};
}
const output = {
  hypothesis: "The 32 source-visible 13-dot fragments may be 32 ciphertext integers with 8-byte source-grid-row DES keys.",
  original_fragment_lengths:fragments.slice(0,28).map(a => a.length),
  controls:variants.map(v => ({variant:v.label, plant:runPlant(v)})),
  original:variants.map(runOriginal),
  conclusion:"Four source-fixed DES/3DES CTR interpretations tested; any English or file decoding requires independent interpretation. No other cipher family excluded."
};
console.log(JSON.stringify(output, null, 2));
