#!/usr/bin/env node
'use strict';

// Reproduce the source-constrained p55-inner BASE29 polynomial bridge.
// Inputs are the original repository transcription and 2014 square values.
// No cipher/decryption consumer is attempted here.

const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcription = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8');
const squareText = fs.readFileSync('resources/cicada2014-openpuff-magic-squares.txt', 'utf8');

const mod = n => ((n % 29) + 29) % 29;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

function parseWords(text) {
  const words = [];
  let word = [];
  for (const ch of text) {
    if (runeIndex.has(ch)) word.push(runeIndex.get(ch));
    else if ('-.&$§'.includes(ch)) {
      if (word.length) words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

function evalAscending(coefficients, x) {
  let y = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) y = mod(y * x + coefficients[i]);
  return y;
}

function inverseMod(a) {
  for (let x = 1; x < 29; x++) if (mod(a * x) === 1) return x;
  throw new Error('noninvertible coefficient in GF(29)');
}

function polynomialRemainder(coefficients, divisor) {
  const a = coefficients.map(mod);
  const d = divisor.map(mod);
  const invLead = inverseMod(d[d.length - 1]);
  while (a.length >= d.length) {
    while (a.length && a[a.length - 1] === 0) a.pop();
    if (a.length < d.length) break;
    const factor = mod(a[a.length - 1] * invLead);
    const shift = a.length - d.length;
    for (let j = 0; j < d.length; j++) a[shift + j] = mod(a[shift + j] - factor * d[j]);
  }
  while (a.length && a[a.length - 1] === 0) a.pop();
  return a.length ? a : [0];
}

// The transcription has a rune-free p50 block; split block 54 is physical p55.
const blocks = transcription.split('%');
const p55Words = parseWords(blocks[54]);
const expectedWordLengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.deepEqual(p55Words.map(w => w.length), expectedWordLengths);
const p55Full = p55Words.flat();
const corpusP55 = corpus.pages.find(p => p.page === 55);
assert.ok(corpusP55, 'corpus must contain physical p55');
assert.deepEqual(p55Full, corpusP55.indices, 'transcription p55 must match canonical corpus indices');
assert.equal(p55Full.length, 76);

// p57's "shed circumferences / find the divinity within" selects strict interiors.
// The first p55 segment is a one-rune page carry and contributes no interior.
const coefficients = p55Words.flatMap(w => w.slice(1, -1));
assert.equal(coefficients.length, 43);
assert.equal(p55Words.length, 17);

const squareNumbers = squareText.match(/-?\d+/g).map(Number);
assert.equal(squareNumbers.length, 99);
const dims = [5, 7, 5];
let offset = 0;
const squares = dims.map(n => {
  const cells = squareNumbers.slice(offset, offset + n * n);
  offset += n * n;
  return Array.from({ length: n }, (_, r) => cells.slice(r * n, (r + 1) * n));
});
const magicSums = squares.map(m => m[0].reduce((a, b) => a + b, 0));
assert.deepEqual(magicSums, [3301, 1033, 1033]);
for (let k = 0; k < squares.length; k++) {
  const n = dims[k], target = magicSums[k];
  assert.ok(squares[k].every(row => row.reduce((a, b) => a + b, 0) === target));
  assert.ok(Array.from({ length: n }, (_, c) => squares[k].reduce((s, row) => s + row[c], 0)).every(x => x === target));
}

// Signed 2013 BASE29 example 3301 -> 3QO uses *descending* positional
// powers: 3 * 29^2 + 26 * 29 + 24 = 3301. Ascending polynomial
// coefficients [3,26,24] are a conditional, retrospective choice.
// H(X)=3 + 26X + 24X^2 is therefore not specified by BASE29 alone.
const H = [3, 26, 24];
const x3301 = mod(3301);
const x1033 = mod(1033);
assert.equal(x3301, 24);
assert.equal(x1033, 18);

const p24 = evalAscending(coefficients, x3301);
const p18 = evalAscending(coefficients, x1033);
const p23 = evalAscending(coefficients, 23);
assert.equal(p24, 18);
assert.equal(p18, 23);
assert.equal(p23, 4);

// Controls: source-selected ascending order matters; the full p55 page is not
// the same polynomial and does not reproduce the 24 -> 18 -> 23 chain.
const reverse24 = evalAscending(coefficients.slice().reverse(), 24);
const reverse18 = evalAscending(coefficients.slice().reverse(), 18);
const full24 = evalAscending(p55Full, 24);
const full18 = evalAscending(p55Full, 18);
assert.deepEqual([reverse24, reverse18], [4, 19]);
assert.deepEqual([full24, full18], [24, 26]);

const remainder = polynomialRemainder(coefficients, H);
assert.deepEqual(remainder, [6, 26]); // alpha = 6 + 26u
const [a, b] = remainder;

// H/24 = X^2 + 18X + 11, hence u^2 = 11u + 18.
function fieldMultiply(x, y) {
  const [c, d] = x, [e, f] = y;
  return [
    mod(c * e + 18 * d * f),
    mod(c * f + d * e + 11 * d * f)
  ];
}
function fieldOrder(x) {
  let v = [1, 0];
  for (let n = 1; n <= 840; n++) {
    v = fieldMultiply(v, x);
    if (v[0] === 1 && v[1] === 0) return n;
  }
  return null;
}
const trace = mod(2 * a + 11 * b);
const norm = mod(a * a + 11 * a * b + 11 * b * b);
const alphaOrder = fieldOrder([a, b]);
const uOrder = fieldOrder([0, 1]);
assert.equal(trace, 8);
assert.equal(norm, 24);
assert.equal(alphaOrder, 210);
assert.equal(uOrder, 840);

// The orbit begins with the two square residues and the p57/2013 value 23.
const orbit = [];
const seen = new Set();
let x = 24;
while (!seen.has(x)) {
  seen.add(x);
  orbit.push(x);
  x = evalAscending(coefficients, x);
}
assert.deepEqual(orbit, [24, 18, 23, 4, 6, 19, 22]);
assert.equal(x, 22);

console.log(JSON.stringify({
  p55WordLengths: expectedWordLengths,
  coefficientCount: coefficients.length,
  coefficients,
  squareMagicSums: magicSums,
  residues: { '3301 mod 29': x3301, '1033 mod 29': x1033 },
  evaluations: { 'P(24)': p24, 'P(18)': p18, 'P(23)': p23 },
  controls: { reversed: [reverse24, reverse18], fullP55: [full24, full18] },
  remainderModH: remainder,
  fieldElement: '6 + 26u',
  field: { trace, norm, alphaOrder, generatorOrder: uOrder },
  orbitFrom24: orbit,
  fixedPoint: x,
  caveat: 'Structural correspondence only; no unknown-page plaintext or decoder recovered.'
}, null, 2));
