'use strict';

/**
 * Original-source last-layer test of width-19 rune transposition on LP2 p8–p14.
 * The p8 red heading begins Roman XIX (19), and p8–p14 contains 19×91 runes.
 *
 * Decode a proposed terminal rectangular permutation. If a 29-symbol
 * low-doublet chain cipher preceded that permutation, the transmitted
 * ciphertext should ordinarily lose its low-doublet fingerprint.
 * On original data, test this architectural prediction directly.
 *
 * Windows/Node.js 22 SFT:
 * node sims/lp2_p8_14_xix19_column_finalorder_original_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const source = JSON.parse(fs.readFileSync(path.join(__dirname,
  '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const width = 19;
const section = source.pages.filter((p) => p.page >= 8 && p.page <= 14);
const original = section.flatMap((p) => p.indices);
const n = original.length;
const height = n / width;

assert.equal(section.length, 7);
assert.deepEqual(section.map((p) => p.indices.length),
  [255, 268, 263, 273, 261, 272, 137]);
assert.equal(n, 1729);
assert.equal(height, 91);
assert.deepEqual(original.slice(0, 4), [14, 10, 14, 19]);
assert.equal(original.slice(0, 4).map((x) => source.translit[x]).join(''),
  'XIXM');

/** @param {number[]} values @returns {number} */
function doublets(values) {
  let n = 0;
  for (let i = 1; i < values.length; i++) n += Number(values[i] === values[i - 1]);
  return n;
}

/** @param {number[]} input @returns {number[]} */
function rowToColumn(input) {
  assert.equal(input.length % width, 0);
  const rows = input.length / width;
  const out = [];
  for (let c = 0; c < width; c++) {
    for (let r = 0; r < rows; r++) out.push(input[r * width + c]);
  }
  return out;
}
/** @param {number[]} input @returns {number[]} */
function columnToRow(input) {
  assert.equal(input.length % width, 0);
  const rows = input.length / width;
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < width; c++) out.push(input[c * rows + r]);
  }
  return out;
}
/** @param {number[]} input @returns {number[]} */
function reverseOddRows(input) {
  assert.equal(input.length % width, 0);
  const out = input.slice();
  for (let r = 1; r < input.length / width; r += 2) {
    const start = r * width;
    for (let c = 0; c < width; c++) out[start + c] = input[start + width - 1 - c];
  }
  return out;
}
/** @param {number[]} input @returns {number[]} */
function rowToReverseColumn(input) {
  assert.equal(input.length % width, 0);
  const rows = input.length / width;
  const out = [];
  for (let c = width - 1; c >= 0; c--) {
    for (let r = 0; r < rows; r++) out.push(input[r * width + c]);
  }
  return out;
}
/** @param {number[]} input @returns {number[]} */
function reverseColumnToRow(input) {
  assert.equal(input.length % width, 0);
  const rows = input.length / width;
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < width; c++) {
      out.push(input[(width - 1 - c) * rows + r]);
    }
  }
  return out;
}

const operators = [
  {name: 'row-written then column-read', encode: rowToColumn, decode: columnToRow},
  {name: 'column-written then row-read', encode: columnToRow, decode: rowToColumn},
  {name: 'snake-row-written then column-read',
    encode: (x) => rowToColumn(reverseOddRows(x)),
    decode: (x) => reverseOddRows(columnToRow(x))},
  {name: 'row-written then reversed-column-read',
    encode: rowToReverseColumn, decode: reverseColumnToRow},
];
const untouchedDoublets = doublets(original);
assert.equal(untouchedDoublets, 9);
const observed = operators.map((o) => ({
  mode: o.name, original: untouchedDoublets,
  decoded: doublets(o.decode(original)),
  fraction: doublets(o.decode(original)) / (n - 1),
  first50: o.decode(original).slice(0, 50)
    .map((v) => source.translit[v]).join(''),
}));
assert.deepEqual(observed.map((v) => v.decoded), [61, 51, 55, 61]);

const known = source.pages.find((p) => p.page === 57).indices;
assert.equal(known.length, 95); // 5×19 genuine solved native-GP cleartext.
for (const operator of operators) {
  const encrypted = operator.encode(known);
  assert.deepEqual(operator.decode(encrypted), known);
  const back = operator.decode(original);
  assert.deepEqual(operator.encode(back), original);
}

// Fixed-seed, source-frequency-matched no-repeat *inner* stream controls,
// with the nine original within-chapter repeats imposed at exact source sites.
// Test four plausible outer transpositions with the same observation function.


// An additional direct plaintext-recovery test: combine each *proposed*
// 19-column terminal permutation with the only authentic LP2 p56 cipher.
// The p56 plaintext-F branch copies F=0 without advancing prime key state.
// Exhaustive DP retains all legal F histories, so an empty state set is a
// mathematical impossibility under this exact decoder, independent of score.
const primes = [];
for (let candidate = 2; primes.length <= n; candidate++) {
  let isPrime = true;
  for (const prime of primes) {
    if (prime * prime > candidate) break;
    if (candidate % prime === 0) {
      isPrime = false;
      break;
    }
  }
  if (isPrime) primes.push(candidate);
}
const mod = (x) => ((x % 29) + 29) % 29;
/** @param {number[]} ciphertext @param {number} sign
 *  @returns {{reachable: number, terminal_states: number}} */
