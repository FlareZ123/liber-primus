'use strict';

/**
 * Original-source 41×316 all-secret alphabet gate for LP2.
 *
 * Any fixed GP29 alphabet bijection preserves equal-symbol pairs within
 * its class. Test 41 contiguous rows (316 runes each), 41 interleaved
 * phase classes (316 runes each), and the 316 actual 41-rune columns of
 * the proposed matrix. No secret substitution key need be guessed.
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
 * @param {'rows41'|'phase41'|'columns316'} layout
 * @returns {number}
 */
function equalPairs(indices, layout) {
  assert.equal(indices.length, LENGTH);
  const groupCount = layout === 'columns316' ? WIDTH : CLASSES;
  const groupSize = layout === 'columns316' ? CLASSES : WIDTH;
  const groups = Array.from({ length: groupCount },
    () => new Uint16Array(ALPHABET));
  for (let i = 0; i < LENGTH; i++) {
    const group = layout === 'rows41' ? Math.floor(i / WIDTH)
      : layout === 'phase41' ? i % CLASSES : i % WIDTH;
    groups[group][indices[i]]++;
  }
  let pairs = 0;
  for (const counts of groups) {
    for (const n of counts) pairs += n * (n - 1) / 2;
    assert.equal(counts.reduce((sum, n) => sum + n, 0), groupSize);
  }
  return pairs;
}

/**
 * Plant one independently different, full, bijective affine GP29 alphabet
 * for each of the 41 or 316 position classes, depending on the layout.
 * Every class is correctly decoded with inverse(7)=25 mod29.
 * @param {readonly number[]} originalText
 * @param {'rows41'|'phase41'|'columns316'} layout
 * @returns {{ ciphertext:number[], decrypted:number[] }}
 */
function positivePlant(originalText, layout) {
  const ciphertext = [];
  const decrypted = [];
  for (let i = 0; i < LENGTH; i++) {
    const group = layout === 'rows41' ? Math.floor(i / WIDTH)
      : layout === 'phase41' ? i % CLASSES : i % WIDTH;
    const value = (7 * originalText[i] + 3 * group + 5) % ALPHABET;
    ciphertext.push(value);
    decrypted.push(((25 * (value - 3 * group - 5)) % ALPHABET + ALPHABET) % ALPHABET);
  }
  return { ciphertext, decrypted };
}

const layouts = /** @type {const} */ (['rows41', 'phase41', 'columns316']);
const observed = layouts.map(layout => equalPairs(original, layout));
assert.deepEqual(observed, [69661, 70220, 8916]);
const denominators = layouts.map(layout => {
  const groupCount = layout === 'columns316' ? WIDTH : CLASSES;
  const groupSize = layout === 'columns316' ? CLASSES : WIDTH;
  return groupCount * groupSize * (groupSize - 1) / 2;
});
assert.deepEqual(denominators, [2040570, 2040570, 259120]);

const controls = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt',
    32, [119491, 117225, 14850], [126174, 125113, 15928]],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt',
    8, [122916, 120924, 15538], [125401, 123464, 15866]],
  ['Emerson', 'resources/control/emerson_essays_2944.txt',
    48, [124012, 123151, 15700], [129178, 128299, 16373]]
];

let totalWindows = 0;
const summary = [];
for (const [name, filename, expectedWindows, expectedMin, expectedMax] of controls) {
  const plaintext = nativeGP(read(filename));
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  let windows = 0;
  for (let start = 0; start + LENGTH <= plaintext.length; start += WINDOW_STEP) {
    const window = plaintext.slice(start, start + LENGTH);
    const sample = layouts.map(layout => equalPairs(window, layout));
    for (let k = 0; k < layouts.length; k++) {
      min[k] = Math.min(min[k], sample[k]);
      max[k] = Math.max(max[k], sample[k]);
      assert.ok(sample[k] > observed[k],
        'English control enters secret-alphabet original capacity');
    }
    // Distinct secret alphabets per source-geometry class, with exact inverse.
    if (windows === 0) {
      for (const layout of layouts) {
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
  layoutKeys: layouts,
  keyFamily: '41 or 316 wholly arbitrary independent GP29 bijections, one per fixed source-geometry class',
  originalWithinClassEqualPairs: observed,
  sameClassPositionPairs: denominators,
  originalRates: observed.map((value, i) => value / denominators[i]),
  calibratedControls: summary,
  conclusion: 'The 88 sampled source-native English plaintext windows cannot produce the original LP2 under any of the three fixed-class arbitrary-bijection models. No unknown plaintext or authentic key recovered.'
};
process.stdout.write(JSON.stringify(output, null, 2) + '\n');
