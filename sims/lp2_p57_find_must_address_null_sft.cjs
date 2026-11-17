#!/usr/bin/env node
'use strict';

/**
 * Source-fixed p57 GP-word → printed 32×8 table address → unique outward
 * neighbor calibration. Run with Node.js 22:
 *   node sims/lp2_p57_find_must_address_null_sft.cjs
 *
 * Read-only. Shuffles preserve the original 256 two-character tokens and
 * the joint correlation of their base59/base60 readings.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt');

const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(tokens[150], '2X');
assert.equal(tokens[151], '39');
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
const decode = alphabet => tokens.map(token => {
  const x = alphabet.indexOf(token[0]);
  const y = alphabet.indexOf(token[1]);
  assert.ok(x >= 0 && y >= 0);
  return x * alphabet.length + y;
});
const values59 = decode(alphabet59);
const values60 = decode(alphabet60);

const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p57 = transcription.split('%').at(-1).replace(/[\/\r\n§]/g, '');
const words = p57.split(/[-.]/).filter(Boolean).map(raw => {
  const indices = [...raw].map(rune => runeToIndex.get(rune));
  assert.ok(indices.every(Number.isInteger));
  return {
    text: indices.map(index => corpus.translit[index]).join(''),
    sum: indices.reduce((acc, index) => acc + corpus.prime[index], 0),
    length: indices.length
  };
});
assert.equal(words.length, 20);
const find = words.find(word => word.text === 'FIND');
const must = words.find(word => word.text === 'MUST');
assert.equal(find.sum, 151);
assert.equal(must.sum, 186);
assert.equal(values59[150], 151);
assert.equal(values59[151], 186);
assert.equal(values60[150], 153);
assert.equal(values60[151], 189);

// A point on a ring qualifies only if exactly one cardinal neighbor lies on
// the next shallower ring. This removes corners and possible chosen directions.
function ringDepth(index) {
  const row = Math.floor(index / 8);
  const column = index % 8;
  return Math.min(row, 31 - row, column, 7 - column);
}
const outward = Array.from({ length: 256 }, (_, index) => {
  const row = Math.floor(index / 8);
  const column = index % 8;
  const depth = ringDepth(index);
  if (depth === 0) return -1;
  const adjacent = [];
  if (row > 0) adjacent.push(index - 8);
  if (row < 31) adjacent.push(index + 8);
  if (column > 0) adjacent.push(index - 1);
  if (column < 7) adjacent.push(index + 1);
  const exits = adjacent.filter(cell => ringDepth(cell) === depth - 1);
  return exits.length === 1 ? exits[0] : -1;
});
assert.equal(outward[150], 151);
const eligible = words.filter(word =>
  word.sum >= 1 && word.sum <= 256 && outward[word.sum - 1] >= 0);
assert.equal(eligible.length, 9);

/**
 * @param {number[]} values Immutable original parsed radix values.
 * @param {{sum:number}[]} trialWords Ordered original or matched reference words.
 * @param {number[]|null} permutation Original-token index in each trial cell.
 * @returns {number} Count of distinct ordered word-occurrence transitions.
 */
function transitionCount(values, trialWords, permutation = null) {
  const frequency = new Uint8Array(256);
  for (const word of trialWords) {
    if (word.sum >= 0 && word.sum < 256) frequency[word.sum] += 1;
  }
  let count = 0;
  for (const word of trialWords) {
    const address = word.sum - 1;
    if (address < 0 || address >= 256 || outward[address] < 0) continue;
    const firstValue = values[permutation ? permutation[address] : address];
    if (firstValue !== word.sum) continue;
    const exit = outward[address];
    const secondValue = values[permutation ? permutation[exit] : exit];
    count += frequency[secondValue];
    if (secondValue === word.sum) count -= 1;
  }
  return count;
}
assert.equal(transitionCount(values59, words), 1);
assert.equal(transitionCount(values60, words), 0);

