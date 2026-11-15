'use strict';

/**
 * Source-original LP2 p50 numeric-table cumulative-step cipher:
 * direct original-key inverse and all-secret stationary codebook obstruction.
 * Windows 11 / Node.js 22; CommonJS, built-ins only.
 *
 * Natural global table phase: first rune of each within-page adjacent pair.
 * Page starts consume clock but have no predecessor and are not decoded.
 * This model preserves words and has no hidden nulls or evolving keys.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pages = gp.pages.filter((p) => p.page <= 55);
const N = pages.reduce((s, p) => s + p.indices.length, 0);
const B = grid.bytes;
assert.equal(N, 12956);
assert.equal(B.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(B)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);
assert.deepEqual(pages.map((p) => p.page), Array.from({ length: 56 }, (_, i) => i));
assert.equal(pages[50].indices.length, 0);

/** @typedef {{start:number,length:number}} PageRange */
/** @type {PageRange[]} */
const ranges = [];
let global = 0;
for (const page of pages) {
  if (page.indices.length) ranges.push({ start: global, length: page.indices.length });
  global += page.indices.length;
}
assert.equal(global, N);
assert.equal(ranges.length, 55);
const C = pages.flatMap((p) => p.indices);
const phase = [];
const D = [];
const eligibleAbsolute = [];
for (const { start, length } of ranges) {
  for (let i = 1; i < length; i++) {
    const at = start + i;
    eligibleAbsolute.push(at);
    phase.push((at - 1) % 256);
    D.push((C[at] - C[at - 1] + 29) % 29);
  }
}
assert.equal(D.length, 12901);
assert.equal(D.filter((x) => x === 0).length, 86);

/** @param {number[]} indices @returns {number} */
function indexOfCoincidence(indices) {
  const bins = new Uint32Array(29);
  for (const x of indices) bins[x]++;
  return bins.reduce((s, c) => s + c * (c - 1), 0) /
    (indices.length * (indices.length - 1));
}

/**
 * Exact, unknown-key-invariant conditional equality counts. A distinct
 * arbitrary 29-symbol secret permutation is granted for EACH selector value.
 * @param {number[]} values
 * @param {number[]} selector
 * @returns {{groups:number,pairs:number,hits:number,rate:number}}
 */
function invariant(values, selector) {
  assert.equal(values.length, selector.length);
  const groups = new Map();
  for (let i = 0; i < values.length; i++) {
    let counts = groups.get(selector[i]);
    if (!counts) {
      counts = new Uint32Array(29);
      groups.set(selector[i], counts);
    }
    counts[values[i]]++;
  }
  let pairs = 0, hits = 0;
  for (const counts of groups.values()) {
    let n = 0;
    for (const count of counts) {
      n += count;
      hits += count * (count - 1) / 2;
    }
    pairs += n * (n - 1) / 2;
  }
  return { groups: groups.size, pairs, hits, rate: hits / pairs };
}

// Grant a wholly new, arbitrary 256-alphabet dictionary at EACH original
// image-defined chapter, as well as independently resetting its phase.
// An additive phase shift within a chapter merely renames 256 alphabets,
// so global and chapter-local phase clocks have the same exact invariant.
const chapterBounds = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const chapterPhase = [];
let chGlobal = 0;
for (const page of pages) {
  const chapter = chapterBounds.findIndex(([lo, hi]) =>
    page.page >= lo && page.page <= hi);
  assert.ok(chapter >= 0);
  for (let i = 1; i < page.indices.length; i++) {
    chapterPhase.push(chapter * 256 + ((chGlobal + i - 1) % 256));
  }
  chGlobal += page.indices.length;
}
assert.equal(chapterPhase.length, 12901);

const selectors = {
  phase256: phase.slice(),
  chapterPhase2303: chapterPhase,
  rawByte161: phase.map((j) => B[j]),
  residue29: phase.map((j) => B[j] % 29),
  firstDigit5: phase.map((j) => Number(grid.pages.flatMap((p) => p.tokens)[j][0]))
};
const expected = {
  phase256: [256, 318683, 11355],
  chapterPhase2303: [2303, 39331, 1423],
  rawByte161: [161, 641510, 22944],
  residue29: [29, 3399829, 120638],
  firstDigit5: [5, 18551875, 654964]
};
const sourceResults = {};
for (const [name, selector] of Object.entries(selectors)) {
  const r = invariant(D, selector);
  assert.deepEqual([r.groups, r.pairs, r.hits], expected[name]);
  sourceResults[name] = r;
}

