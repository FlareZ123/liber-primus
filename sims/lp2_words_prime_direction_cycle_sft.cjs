"use strict";

/**
 * Original-source GP-prime word-number navigation, motivated by Cicada's
 * signed 2016 wording: "Its words are the map ... their numbers are the direction".
 * A deliberately finite *candidate* operation: start at printed word 0,
 * move forward by that word's GP prime-weight sum modulo the number of words,
 * and repeat. Report the complete functional graph and an exploratory,
 * printed-page/word-length conditioned shuffle control.
 *
 * No recovered plaintext or author-authenticated route is assumed.
 * Node.js 22, CommonJS, no dependencies, no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const glyphIndex = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const text = read("resources/lp2-transcription.txt").split("%").slice(0, 55).join("%");
const words = text.split(/[-.&$§]/u)
  .map(chunk => [...chunk].filter(char => glyphIndex.has(char))
    .map(char => glyphIndex.get(char)))
  .filter(word => word.length);
const symbols = words.flat();

assert.equal(pages.length, 55);
assert.equal(symbols.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(symbols, pages.flatMap(p => p.indices));
assert.equal(corpus.prime.length, 29);

const N = words.length;
const primeSums = words.map(word => word.reduce(
  (sum, rune) => sum + corpus.prime[rune], 0));
const step = (i, sums) => (i + sums[i]) % N;

/**
 * Return every directed cycle of a finite function, in source-traversal order.
 * The other visited states form directed trees feeding those cycles.
 * @param {number[]} sums
 * @returns {number[][]}
 */
function cycles(sums) {
  assert.equal(sums.length, N);
  const seen = new Uint8Array(N);
  const result = [];
  for (let start = 0; start < N; start++) {
    if (seen[start]) continue;
    const local = new Map();
    let here = start;
    while (!seen[here] && !local.has(here)) {
      local.set(here, local.size);
      here = step(here, sums);
    }
    if (local.has(here)) {
      result.push([...local.keys()].slice(local.get(here)));
    }
    for (const i of local.keys()) seen[i] = 1;
  }
  return result;
}

/** @param {number[]} sums */
function fromFirst(sums) {
  const seen = new Map();
  const path = [];
  let here = 0;
  while (!seen.has(here)) {
    seen.set(here, path.length);
    path.push(here);
    here = step(here, sums);
  }
  return { path, firstCycleIndex: seen.get(here), returnWord: here };
}

/** @param {number[]} values */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const v of values) {
    assert(Number.isInteger(v) && v >= 0 && v < 29);
    hist[v]++;
  }
  const n = values.length;
  return hist.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

/** @param {number} n */
function firstPrimes(n) {
  const primes = [];
  for (let test = 2; primes.length < n; test++) {
    if (primes.every(prime => prime * prime > test || test % prime !== 0)) {
      primes.push(test);
    }
  }
  return primes;
}

/** @param {number[]} values */
function runeLabels(values) {
  return values.map(index => corpus.translit[index]).join(" ");
}

const route = fromFirst(primeSums);
const components = cycles(primeSums);
assert.equal(components.length, 1);
assert.equal(components[0].length, 90);
assert.equal(route.path.length, 102);
assert.equal(route.firstCycleIndex, 12);
assert.equal(route.returnWord, 1108);
assert.equal(primeSums[0], 347);
assert.deepEqual(route.path.slice(0, 8),
  [0, 347, 592, 754, 1646, 1772, 2214, 2550]);

const cycle = route.path.slice(route.firstCycleIndex);
const firstRune = cycle.map(i => words[i][0]);
const lastRune = cycle.map(i => words[i].at(-1));
const sumResidue = cycle.map(i => primeSums[i] % 29);
const wordLengths = cycle.map(i => words[i].length % 29);
const p = firstPrimes(cycle.length);
const mod = value => (value % 29 + 29) % 29;
const dec = firstRune.map((value, i) => mod(value - (p[i] - 1)));
const enc = firstRune.map((value, i) => mod(value + (p[i] - 1)));

