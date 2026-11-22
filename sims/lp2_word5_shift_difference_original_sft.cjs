'use strict';
/**
 * Original LP2 five-back and word-phase difference invariant, single-file test.
 * Invoke from repository root with Node.js 22 on Windows or another OS:
 *   node sims/lp2_word5_shift_difference_original_sft.cjs
 *
 * Two separate facts:
 *  (1) Rune-S within-word lag-five equality sites are enriched under a
 *      word-inventory/adjacent-equality-site conditioned source null.
 *  (2) Any wordwise Caesar shift plus five fixed phase shifts preserves
 *      each phase-conditioned adjacent-difference index of coincidence.
 *
 * A tested English-like wordwise five-phase Caesar family fails (2), even
 * though the original lag-five equality count is near native-GP controls.
 * No authentic key or unknown plaintext is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeId = new Map(gp.runes.map((r, i) => [r, i]));
const originalText = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%');
const sourceWords = [];
let word = [];
for (const ch of originalText) {
  if (runeId.has(ch)) word.push(runeId.get(ch));
  else if (ch !== '/' && ch !== '%' && !/\s/u.test(ch)) {
    if (word.length) sourceWords.push(word);
    word = [];
  }
}
if (word.length) sourceWords.push(word);
const lengths = sourceWords.map(w => w.length);
assert.equal(lengths.length, 2896);
assert.equal(lengths.reduce((n, x) => n + x, 0), 12956);
assert.equal(Math.max(...lengths), 14);

/** @param {number[]} hist @returns {number} */
function ic(hist) {
  const n = hist.reduce((s, x) => s + x, 0);
  return hist.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
}
/** @param {number[][]} words @returns {number[][]} */
function differenceHistograms(words) {
  const hist = Array.from({length: 5}, () => Array(29).fill(0));
  for (const w of words)
    for (let i = 1; i < w.length; i++)
      hist[i % 5][(w[i] - w[i - 1] + 29) % 29]++;
  return hist;
}
const originalHist = differenceHistograms(sourceWords);
assert.deepEqual(originalHist.map(h => h.reduce((a, b) => a + b, 0)),
  [872, 3397, 2715, 1835, 1241]);
const originalIc = originalHist.map(ic);
console.log('LP2 word-phase delta IoC:', originalIc.map(v => v.toFixed(8)).join(', '));
const spelling = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} input @returns {number[]} */
function gpWord(input) {
  const t = input.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const arr = [];
  for (let i = 0; i < t.length;) {
    if (t.startsWith('ING', i)) {arr.push(21); i += 3;}
    else if (t.startsWith('IO', i)) {arr.push(27); i += 2;}
    else {
      const p = spelling.find(x => t.startsWith(x.s, i));
      assert.ok(p, 'unknown GP spelling');
      arr.push(p.i);
      i += p.s.length;
    }
  }
  return arr;
}
/** @param {string} s @returns {number[][]} */
const nativeWords = s => (s.match(/[A-Za-z]+/g) || []).map(gpWord);
let state = 0x13a5c023;
/** @param {number} n @returns {number} */
function randomInt(n) {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return Math.floor(state / 4294967296 * n);
}
/** @param {number[][]} corpus @returns {number[][][]} */
function bucketize(corpus) {
  const bins = Array.from({length: 15}, () => []);
  for (const w of corpus) if (w.length < bins.length) bins[w.length].push(w);
  for (const n of lengths) assert.ok(bins[n].length, 'missing word length');
  return bins;
}
/** @param {number[][]} words @returns {number[][]} */
function fiveBackHistograms(words) {
  const hist = Array.from({length: 5}, () => Array(29).fill(0));
  for (const w of words)
    for (let j = 5; j < w.length; j++)
      hist[j % 5][(w[j] - w[j - 5] + 29) % 29]++;
  return hist;
}
const originalFive = fiveBackHistograms(sourceWords);
const originalFiveIc = originalFive.map(ic);
/** @param {number[][]} h @returns {number} */
function weightedIc(h) {
  let count = 0, weighted = 0;
  for (const row of h) {
    const n = row.reduce((a, b) => a + b, 0);
    weighted += n * ic(row);
    count += n;
  }
  return weighted / count;
}
const originalWeighted = {
  adjacent: weightedIc(originalHist),
  fiveBack: weightedIc(originalFive)
};
console.log('Original weighted delta IoC:', JSON.stringify(originalWeighted));

assert.deepEqual(originalFive.map(h => h.reduce((a, b) => a + b, 0)),
  [872, 584, 350, 190, 109]);