/** @typedef {{s:string,i:number}} RuneToken */
/** @type {RuneToken[]} */
const runeTokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} w @returns {number[]} */
function encodeWord(w) {
  const output = [];
  for (let i = 0; i < w.length;) {
    if (w.startsWith('ING', i)) { output.push(21); i += 3; continue; }
    if (w.startsWith('IO', i)) { output.push(27); i += 2; continue; }
    const token = runeTokens.find((t) => w.startsWith(t.s, i));
    assert.ok(token, 'unmappable source word: ' + w);
    output.push(token.i);
    i += token.s.length;
  }
  return output;
}
/** @param {string} raw @returns {number[]} */
function encodeNative(raw) {
  const t = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  return (t.match(/[A-Z]+/g) || []).flatMap(encodeWord);
}
const latinAlphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const nativeSources = [
  { name: 'Shakespeare', symbols: encodeNative(read('resources/control/shakespeare_first300k.txt')) },
  { name: 'Gibran', symbols: encodeNative(read('resources/control/gibran_prophet_58585.txt')) },
  { name: 'Emerson', symbols: encodeNative(read('resources/control/emerson_essays_2944.txt')) },
  { name: 'Vulgate', symbols: read('resources/control/latin-vulgate-gp-wholewords.txt')
    .split(/\r?\n/).filter((w) => /^[0-9A-S]+$/.test(w))
    .flatMap((w) => Array.from(w, (c) => latinAlphabet.indexOf(c))) }
];
assert.deepEqual(nativeSources.map((s) => s.symbols.length),
  [217106, 62492, 321327, 204802]);

/** @param {number[]} xs @returns {number[]} */
function inputEligible(xs) {
  assert.equal(xs.length, N);
  return eligibleAbsolute.map((i) => xs[i]);
}
/** @param {number[]} xs @returns {number[][]} */
function makeWindows(xs) {
  const starts = [];
  for (let i = 0; i + N <= xs.length; i += Math.floor(N / 2)) starts.push(i);
  if (starts.at(-1) + N < xs.length) starts.push(xs.length - N);
  return starts.map((i) => inputEligible(xs.slice(i, i + N)));
}

const allControls = nativeSources.map((s) => ({
  name: s.name, windows: makeWindows(s.symbols)
}));
assert.deepEqual(allControls.map((s) => s.windows.length), [33, 9, 49, 31]);
const controlResults = {};
for (const [name, selector] of Object.entries(selectors)) {
  const original = sourceResults[name];
  let minimum = Infinity, maximum = -Infinity, atOrBelowSource = 0, windows = 0;
  const sourceMinima = [];
  for (const source of allControls) {
    let subMin = Infinity;
    for (const sample of source.windows) {
      const m = invariant(sample, selector);
      minimum = Math.min(minimum, m.rate);
      maximum = Math.max(maximum, m.rate);
      subMin = Math.min(subMin, m.rate);
      if (m.rate <= original.rate) atOrBelowSource++;
      windows++;
    }
    sourceMinima.push({ name: source.name, count: source.windows.length, minimum: subMin });
  }
  assert.equal(windows, 122);
  assert.equal(atOrBelowSource, 0);
  assert.ok(minimum > 0.0569);
  controlResults[name] = { minimum, maximum, windows, atOrBelowSource, sourceMinima };
}

/**
 * Simple seeded PRNG solely for a synthetic reversible control.
 * @param {number} initial
 * @returns {()=>number}
 */
function rng(initial) {
  let x = initial >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return x >>> 0;
  };
}
/**
 * Each source selector gets a different 29-way secret permutation, with
 * plaintext GP EA (index28) assigned to zero difference (repeat). Thus
 * rare repeats do not prevent a valid reversible cumulative-step cipher.
 * @param {number[]} keys
 * @param {number} seed
 * @returns {Map<number,number[]>}
 */
