'use strict';

/**
 * Original-source 213 red GP runes plus 43 strictly interior p55 GP runes
 * versus the 256 printed numeral cells. Reproduction: node
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
  positiveControl: '43/43 exact'
};
assert.equal(result.redSolved, 12);
assert.equal(result.equalTableResidues, 5);
assert.ok(Math.abs(outputs.subtract.p55InteriorIoC - 0.031007751937984496) < 1e-12);
assert.ok(Math.abs(outputs.add.p55InteriorIoC - 0.029900332225913623) < 1e-12);
console.log(JSON.stringify(result, null, 2));
