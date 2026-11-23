"use strict";
/**
 * LP2 full-book GP29 one-codeword original source / solved-native positive SFT.
 * Windows 11, Node.js 22: node sims/lp2_gp29_fullbook_fixedrepeat_wordpair_source_sft.cjs
 *
 * This conditional source codebook fixes the ENTIRE original 86-site exact
 * repeated-rune transition mask. The only printable side choices are swaps
 * of the two original printed lengths in 1,448 consecutive word pairs.
 *
 * A positive exact source/plant result is mathematical existence, NOT
 * evidence that Cicada actually used this model or selected its rank order.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} p @returns {string} */
function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mapping = new Map(corpus.runes.map((v, i) => [v, i]));
const words = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\n\r%&$\s]/g, "")
  .split(/[-.]/)
  .filter(t => /[\u16A0-\u16FF]/u.test(t))
  .slice(0, 2896)
  .map(s => Array.from(s, rune => {
    const i = mapping.get(rune);
    assert.notEqual(i, undefined);
    return i;
  }));
assert.equal(words.length, 2896);
const sourcePages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const original = sourcePages.flatMap(p => p.indices);
const N = original.length;
assert.equal(N, 12956);
assert.deepEqual(words.flat(), original);
const originalLens = words.map(w => w.length);
assert.equal(originalLens.reduce((s, l) => s + l, 0), N);

const repeatMask = new Uint8Array(N - 1);
let E = 0;
for (let i = 1; i < N; i++) {
  const repeated = Number(original[i] === original[i - 1]);
  repeatMask[i - 1] = repeated;
  E += repeated;
}
assert.equal(E, 86);
/** @param {number[]} lengths @returns {number[]} */
function lengthPairBits(lengths) {
  const result = [];
  for (let i = 0; i + 1 < lengths.length; i += 2) {
    if (lengths[i] !== lengths[i + 1])
      result.push(Number(lengths[i] > lengths[i + 1]));
  }
  return result;
}
const originalBits = lengthPairBits(originalLens);
const U = originalBits.length;
assert.equal(U, 1242);
const G = 1n << BigInt(U);
const alphabetCount = 28n ** BigInt(N - 1 - E);
const M = 29n * alphabetCount * G;
const Q = 29n ** BigInt(N);
assert.ok(M >= Q);

