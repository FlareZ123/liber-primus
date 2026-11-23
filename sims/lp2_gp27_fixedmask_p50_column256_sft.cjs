"use strict";

/**
 * Original LP2 GP27 fixed-repeat-mask / printed 256-bit key receiver.
 *
 * Source-selected *conditional* model:
 * - preserve all 55 original page heads, lengths, and 86 exact repeat sites;
 * - use a 28-way nonrepeat successor rank (cyclic or GP ordinal);
 * - treat solved-native EO/OE-free GP27 as hypothetical plaintext alphabet;
 * - test the 32 printed fifth-column bytes of the p49-p51 grid as a 256-bit key.
 *
 * Both fixed packings are tested against original bytes. They are genuine
 * reversible full-length codecs on their declared domain, not author-verified.
 *
 * Windows Node.js >= 20: node sims/lp2_gp27_fixedmask_p50_column256_sft.cjs
 * Reads repository-original JSON files; writes nothing.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = path.join(__dirname, "..", "resources", "liber-primus");
/** @param {string} name */
const json = (name) => JSON.parse(fs.readFileSync(path.join(base, name), "utf8"));
const corpus = json("lp2-corpus.json");
const grid = json("lp2-grid-256.json");
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const N = pages.reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(pages.length, 55);
assert.equal(N, 12956);
assert.equal(grid.bytes.length, 256);
const gp27 = corpus.translit.map((_s, i) => i).filter((i) => i !== 12 && i !== 22);
assert.equal(gp27.length, 27);
const originalMask = pages.map((p) =>
  p.indices.map((v, j) => j > 0 && v === p.indices[j - 1]));
const repeated = originalMask.reduce((sum, x) =>
  sum + x.filter(Boolean).length, 0);
assert.equal(repeated, 86);
const P = 27n ** BigInt(N);
const keyBytes = Buffer.from(Array.from({length: 32},
  (_v, row) => grid.bytes[8 * row + 4]));
const key = BigInt("0x" + keyBytes.toString("hex"));
const mask256 = (1n << 256n) - 1n;
assert.equal(keyBytes.length, 32);

/** @param {number} prev @param {number} next @param {"cyclic"|"sorted"} order */
function successorRank(prev, next, order) {
  assert.notEqual(prev, next);
  return order === "cyclic" ? (next - prev + 29) % 29 - 1
    : next - Number(next > prev);
}
/** @param {number} prev @param {number} digit @param {"cyclic"|"sorted"} order */
function successorUnrank(prev, digit, order) {
  assert(digit >= 0 && digit < 28);
  return order === "cyclic" ? (prev + digit + 1) % 29
    : digit + Number(digit >= prev);
}
/**
 * Encode with the already frozen original repeat mask. A mask site contributes
 * no numeral digit, and is repeated verbatim during inverse reconstruction.
 * @param {number[][]} outputPages
 * @param {"cyclic"|"sorted"} order
 * @returns {{rank:bigint,capacity:bigint}}
 */
function encode(outputPages, order) {
  let rank = 0n, capacity = 1n;
  assert.equal(outputPages.length, pages.length);
  for (let page = 0; page < outputPages.length; page++) {
    const values = outputPages[page], mask = originalMask[page];
    assert.equal(values.length, mask.length);
    assert(values.every((v) => Number.isInteger(v) && v >= 0 && v < 29));
    rank = rank * 29n + BigInt(values[0]);
    capacity *= 29n;
    for (let i = 1; i < values.length; i++) {
      if (mask[i]) {
        assert.equal(values[i], values[i - 1]);
        continue;
      }
      assert.notEqual(values[i], values[i - 1]);
      rank = rank * 28n + BigInt(successorRank(values[i - 1], values[i], order));
      capacity *= 28n;
    }
  }
  return {rank, capacity};
}
/**
 * Exact inverse for the frozen original 55-page codebook, using mixed-radix
 * backwards extraction and reconstructing predecessor-dependent symbols forward.
 * @param {bigint} rank
 * @param {"cyclic"|"sorted"} order
 * @returns {number[][]}
 */