function secretCodebooks(keys, seed) {
  const random = rng(seed);
  const codes = new Map();
  for (const key of new Set(keys)) {
    const order = Array.from({ length: 28 }, (_, i) => i + 1);
    for (let i = order.length - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    codes.set(key, [...order, 0]);
  }
  return codes;
}
/**
 * Preserve page leaders as published initial states; encrypt the remaining
 * 12,901 native plaintext symbols as secret selector-permuted increments.
 * Verify both directions, including all step-zero exceptions.
 * @param {number[]} native
 * @param {number[]} keys
 * @param {Map<number,number[]>} codebooks
 * @returns {{cipher:number[],steps:number[],recovered:number[]}}
 */
function plant(native, keys, codebooks) {
  assert.equal(native.length, N);
  const cipher = native.slice();
  const recovered = native.slice();
  const steps = [];
  let n = 0;
  for (const { start, length } of ranges) {
    for (let i = 1; i < length; i++) {
      const p = native[start + i], key = keys[n];
      const shift = codebooks.get(key)[p];
      cipher[start + i] = (cipher[start + i - 1] + shift) % 29;
      steps.push((cipher[start + i] - cipher[start + i - 1] + 29) % 29);
      const inverse = codebooks.get(key).indexOf(steps[n]);
      recovered[start + i] = inverse;
      n++;
    }
  }
  assert.equal(n, D.length);
  assert.deepEqual(recovered, native);
  return { cipher, steps, recovered };
}

const native = nativeSources[0].symbols.slice(0, N);
const nativeEligible = inputEligible(native);
const plants = {};
let seed = 0x33015608;
for (const [name, selector] of Object.entries(selectors)) {
  const codebooks = secretCodebooks(selector, seed++);
  const planted = plant(native, selector, codebooks);
  const observed = invariant(planted.steps, selector);
  const truth = invariant(nativeEligible, selector);
  assert.deepEqual(observed, truth);
  assert.equal(planted.steps.filter((x) => x === 0).length,
    nativeEligible.filter((x) => x === 28).length);
  plants[name] = {
    exactRecovered: planted.recovered.length,
    sourceLikeRepeats: planted.steps.filter((x) => x === 0).length,
    exactNativeConditionalIoC: observed.rate
  };
}

/**
 * Source-keyed, byte modulo29, cyclic incremental original-input inverse:
 * both signs for C'[i] = C'[i-1] + (P[i] +/- K[i]) mod29.
 */
const sourceFullKey = phase.map((j) => B[j] % 29);
const direct = {};
for (const sign of [-1, +1]) {
  const decoded = D.map((d, i) => (d + sign * sourceFullKey[i] + 29) % 29);
  const simulatedSteps = decoded.map((p, i) =>
    (p - sign * sourceFullKey[i] + 29) % 29);
  assert.deepEqual(simulatedSteps, D);
  const nativeSteps = nativeEligible.map((p, i) =>
    (p - sign * sourceFullKey[i] + 29) % 29);
  assert.deepEqual(nativeSteps.map((d, i) =>
    (d + sign * sourceFullKey[i] + 29) % 29), nativeEligible);
  direct[sign === -1 ? 'minusKey' : 'plusKey'] = {
    originalIoC: indexOfCoincidence(decoded),
    originalNativeTextHead: decoded.slice(0, 32).map((i) => gp.translit[i]).join('-'),
    nativePlantExact: nativeEligible.length
  };
  assert.ok(indexOfCoincidence(decoded) < 0.04);
}
assert.ok(Math.abs(direct.minusKey.originalIoC - 0.03447274383513327) < 1e-11);
assert.ok(Math.abs(direct.plusKey.originalIoC - 0.03446555732414229) < 1e-11);

console.log(JSON.stringify({
  sourceOriginal: {
    pages: ranges.length, runes: N, decodedSteps: D.length,
    originalExactRepeatedSteps: D.filter((x) => x === 0).length,
    invariantBySelector: sourceResults
  },
  originalSourceKeyLiteralInverses: direct,
  nativeEnglishLatinSourceControls: controlResults,
  sourceNativePositivePlants: plants,
  decision: 'No stationary selector-specific GP29 alphabet, regardless of secret permutation, can make this cumulative-step register match source-native GP prose under the stated global clock and page/word alignment. It does not exclude changing keys, nulls, word rewrites, non-GP plaintext or different clocks.'
}, null, 2));