// Physical page of the word START, even for 32 words spanning page breaks.
// Controls preserve each source word length, start page and exact score
// multiset within that printed-page/word-length grouping.
const runeStarts = [];
let boundary = 0;
for (const page of pages) {
  runeStarts.push({page: page.page, offset: boundary});
  boundary += page.indices.length;
}
assert.equal(boundary, symbols.length);
const groups = new Map();
let offset = 0;
let pageIndex = 0;
for (let i = 0; i < words.length; i++) {
  while (pageIndex + 1 < runeStarts.length
      && runeStarts[pageIndex + 1].offset <= offset) pageIndex++;
  const key = String(runeStarts[pageIndex].page) + ":" + String(words[i].length);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(i);
  offset += words[i].length;
}
assert.equal(offset, symbols.length);
assert.equal(groups.size, 526);
assert.equal([...groups.values()].filter(g => g.length === 1).length, 87);

let seed = 0x554e2016;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

const trials = 5000;
let oneCycle = 0;
let oneCycleExactly90 = 0;
let oneCycleAtLeast90 = 0;
for (let trial = 0; trial < trials; trial++) {
  const sample = primeSums.slice();
  for (const indices of groups.values()) {
    const vals = indices.map(i => sample[i]);
    for (let j = vals.length - 1; j > 0; j--) {
      const k = random32() % (j + 1);
      [vals[j], vals[k]] = [vals[k], vals[j]];
    }
    indices.forEach((index, j) => { sample[index] = vals[j]; });
  }
  const all = cycles(sample);
  if (all.length === 1) {
    oneCycle++;
    if (all[0].length === 90) oneCycleExactly90++;
    if (all[0].length >= 90) oneCycleAtLeast90++;
  }
}
assert.equal(oneCycle, 1277);
assert.equal(oneCycleExactly90, 0);
assert.equal(oneCycleAtLeast90, 134);
assert.ok(Math.abs(ioc(firstRune) - 0.035705368289637954) < 1e-12);
assert.ok(Math.abs(ioc(dec) - 0.03245942571785269) < 1e-12);
assert.ok(Math.abs(ioc(enc) - 0.03495630461922597) < 1e-12);

// Independent small structural positive: an odd modular jump on an odd
// length creates one cycle, and a caller can reconstruct every successor.
const small = [2, 2, 2, 2, 2];
let smallState = 0;
const planted = [];
do {
  planted.push(smallState);
  smallState = (smallState + small[smallState]) % small.length;
} while (smallState !== 0);
assert.deepEqual(planted, [0, 2, 4, 1, 3]);
assert.equal(new Set(planted).size, small.length);

console.log(JSON.stringify({
  classification: "Exploratory source-phrase-motivated navigation; no LP2 plaintext or key",
  original: {
    runeCount: symbols.length,
    wordCount: N,
    sourceFirstPrimeSum: primeSums[0],
    firstRoute: route.path.slice(0, 20),
    pathBeforeCycle: route.firstCycleIndex,
    cycleLength: cycle.length,
    cyclesInWholeGraph: components.length,
    cycleEntry: route.returnWord,
    cycleFirst20: cycle.slice(0, 20)
  },
  directReadouts: [
    {name:"first-rune", ioc:ioc(firstRune), first30:runeLabels(firstRune.slice(0,30))},
    {name:"last-rune", ioc:ioc(lastRune), first30:runeLabels(lastRune.slice(0,30))},
    {name:"word-prime-sum-mod29", ioc:ioc(sumResidue), first30:runeLabels(sumResidue.slice(0,30))},
    {name:"word-length-mod29", ioc:ioc(wordLengths), first30:runeLabels(wordLengths.slice(0,30))},
    {name:"first-rune-minus-p56-totient", ioc:ioc(dec), first30:runeLabels(dec.slice(0,30))},
    {name:"first-rune-plus-p56-totient", ioc:ioc(enc), first30:runeLabels(enc.slice(0,30))}
  ],
  matchedNull: {
    seed:"0x554e2016",
    trials, preserved:"printed start-page, rune-word length, prime-sum multiset in each bin",
    bins:groups.size, singletonBins:87,
    exactlyOneCycle:oneCycle,
    exactlyOneCycleLength90:oneCycleExactly90,
    exactlyOneCycleLengthAtLeast90:oneCycleAtLeast90,
    atLeast90AndExactlyOnePlusOneP:
      (oneCycleAtLeast90 + 1) / (trials + 1),
    caution:"Exploratory selected model/length: conditional null is not a discovery-level p-value"
  },
  plantedSmallCycle:planted,
  conclusion:"The simple self-route is mathematically defined but its source readouts remain ciphertext-like. This is no decipherment."
}, null, 2));