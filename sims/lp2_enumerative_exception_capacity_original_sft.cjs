"use strict";
/**
 * SFT: exact enumerative constrained-code capacity and original-source
 * arithmetic rank inversion for Liber Primus LP2.
 *
 * Run on Windows 11 with Node.js 22:
 *   node sims/lp2_enumerative_exception_capacity_original_sft.cjs
 *
 * Original word breaks and punctuation come from the canonical transcription.
 * A 29-symbol source is assumed unrestricted and length-preserving. The
 * tested output codebooks FIX observed equal-adjacent counts per whole book,
 * physical page, or complete printed word. This is a conditional capacity
 * theorem, not a claim that Cicada used this encoder.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const punctuation = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const lookup = new Map(corpus.runes.map((r, i) => [r, i]));
const toIndices = s => [...s].map(r => {
  const i = lookup.get(r);
  assert.notEqual(i, undefined, "unknown GP rune");
  return i;
});
const words = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\n\r%&$\s]/g, "")
  .split(/[-.]/)
  .filter(s => /[\u16A0-\u16FF]/u.test(s))
  .slice(0, 2896)
  .map(toIndices);
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const full = pages.flatMap(p => p.indices);
const total = full.length;
const repeatCount = a => a.slice(1).reduce((n, v, i) => n + Number(v === a[i]), 0);

/** @param {number} n @param {number} k */
function choose(n, k) {
  assert.ok(Number.isInteger(n) && Number.isInteger(k) && n >= 0 && k >= 0 && k <= n);
  let z = 1n;
  for (let j = 1; j <= Math.min(k, n - k); j++) {
    z = z * BigInt(n - j + 1) / BigInt(j);
  }
  return z;
}

/** Count GP29 ciphertext segments with fixed length and exact repeat count. */
function codebook(a) {
  const t = a.length - 1, e = repeatCount(a);
  return 29n * choose(t, e) * (28n ** BigInt(t - e));
}

/** Minimum fixed-length binary side field to encode EVERY GP29 source. */
function missingBits(sourceSize, codebookSize) {
  const n = (sourceSize + codebookSize - 1n) / codebookSize - 1n;
  return n === 0n ? 0 : n.toString(2).length;
}
assert.equal(words.length, 2896);
assert.equal(total, 12956);
assert.equal(words.reduce((s, w) => s + w.length, 0), total);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + repeatCount(p.indices), 0), 86);
assert.equal(words.reduce((s, w) => s + repeatCount(w), 0), 63);

const sourceSize = 29n ** BigInt(total);
const bookSize = codebook(full);
const pageSize = pages.reduce((v, p) => v * codebook(p.indices), 1n);
const wordSize = words.reduce((v, w) => v * codebook(w), 1n);
const required = {
  global: missingBits(sourceSize, bookSize),
  pageFixed: missingBits(sourceSize, pageSize),
  wordFixed: missingBits(sourceSize, wordSize)
};
assert.deepEqual(required, { global: 328, pageFixed: 446, wordFixed: 679 });

const ends = [];
let offset = 0;
for (const word of words) {
  offset += word.length;
  ends.push(offset);
}
const endSet = new Set(ends);
const events = punctuation.events;
const distinctSites = new Set(events.map(e => e.rune_offset));
assert.equal(events.length, 180);
assert.equal(distinctSites.size, 173);
assert.ok(events.every(e => endSet.has(e.rune_offset)));
assert.deepEqual(punctuation.counts, { "⁜": 31, "⁘": 145, "⁚": 4 });
const ternaryIdentities = 3n ** BigInt(events.length);
const fact = n => {
  let x = 1n;
  for (let i = 2; i <= n; i++) x *= BigInt(i);
  return x;
};
const multisetIdentities = fact(180) / (fact(31) * fact(145) * fact(4));
const possiblePositions = choose(words.length, distinctSites.size);
assert.ok(sourceSize > bookSize * ternaryIdentities);
assert.ok(sourceSize > pageSize * ternaryIdentities);
assert.ok(sourceSize > wordSize * ternaryIdentities);
assert.ok(sourceSize > wordSize * multisetIdentities);
assert.ok(sourceSize <= wordSize * possiblePositions);

/* Page-local punctuation-placement capacity fails for seven physical pages. */
let pageStart = 0;
const localDeficits = [];
for (const p of pages) {
  const pageEnd = pageStart + p.indices.length;
  const endings = ends.filter(v => v > pageStart && v <= pageEnd).length;
  const punctuationSites = new Set(events.filter(e =>
    e.rune_offset > pageStart && e.rune_offset <= pageEnd
  ).map(e => e.rune_offset)).size;
  const n = p.indices.length;
  const source = 29n ** BigInt(n);
  const side = choose(endings, punctuationSites);
  if (source > codebook(p.indices) * side) {
    localDeficits.push(p.page);
  }
  pageStart = pageEnd;
}
assert.deepEqual(localDeficits, [13, 20, 21, 23, 37, 51, 54]);

/* Original nine printed chapter groupings are source-visible. Verify that
   word-preserving local punctuation positions lack capacity in two chapters. */