/** @param {number[]} a @returns {bigint} */
function base29(a) {
  let result = 0n;
  for (const x of a) result = 29n * result + BigInt(x);
  return result;
}
/** @param {bigint} value @param {number} size @returns {number[]} */
function from29(value, size) {
  assert.ok(value >= 0n && value < 29n ** BigInt(size));
  const out = new Array(size);
  for (let i = size - 1; i >= 0; i--) {
    out[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return out;
}
/** @param {number[]} runes @returns {bigint} */
function rankFixedMaskRunes(runes) {
  assert.equal(runes.length, N);
  let rank = BigInt(runes[0]);
  for (let i = 1; i < N; i++) {
    const prev = runes[i - 1], current = runes[i];
    if (repeatMask[i - 1]) {
      assert.equal(current, prev);
      continue;
    }
    assert.notEqual(current, prev);
    const d = current < prev ? current : current - 1;
    assert.ok(d >= 0 && d < 28);
    rank = rank * 28n + BigInt(d);
  }
  return rank;
}
/** @param {bigint} rank @returns {number[]} */
function unrankFixedMaskRunes(rank) {
  assert.ok(rank >= 0n && rank < 29n * alphabetCount);
  const digits = new Array(N - 1 - E);
  for (let j = digits.length - 1; j >= 0; j--) {
    digits[j] = Number(rank % 28n);
    rank /= 28n;
  }
  assert.ok(rank >= 0n && rank < 29n);
  const result = [Number(rank)];
  let d = 0;
  for (let i = 1; i < N; i++) {
    const prev = result[i - 1];
    if (repeatMask[i - 1]) {
      result.push(prev);
    } else {
      const z = digits[d++];
      result.push(z < prev ? z : z + 1);
    }
  }
  assert.equal(d, digits.length);
  return result;
}
/** @param {number[]} b @returns {bigint} */
function rankBits(b) {
  assert.equal(b.length, U);
  return b.reduce((r, x) => (r << 1n) | BigInt(x), 0n);
}
/** @param {bigint} b @returns {number[]} */
function unrankBits(b) {
  assert.ok(b >= 0n && b < G);
  const bits = new Array(U);
  for (let j = U - 1; j >= 0; j--) {
    bits[j] = Number(b & 1n);
    b >>= 1n;
  }
  assert.equal(b, 0n);
  return bits;
}
/** @param {number[]} bits @returns {number[]} */
function unrankLengths(bits) {
  const result = originalLens.slice();
  let cursor = 0;
  for (let j = 0; j + 1 < result.length; j += 2) {
    const a = result[j], b = result[j + 1];
    if (a === b) continue;
    const bit = bits[cursor++];
    result[j] = bit ? Math.max(a, b) : Math.min(a, b);
    result[j + 1] = bit ? Math.min(a, b) : Math.max(a, b);
  }
  assert.equal(cursor, U);
  return result;
}
/**
 * @param {bigint} R
 * @returns {{runes:number[],lengths:number[]}}
 */
function unrankCodeword(R) {
  assert.ok(R >= 0n && R < M);
  return {
    runes: unrankFixedMaskRunes(R / G),
    lengths: unrankLengths(unrankBits(R % G))
  };
}
/** @param {number[]} x @returns {number} */
function ioc(x) {
  const h = Array(29).fill(0);
  for (const n of x) h[n]++;
  return h.reduce((s, c) => s + c * (c - 1), 0) /
    (x.length * (x.length - 1));
}

const originalR = rankFixedMaskRunes(original) * G + rankBits(originalBits);
const sourceCandidate = originalR * Q / M;
const sourceMin = (sourceCandidate * M + Q - 1n) / Q;
const sourceResidue = originalR - sourceMin;
assert.ok(sourceResidue >= 0n && originalR < M);
const rebuiltSource = unrankCodeword(sourceMin + sourceResidue);
assert.deepEqual(rebuiltSource.runes, original);
assert.deepEqual(rebuiltSource.lengths, originalLens);
assert.equal(rankFixedMaskRunes(rebuiltSource.runes) * G +
  rankBits(lengthPairBits(rebuiltSource.lengths)), originalR);

const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
const native = Array.from({length:N}, (_, i) => solved[i % solved.length]);
const X = base29(native);
const plantedR = (X * M + Q - 1n) / Q;
const planted = unrankCodeword(plantedR);
assert.equal(rankFixedMaskRunes(planted.runes) * G +
  rankBits(lengthPairBits(planted.lengths)), plantedR);
assert.equal(plantedR * Q / M, X);
const recoveredPlant = from29(plantedR * Q / M, N);
assert.deepEqual(recoveredPlant, native);

const candidate = from29(sourceCandidate, N);
const before16 = sourcePages.filter(p => p.page < 16)
  .reduce((n, p) => n + p.indices.length, 0);
console.log("FULL BOOK FIXED EXACT REPEAT SITES GP29:");
console.log("original runes", N, "original printed words", words.length,
  "fixed repeated rune sites", E, "word pairs", words.length/2,
  "visible unequal-length pair bits", U, "source residual zero",
  sourceResidue===0n);
console.log("source first300 IoC", ioc(candidate.slice(0,300)).toFixed(9),
  "source p16 first200 IoC", ioc(candidate.slice(before16,before16+200)).toFixed(9),
  "native solved planted IoC", ioc(native).toFixed(9));
console.log("source first80 GP29 symbols", candidate.slice(0,80).join(","));
console.log("PASS 12956 source original + original 2896 gaps,",
  "12956 native solved-p57 source runes, no punct/ink/page reset.");
