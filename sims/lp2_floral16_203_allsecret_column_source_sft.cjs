'use strict';

/**
 * Source-original 16x203 floral black register: a key-independent
 * obstruction to any deterministic fixed per-column GP29 encoding of
 * source-native English. A column-dependent bijection is a special case.
 *
 * All original ciphertext and ink offsets are read from repository sources.
 * Three independent literary donors are used as finite language controls.
 * Node.js 22, CommonJS, read-only, no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pageLengths = [231, 273, 272, 274, 273, 270, 270, 274, 271, 66, 0, 92, 263, 179, 232, 76];

/** @type {number[]} */
const black = [];
/** @type {{page:number, end:number, black:number}[]} */
const pageBlackEnds = [];
for (let page = 40; page <= 55; page++) {
  const original = corpus.pages.find(p => p.page === page);
  assert.ok(original);
  assert.equal(original.indices.length, pageLengths[page - 40]);
  const annotation = ink.pages.find(p => p.page === page);
  const spans = annotation?.red_spans || [];
  const red = new Set(spans.flatMap(s =>
    Array.from({length: s.length}, (_, i) => s.start + i)));
  for (let i = 0; i < original.indices.length; i++) {
    const x = original.indices[i];
    assert.ok(Number.isInteger(x) && x >= 0 && x < 29);
    if (!red.has(i)) black.push(x);
  }
  pageBlackEnds.push({page, end:black.length, black:original.indices.length-red.size});
}
assert.equal(black.length, 3248);
const redCounts = [40,53,54].map(page => ink.pages.find(p =>
  p.page === page).red_spans.reduce((sum,s) => sum + s.length,0));
assert.deepEqual(redCounts, [8,51,9]);
const printedBlackSeams = pageBlackEnds.filter(x => x.page !== 50 && x.page !== 55);
assert.equal(printedBlackSeams.length, 14);
const seamOffsets = printedBlackSeams.map(x => x.end % 203);
assert.deepEqual(seamOffsets, [20,90,159,27,97,164,28,99,167,30,122,182,107,127]);
assert.ok(seamOffsets.every(remainder => remainder > 0));


/**
 * Exact number of equal unordered pairs across sixteen rows for each of
 * 203 fixed source positions, where every row is 203 contiguous runes.
 * @param {number[]} stream Exactly 3248 GP29 symbol indices
 * @returns {number}
 */
function equalColumnPairs(stream) {
  assert.equal(stream.length, 16 * 203);
  let pairs = 0;
  for (let column = 0; column < 203; column++) {
    const histogram = new Uint16Array(29);
    for (let row = 0; row < 16; row++) {
      histogram[stream[row * 203 + column]]++;
    }
    for (const n of histogram) pairs += n * (n - 1) / 2;
  }
  return pairs;
}

const originalPairs = equalColumnPairs(black);
assert.equal(originalPairs, 857);
assert.equal(16 * 15 / 2 * 203, 24360);

/** Canonical approximate Latin-to-GP rune encoding used for literary controls. */
const translit = new Map(corpus.translit.map((x, i) => [x, i]));
for (const [from, to] of [['K', 'C'], ['Q', 'C'], ['V', 'U'], ['Z', 'S']]) {
  translit.set(from, translit.get(to));
}
const tokens = [...translit.keys()].sort((a, b) => b.length - a.length);

/**
 * Longest-match Latin words to GP29, without any postselection.
 * @param {string} text
 * @returns {number[]}
 */
function nativeGP(text) {
  /** @type {number[]} */
  const output = [];
  for (const match of text.toUpperCase().matchAll(/[A-Z]+/g)) {
    const word = match[0];
    for (let i = 0; i < word.length;) {
      const token = tokens.find(t => word.startsWith(t, i));
      assert.ok(token, 'Unexpected native Latin character');
      output.push(translit.get(token));
      i += token.length;
    }
  }
  return output;
}

/**
 * Fixed-stride finite donor windows. Sampling 203-rune shifts ensures
 * reproducibility and includes overlapping windows; these are NOT independent.
 * @param {number[]} tape
 */
function controls(tape) {
  /** @type {number[]} */
  const observed = [];
  for (let i = 0; i + 3248 <= tape.length; i += 203) {
    observed.push(equalColumnPairs(tape.slice(i, i + 3248)));
  }
  const sorted = observed.toSorted((a, b) => a - b);
  return {
    nativeRunes: tape.length,
    windows: observed.length,
    minimum: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    maximum: sorted[sorted.length - 1],
    noMoreThanSource: observed.filter(x => x <= originalPairs).length,
    fifthPercentile: sorted[Math.floor(sorted.length * .05)],
  };
}

const donors = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 0],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 7000],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 1100],
];
const measured = {};
for (const [name, filename, cut] of donors) {
  const text = read(filename).slice(cut);
  measured[name] = controls(nativeGP(text));
}
assert.deepEqual(measured, {
  Shakespeare: {nativeRunes:218800,windows:1062,minimum:1321,median:1467,maximum:1648,noMoreThanSource:0,fifthPercentile:1386},
  Gibran: {nativeRunes:58898,windows:275,minimum:1333,median:1493,maximum:1639,noMoreThanSource:0,fifthPercentile:1392},
  Emerson: {nativeRunes:323911,windows:1580,minimum:1361,median:1533,maximum:1662,noMoreThanSource:0,fifthPercentile:1450},
});

/** @param {number} x */
function inv29(x) {
  for (let y = 1; y < 29; y++) if (x * y % 29 === 1) return y;
  throw new Error('GP29 multiplier was not invertible');
}
// One full positive: a secret affine key per printed column bijectively
// encrypts a genuine GP29 3248-rune donor. Recover plaintext and pairs.
const clear = nativeGP(read(donors[0][1])).slice(0, 3248);
const scale = Array.from({length:203}, (_, c) => 1 + (5 * c + 7) % 28);
const shift = Array.from({length:203}, (_, c) => 17 * c % 29);
const encrypted = clear.map((x, i) =>
  (scale[i % 203] * x + shift[i % 203]) % 29);
const decoded = encrypted.map((x, i) =>
  ((x - shift[i % 203] + 29) * inv29(scale[i % 203])) % 29);
assert.deepEqual(decoded, clear);
assert.equal(equalColumnPairs(encrypted), equalColumnPairs(clear));
assert.ok(equalColumnPairs(encrypted) >= 1321);
// Even a noninjective stationary column function cannot decrease collisions.
const merged = clear.map((x, i) =>
  (scale[i % 203] * x + shift[i % 203]) % 17);
assert.ok(equalColumnPairs(merged) >= equalColumnPairs(clear));

console.log(JSON.stringify({
  source: 'original LP2 p40-55 black ink, pages concatenated',
  sourceBlackRunes: black.length,
  shape: '16 x 203',
  physicalPageSeamsInside203Rows: seamOffsets,
  alignedNonemptyPrintedSeams: 0,
  sourceEqualPairs: originalPairs,
  comparedPairs: 24360,
  sourcePairProbability: originalPairs / 24360,
  donors: measured,
  plantedNativeColumnCipher: {
    length: clear.length,
    clearEqualPairs: equalColumnPairs(clear),
    cipherEqualPairs: equalColumnPairs(encrypted),
    exactRecovered: decoded.length,
  },
  scope: 'Reject direct native-GP English decoded by one deterministic fixed-output function per 203-symbol column. This does not reject row-private keys, positional mixing, moving spaces, non-GP intermediates or multi-stage encryption.',
}, null, 2));