console.log('LP2 word-phase five-back delta IoC:',
  originalFiveIc.map(v => v.toFixed(8)).join(', '));
const multipliers = [1, 2, 3, 5, 8];
/** @param {number} a @returns {number} */
function inverse29(a) {
  for (let b = 1; b < 29; b++) if (a * b % 29 === 1) return b;
  throw Error('field inverse missing');
}
const offsets = [2, 11, 19, 6, 23];
for (const [name, file] of [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt']
]) {
  const buckets = bucketize(nativeWords(read(file)));
  const trials = 3000;
  const minima = Array(5).fill(Infinity);
  const fiveMinima = Array(5).fill(Infinity);
  let minWeightedAdjacent = Infinity, minWeightedFive = Infinity;
  let lowWeightedAdjacent = 0, lowWeightedFive = 0;
  let totalFive = 0;
  for (let t = 0; t < trials; t++) {
    const native = lengths.map(n => {
      const bin = buckets[n];
      return bin[randomInt(bin.length)];
    });
    const counts = differenceHistograms(native);
    const fiveCounts = fiveBackHistograms(native);
    const wa = weightedIc(counts), wf = weightedIc(fiveCounts);
    minWeightedAdjacent = Math.min(minWeightedAdjacent, wa);
    minWeightedFive = Math.min(minWeightedFive, wf);
    lowWeightedAdjacent += +(wa <= originalWeighted.adjacent);
    lowWeightedFive += +(wf <= originalWeighted.fiveBack);
    fiveCounts.forEach((h, i) => {
      fiveMinima[i] = Math.min(fiveMinima[i], ic(h));
    });
    counts.forEach((h, i) => {
      minima[i] = Math.min(minima[i], ic(h));
    });
    for (const w of native)
      for (let i = 5; i < w.length; i++)
        totalFive += +(w[i] === w[i - 5]);
    if (t === 0) {
      const encrypted = native.map((w, wordId) =>
        w.map((p, i) => (p + wordId * 13 + 7 + offsets[i % 5]) % 29));
      const decrypted = encrypted.map((w, wordId) =>
        w.map((c, i) => (c - (wordId * 13 + 7) % 29
          - offsets[i % 5] + 58) % 29));
      assert.deepEqual(decrypted, native);
      const mapped = differenceHistograms(encrypted);
      const shift = i => (offsets[i] - offsets[(i + 4) % 5] + 29) % 29;
      for (let phase = 0; phase < 5; phase++)
        for (let r = 0; r < 29; r++)
          assert.equal(mapped[phase][(r + shift(phase)) % 29],
            counts[phase][r], 'synthetic five-phase difference rotation');
      assert.deepEqual(mapped.map(ic), counts.map(ic));
      const affine = native.map((w, wordId) => w.map((p, i) =>
        (multipliers[i % 5] * p +
          (7 * wordId + 3 * wordId * (i % 5) + offsets[i % 5]) % 29) % 29));
      const affineInverse = affine.map((w, wordId) => w.map((c, i) =>
        ((c - (7 * wordId + 3 * wordId * (i % 5) +
          offsets[i % 5]) % 29 + 29) % 29 *
          inverse29(multipliers[i % 5])) % 29));
      assert.deepEqual(affineInverse, native);
      const affineFive = fiveBackHistograms(affine);
      for (let phase = 0; phase < 5; phase++)
        for (let r = 0; r < 29; r++)
          assert.equal(affineFive[phase][(multipliers[phase] * r) % 29],
            fiveCounts[phase][r], 'affine five-back multiplication');
      assert.deepEqual(affineFive.map(ic), fiveCounts.map(ic));
    }
  }
  assert.ok(minima.every((min, i) => min > originalIc[i]),
    'original five-phase Caesar family unexpectedly compatible');
  assert.ok(minWeightedAdjacent > originalWeighted.adjacent);
  assert.ok(minWeightedFive > originalWeighted.fiveBack);
  assert.equal(lowWeightedAdjacent, 0);
  assert.equal(lowWeightedFive, 0);
  console.log(name, 'source-word-shaped weighted Ic minima', {
    adjacent: minWeightedAdjacent,
    fiveBack: minWeightedFive,
    lowWeightedAdjacent,
    lowWeightedFive
  });
  console.log(name, 'per-phase five-back minima (not individually excluded):',
    fiveMinima.map(v => v.toFixed(8)).join(', '));
  console.log(name, 'minimum five-back affine IoC:',
    fiveMinima.map(v => v.toFixed(8)).join(', '));
  console.log(name, 'native controls N=' + trials,
    'minimum IoC:', minima.map(v => v.toFixed(8)).join(', '),
    'mean lag5 matches:', (totalFive / trials).toFixed(4));
}
/* Latin is an independent *already GP29-encoded* whole-word corpus,
 * preserving its native word boundaries. Test the same original-length
 * phase-conditioned invariants without an English spelling converter. */
const latinAlphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const latinBins = Array.from({length:15}, () => []);
for (const line of read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/u)) {
  if (!/^[0-9A-S]+$/u.test(line) || line.length >= latinBins.length) continue;
  latinBins[line.length].push(Array.from(line,
    ch => latinAlphabet.indexOf(ch)));
}
for (const length of lengths)
  assert.ok(latinBins[length].length, 'Latin lacks source word length');
state = 0x13a5c023;
const LatinN = 3000;
let latinAdjacentMean = 0, latinFiveMean = 0;
let latinAdjacentMin = Infinity, latinFiveMin = Infinity;
let latinAdjacentUnder = 0, latinFiveUnder = 0;
for (let t = 0; t < LatinN; t++) {
  const native = lengths.map(n => {
    const bin = latinBins[n];
    return bin[randomInt(bin.length)];
  });
  const adjacent = weightedIc(differenceHistograms(native));
  const five = weightedIc(fiveBackHistograms(native));
  latinAdjacentMean += adjacent;
  latinFiveMean += five;
  latinAdjacentMin = Math.min(latinAdjacentMin, adjacent);
  latinFiveMin = Math.min(latinFiveMin, five);
  latinAdjacentUnder += +(adjacent <= originalWeighted.adjacent);
  latinFiveUnder += +(five <= originalWeighted.fiveBack);
}
assert.equal(latinAdjacentUnder, 0);
assert.equal(latinFiveUnder, 0);
console.log('Latin Vulgate native-GP original-shaped controls', {
  N: LatinN, adjacentMean:latinAdjacentMean/LatinN,
  fiveMean:latinFiveMean/LatinN,
  adjacentMin:latinAdjacentMin, fiveMin:latinFiveMin,
  atOrBelowOriginal:[latinAdjacentUnder,latinFiveUnder]
});
/* Conditional null holds each original word's multiset and exact adjacent
 * equality mask fixed. Rejection samples are uniform over the source-word
 * permutation multiset satisfying those sites, with a fixed RNG seed. */
const eligible = sourceWords.filter(w =>
  w.length >= 6 && new Set(w).size < w.length)
  .map(w => ({w, mask: w.slice(1).map((v, i) => +(v === w[i]))}));
assert.equal(eligible.length, 441);
const observedByRune = Array(29).fill(0);
for (const {w} of eligible)
  for (let i = 5; i < w.length; i++)
    if (w[i] === w[i - 5]) observedByRune[w[i]]++;
assert.equal(observedByRune.reduce((a, b) => a + b, 0), 104);
assert.equal(observedByRune[15], 11);
/** @param {number[]} w @returns {number[]} */
function shuffle(w) {
  const v = w.slice();
  for (let i = v.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [v[i], v[j]] = [v[j], v[i]];
  }
  return v;
}
/** @param {number[]} w @param {number[]} mask @returns {boolean} */
function matches(w, mask) {
  for (let i = 1; i < w.length; i++)
    if (+(w[i] === w[i - 1]) !== mask[i - 1]) return false;
  return true;
}
state = 0x13a5c023;
let total = 0, totalHigh = 0, sTotal = 0, sHigh = 0, sMax = 0;
const conditionalTrials = 3000;
for (let t = 0; t < conditionalTrials; t++) {
  let count = 0, sCount = 0;
  for (const {w, mask} of eligible) {
    let candidate;
    do {candidate = shuffle(w);} while (!matches(candidate, mask));
    for (let i = 5; i < candidate.length; i++)
      if (candidate[i] === candidate[i - 5]) {
        count++;
        if (candidate[i] === 15) sCount++;
      }
  }
  total += count;
  sTotal += sCount;
  totalHigh += +(count >= 104);
  sHigh += +(sCount >= 11);
  sMax = Math.max(sMax, sCount);
}
console.log('Original lag5 equality total=104, S=11; conditional N=' +
  conditionalTrials + ', mean total=' + (total / conditionalTrials).toFixed(3) +
  ', tail(total>=104)=' + totalHigh +
  ', mean S=' + (sTotal / conditionalTrials).toFixed(3) +
  ', tail(S>=11)=' + sHigh + ', max S=' + sMax);
assert.equal(sHigh, 0);
console.log('PASS: original-source phase-shift exclusion and lag5 source shape');
