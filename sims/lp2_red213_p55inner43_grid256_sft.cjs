'use strict';

/**
 * Two source-visible 256-slot candidate objects for the printed numeral grid:
 * 213 unknown red runes + 43 p55 word interiors, and all 225 red runes
 * plus 31 red 13-/23-dot punctuation symbols. Reproduction: node
 * sims/lp2_red213_p55inner43_grid256_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const ink = JSON.parse(read('lp2-ink-annotations.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const pages = read('lp2-transcription.txt').split(/^\s*%\s*$/m);
/** @param {string} rune */
const index = rune => {
  const value = corpus.runes.indexOf(rune);
  assert.ok(value >= 0, 'unknown GP rune');
  return value;
};
/** @param {number} x */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {number[]} xs */
const ioc = xs => {
  const freq = Array(29).fill(0);
  for (const x of xs) freq[x]++;
  return freq.reduce((n, f) => n + f * (f - 1), 0) / (xs.length * (xs.length - 1));
};
/**
 * Descending coefficients of a polynomial modulo x^2+18x+11 in GF(29).
 * @param {number[]} xs
 * @returns {number[]}
 */
const hRemainder = xs => {
  let a = 0;
  let b = 0;
  for (const x of xs) {
    const nextA = mod29(x - 11 * b);
    const nextB = mod29(a - 18 * b);
    a = nextA;
    b = nextB;
  }
  return [a, b];
};
/**
 * Polynomial value and formal derivative at 24, as an exact test of (x+5)^2.
 * @param {number[]} xs
 * @returns {number[]}
 */
const doubleRoot = xs => {
  let value = 0;
  let derivative = 0;
  for (const x of xs) {
    derivative = mod29(24 * derivative + value);
    value = mod29(24 * value + x);
  }
  return [value, derivative];
};

const red = [];
for (const page of ink.pages) {
  if (page.page >= 56) continue;
  const original = corpus.pages.find(p => p.page === page.page).indices;
  for (const span of page.red_spans || []) {
    const indices = Array.from(span.runes).map(index);
    assert.equal(indices.length, span.length);
    assert.deepStrictEqual(indices, original.slice(span.start, span.start + span.length));
    red.push(...indices);
  }
}
assert.equal(red.length, 213);

// The master transcription omits runeless p50, so its 55th segment is physical p55.
const page55Words = pages[54].replace(/[\/\r\n]/g, '').split(/[-.&$\s\d]+/).filter(Boolean);
assert.equal(page55Words.length, 17);
assert.equal(page55Words[0], 'ᛝ'); // a singleton carried from the preceding page
assert.deepStrictEqual(Array.from(page55Words.join('')).map(index),
  corpus.pages.find(p => p.page === 55).indices);
const words = page55Words.slice(1);
const interior = words.flatMap(word => Array.from(word).slice(1, -1).map(index));
assert.equal(words.length, 16);
assert.equal(interior.length, 43);

const selected = red.concat(interior);
const key = grid.bytes.map(x => x % 29);
assert.equal(selected.length, 256);
assert.equal(key.length, 256);
assert.deepStrictEqual(hRemainder(key), [0, 0]);
assert.deepStrictEqual(doubleRoot(key), [0, 0]);
assert.deepStrictEqual(hRemainder(selected), [1, 10]);
assert.deepStrictEqual(doubleRoot(selected), [11, 13]);
assert.deepStrictEqual(hRemainder([...selected].reverse()), [24, 0]);
assert.deepStrictEqual(doubleRoot([...selected].reverse()), [16, 4]);

// Independent native-GP positive control of the exact source-derived 43-cell pad.
const positive = corpus.pages.find(p => p.page === 57).indices.slice(0, 43);
const plant = positive.map((x, j) => mod29(x + key[213 + j]));
assert.deepStrictEqual(plant.map((x, j) => mod29(x - key[213 + j])), positive);

/** @param {number[]} xs */
const render = xs => xs.map(x => corpus.translit[x]).join('');
const outputs = {};
for (const [sign, name] of [[-1, 'subtract'], [1, 'add']]) {
  const out = selected.map((x, j) => mod29(x + sign * key[j]));
  outputs[name] = {
    fullIoC: ioc(out),
    p55InteriorIoC: ioc(out.slice(213)),
    p55Interior: render(out.slice(213)),
    redFirst60: render(out.slice(0, 60))
  };
}

/**
 * All-page red-ink candidate: each actual red rune is one GP index;
 * each red 13-/23-dot punctuation has a separate single-token candidate
 * value: the GP index whose prime weight equals its literal dot count.
 * Both the selection and numeric interpretation are experimental.
 */
