'use strict';

/**
 * Source-frozen internal-red-heading same-pad experiment (Node.js 22, CJS).
 *
 * Twelve segments are the nine ink-defined top-level visual chapters plus
 * physical page 6:71, page 15:9 and page 33:91. Their boundaries come from
 * original layout, without optimizing on any ciphertext statistics.
 *
 * For C_s[i] = P_s[i] + K[i] (mod 29), restarted with the same K at each
 * segment, C_a[i] = C_b[i] exactly when P_a[i] = P_b[i]. This equality
 * invariant also applies to an arbitrary identical bijection per key index.
 * The best per-pair residue allows an extra constant offset per segment
 * under the additive model and is a deliberately permissive upper bound.
 *
 * Execute: node sims/lp2_internal_rubric_sharedpad_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');

const anchors = [
  { page: 0, offset: 0, label: 'p0' },
  { page: 3, offset: 0, label: 'p3' },
  { page: 6, offset: 71, label: 'p6:71' },
  { page: 8, offset: 0, label: 'p8' },
  { page: 15, offset: 0, label: 'p15:0' },
  { page: 15, offset: 9, label: 'p15:9' },
  { page: 23, offset: 0, label: 'p23' },
  { page: 27, offset: 0, label: 'p27' },
  { page: 33, offset: 0, label: 'p33:0' },
  { page: 33, offset: 91, label: 'p33:91' },
  { page: 40, offset: 0, label: 'p40' },
  { page: 54, offset: 0, label: 'p54' }
];
const internal = [[6, 71, 11], [15, 9, 11], [33, 91, 8]];
for (const [page, offset, length] of internal) {
  const record = ink.pages.find((p) => p.page === page);
  assert(record);
  assert(record.red_spans.some((s) => s.start === offset && s.length === length));
}
const pages = corpus.pages.filter((p) => p.page <= 55);
const source = pages.flatMap((p) => p.indices);
assert.equal(source.length, 12956);
const pageStart = Array(56).fill(0);
for (let p = 1; p < 56; p++) {
  const prior = pages.find((r) => r.page === p - 1);
  assert(prior);
  pageStart[p] = pageStart[p - 1] + prior.indices.length;
}
const cuts = anchors.map(({ page, offset }) => pageStart[page] + offset);
assert.deepEqual(cuts, [0,729,1541,1874,3603,3612,5506,6527,7960,8051,9640,12648]);
const segments = cuts.map((start, i) => source.slice(start, cuts[i + 1] ?? source.length));
assert.deepEqual(segments.map((s) => s.length),
  [729,812,333,1729,9,1894,1021,1433,91,1589,3008,308]);

const runes = new Map(corpus.runes.map((r, i) => [r, i]));
const wordLengths = Array.from({ length: segments.length }, () => []);
let current = 0;
/** @type {number[]} */
let pending = [];
/** @param {number} p @returns {number} */
function segmentOf(p) {
  for (let i = cuts.length - 1; i >= 0; i--) {
    if (p >= cuts[i]) return i;
  }
  throw Error('Position below source start');
}
function flushWord() {
  if (!pending.length) return;
  const section = segmentOf(pending[0]);
  assert.equal(segmentOf(pending.at(-1)), section, 'A rubric split a printed word');
  wordLengths[section].push(pending.length);
  pending = [];
}
for (const ch of transcript) {
  const value = runes.get(ch);
  if (value !== undefined && current < source.length) {
    assert.equal(source[current], value, 'Transcription mismatch at ' + current);
    pending.push(current++);
  } else if ('-.$&§'.includes(ch)) {
    flushWord();
  }
}
flushWord();
assert.equal(current, source.length);
assert.equal(wordLengths.flat().length, 2896);
for (let i = 0; i < segments.length; i++) {
  assert.equal(wordLengths[i].reduce((a, b) => a + b, 0), segments[i].length);
}

const alphabet = corpus.translit.map((symbol, i) => ({ symbol, i }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
/** @param {string} s @returns {number[]} */
function gpWord(s) {
  const value = s.toUpperCase().replace(/ING/g, 'NG').replace(/IO/g, 'IA')
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/Q/g, 'C');
  const output = [];
  for (let j = 0; j < value.length;) {
    const part = alphabet.find((x) => value.startsWith(x.symbol, j));
    if (!part) return [];
    output.push(part.i);
    j += part.symbol.length;
  }
  return output;
}
const controls = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt'
];
const dictionary = Array.from({ length: 15 }, () => []);
for (const name of controls) {
  for (const word of read(name).match(/[A-Za-z]+/g) || []) {
    const encoded = gpWord(word);
    if (encoded.length > 0 && encoded.length < dictionary.length) {
      dictionary[encoded.length].push(encoded);
    }
  }
}
assert(dictionary.slice(1).every((list) => list.length));

let randomState = 0x33011203;
/** @returns {number} */
function random32() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}
/** @returns {number[][]} */
function sampleEnglish() {
  return wordLengths.map((lengths) => lengths.flatMap((n) => {
    const choices = dictionary[n];
    return choices[random32() % choices.length];
  }));
}
const newlySplit = new Set([1, 2, 4, 5, 8, 9]);
/**
 * @param {number[][]} tapes
 * @param {boolean} focused Only pairs touching a newly split section
 * @returns {{comparisons:number,equal:number,shift:number,pairs:number,equalityRate:number,bestShiftRate:number}}
 */
