"use strict";

/**
 * LP2 whole-word Josephus inverse: source-locked 29/256/3299/3301 clocks
 * and the 16 Fibonacci-prime spiral numbers as repeated elimination steps.
 *
 * Source: complete original transcription, physical visual chapter starts,
 * p15 printed 4x4 spiral, Cicada identifier 3301, GP29 alphabet and p57's
 * solved circumference metaphor. This is exploratory operator discovery,
 * not a Cicada-authenticated instruction. All outputs remain encrypted.
 *
 * Reproduces a deceptively strong length-grammar false lead with a fixed
 * familywise null and a separate source-native English transition diagnostic.
 * Tested with Node.js 22 and standard built-ins; no dependencies/CLI args.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {readSquare, clockwiseSpiral, primeList, uniqueFibonacciPrimeRanks} =
  require("./fibonacci_prime_spiral.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const words = parseSharedCorpus().words;
const lens = words.map(w => w.length);
assert.equal(words.length, 2896);
assert.equal(lens.reduce((a, b) => a + b, 0), 12956);
const n = lens.length;
const chapterPages = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const breaks = chapterPages.map(p => words.findIndex(w => w.startPage >= p))
  .concat(n);
assert.equal(breaks[0], 0);
assert(breaks.every((v, i) => i === 0 || v > breaks[i - 1]));

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return function next() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Josephus elimination order. A positive step means count that many
 * surviving slots, including the current slot. Print order is 0-based.
 * @param {number} size
 * @param {number[]} steps
 */
function elimination(size, steps) {
  const survivors = Array.from({length: size}, (_, i) => i);
  const order = [];
  let cursor = 0;
  while (survivors.length) {
    const step = steps[order.length % steps.length];
    assert(Number.isSafeInteger(step) && step > 0);
    cursor = (cursor + step - 1) % survivors.length;
    order.push(survivors.splice(cursor, 1)[0]);
  }
  return order;
}

/**
 * Map output word slot -> original word slot.
 * 'inverse' is the operation that reconstructs original slot positions
 * when input words were emitted in Josephus elimination order.
 * @param {number[]} steps @param {boolean} inverse
 * @param {"book"|"chapter"} scope
 */
function indexMap(steps, inverse, scope) {
  const map = new Array(n);
  const regions = scope === "book" ? [[0, n]]
    : chapterPages.map((_, i) => [breaks[i], breaks[i + 1]]);
  for (const [start, end] of regions) {
    const source = elimination(end - start, steps);
    for (let i = 0; i < source.length; i++) {
      if (inverse) map[start + source[i]] = start + i;
      else map[start + i] = start + source[i];
    }
  }
  assert.deepEqual([...map].sort((a, b) => a - b),
    Array.from({length: n}, (_, i) => i));
  return map;
}

/** @param {number[]} lengths */
function chi(lengths) {
  const counts = Array.from({length: 9}, () => new Array(9).fill(0));
  const row = new Array(9).fill(0), col = new Array(9).fill(0);
  for (let i = 1; i < lengths.length; i++) {
    const a = Math.min(8, lengths[i - 1] - 1);
    const b = Math.min(8, lengths[i] - 1);
    counts[a][b]++;
    row[a]++;
    col[b]++;
  }
  let value = 0;
  for (let a = 0; a < 9; a++) for (let b = 0; b < 9; b++) {
    const expected = row[a] * col[b] / (lengths.length - 1);
    if (expected > 0) value += (counts[a][b] - expected) ** 2 / expected;
  }
  return {value, counts, row, col};
}

const base = chi(lens);
assert(Math.abs(base.value - 68.27318638192133) < 1e-9);
const constantValues = [29, 256, 3299, 3301];
const cases = [];
for (const step of constantValues)
  for (const inverse of [false, true])
    for (const scope of ["book", "chapter"]) {
      const map = indexMap([step], inverse, scope);
      cases.push({step, inverse, scope, map,
        value: chi(map.map(i => lens[i])).value});
    }
const peak = cases.reduce((a, b) => a.value > b.value ? a : b);
assert.equal(peak.step, 29);
assert(peak.inverse && peak.scope === "book");
assert(Math.abs(peak.value - 113.89338148645109) < 1e-9);

// Predeclared complete 16-model familywise shuffle null. One sample consists
// of a uniform permutation of all source lengths, then the maximum over
// every constant, direction and region scope is recorded. All shuffles
// preserve the original 2,896-word length inventory exactly.
const next = rng(0x33012129);
const working = lens.slice();
const trials = 2500;
let peakHits = 0, fixedHits = 0, sumFixed = 0, sumFamily = 0;
for (let sample = 0; sample < trials; sample++) {
  for (let i = n - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [working[i], working[j]] = [working[j], working[i]];
  }
  let maximum = 0;
  for (const item of cases) {
    const value = chi(item.map.map(i => working[i])).value;
    if (value > maximum) maximum = value;
    if (item === peak) {
      if (value >= peak.value) fixedHits++;
      sumFixed += value;
    }
  }
  if (maximum >= peak.value) peakHits++;
  sumFamily += maximum;
}
assert.equal(fixedHits, 1);
assert.equal(peakHits, 4);
console.log("word count", n, "source length chi-square", base.value);
console.log("29-step inverse chi-square", peak.value,
  "fixed null p", (fixedHits + 1) / (trials + 1),
  "16-model familywise p", (peakHits + 1) / (trials + 1),
  "mean family maximum", sumFamily / trials);