function phiFInverse(ciphertext, sign) {
  let states = new Set([0]);
  for (let at = 0; at < ciphertext.length; at++) {
    const c = ciphertext[at];
    const next = new Set();
    for (const primeClock of states) {
      if (c === 0) next.add(primeClock);
      const decoded = mod(c + sign * (primes[primeClock] - 1));
      if (decoded !== 0) next.add(primeClock + 1);
    }
    if (next.size === 0) return {reachable: at, terminal_states: 0};
    states = next;
  }
  return {reachable: ciphertext.length, terminal_states: states.size};
}
/** @param {number[]} plaintext @param {number} encryptionSign
 *  @returns {number[]} */
function phiFEncrypt(plaintext, encryptionSign) {
  let primeClock = 0;
  return plaintext.map((p) => {
    if (p === 0) return 0;
    const c = mod(p + encryptionSign * (primes[primeClock] - 1));
    primeClock++;
    return c;
  });
}
const phiFOriginal = [
  {mode: 'unmodified chapter',
    subtract: phiFInverse(original, -1).reachable,
    add: phiFInverse(original, 1).reachable},
  ...operators.map((operator) => ({
    mode: operator.name,
    subtract: phiFInverse(operator.decode(original), -1).reachable,
    add: phiFInverse(operator.decode(original), 1).reachable,
  })),
];
assert.deepEqual(phiFOriginal.map((x) => [x.subtract, x.add]),
  [[30, 26], [20, 47], [15, 215], [125, 47], [6, 11]]);
// Native solved-p57 GP is the real plaintext donor. It is forward encrypted
// with the original p56 F-transport, then transposed and exactly untransposed.
const plantedP57 = Array.from({length: n},
  (_, i) => known[i % known.length]);
for (const operator of operators) {
  for (const sign of [-1, 1]) {
    const encrypted = phiFEncrypt(plantedP57, sign);
    const presented = operator.encode(encrypted);
    const recoveredCipher = operator.decode(presented);
    assert.deepEqual(recoveredCipher, encrypted);
    const reach = phiFInverse(recoveredCipher, -sign);
    assert.equal(reach.reachable, n);
  }
}

const histogram = Array(29).fill(0);
for (const v of original) histogram[v]++;
const repeatSites = [];
for (let i = 1; i < n; i++) {
  if (original[i] === original[i - 1]) repeatSites.push(i);
}
assert.equal(repeatSites.length, 9);
let randomState = 0x33011914;
/** @returns {number} */
function nextRandom() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}
/** @param {number} previous @returns {number} */
function sampleExcept(previous) {
  const excluded = previous < 0 ? 0 : histogram[previous];
  let draw = nextRandom() % (n - excluded);
  for (let x = 0; x < histogram.length; x++) {
    if (x === previous) continue;
    if (draw < histogram[x]) return x;
    draw -= histogram[x];
  }
  throw Error('unreachable source-frequency weighted sample');
}
const trials = 2000;
const nullStats = operators.map((operator) =>
  ({mode: operator.name, min: Infinity, max: -Infinity,
    total: 0, atMostObserved: 0}));
const repeatMask = new Set(repeatSites);
for (let trial = 0; trial < trials; trial++) {
  const inner = [];
  for (let i = 0; i < n; i++) {
    inner.push(repeatMask.has(i) ? inner[i - 1] :
      sampleExcept(i ? inner[i - 1] : -1));
  }
  assert.equal(doublets(inner), 9);
  for (let j = 0; j < operators.length; j++) {
    const candidate = operators[j].encode(inner);
    const c = doublets(candidate);
    const stats = nullStats[j];
    stats.min = Math.min(stats.min, c);
    stats.max = Math.max(stats.max, c);
    stats.total += c;
    stats.atMostObserved += Number(c <= untouchedDoublets);
  }
}
const controls = nullStats.map((s) => ({
  mode: s.mode, trials, minimum_doublets: s.min, maximum_doublets: s.max,
  mean_doublets: Number((s.total / trials).toFixed(3)),
  samples_at_or_below_original9: s.atMostObserved,
}));
assert.ok(controls.every((s) =>
  s.samples_at_or_below_original9 === 0 && s.minimum_doublets >= 15));
console.log(JSON.stringify({
  result: 'FULL-P8-P14 ORIGINAL FINGERPRINT IS INCOMPATIBLE WITH FOUR SIMPLE TERMINAL WIDTH19 TRANSPOSITION MODELS UNDER MATCHED NO-REPEAT INNER NULL',
  source: 'original complete illustrated p8–p14 and red XIX title',
  pages: section.map((p) => p.page),
  source_exact_runes: n,
  shape: {rows: height, columns: width},
  observed_source_doublets: untouchedDoublets,
  expected_random_doublets_approx: (n - 1) / 29,
  original_full_inverses: observed,
  known_native_gp_exact_plants: operators.length,
  authentic_phi_F_inverse_original_complete_rune_prefixes: phiFOriginal,
  authentic_phi_F_native_GP_plants: operators.length * 2,
  source_frequency_matched_controls: controls,
  scope: 'conditional last-layer architecture; does not exclude an earlier transposition before a final anti-repeat encoder or source-keyed nonrectangular transport',
}, null, 2));
