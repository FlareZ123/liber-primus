'use strict';

/**
 * Exact original-input, all-seed test of the p39 red quadratic as an independent
 * two-state GP29 additive pad on each of sixteen 203-rune floral black rows.
 *
 * Read-only Windows Node.js 22 SFT, no network and no packages.
 * Run directly from any current working directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const solved = load('resources/external/relikd-solved-gp29-native-v1.json');

/** @param {number} n @returns {number} */
function mod29(n) { return ((n % 29) + 29) % 29; }

/** @param {number[]} sequence @returns {number} */
function equalPairs(sequence) {
  const hist = new Uint16Array(29);
  for (const x of sequence) { assert.ok(Number.isInteger(x) && x >= 0 && x < 29); hist[x]++; }
  let pairs = 0;
  for (const count of hist) pairs += count * (count - 1) / 2;
  return pairs;
}

/**
 * The monic p39 red factor is x^2+10x+25=(x-24)^2 in GF29.
 * Its autonomous pad obeys k[i+2]=19*k[i+1]+4*k[i] (mod29).
 * @param {number[]} symbols
 * @param {number} first
 * @param {number} second
 * @param {1|-1} sign
 * @returns {number[]}
 */
function cipher(symbols, first, second, sign) {
  const output = [];
  let x = first, y = second;
  for (const symbol of symbols) {
    output.push(mod29(symbol + sign * x));
    const next = mod29(19 * y + 4 * x);
    x = y;
    y = next;
  }
  return output;
}

/**
 * Maximum equality pairs attainable under ALL 841 start states.
 * A plus-sign decoder is already included, since negating both free
 * starting states produces the opposite pad.
 * @param {number[]} row
 * @returns {{pairs:number,seed:[number,number]}}
 */
function allSeedUpperBound(row) {
  assert.equal(row.length, 203);
  let bestPairs = -1;
  /** @type {[number,number]} */
  let bestSeed = [0, 0];
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      const hist = new Uint16Array(29);
      let x = a, y = b;
      for (const symbol of row) {
        hist[mod29(symbol - x)]++;
        const next = mod29(19 * y + 4 * x);
        x = y;
        y = next;
      }
      let pairs = 0;
      for (const count of hist) pairs += count * (count - 1) / 2;
      if (pairs > bestPairs) { bestPairs = pairs; bestSeed = [a, b]; }
    }
  }
  return { pairs: bestPairs, seed: bestSeed };
}

const triad = corpus.pages.find((p) => p.page === 39).indices.slice(119, 122);
assert.deepEqual(triad, [27, 5, 15]);
const G = [15, 5, 27]; // descending source polynomial
assert.equal(mod29(15 * 24 * 24 + 5 * 24 + 27), 0);
assert.equal(mod29(30 * 24 + 5), 0);
assert.equal(grid.pages.flatMap((p) => p.tokens)[0], '3N');
assert.equal(grid.pages.flatMap((p) => p.bytes)[0], 203);

const marks = new Map(ink.pages.map((p) => [p.page, p.red_spans || []]));
const expectedRed = new Map([[40, [{ start: 0, length: 8 }]],
  [53, [{ start: 128, length: 51 }]],
  [54, [{ start: 0, length: 9 }]]]);
for (let p = 40; p <= 55; p++) {
  const found = marks.get(p);
  const expected = expectedRed.get(p) || [];
  assert.deepEqual(found.map((s) => ({ start: s.start, length: s.length })), expected);
}
const black = [];
for (let p = 40; p <= 55; p++) {
  const original = corpus.pages.find((x) => x.page === p);
  for (let i = 0; i < original.indices.length; i++) {
    if (marks.get(p).some((span) => i >= span.start && i < span.start + span.length)) continue;
    black.push(original.indices[i]);
  }
}
assert.equal(black.length, 16 * 203);
const rows = Array.from({ length: 16 }, (_, r) => black.slice(r * 203, (r + 1) * 203));

const originalBounds = rows.map(allSeedUpperBound);
const actualPairs = originalBounds.map((r) => r.pairs);
assert.deepEqual(actualPairs, [853, 826, 804, 808, 820, 812, 806, 837, 796, 829, 793, 796, 828, 804, 808, 845]);
const sourceMax = Math.max(...actualPairs);
const sourceMean = actualPairs.reduce((a, b) => a + b, 0) / (16 * 203 * 202 / 2);
assert.equal(sourceMax, 853);

// Use ONLY genuine contiguous solved GP29 windows from within a solved section.
// No word substitution, synthetic prose, or mixing unrelated text sections.
const runeIndex = new Map(solved.runes.map((r, i) => [r, i]));
let nControlWindows = 0;
let minControlPairs = Infinity;
let maxControlPairs = -1;
const controlsBySection = [];
for (const section of solved.sections) {
  const indices = Array.from(section.source_text).filter((r) => runeIndex.has(r))
    .map((r) => runeIndex.get(r));
  let minimum = Infinity, maximum = -1, count = 0;
  for (let start = 0; start + 203 <= indices.length; start++) {
    const pairs = equalPairs(indices.slice(start, start + 203));
    minimum = Math.min(minimum, pairs);
    maximum = Math.max(maximum, pairs);
    count++;
  }
  if (!count) continue;
  controlsBySection.push({ section: section.name, count, minimum, maximum });
  minControlPairs = Math.min(minControlPairs, minimum);
  maxControlPairs = Math.max(maxControlPairs, maximum);
  nControlWindows += count;
}
assert.equal(nControlWindows, 1561);
assert.equal(minControlPairs, 1096);
assert.ok(sourceMax < minControlPairs);

// Real solved-Cicada native-language positive: 203 source symbols,
// encrypted under a secret two-rune seed, exactly recovered.
const welcome = solved.sections.find((s) => s.name === '0_welcome');
const native = Array.from(welcome.source_text).filter((r) => runeIndex.has(r))
  .map((r) => runeIndex.get(r)).slice(0, 203);
assert.equal(native.length, 203);
const encrypted = cipher(native, 4, 9, 1);
assert.deepEqual(cipher(encrypted, 4, 9, -1), native);
const plantedBound = allSeedUpperBound(encrypted);
assert.ok(plantedBound.pairs >= equalPairs(native));
assert.ok(equalPairs(native) > sourceMax);
console.log(JSON.stringify({
  status: 'PASS',
  input: 'LP2 p40–p55 black 3248=16x203 original GP indices',
  source: 'p39 red G=(x-24)^2, exhaustive 29^2 seeds independently per row',
  allSeeds: 16 * 841,
  originalPerRowMaxEqualPairs: actualPairs,
  originalMaxEqualPairs: sourceMax,
  originalUpperBoundMeanRowIoC: sourceMean,
  solvedNativeControlWindows: nControlWindows,
  solvedNativeMinEqualPairs: minControlPairs,
  solvedNativeMaxEqualPairs: maxControlPairs,
  solvedNativeBySection: controlsBySection,
  nativePositiveExact: native.length + '/' + native.length,
  scope: 'direct GP29 additive pad only; nonnative payloads and varying-state operations remain open'
}, null, 2));