// Explicit 32-bit seeded generator. Modulo reduction has an absolute
// per-draw deviation bounded by 1/2^32 and affects neither exact analytic
// fixed-pair probabilities nor the qualitative null inference.
let state = 0x6d3fbe21;
function next32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
function shuffle(order, rowsOnly) {
  for (let i = 0; i < 256; i += 1) order[i] = i;
  if (rowsOnly) {
    for (let row = 0; row < 32; row += 1) {
      const base = row * 8;
      for (let col = 7; col > 0; col -= 1) {
        const swapCol = next32() % (col + 1);
        [order[base + col], order[base + swapCol]] =
          [order[base + swapCol], order[base + col]];
      }
    }
  } else {
    for (let i = 255; i > 0; i -= 1) {
      const j = next32() % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
  }
}
function tableNull(trials, rowsOnly) {
  let exact = 0;
  let any59 = 0;
  let any60 = 0;
  let anyEither = 0;
  let total59 = 0;
  let total60 = 0;
  const order = Array.from({ length: 256 }, (_, index) => index);
  for (let k = 0; k < trials; k += 1) {
    shuffle(order, rowsOnly);
    const n59 = transitionCount(values59, words, order);
    const n60 = transitionCount(values60, words, order);
    total59 += n59;
    total60 += n60;
    if (n59 > 0) any59 += 1;
    if (n60 > 0) any60 += 1;
    if (n59 + n60 > 0) anyEither += 1;
    if (values59[order[150]] === 151 && values59[order[151]] === 186) exact += 1;
  }
  return { trials, rowsOnly, exact, any59, any60, anyEither, total59, total60 };
}

// The reference pool is sourced from solved LP1 prose (sections before 56),
// excluding editorial markup, numerical grids and comments. Transliteration
// is a declared approximation: GP has TH/NG/etc digraphs, and K/V/Q/Z are
// normalized to C/U/C/S. The p57 14-rune ineligible title-length word has
// no reference match and remains fixed. It has sum 451 and cannot address 256.
const gpIndex = new Map(corpus.translit.map((rune, index) => [rune, index]));
const digraphs = ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA'];
function toGp(word) {
  const source = word.replaceAll('K', 'C').replaceAll('V', 'U')
    .replaceAll('Q', 'C').replaceAll('Z', 'S');
  const indexes = [];
  for (let i = 0; i < source.length;) {
    const piece = digraphs.find(d => source.startsWith(d, i)) || source[i];
    if (!gpIndex.has(piece)) return null;
    indexes.push(gpIndex.get(piece));
    i += piece.length;
  }
  return {
    text: source,
    length: indexes.length,
    sum: indexes.reduce((acc, i) => acc + corpus.prime[i], 0)
  };
}
const lp1BeforeP56 = lp1.split('### 56')[0];
const pool = lp1BeforeP56.split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => /^[A-Z][A-Z .,;:!?'"-]*$/.test(line))
  .flatMap(line => line.match(/[A-Z]{2,}/g) || [])
  .map(toGp)
  .filter(Boolean);
const buckets = new Map();
for (const word of pool) {
  if (!buckets.has(word.length)) buckets.set(word.length, []);
  buckets.get(word.length).push(word);
}
assert.ok(words.every(word =>
  buckets.has(word.length) || word.sum > 256));
function referenceNull(trials) {
  let any59 = 0;
  let any60 = 0;
  let anyEither = 0;
  for (let k = 0; k < trials; k += 1) {
    const sample = words.map(word => {
      const bucket = buckets.get(word.length);
      return bucket ? bucket[next32() % bucket.length] : word;
    });
    const n59 = transitionCount(values59, sample);
    const n60 = transitionCount(values60, sample);
    if (n59 > 0) any59 += 1;
    if (n60 > 0) any60 += 1;
    if (n59 + n60 > 0) anyEither += 1;
  }
  return { trials, poolSize: pool.length, any59, any60, anyEither };
}

const trials = 300000;
const global = tableNull(trials, false);
const byRow = tableNull(trials, true);
const matchedLp1 = referenceNull(trials);
const sameRow = values59.slice(18 * 8, 19 * 8);
assert.equal(sameRow.filter(value => value === 151).length, 1);
assert.equal(sameRow.filter(value => value === 186).length, 1);


// Source-level conditional null for the purported omitted-f base59 alphabet.
// Preserve the original 256 leading digits exactly. A legal 8-bit base60 byte
// has 60 possible second digits after leading 0..3, but only 16 after 4.
// This calculation asks whether an unseen lower-case f is surprising under
// that explicitly *conditional*, iid byte-model. It is not a likelihood
// comparison between the two complete 256-byte codecs.
const secondSymbols = [...alphabet60];
const leading4 = tokens.filter(token => token[0] === '4').length;
const ordinary = tokens.length - leading4;
const secondObserved = new Set(tokens.map(token => token[1]));
assert.equal(leading4, 17);
assert.equal(ordinary, 239);
assert.deepEqual(secondSymbols.filter(symbol => !secondObserved.has(symbol)), ['f']);
const choose = (n, k) => {
  let value = 1n;
  for (let j = 1; j <= k; j += 1) {
    value = value * BigInt(n - j + 1) / BigInt(j);
  }
  return value;
};
/**
 * Exact count of second-digit assignments that contain all remaining allowed
 * symbols, given fixed leading digits and two groups of forbidden symbols.
 * @param {number} lowRemaining Number of legal high-leading-4 suffixes left.
 * @param {number} highRemaining Number of suffixes legal only after 0..3 left.
 * @param {number} bannedLow Already forbidden symbols in low group.
 * @param {number} bannedHigh Already forbidden symbols in high-only group.
 * @returns {bigint} Exact integer inclusion-exclusion count.
 */
function allRemainingUsed(lowRemaining, highRemaining, bannedLow = 0,
  bannedHigh = 0) {
  let total = 0n;
  for (let i = 0; i <= lowRemaining; i += 1) {
    for (let j = 0; j <= highRemaining; j += 1) {
      const sign = (i + j) % 2 ? -1n : 1n;
      const base60 = BigInt(60 - bannedLow - bannedHigh - i - j);
      const base16 = BigInt(16 - bannedLow - i);
      total += sign * choose(lowRemaining, i) * choose(highRemaining, j) *
        base60 ** BigInt(ordinary) * base16 ** BigInt(leading4);
    }
  }
  return total;
}
const allPossible = 60n ** BigInt(ordinary) * 16n ** BigInt(leading4);
const noMissing = allRemainingUsed(16, 44);
const exactlyOneMissingLow = 16n * allRemainingUsed(15, 44, 1, 0);
const exactlyOneMissingHigh = 44n * allRemainingUsed(16, 43, 0, 1);
const fixedScale = 10n ** 18n;
const probability = numerator =>
  Number(numerator * fixedScale / allPossible) / 1e18;
const radixOccupancy = {
  originalLeading4Count: leading4,
  originalLeading0to3Count: ordinary,
  missingSecondDigits: secondSymbols.filter(symbol => !secondObserved.has(symbol)),
  conditionalProbabilityAnyMissing: probability(allPossible - noMissing),
  conditionalProbabilityExactlyOneMissing: probability(
    exactlyOneMissingLow + exactlyOneMissingHigh),
  conditionalProbabilityFAbsent: Number(
    59n ** BigInt(ordinary) * fixedScale /
    (60n ** BigInt(ordinary))) / 1e18,
  conditionalProbabilityFOnlyMissing: probability(
    exactlyOneMissingHigh / 44n)
};
assert.ok(radixOccupancy.conditionalProbabilityAnyMissing > 0.60 &&
  radixOccupancy.conditionalProbabilityAnyMissing < 0.61);
assert.ok(radixOccupancy.conditionalProbabilityExactlyOneMissing > 0.38 &&
  radixOccupancy.conditionalProbabilityExactlyOneMissing < 0.39);
assert.ok(radixOccupancy.conditionalProbabilityFOnlyMissing > 0.0077 &&
  radixOccupancy.conditionalProbabilityFOnlyMissing < 0.0078);

// Both byte-valued codebooks have 256 legal encodings, 252 in common.
// All 256 original tokens fall within the overlap. Therefore two separately
// assumed iid uniformly random byte models give the observed EXACT sequence
// the same probability (1/256)^256. This makes a genuine likelihood tie.
const legal60 = new Set(Array.from({ length: 256 }, (_, value) =>
  alphabet60[Math.floor(value / 60)] + alphabet60[value % 60]));
const legal59 = new Set(Array.from({ length: 256 }, (_, value) =>
  alphabet59[Math.floor(value / 59)] + alphabet59[value % 59]));
const commonCodewords = [...legal60].filter(token => legal59.has(token));
assert.equal(legal60.size, 256);
assert.equal(legal59.size, 256);
assert.equal(commonCodewords.length, 252);
assert.ok(tokens.every(token => legal60.has(token) && legal59.has(token)));
const codebookComparison = {
  base60LegalCodewords: legal60.size,
  base59LegalCodewords: legal59.size,
  sharedCodewords: commonCodewords.length,
  originalTokensOutsideSharedSupport: tokens.filter(token =>
    !legal60.has(token) || !legal59.has(token)).length,
  base60Exclusive: [...legal60].filter(token => !legal59.has(token)),
  base59Exclusive: [...legal59].filter(token => !legal60.has(token)),
  exactOriginalSequenceUniformByteLikelihoodRatio59to60: 1
};

const result = {
  seed: '0x6d3fbe21',
  original: {
    p57WordOccurrences: words.length,
    eligibleInitialAddresses: eligible.map(word => [word.text, word.sum]),
    base59Transitions: transitionCount(values59, words),
    base60Transitions: transitionCount(values60, words),
    sourcePath: [[150, '2X', 151], [151, '39', 186]]
  },
  exactFixedPairPGlobal: values59.filter(value => value === 151).length *
    values59.filter(value => value === 186).length / (256 * 255),
  exactFixedPairPWithinOriginalRow: 1 / (8 * 7),
  global,
  byRow,
  matchedLp1,
  radixOccupancy,
  codebookComparison
};
console.log(JSON.stringify(result, null, 2));
