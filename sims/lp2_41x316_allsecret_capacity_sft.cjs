'use strict';

/**
 * Original-source 41×316 all-secret alphabet gate for LP2.
 *
 * A fixed alphabet bijection for each of 41 contiguous rows (316 symbols
 * apiece), or each of 41 interleaved position classes, preserves exact
 * within-class equality counts. This tests those complete secret-key
 * families without guessing a single substitution alphabet.
 *
 * SFT: node sims/lp2_41x316_allsecret_capacity_sft.cjs
 * Node 20+, CommonJS, core libraries only, fixed checked-in witnesses.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.join(ROOT, filename), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const ALPHABET = 29;
const CLASSES = 41;
const WIDTH = 316;
const LENGTH = CLASSES * WIDTH;
const WINDOW_STEP = LENGTH / 2;
assert.equal(original.length, LENGTH);
assert.equal(new Set(original).size, ALPHABET);
assert.equal(corpus.pages.find(p => p.page === 50).indices.length, 0);

const tokens = corpus.translit.map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/**
 * Source-calibrated solved LP1 English orthography:
 * QU -> CW, V -> U, K/Q -> C, Z -> S, ING -> NG, IO -> IA.
 * @param {string} text
 * @returns {number[]}
 */
function nativeGP(text) {
  const words = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/[VKQ]/g, value => value === 'V' ? 'U' : 'C')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA').match(/[A-Z]+/g) || [];
  const encoded = [];
  for (const word of words) {
    for (let at = 0; at < word.length;) {
      const token = tokens.find(item => word.startsWith(item.symbol, at));
      assert.ok(token, 'Unable to map native GP word: ' + word);
      encoded.push(token.value);
      at += token.symbol.length;
    }
  }
  return encoded;
}

/**
 * @param {readonly number[]} indices
 * @param {'rows'|'columns'} layout
 * @returns {number}
 */
function equalPairs(indices, layout) {
  assert.equal(indices.length, LENGTH);
  const groups = Array.from({ length: CLASSES },
    () => new Uint16Array(ALPHABET));
  for (let i = 0; i < LENGTH; i++) {
    const group = layout === 'rows' ? Math.floor(i / WIDTH) : i % CLASSES;
    groups[group][indices[i]]++;
  }
  let pairs = 0;
  for (const counts of groups) {
    for (const n of counts) pairs += n * (n - 1) / 2;
    assert.equal(counts.reduce((sum, n) => sum + n, 0), WIDTH);
  }
  return pairs;
}

/**
 * Plant 41 independently different, full, bijective affine GP29 alphabets.
 * Every class is correctly decoded with inverse(7)=25 mod29.
 * @param {readonly number[]} originalText
 * @param {'rows'|'columns'} layout
 * @returns {{ ciphertext:number[], decrypted:number[] }}
 */
function positivePlant(originalText, layout) {
  const ciphertext = [];
  const decrypted = [];
  for (let i = 0; i < LENGTH; i++) {
    const group = layout === 'rows' ? Math.floor(i / WIDTH) : i % CLASSES;
    const value = (7 * originalText[i] + 3 * group + 5) % ALPHABET;
    ciphertext.push(value);
    decrypted.push(((25 * (value - 3 * group - 5)) % ALPHABET + ALPHABET) % ALPHABET);
  }
  return { ciphertext, decrypted };
}

const observed = ['rows', 'columns'].map(layout => equalPairs(original, layout));
assert.deepEqual(observed, [69661, 70220]);
const denominator = CLASSES * WIDTH * (WIDTH - 1) / 2;
assert.equal(denominator, 2040570);

const controls = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt',
    32, [119491, 117225], [126174, 125113]],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt',
    8, [122916, 120924], [125401, 123464]],
  ['Emerson', 'resources/control/emerson_essays_2944.txt',
    48, [124012, 123151], [129178, 128299]]
];

let totalWindows = 0;
const summary = [];
for (const [name, filename, expectedWindows, expectedMin, expectedMax] of controls) {
  const plaintext = nativeGP(read(filename));
  const min = [Infinity, Infinity];
  const max = [-Infinity, -Infinity];
  let windows = 0;
  for (let start = 0; start + LENGTH <= plaintext.length; start += WINDOW_STEP) {
    const window = plaintext.slice(start, start + LENGTH);
    const sample = ['rows', 'columns'].map(layout => equalPairs(window, layout));
    for (let k = 0; k < 2; k++) {
      min[k] = Math.min(min[k], sample[k]);
      max[k] = Math.max(max[k], sample[k]);
      assert.ok(sample[k] > observed[k],
        'English control enters secret-alphabet original capacity');
    }
    // Distinct secret alphabets per source-geometry class, with exact inverse.
    if (windows === 0) {
      for (const layout of ['rows', 'columns']) {
        const plant = positivePlant(window, layout);
        assert.deepEqual(plant.decrypted, window);
        assert.equal(equalPairs(plant.ciphertext, layout), equalPairs(window, layout));
      }
    }
    windows++;
  }
  assert.equal(windows, expectedWindows, name + ' window count');
  assert.deepEqual(min, expectedMin, name + ' minimum pair counts');
  assert.deepEqual(max, expectedMax, name + ' maximum pair counts');
  totalWindows += windows;
  summary.push({ name, nativeGPRunes: plaintext.length, windows,
    minimumEqualPairs: min, maximumEqualPairs: max });
}
assert.equal(totalWindows, 88);

const output = {
  originalUnknownRunes: LENGTH,
  geometry: [CLASSES, WIDTH],
  keyFamily: '41 wholly arbitrary independent GP29 bijections; grouped rows or interleaved columns',
  originalWithinClassEqualPairs: observed,
  sameClassPositionPairs: denominator,
  originalRates: observed.map(value => value / denominator),
  calibratedControls: summary,
  conclusion: 'The 88 sampled source-native English plaintext windows cannot produce the original LP2 under either fixed-class arbitrary-bijection model. No unknown plaintext or authentic key recovered.'
};
process.stdout.write(JSON.stringify(output, null, 2) + '\n');
