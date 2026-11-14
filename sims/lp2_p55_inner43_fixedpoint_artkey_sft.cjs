'use strict';

/**
 * Original-source p55 strict-word-interior GF(29) functional graph:
 * two fixed points (5 and 22), exact factor quotient, and one historical
 * prime-totient consumer. An exploratory arithmetic/art hypothesis only.
 *
 * Run from repository root: node sims/lp2_p55_inner43_fixedpoint_artkey_sft.cjs
 * Node.js 22, CommonJS; no package dependencies and no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const blocks = read('resources/liber-primus/lp2-transcription.txt').split('%');
const index = new Map(corpus.runes.map((rune, i) => [rune, i]));
const mod = (value) => ((value % 29) + 29) % 29;

/** @param {string} source @returns {number[][]} */
function parseWords(source) {
  const words = [];
  let word = [];
  for (const char of source) {
    if (index.has(char)) word.push(index.get(char));
    else if ('-.&$§'.includes(char)) {
      if (word.length) words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

/** @param {number} page @returns {number[][]} */
function pageWords(page) {
  assert.ok(Number.isInteger(page) && page >= 0 && page <= 57 && page !== 50);
  const words = parseWords(blocks[page < 50 ? page : page - 1]);
  const reference = corpus.pages.find((item) => item.page === page);
  assert.ok(reference);
  assert.deepEqual(words.flat(), reference.indices, 'Original transcription mismatch for p' + page);
  return words;
}

/** @param {number[]} coefficients @param {number} x @returns {number} */
function evaluate(coefficients, x) {
  let result = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) {
    result = mod(result * x + coefficients[i]);
  }
  return result;
}

/**
 * Complete functional graph with canonical cycle labels.
 * @param {number[]} coefficients
 * @returns {{map:number[],fixed:number[],basins:Map<string,number>,cycles:number[][]}}
 */
function graph(coefficients) {
  const mapping = Array.from({ length: 29 }, (_, x) => evaluate(coefficients, x));
  const fixed = mapping.flatMap((value, i) => value === i ? [i] : []);
  const basins = new Map();
  const canonicalCycles = new Map();
  for (let start = 0; start < 29; start++) {
    const seen = new Map();
    let current = start;
    while (!seen.has(current)) {
      seen.set(current, seen.size);
      current = mapping[current];
    }
    const cycle = [...seen.keys()].slice(seen.get(current)).sort((a, b) => a - b);
    const key = cycle.join(',');
    basins.set(key, (basins.get(key) || 0) + 1);
    canonicalCycles.set(key, cycle);
  }
  const cycles = [...canonicalCycles.values()].sort((a, b) => a[0] - b[0]);
  return { map: mapping, fixed, basins, cycles };
}

/** @param {ReturnType<typeof graph>} g @returns {boolean} */
function has27And2FixedBasins(g) {
  return g.cycles.length === 2
    && g.cycles.every((cycle) => cycle.length === 1)
    && [...g.basins.values()].sort((a, b) => a - b).join(',') === '2,27';
}

const words = pageWords(55);
assert.deepEqual(words.map((word) => word.length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const full = words.flat();
const inside = words.flatMap((word) => word.slice(1, -1));
assert.equal(full.length, 76);
assert.equal(inside.length, 43);
assert.deepEqual(inside.slice(0, 8), [19, 10, 12, 6, 23, 2, 27, 24]);
const g = graph(inside);
assert.deepEqual(g.fixed, [5, 22]);
assert.deepEqual(g.cycles, [[5], [22]]);
assert.deepEqual(Object.fromEntries(g.basins), { '5': 2, '22': 27 });
assert.equal(g.map[17], 5);
assert.deepEqual([24, 18, 23, 4, 6, 19, 22].map((x) => g.map[x]),
  [18, 23, 4, 6, 19, 22, 22]);
assert.equal(mod(3301), 24);
assert.equal(mod(1033), 18);
assert.equal(mod(5 * 22), 23);
const terminal = ink.pages.find((record) => record.page === 57);
assert.ok(terminal.large_punctuation.some((event) =>
  event[0] === 95 && event[1] === 23 && event[2] === 'red'));

const fullGraph = graph(full);
const reverseGraph = graph([...inside].reverse());
assert.deepEqual(fullGraph.fixed, [1, 24]);
assert.deepEqual(reverseGraph.fixed, [20]);
const p53Graph = graph(pageWords(53).flatMap((word) => word.slice(1, -1)));
assert.deepEqual(p53Graph.fixed, [7]);

// The two fixed points imply (P(X)-X)=(X-5)(X-22)*Q(X) in GF(29)[X].
// Ascending divisor coefficients are [110, -27, 1] mod 29 = [23,2,1].
const divisor = [23, 2, 1];
const remainder = [...inside];
remainder[1] = mod(remainder[1] - 1);
const quotient = Array(inside.length - 2).fill(0);
for (let power = remainder.length - 1; power >= 2; power--) {
  const coefficient = remainder[power];
  quotient[power - 2] = coefficient;
  for (let j = 0; j < divisor.length; j++) {
    remainder[power - 2 + j] = mod(remainder[power - 2 + j] - coefficient * divisor[j]);
  }
}
assert.deepEqual(remainder.slice(0, 2), [0, 0]);
assert.ok(remainder.every((coefficient) => coefficient === 0));
assert.equal(quotient.length, 41);
assert.deepEqual(quotient.slice(0, 8), [21, 20, 13, 26, 7, 16, 2, 9]);

/** @param {number} n @returns {number[]} */
function primes(n) {
  const output = [];
  for (let candidate = 2; output.length < n; candidate++) {
    let prime = true;
    for (let k = 2; k * k <= candidate; k++) {
      if (candidate % k === 0) { prime = false; break; }
    }
    if (prime) output.push(candidate);
  }
  return output;
}
const primeList = primes(160);

/**
 * Exact p56 historical plaintext-F-bypass inverse, first-prime clock zero.
 * Every ciphertext F position can be literal or shifted; ordinary decoded
 * F without a literal bypass is illegal under the known solved encoder.
 * @param {number[]} cipher
 * @returns {{mask:number,plain:number[],ioc:number}[]}
 */
function totientInverse(cipher) {
  const fPositions = cipher.flatMap((value, i) => value === 0 ? [i] : []);
  assert.ok(fPositions.length < 15, 'Bounded F branch enumeration');
  const outputs = [];
  for (let mask = 0; mask < (1 << fPositions.length); mask++) {
    let clock = 0;
    let valid = true;
    const plain = [];
    for (let position = 0; position < cipher.length; position++) {
      const flag = fPositions.indexOf(position);
      const literal = flag !== -1 && (mask & (1 << flag)) !== 0;
      const value = literal ? 0 : mod(cipher[position] - (primeList[clock++] - 1));
      if (!literal && value === 0) { valid = false; break; }
      plain.push(value);
    }
    if (!valid) continue;
    const counts = Array(29).fill(0);
    for (const value of plain) counts[value]++;
    const ioc = counts.reduce((sum, count) => sum + count * (count - 1), 0)
      / (plain.length * (plain.length - 1));
    outputs.push({ mask, plain, ioc });
  }
  return outputs;
}

/** @param {number[]} plain @returns {number[]} */
function totientEncrypt(plain) {
  let clock = 0;
  return plain.map((value) => value === 0
    ? 0 : mod(value + primeList[clock++] - 1));
}
const positive = corpus.pages.find((item) => item.page === 57).indices.slice(0, 41);
assert.equal(positive.length, 41);
assert.ok(totientInverse(totientEncrypt(positive))
  .some((row) => row.plain.every((value, i) => value === positive[i])));
const decoded = totientInverse(quotient);
assert.deepEqual(decoded.map((row) => row.mask), [1, 2, 3]);
assert.ok(decoded.every((row) => row.ioc < 0.047));

// Source panel: all 57 rune-bearing physical pp0-57. This comparison is
// exploratory; p56/p57 are known text and page lengths vary.
const graphMatches = [];
for (let page = 0; page <= 57; page++) {
  if (page === 50) continue;
  const core = pageWords(page).flatMap((word) => word.slice(1, -1));
  if (has27And2FixedBasins(graph(core))) graphMatches.push(page);
}
assert.deepEqual(graphMatches, [34, 55]);

// Uniform random function P(two distinct singleton attractors with basin
// sizes 27 and 2) = 29*28*27^26 / 29^29, by Cayley's rooted-tree count.
const exactNull = 29 * 28 * Math.pow(27, 26) / Math.pow(29, 29);
assert.ok(Math.abs(exactNull - 0.005193641379188597) < 1e-12);

// Fixed-source-inventory Monte Carlo: Fisher-Yates rune-order shuffles.
// xorshift32 is explicitly deterministic; no external PRNG library.
let state = 0x20261114;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
let sameShape = 0;
let anchoredFixed = 0;
let anchoredShape = 0;
const replicates = 100000;
for (let trial = 0; trial < replicates; trial++) {
  const shuffled = [...inside];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = random32() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const result = graph(shuffled);
  const anchor = result.fixed.length === 2
    && result.fixed[0] === 5 && result.fixed[1] === 22;
  if (anchor) anchoredFixed++;
  if (has27And2FixedBasins(result)) {
    sameShape++;
    if (anchor && result.basins.get('22') === 27) anchoredShape++;
  }
}
assert.deepEqual([sameShape, anchoredFixed, anchoredShape], [492, 50, 0]);

console.log(JSON.stringify({
  classification: 'Source-derived arithmetic and candidate decode, no plaintext recovery',
  page: 55, fullRunes: 76, interiorRunes: 43,
  fixedPoints: g.fixed, basins: Object.fromEntries(g.basins),
  orbit3301: [24, 18, 23, 4, 6, 19, 22],
  artAnchors: 'LP1 p5 moth reused on LP2 p55; LP1 pp14-16 reclining figure reused on LP2 p22',
  terminalDotCount: 23,
  fixedFactorAscending: divisor, quotientLength: quotient.length,
  quotientGP: quotient.map((value) => corpus.translit[value]).join(''),
  p56TotientQuotientCandidates: decoded.map((row) => ({
    mask: row.mask, ioc: row.ioc,
    transliteration: row.plain.map((value) => corpus.translit[value]).join('')
  })),
  originalPageGraphShapeMatches: graphMatches,
  uniformFunctionShapeProbability: exactNull,
  fixedMultisetShuffle: { seed: '0x20261114', replicates, sameShape,
    anchoredFixed, anchoredShape },
  controls: { fullPageFixed: fullGraph.fixed, reversedInteriorFixed: reverseGraph.fixed,
    otherMothPage53Fixed: p53Graph.fixed, nativePrimeTotientPlant: 'PASS' },
  caveat: 'The polynomial, fixed-point/word-interior interpretation and next operation are not first-party instructions. The original p55 ciphertext remains undeciphered.'
}, null, 2));