const colored = [];
for (const page of ink.pages) {
  const original = corpus.pages.find(p => p.page === page.page).indices;
  for (const span of page.red_spans || []) {
    const values = Array.from(span.runes).map(index);
    assert.deepStrictEqual(values, original.slice(span.start, span.start + span.length));
    for (let j = 0; j < values.length; j++) {
      colored.push({page: page.page, at: span.start + j, kind: 'rune', value: values[j]});
    }
  }
  for (const [at, dots, inkColor] of page.large_punctuation || []) {
    if (inkColor !== 'red' || (dots !== 13 && dots !== 23)) continue;
    const value = corpus.prime.indexOf(dots);
    assert.ok(value >= 0);
    colored.push({page: page.page, at, kind: 'dot', dots, value});
  }
}
// A printed punctuation mark at a rune offset precedes the rune at that offset.
colored.sort((a, b) => a.page - b.page || a.at - b.at ||
  (a.kind === 'dot' ? -1 : 1));

const markerSeparatedRuneCounts = [];
let sectionRunes = 0;
for (const entry of colored) {
  if (entry.kind === 'rune') sectionRunes++;
  else {
    markerSeparatedRuneCounts.push(sectionRunes);
    sectionRunes = 0;
  }
}
markerSeparatedRuneCounts.push(sectionRunes);
assert.equal(markerSeparatedRuneCounts.length, 32);
assert.deepStrictEqual(markerSeparatedRuneCounts, [
  13, 0, 16, 0, 3, 0, 11, 0, 14, 12, 0, 9, 11, 0, 16, 0,
  19, 0, 10, 0, 8, 0, 3, 0, 59, 9, 0, 5, 0, 7, 0, 0
]);
const fixedRowSlots = markerSeparatedRuneCounts.map((n, j) => n + (j < 31 ? 1 : 0));
assert.equal(fixedRowSlots.filter(n => n === 8).length, 1);

const redInk256 = colored.map(x => x.value);
const dotCounts = colored.filter(x => x.kind === 'dot');
assert.equal(redInk256.length, 256);
assert.equal(colored.filter(x => x.kind === 'rune').length, 225);
assert.equal(dotCounts.length, 31);
assert.equal(dotCounts.filter(x => x.dots === 13).length, 30);
assert.equal(dotCounts.filter(x => x.dots === 23).length, 1);
assert.deepStrictEqual(hRemainder(redInk256), [5, 3]);
assert.deepStrictEqual(doubleRoot(redInk256), [15, 16]);
assert.deepStrictEqual(hRemainder([...redInk256].reverse()), [23, 0]);
assert.deepStrictEqual(doubleRoot([...redInk256].reverse()), [13, 19]);
const redInkOutputs = {};
for (const [sign, name] of [[-1, 'subtract'], [1, 'add']]) {
  const out = redInk256.map((x, j) => mod29(x + sign * key[j]));
  redInkOutputs[name] = {
    fullIoC: ioc(out),
    first50: render(out.slice(0, 50)),
    last50: render(out.slice(-50)),
    knownSolvedP57RedRunesKept: colored.reduce(
      (n, e, j) => n + (e.kind === 'rune' && e.page === 57 && out[j] === e.value), 0)
  };
}
assert.ok(Math.abs(redInkOutputs.subtract.fullIoC - 0.03373161764705882) < 1e-12);
assert.ok(Math.abs(redInkOutputs.add.fullIoC - 0.035386029411764705) < 1e-12);

const result = {
  redUnsolved: red.length,
  redSolved: ink.pages.filter(p => p.page >= 56).reduce(
    (s, p) => s + (p.red_spans || []).reduce((t, x) => t + x.length, 0), 0),
  p55Interior: interior.length,
  p55CompleteWords: words.length,
  coreIoC: ioc(interior),
  selectedIoC: ioc(selected),
  equalTableResidues: selected.filter((x, j) => x === key[j]).length,
  hRemainder: hRemainder(selected),
  gRootAndDerivative: doubleRoot(selected),
  reversedH: hRemainder([...selected].reverse()),
  reversedG: doubleRoot([...selected].reverse()),
  outputs,
  allPageRedInkCandidate: {
    total: redInk256.length,
    allRedRunes: 225,
    red13And23Dots: 31,
    markerSeparatedRuneCounts,
    matchedOriginalEightCellRows: fixedRowSlots.filter(n => n === 8).length,
    originalIoC: ioc(redInk256),
    equalTableResidues: redInk256.filter((x, j) => x === key[j]).length,
    hRemainder: hRemainder(redInk256),
    gRootAndDerivative: doubleRoot(redInk256),
    reversedH: hRemainder([...redInk256].reverse()),
    reversedG: doubleRoot([...redInk256].reverse()),
    redInkOutputs
  },
  positiveControl: '43/43 exact'
};
assert.equal(result.redSolved, 12);
assert.equal(result.equalTableResidues, 5);
assert.ok(Math.abs(outputs.subtract.p55InteriorIoC - 0.031007751937984496) < 1e-12);
assert.ok(Math.abs(outputs.add.p55InteriorIoC - 0.029900332225913623) < 1e-12);
console.log(JSON.stringify(result, null, 2));
