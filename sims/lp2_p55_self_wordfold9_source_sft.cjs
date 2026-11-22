"use strict";

/**
 * LP2 physical p55 original-word-fragment 17->9 prime-sum fold: source and
 * heldout controls. Node 22 CommonJS, read-only. Not a plaintext decoder.
 *
 * The candidate pairwise fold of printed GP prime sums is motivated by the
 * recovered Cicada 'FOLD' pointer and the source's last-page geometry, but
 * neither the fold nor its additive key role is author-authenticated.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalPages = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55);
const index = new Map(gp.runes.map((r, i) => [r, i]));

/**
 * Source printing: '/' or physical lines do not split a word, but its
 * originally printed hyphens, stops and special marks do.
 * @param {string} str @returns {number[][]}
 */
function fragments(str) {
  return str.split(/[-.$&§0123456789]+/)
    .map((piece) => [...piece].filter((g) => index.has(g)).map((g) => index.get(g)))
    .filter((piece) => piece.length);
}

/** @param {number[][]} words @param {number[]} weights @returns {number[]} */
function fold9(words, weights) {
  assert.equal(words.length, 17);
  const sums = words.map((word) => word.reduce((n, digit) => n + weights[digit], 0));
  return Array.from({length: 9}, (_, i) =>
    (i === 8 ? sums[8] : sums[i] + sums[16 - i]) % 29);
}

/**
 * Source-fixed nine-key GP29 transform on exactly the original rune stream.
 * @param {number[]} runes @param {number[]} key @param {-1|1} sign
 * @param {boolean} reverse @param {number} phase
 * @returns {number[]}
 */
function apply(runes, key, sign, reverse = false, phase = 0) {
  const k = reverse ? key.toReversed() : key;
  return runes.map((c, i) => (c + 29 + sign * k[(i + phase) % 9]) % 29);
}
/** @param {number[]} arr @returns {number} */
function numerator(arr) {
  const h = Array(29).fill(0);
  for (const c of arr) h[c]++;
  return h.reduce((n, count) => n + count * (count - 1), 0);
}
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  return numerator(arr) / (arr.length * (arr.length - 1));
}
/** @param {number[]} arr @returns {string} */
function names(arr) {
  return arr.map((c) => gp.translit[c]).join("");
}

/**
 * Two decryption signs and both simple reading directions. No secret key or
 * phase is optimized against original p55.
 * @param {number[]} runes @param {number[]} key
 * @returns {{fixed:number,best:number}}
 */
function family(runes, key) {
  const fixed = numerator(apply(runes, key, -1));
  return {
    fixed,
    best: Math.max(fixed,
      numerator(apply(runes, key, -1, true)),
      numerator(apply(runes, key, 1)),
      numerator(apply(runes, key, 1, true)))
  };
}

/**
 * Reproducible independent xorshift32 Fisher-Yates samples.
 * @param {number} seed @returns {(arr:any[])=>any[]}
 */
function shuffler(seed) {
  let state = seed >>> 0;
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  }
  return (arr) => {
    const next = arr.slice();
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
  };
}

const source = fragments(originalPages[54]); // physical p55, p50 is runeless
const target = gp.pages[55].indices;
assert.equal(source.length, 17);
assert.equal(source[0].length, 1); // a word carried from preceding physical p54
assert.deepEqual(source.flat(), target);
assert.equal(target.length, 76);
const key = fold9(source, gp.prime);
assert.deepEqual(key, [6, 3, 21, 3, 17, 15, 22, 9, 17]);
const original = family(target, key);
assert.deepEqual(original, {fixed: 256, best: 256});
const decoded = apply(target, key, -1);
assert.deepEqual(apply(decoded, key, 1), target);
assert.equal(ioc(target), 0.037894736842105266);
assert.equal(ioc(decoded), 0.04491228070175438);

// A real solved GP source supplies a 76-rune plaintext control. It undergoes
// the same forward encoder and is recovered without adjusting any key digit.
const p57 = fragments(read("resources/liber-primus/lp2-transcription.txt").split("%").at(-1));
const native = [p57[0], ...p57.slice(1).map((word) => word.slice(0, -1))].flat();
assert.equal(p57.length, 20);
assert.equal(native.length, 76);
const planted = apply(native, key, 1);
assert.deepEqual(apply(planted, key, -1), native);
assert.equal(ioc(native), 0.05649122807017544);