function decodeRank(rank, order) {
  const capacity = pages.reduce((value, p, page) =>
    value * 29n * (28n ** BigInt(p.indices.length - 1 -
      originalMask[page].filter(Boolean).length)), 1n);
  assert(rank >= 0n && rank < capacity);
  const output = Array(pages.length);
  let number = rank;
  for (let page = pages.length - 1; page >= 0; page--) {
    const mask = originalMask[page];
    const digits = Array(mask.length).fill(null);
    for (let i = mask.length - 1; i >= 1; i--) {
      if (mask[i]) continue;
      digits[i] = Number(number % 28n);
      number /= 28n;
    }
    const head = Number(number % 29n);
    number /= 29n;
    const values = [head];
    for (let i = 1; i < mask.length; i++) {
      values.push(mask[i] ? values[i - 1]
        : successorUnrank(values[i - 1], digits[i], order));
    }
    output[page] = values;
  }
  assert.equal(number, 0n);
  return output;
}
/** @param {number[]} numbers fixed GP27 alphabet indices */
function toInteger(numbers) {
  let x = 0n;
  for (const i of numbers) {
    assert(Number.isInteger(i) && i >= 0 && i < 27);
    x = x * 27n + BigInt(i);
  }
  return x;
}
/** @param {bigint} x */
function fromInteger(x) {
  assert(x >= 0n && x < P);
  const numbers = Array(N);
  for (let i = N - 1; i >= 0; i--) {
    numbers[i] = Number(x % 27n);
    x /= 27n;
  }
  assert.equal(x, 0n);
  return numbers.map((i) => gp27[i]);
}
/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((sum, k) => sum + k * (k - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {bigint} value */
function bits(value) {
  assert(value > 0n);
  const b = value.toString(2), n = Math.min(52, b.length);
  const m = Number.parseInt(b.slice(0, n), 2) / 2 ** (n - 1);
  return b.length - 1 + Math.log2(m);
}

const source57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(source57.length, 95);
assert(source57.every((r) => gp27.includes(r)));
const gpTo27 = new Map(gp27.map((v, i) => [v, i]));
const native = Array.from({length: N},
  (_v, i) => gpTo27.get(source57[i % source57.length]));
const X = toInteger(native);
assert.deepEqual(fromInteger(X), native.map((v) => gp27[v]));
const originalPages = pages.map((p) => p.indices);
const tests = [];
for (const order of ["cyclic", "sorted"]) {
  const {rank: R, capacity: M} = encode(originalPages, order);
  assert.deepEqual(decodeRank(R, order), originalPages,
    "original full-book mixed-radix exact inverse");

  // Source-matched planted positive on all 12,956 rune positions. A 256-bit
  // key and GP27 native message fit the observed fixed-mask output codebook.
  const plantedRank = (X << 256n) + key;
  assert(plantedRank < M);
  const plantedPages = decodeRank(plantedRank, order);
  const plant = encode(plantedPages, order);
  assert.equal(plant.rank, plantedRank);
  assert.equal(plant.rank & mask256, key);
  assert.equal(plant.rank >> 256n, X);
  assert.deepEqual(fromInteger(plant.rank >> 256n), native.map((v) => gp27[v]));

  // Two directionally natural ways to pack actual GP27 plaintext/key.
  // Sender A: R = X * 2^256 + printed_column_key.
  const low256 = R & mask256;
  const Xhi = R >> 256n;
  const senderAKeyMatch = low256 === key;
  const senderAInputFits = Xhi < P;

  // Sender B: R = side_quotient * 27^N + X; its side_quotient uses
  // 269.12 bits, so compare the source 256-bit key to both unfitted
  // 13-bit spare-bit placements. No modulo or language-score tuning.
  const quotient = R / P;
  const Xlo = R % P;
  const senderBKeyLowMatch = (quotient & mask256) === key;
  const senderBKeyHighMatch = (quotient >> 13n) === key;
  const decoded = fromInteger(Xlo);
  const page0 = decoded.slice(0, corpus.pages[0].indices.length);
  const report = {
    order, length: N, pages: pages.length, doublets: repeated,
    capacityBits: Number(bits(M).toFixed(6)),
    gp27InputBits: Number(bits(P).toFixed(6)),
    sourceKeyHex: keyBytes.toString("hex"),
    capacitySurplusBits: Number((bits(M) - bits(P)).toFixed(6)),
    plantedNativeOriginalShapeRoundtrip: true,
    senderA: {
      keyMatches: senderAKeyMatch, gp27InputFits: senderAInputFits,
      observedLow256Hex: low256.toString(16).padStart(64, "0")
    },
    senderB: {
      sideQuotientBits: quotient.toString(2).length,
      keyAtLow256: senderBKeyLowMatch,
      keyAbove13SpareBits: senderBKeyHighMatch,
      observedSideQuotientHex: quotient.toString(16),
      directRemainderGP27IoC: ioc(decoded),
      p0IoC: ioc(page0),
      p0Head: page0.slice(0, 45).map((v) => corpus.translit[v]).join("")
    }
  };
  assert.equal(senderAKeyMatch, false);
  assert.equal(senderAInputFits, false);
  assert.equal(senderBKeyLowMatch, false);
  assert.equal(senderBKeyHighMatch, false);
  assert(report.senderB.directRemainderGP27IoC < 0.04);
  tests.push(report);
}
console.log(JSON.stringify({
  status: "both frozen literal source-key packings excluded",
  controls: {p57SourceGP27Runes: source57.length,
    gp27Alphabet: gp27.map((i) => corpus.translit[i]),
    sourceNativeP57IoC: ioc(source57),
    exactPlantedLength: N},
  tests
}, null, 2));
console.log("PASS: full original and source-native planted invert exactly; literal fifth-column 256-bit key fails both fixed-mask original packings.");