/** Source spiral in red-start outward order, source numbers strictly fixed. */
const grid = readSquare();
const spiral = clockwiseSpiral().map(([r, c]) => grid[r][c]);
assert.deepEqual(spiral, [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
]);
const ranks = uniqueFibonacciPrimeRanks();
const underlying = primeList(Math.max(...ranks));
const primeValues = ranks.map(k => underlying[k - 1]);
assert.deepEqual(spiral, primeValues.map(k => Math.abs(3301 - k)));
const variable = [
  {label: "printed-distance", steps: spiral},
  {label: "prime-ordinal", steps: ranks},
  {label: "underlying-prime", steps: primeValues}
];
const variableCases = [];
for (const item of variable)
  for (const inverse of [false, true])
    for (const scope of ["book", "chapter"]) {
      const map = indexMap(item.steps, inverse, scope);
      variableCases.push({
        name: item.label, inverse, scope,
        value: chi(map.map(i => lens[i])).value
      });
    }
const variablePeak = variableCases.reduce((a, b) =>
  a.value > b.value ? a : b);
assert.equal(variablePeak.name, "underlying-prime");
assert(variablePeak.inverse && variablePeak.scope === "chapter");
assert(Math.abs(variablePeak.value - 75.33184365245664) < 1e-9);
console.log("best twelve variable-step candidate", variablePeak);

// Independent heldout original-English transition diagnostic. Native GP
// spelling uses the exact independently solved LP1 ING and IO contractions.
const alphabet = JSON.parse(read("resources/liber-primus/lp2-corpus.json"))
  .translit.slice().sort((a, b) => b.length - a.length);
function gpLength(word) {
  const norm = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let count = 0;
  for (let i = 0; i < norm.length;) {
    let delta = norm.startsWith("ING", i) ? 3
      : norm.startsWith("IO", i) ? 2 : 0;
    if (!delta) {
      const match = alphabet.find(token => norm.startsWith(token, i));
      assert(match, "unmapped source word: " + word);
      delta = match.length;
    }
    i += delta;
    count++;
  }
  return count;
}
const sourceFiles = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
const language = sourceFiles.map(file =>
  (read(file).match(/[A-Za-z]+/g) || []).map(gpLength));
assert.deepEqual(language.map(a => a.length), [15733, 55407, 77932]);

// A fixed source-independent bigram likelihood-ratio scorer:
// log Pr(next length | previous length) - log Pr(next length).
// Pooled English source controls, with fixed half-count smoothing.
const matrix = Array.from({length: 9}, () => new Array(9).fill(0));
const freq = new Array(9).fill(0);
for (const seq of language) for (let i = 1; i < seq.length; i++) {
  const a = Math.min(8, seq[i - 1] - 1);
  const b = Math.min(8, seq[i] - 1);
  matrix[a][b]++;
  freq[b]++;
}
const rowTotals = matrix.map(a => a.reduce((s, x) => s + x, 0));
const grandTotal = freq.reduce((s, x) => s + x, 0);
const llr = matrix.map((row, i) => row.map((count, j) =>
  Math.log((count + 0.5) / (rowTotals[i] + 4.5)) -
  Math.log((freq[j] + 0.5) / (grandTotal + 4.5))));
function llrScore(data, map) {
  let total = 0, prev = Math.min(8, data[map[0]] - 1);
  for (let i = 1; i < map.length; i++) {
    const curr = Math.min(8, data[map[i]] - 1);
    total += llr[prev][curr];
    prev = curr;
  }
  return total;
}
const identity = Array.from({length: n}, (_, i) => i);
const rawScore = llrScore(lens, identity);
const chiPeakScore = llrScore(lens, peak.map);
assert(Math.abs(rawScore - (-82.13535693618675)) < 1e-8);
assert(Math.abs(chiPeakScore - (-77.42304922529028)) < 1e-8);

const languageCases = cases.filter(x => x.scope === "book");
const languagePeak = languageCases.reduce((a, b) =>
  llrScore(lens, a.map) > llrScore(lens, b.map) ? a : b);
assert.equal(languagePeak.step, 3299);
assert(!languagePeak.inverse);
const EnglishTop = llrScore(lens, languagePeak.map);
assert(Math.abs(EnglishTop - (-57.19747488825015)) < 1e-8);

const nextEnglish = rng(0x33012131), shuffledEnglish = lens.slice();
const englishTrials = 5000;
let samePeakHits = 0, maxFamilyHits = 0;
for (let sample = 0; sample < englishTrials; sample++) {
  for (let i = n - 1; i > 0; i--) {
    const j = nextEnglish() % (i + 1);
    [shuffledEnglish[i], shuffledEnglish[j]] =
      [shuffledEnglish[j], shuffledEnglish[i]];
  }
  const k29 = llrScore(shuffledEnglish, peak.map);
  if (k29 >= chiPeakScore) samePeakHits++;
  let best = -Infinity;
  for (const item of languageCases)
    best = Math.max(best, llrScore(shuffledEnglish, item.map));
  if (best >= EnglishTop) maxFamilyHits++;
}
assert.equal(samePeakHits, 2824);
assert.equal(maxFamilyHits, 1224);
console.log("English GP transition log-odds: original", rawScore,
  "29-step inverse", chiPeakScore, "best source constant", EnglishTop);
console.log("English length-order heldout null: 29-step p",
  (samePeakHits + 1) / (englishTrials + 1),
  "best-of-eight p", (maxFamilyHits + 1) / (englishTrials + 1));

// A positive plant proves exact forward/inverse Josephus word permutation.
const plant = language[0].slice(0, n);
const forward = indexMap([29], false, "book");
const backward = indexMap([29], true, "book");
const encryptedPlant = forward.map(i => plant[i]);
const restored = backward.map(i => encryptedPlant[i]);
assert.deepEqual(restored, plant);
assert.notDeepEqual(encryptedPlant, plant);
console.log("PASS: original exact source, native-language controls, positive plant.");