// Source-preserving null 1: retain the original first carried fragment and
// shuffle the sixteen complete p55 fragments as *whole words*. Derive each
// wrong-order key afresh from the permuted ciphertext. It maintains all glyph
// identities, the exact word inventory and the p55 length.
const trials = 50000;
const shuffleWords = shuffler(0x33015510);
const wrongWordCount = [0, 0];
const wrongWordMean = [0, 0];
for (let i = 0; i < trials; i++) {
  const testWords = [source[0], ...shuffleWords(source.slice(1))];
  const test = family(testWords.flat(), fold9(testWords, gp.prime));
  for (let j = 0; j < 2; j++) {
    const n = j === 0 ? test.fixed : test.best;
    wrongWordCount[j] += Number(n >= (j === 0 ? original.fixed : original.best));
    wrongWordMean[j] += n;
  }
}
assert.deepEqual(wrongWordCount, [477, 1797]);

// Source-preserving null 2: the same original ciphertext and word order,
// changing only the 29 original prime weights through random *permutations*.
// This preserves the exact known prime multiset and source GP runes.
const shuffleWeights = shuffler(0x33015529);
const wrongAlphabetCount = [0, 0];
const wrongAlphabetMean = [0, 0];
for (let i = 0; i < trials; i++) {
  const test = family(target, fold9(source, shuffleWeights(gp.prime)));
  for (let j = 0; j < 2; j++) {
    const n = j === 0 ? test.fixed : test.best;
    wrongAlphabetCount[j] += Number(n >= (j === 0 ? original.fixed : original.best));
    wrongAlphabetMean[j] += n;
  }
}
assert.deepEqual(wrongAlphabetCount, [662, 2656]);

// Original-corpus heldout 17-fragment page-local windows, with the same
// original prime weights and 17->9 folding operation.
const candidates = [];
for (let i = 0; i < originalPages.length; i++) {
  const words = fragments(originalPages[i]);
  const physical = i < 50 ? i : i + 1;
  for (let start = 0; start + 17 <= words.length; start++) {
    const block = words.slice(start, start + 17);
    const sequence = block.flat();
    const decodedBlock = apply(sequence, fold9(block, gp.prime), -1);
    candidates.push({
      physical, start, length: sequence.length, ioc: ioc(decodedBlock)
    });
  }
}
const sameLength = candidates.filter((c) => c.length === 76);
const sameLengthAtLeast = sameLength.filter((c) => c.ioc >= ioc(decoded));
assert.equal(candidates.length, 2048);
assert.equal(sameLength.length, 76);
assert.equal(sameLengthAtLeast.length, 1);
assert.equal(sameLengthAtLeast[0].physical, 55);

// Independent visible duplicated two-word ciphertext: p27 contains the exact
// last six rune digits of p55. Align phases by that source-anchored recurrence,
// *without* fitting a p27 phase to an English score.
const p27 = gp.pages[27].indices, marker = target.slice(-6);
function locations(seq) {
  const out = [];
  for (let i = 0; i + marker.length <= seq.length; i++) {
    if (marker.every((digit, n) => seq[i + n] === digit)) out.push(i);
  }
  return out;
}
assert.deepEqual(locations(p27), [28]);
assert.deepEqual(locations(target), [70]);
const phase = (70 - 28) % 9;
assert.equal(phase, 6);
const p27Decoded = apply(p27, key, -1, false, phase);
assert.equal(ioc(p27), 0.03393125710722277);
assert.equal(ioc(p27Decoded), 0.03330765562525219);

console.log(JSON.stringify({
  original: {length: target.length, wordFragments: source.length, key,
    keyLabels: names(key), rawIoc: ioc(target), decodedIoc: ioc(decoded),
    decodedPrefix: names(decoded.slice(0, 36))},
  nativeSolvedPositive: {length: native.length, decodedIoc: ioc(native),
    roundtrip: 76},
  wordOrderNull: {trials, seed: "0x33015510",
    fixedCount: wrongWordCount[0], familyCount: wrongWordCount[1],
    familywisePlusOne: (wrongWordCount[1] + 1) / (trials + 1)},
  primeAssignmentNull: {trials, seed: "0x33015529",
    fixedCount: wrongAlphabetCount[0], familyCount: wrongAlphabetCount[1],
    familywisePlusOne: (wrongAlphabetCount[1] + 1) / (trials + 1)},
  originalCorpus: {windows17: candidates.length,
    sameLength76: sameLength.length, atLeastAsStrong: sameLengthAtLeast.length},
  p27DuplicateHeldout: {p27MarkerOffset: 28, p55MarkerOffset: 70, phase,
    rawIoc: ioc(p27), decodedIoc: ioc(p27Decoded)},
  decision: "Provisional local p55 self-fold signal, no authentic plaintext or transferable key"
}, null, 2));