function statistic(tapes, focused = false) {
  let comparisons = 0, equal = 0, shift = 0, pairs = 0;
  for (let a = 0; a < tapes.length; a++) {
    for (let b = a + 1; b < tapes.length; b++) {
      if (focused && !newlySplit.has(a) && !newlySplit.has(b)) continue;
      const n = Math.min(tapes[a].length, tapes[b].length);
      const residues = new Uint16Array(29);
      for (let k = 0; k < n; k++) {
        residues[(tapes[a][k] - tapes[b][k] + 29) % 29]++;
      }
      comparisons += n;
      equal += residues[0];
      shift += Math.max(...residues);
      pairs++;
    }
  }
  return { comparisons, equal, shift, pairs,
    equalityRate: equal / comparisons, bestShiftRate: shift / comparisons };
}
const original = statistic(segments);
const focus = statistic(segments, true);
assert.equal(original.comparisons, 37376);
assert.equal(original.equal, 1253);
assert.equal(original.shift, 1849);
assert.equal(focus.comparisons, 25262);
assert.equal(focus.equal, 844);
assert.equal(focus.shift, 1277);
assert.equal(focus.pairs, 51);

const trials = 1500;
const summary = { all: { sum: 0, min: 1, below: 0, shiftSum: 0, shiftMin: 1, shiftBelow: 0 },
  focus: { sum: 0, min: 1, below: 0, shiftSum: 0, shiftMin: 1, shiftBelow: 0 } };
for (let t = 0; t < trials; t++) {
  const plain = sampleEnglish();
  const stats = { all: statistic(plain), focus: statistic(plain, true) };
  for (const name of ['all', 'focus']) {
    const value = stats[name], agg = summary[name];
    const actual = name === 'all' ? original : focus;
    agg.sum += value.equalityRate;
    agg.min = Math.min(agg.min, value.equalityRate);
    agg.shiftSum += value.bestShiftRate;
    agg.shiftMin = Math.min(agg.shiftMin, value.bestShiftRate);
    if (value.equalityRate <= actual.equalityRate) agg.below++;
    if (value.bestShiftRate <= actual.bestShiftRate) agg.shiftBelow++;
  }
}
assert.equal(summary.all.below, 0);
assert.equal(summary.focus.below, 0);
assert.equal(summary.all.shiftBelow, 0);
assert.equal(summary.focus.shiftBelow, 0);

// Source-shaped positive plant, same 3,008-position prime-totient key
// restarted on all twelve original red-heading sections.
const plant = sampleEnglish();
const primes = [];
for (let n = 2; primes.length < 3008; n++) {
  let isPrime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { isPrime = false; break; }
  }
  if (isPrime) primes.push(n);
}
const key = primes.map((n) => (n - 1) % 29);
const encrypted = plant.map((p) => p.map((value, i) => (value + key[i]) % 29));
const longest = segments.findIndex((s) => s.length === key.length);
assert(longest >= 0);
const recoveredKey = encrypted[longest].map((value, i) =>
  (value - plant[longest][i] + 29) % 29);
assert.deepEqual(recoveredKey, key);
for (let section = 0; section < segments.length; section++) {
  const decrypted = encrypted[section].map((value, i) =>
    (value - recoveredKey[i] + 29) % 29);
  assert.deepEqual(decrypted, plant[section]);
  assert.deepEqual(decrypted.map((value, i) => (value + recoveredKey[i]) % 29),
    encrypted[section]);
}
assert.deepEqual(statistic(encrypted), statistic(plant));

const report = {};
for (const name of ['all', 'focus']) {
  const q = summary[name];
  report[name] = {
    meanEquality: q.sum / trials,
    minimumEquality: q.min,
    equalOrBelowOriginal: q.below,
    lowerTailAddOne: (q.below + 1) / (trials + 1),
    meanBestShift: q.shiftSum / trials,
    minimumBestShift: q.shiftMin,
    bestShiftBelowOriginal: q.shiftBelow,
    bestShiftLowerTailAddOne: (q.shiftBelow + 1) / (trials + 1)
  };
}
console.log(JSON.stringify({
  source: 'Original physical LP2 page order, ink annotations and unchanged GP29 corpus',
  anchors: anchors.map((p, i) => ({ ...p, global: cuts[i],
    runes: segments[i].length, words: wordLengths[i].length })),
  originalAll: original, originalNewSplitPairs: focus,
  nativeEnglishControls: { sources: controls, seed: '0x33011203', trials, report },
  positive: { identicalKeyLength: key.length, recoveredFromSection: anchors[longest].label,
    allTwelveDecryptedAndReencryptedExactly: true },
  decision: 'No source-native English reading under the same 29-ary additive key reset at all 12 source-visible headings; identical positionwise bijections also fail the equality invariant. No unknown LP2 plaintext or key recovered.'
}, null, 2));
