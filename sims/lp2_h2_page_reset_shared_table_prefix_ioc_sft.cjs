'use strict';

/**
 * Source-conditioned original-cipher gate for a specific H2 shortcut:
 * one globally shared secret 29x29 substitution tableau, but the
 * successive-prime-totient pointer and previous ciphertext are reset at
 * the beginning of each physical LP2 page (55 rune-bearing pages).
 *
 * An exact permutation-invariant diagnostic groups the first K glyphs
 * by their within-page position, pools across pages, and counts
 * same-ciphertext coincidences. Hidden skips are part of each 120-plant
 * native-GP control. A new secret tableau is drawn for every plant.
 *
 * This is NOT a universal exclusion of H2, chapter/book clocks, or
 * tables that vary across pages. Node.js 22, CommonJS, no dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sourceText = read('resources/control/gibran_prophet_58585.txt');

const N = 29;
const Q = 0.81;
const TRIALS = 120;
const WIDTHS = [8, 16, 32, 64];
const pages = gp.pages.filter((page) =>
  page.page <= 55 && page.indices.length > 0);
const lengths = pages.map((page) => page.indices.length);
const originalPages = pages.map((page) => page.indices);
const LENGTH = lengths.reduce((sum, length) => sum + length, 0);
assert.equal(pages.length, 55);
assert.equal(LENGTH, 12956);

const tokens = gp.translit.map((spelling, index) => ({ spelling, index }))
  .sort((a, b) => b.spelling.length - a.spelling.length);

/** @param {string} input @returns {number[]} */
function encodeWord(input) {
  const word = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) {
      out.push(21); i += 3; continue;
    }
    if (word.startsWith('IO', i)) {
      out.push(27); i += 2; continue;
    }
    const token = tokens.find(({ spelling }) => word.startsWith(spelling, i));
    assert.ok(token);
    out.push(token.index);
    i += token.spelling.length;
  }
  return out;
}
const corpus = (sourceText.match(/[A-Za-z]+/g) || []).flatMap(encodeWord);
assert.equal(corpus.length, 62492);

/** @param {number} seed */
function rng(seed) {
  let s = seed >>> 0;
  const u = () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  return { u, int: (n) => Math.floor(u() * n) };
}

/** @param {{int:(n:number)=>number}} random @returns {number[]} */
function permutation(random) {
  const a = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i -= 1) {
    const j = random.int(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Source-derived successive-prime totient modulo29 row labels.
const composite = new Uint8Array(120000);
const primeRows = [];
for (let p = 2; p < composite.length && primeRows.length < 6000; p += 1) {
  if (composite[p]) continue;
  primeRows.push((p - 1) % N);
  if (p * p < composite.length) {
    for (let k = p * p; k < composite.length; k += p) composite[k] = 1;
  }
}
assert.equal(primeRows.length, 6000);

/**
 * At each *within-page* slot j, ciphertext values over all 55 pages
 * must be the output of the same secret row if the key is reset and
 * skipped only under the declared q=.81 process. The within-j
 * coincidence statistic is invariant under that secret row's
 * permutation; synthetic controls include all random secret tables.
 *
 * @param {number[][]} sourcePages
 * @param {number} width
 * @returns {number}
 */
function pooledCoincidence(sourcePages, width) {
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < width; i += 1) {
    const counts = new Array(N).fill(0);
    for (const page of sourcePages) {
      if (i < page.length) counts[page[i]] += 1;
    }
    const n = counts.reduce((sum, v) => sum + v, 0);
    numerator += counts.reduce((sum, v) => sum + v * (v - 1), 0);
    denominator += n * (n - 1);
  }
  return numerator / denominator;
}

const original = WIDTHS.map((width) =>
  pooledCoincidence(originalPages, width));
const expectedOriginal = [
  0.03569023569023569,
  0.0345959595959596,
  0.035206228956228956,
  0.03492213804713805,
];
for (let i = 0; i < WIDTHS.length; i += 1) {
  assert.ok(Math.abs(original[i] - expectedOriginal[i]) < 1e-13);
}
const controls = WIDTHS.map(() => []);
for (let trial = 0; trial < TRIALS; trial += 1) {
  const random = rng((0x1079c77a + trial * 0x9e3779b9) >>> 0);
  const start = random.int(corpus.length - LENGTH);
  const plaintext = corpus.slice(start, start + LENGTH);
  const table = Array.from({ length: N }, () => permutation(random));
  let sourcePosition = 0;
  const syntheticPages = [];
  for (const pageLength of lengths) {
    const generated = [];
    let pointer = 0;
    let previousCipher = -1;
    for (let i = 0; i < pageLength; i += 1) {
      const plainRune = plaintext[sourcePosition++];
      let output = table[primeRows[pointer]][plainRune];
      while (output === previousCipher && random.u() < Q) {
        pointer += 1;
        output = table[primeRows[pointer]][plainRune];
      }
      generated.push(output);
      previousCipher = output;
      pointer += 1;
    }
    syntheticPages.push(generated);
  }
  assert.equal(sourcePosition, LENGTH);
  for (let k = 0; k < WIDTHS.length; k += 1) {
    controls[k].push(pooledCoincidence(syntheticPages, WIDTHS[k]));
  }
}
const summary = WIDTHS.map((width, k) => {
  const control = controls[k].slice().sort((a, b) => a - b);
  const atOrBelow = control.filter((value) => value <= original[k]).length;
  assert.equal(atOrBelow, 0, 'original joined page prefixes not H2-native');
  return {
    width,
    originalPooledIoC: original[k],
    syntheticMin: control[0],
    syntheticMedian: control[Math.floor(control.length / 2)],
    syntheticMax: control.at(-1),
    syntheticAtOrBelowOriginal: atOrBelow,
  };
});
console.log(JSON.stringify({
  status: 'PASS',
  originalRunePages: pages.length,
  originalTotalRunes: LENGTH,
  syntheticTrials: TRIALS,
  condition: 'Shared fixed secret tableau and prime-row clock reset per physical page',
  originalCipherInputUsed: true,
  authenticPlaintextRecovered: false,
  results: summary,
}, null, 2));