const chapterRanges = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const chapterDeficits = [];
const chapterDeficitsEvenWithTernaryGlyphs = [];
const starts = new Map();
let running = 0;
for (const page of corpus.pages.filter(p => p.page <= 55)) {
  starts.set(page.page, running);
  running += page.indices.length;
}
for (const [first, last] of chapterRanges) {
  const lo = starts.get(first);
  const hi = starts.get(last) + corpus.pages.find(p => p.page === last).indices.length;
  const chapterWords = words.filter((_, i) => ends[i] > lo && ends[i] <= hi);
  const chapterRunes = chapterWords.reduce((s, w) => s + w.length, 0);
  assert.equal(chapterRunes, hi - lo, "chapter division cannot bisect a word");
  const chapterMarks = events.filter(e => e.rune_offset > lo && e.rune_offset <= hi);
  const nSites = new Set(chapterMarks.map(e => e.rune_offset)).size;
  const sidePositions = choose(chapterWords.length, nSites);
  const encoded = chapterWords.reduce((v, w) => v * codebook(w), 1n);
  const unconstrained = 29n ** BigInt(chapterRunes);
  if (unconstrained > encoded * sidePositions) chapterDeficits.push(first);
  if (unconstrained > encoded * sidePositions * 3n ** BigInt(chapterMarks.length)) {
    chapterDeficitsEvenWithTernaryGlyphs.push(first);
  }
}
assert.deepEqual(chapterDeficits, [23, 54]);
assert.deepEqual(chapterDeficitsEvenWithTernaryGlyphs, [23, 54]);

/** Native-GP, no sidecar: base28 ordered/cyclic nonrepeat-rank inverse. */
function directInverse(cipher, cyclic, mirror, reverseDigits) {
  const digits = [];
  for (let i = 1; i < cipher.length; i++) {
    const prev = cipher[i - 1], v = cipher[i];
    if (v === prev) continue; // literal repeat event, carried as visible mask
    const k = cyclic ? (v - prev + 28) % 29 : v - Number(v > prev);
    digits.push(mirror ? 27 - k : k);
  }
  if (reverseDigits) digits.reverse();
  let value = 0n;
  for (const d of digits) value = value * 28n + BigInt(d);
  const outputLength = Math.ceil(digits.length * Math.log(28) / Math.log(29));
  const output = Array(outputLength).fill(0);
  for (let i = output.length - 1; i >= 0; i--) {
    output[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return [cipher[0], ...output];
}
const ioc = a => {
  const freq = Array(29).fill(0);
  for (const v of a) freq[v]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
};
const solvedSections = solved.sections.map(x =>
  ([...x.source_text].filter(c => lookup.has(c))).map(c => lookup.get(c)));
function minimumSolvedIoc(n) {
  let best = Infinity;
  let count = 0;
  for (const section of solvedSections) {
    for (let i = 0; i + n <= section.length; i++) {
      best = Math.min(best, ioc(section.slice(i, i + n)));
      count++;
    }
  }
  return { min: best, count };
}
const controls = { n200: minimumSolvedIoc(200), n300: minimumSolvedIoc(300) };
assert.equal(controls.n200.count, 1573);
assert.equal(controls.n300.count, 1173);
const variants = [];
const p0 = pages.find(p => p.page === 0).indices;
const p1 = pages.find(p => p.page === 1).indices;
const p16 = pages.find(p => p.page === 16).indices;
for (const cyclic of [false, true]) {
  for (const mirror of [false, true]) {
    for (const reverseDigits of [false, true]) {
      const opening = [...directInverse(p0, cyclic, mirror, reverseDigits),
        ...directInverse(p1, cyclic, mirror, reverseDigits)].slice(0, 300);
      const holdout = directInverse(p16, cyclic, mirror, reverseDigits).slice(0, 200);
      variants.push({
        cyclic, mirror, reverseDigits,
        p0p1Ioc300: ioc(opening), p16Ioc200: ioc(holdout)
      });
    }
  }
}
assert.ok(variants.every(v => v.p0p1Ioc300 < controls.n300.min));
assert.ok(variants.every(v => v.p16Ioc200 < controls.n200.min));

/* Real solved-native plaintext, planted through a length-expanding GP28
   nonrepeat transition encoder, recovers exactly under the same decoder. */
const native = solvedSections.flat().slice(0, 300);
let value = 0n;
for (const v of native) value = value * 29n + BigInt(v);
let m = 0;
while (28n ** BigInt(m) < 29n ** BigInt(native.length)) m++;
const digits = Array(m).fill(0);
for (let j = digits.length - 1; j >= 0; j--) {
  digits[j] = Number(value % 28n);
  value /= 28n;
}
assert.equal(value, 0n);
const planted = [0];
for (const d of digits) {
  const prev = planted[planted.length - 1];
  planted.push(d >= prev ? d + 1 : d);
}
assert.equal(repeatCount(planted), 0);
assert.deepEqual(directInverse(planted, false, false, false).slice(-native.length), native);

console.log(JSON.stringify({
  original: { runes: total, words: words.length, pages: pages.length,
    withinPageRepeats: 86, withinWordRepeats: 63 },
  exactMissingBits: required,
  punctuation: { events: events.length, distinctWordEndSites: distinctSites.size,
    identityOnlyMaxBits: events.length * Math.log2(3),
    fixedMultisetBits: Math.log2(Number(multisetIdentities)),
    placementBits: Math.log2(Number(possiblePositions)) },
  insufficientLocalPages: localDeficits,
  insufficientWordPreservingLocalChapters: chapterDeficits,
  chaptersStillInsufficientWithThreePunctuationSymbols: chapterDeficitsEvenWithTernaryGlyphs,
  solvedIoc: controls, directOriginalInverses: variants,
  plantedPositive: "PASS"
}, null, 2));
