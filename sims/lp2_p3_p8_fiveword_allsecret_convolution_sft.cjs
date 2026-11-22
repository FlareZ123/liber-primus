'use strict';
/**
 * LP2 original p3–p7 black scroll words -> p8 black242 five-word checksum:
 * key-independent all-secret GF(29) tap and substitution obstruction.
 * Single runnable test, Windows Node.js 22 CommonJS, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const mod = (v) => ((v % 29) + 29) % 29;
const alphabet = new Map(gp.runes.map((r, i) => [r, i]));

const scroll = gp.pages.slice(3, 8).flatMap((p) => p.indices);
const words = transcription.split('%').slice(3, 8).join('')
  .replace(/[\n\/&$]/g, '').split(/[-.]/)
  .map((s) => [...s].filter((r) => alphabet.has(r)).map((r) => alphabet.get(r)))
  .filter((w) => w.length > 0);
assert.equal(words.length, 255);
assert.equal(scroll.length, 1145);
assert.deepEqual(words.flat(), scroll);
const red = new Set();
let pageOffset = 0;
for (let p = 3; p <= 7; p++) {
  const annotation = ink.pages.find((v) => v.page === p);
  for (const span of annotation?.red_spans || [])
    for (let j = 0; j < span.length; j++) red.add(pageOffset + span.start + j);
  pageOffset += gp.pages[p].indices.length;
}
assert.equal(red.size, 44);
const black = [];
const marked = [];
let pos = 0;
for (const word of words) {
  const marks = word.map((_, j) => red.has(pos + j));
  assert(marks.every(Boolean) || marks.every((x) => !x));
  (marks[0] ? marked : black).push(word);
  pos += word.length;
}
assert.deepEqual([marked.length, black.length], [13, 242]);
const p7Marked = marked.slice(-5);
assert.deepEqual(p7Marked.map((w) => w.length), [2, 4, 3, 2, 3]);
const taps = p7Marked.map((w) => w.reduce((v, x) => mod(v * x), 1));
assert.deepEqual(taps, [11, 26, 8, 15, 2]);
const p8 = gp.pages[8].indices;
const target = p8.slice(12, 254);
assert.equal(target.length, 242);
assert.equal(p8.length - 12, 243); // The final rune carries into p9.
assert.equal(new Set(target).size, 29);

/**
 * Gaussian rank over the prime field GF(29), retaining the first
 * independent original equality equation as a witness per pivot.
 * @param {{values:number[], witness:number[]}[]} equations
 * @returns {{rank:number, witnesses:number[][]}}
 */
function rankWitness(equations) {
  const basis = [];
  const witnesses = [];
  for (const equation of equations) {
    let row = equation.values.map(mod);
    for (const item of basis) {
      const factor = row[item.pivot];
      if (factor) row = row.map((x, j) => mod(x - factor * item.values[j]));
    }
    const pivot = row.findIndex((x) => x !== 0);
    if (pivot < 0) continue;
    const inverse = Array.from({ length: 28 }, (_, i) => i + 1)
      .find((x) => mod(x * row[pivot]) === 1);
    assert(inverse);
    row = row.map((x) => mod(x * inverse));
    basis.push({ pivot, values: row });
    basis.sort((x, y) => x.pivot - y.pivot);
    witnesses.push(equation.witness);
    if (basis.length === 5) break;
  }
  return { rank: basis.length, witnesses };
}

/**
 * Same-output pairs yield homogeneous equations on unknown taps,
 * assuming one fixed, arbitrary and invertible GP29 output alphabet.
 * @param {number[][]} rows
 * @param {number[]} outputs
 */
function rankFromSameOutputs(rows, outputs) {
  const first = new Map();
  const equations = [];
  for (let i = 0; i < rows.length; i++) {
    const value = outputs[i];
    if (!first.has(value)) {
      first.set(value, i);
      continue;
    }
    const j = first.get(value);
    equations.push({
      values: rows[i].map((x, n) => mod(x - rows[j][n])),
      witness: [j, i, value],
    });
  }
  return { ...rankWitness(equations), equations: equations.length };
}
const measures = [
  ['whole-word-length', black.map((w) => mod(w.length))],
  ['GP29-index-sum', black.map((w) => mod(w.reduce((v, x) => v + x, 0)))],
  ['GP-prime-sum', black.map((w) => mod(w.reduce((v, x) => v + gp.prime[x], 0)))],
];
const cube = (x) => mod(x * x * x);
const power = (x, exponent) => {
  let value = 1;
  for (let i = 0; i < exponent; i++) value = mod(value * x);
  return value;
};
for (const [measure, numbers] of measures) {
  for (const orientation of ['past', 'future']) {
    // Restrict to source-contained five-word windows; never wrap scroll ends.
    const originalIndexes = Array.from({ length: 238 }, (_, j) =>
      orientation === 'past' ? j + 4 : j);
    const rows = originalIndexes.map((i) =>
      taps.map((_, j) => numbers[i + (orientation === 'past' ? -j : j)]));
    const outputs = originalIndexes.map((i) => target[i]);
    const actual = rankFromSameOutputs(rows, outputs);
    assert.equal(actual.equations, 209);
    assert.equal(actual.rank, 5,
      'original five-word checksum + any fixed invertible secret alphabet excluded');
    assert.equal(new Set(outputs).size, 29);

    // Constructive plant: the authentic five source-word taps and an invertible,
    // nonlinear GP29 alphabet x^3 (inverse exponent 19 since 3*19 = 57 = 1 mod 28).
    const hidden = rows.map((row) =>
      mod(row.reduce((v, x, j) => v + taps[j] * x, 0)));
    const encrypted = hidden.map(cube);
    assert.deepEqual(encrypted.map((value) => power(value, 19)), hidden);
    const positive = rankFromSameOutputs(rows, encrypted);
    assert.equal(positive.rank, 4); // One nonzero tap vector remains legal.
    assert.notEqual(new Set(encrypted).size, 1);

    const fiveWitnessPairs = actual.witnesses.map(([earlier, later, value]) =>
      [originalIndexes[earlier], originalIndexes[later], value]);
    console.log(JSON.stringify({
      measure, orientation, originalRunes: outputs.length,
      sameOutputEquations: actual.equations, originalRank: actual.rank,
      witnessPairs: fiveWitnessPairs,
      sourceShapedPositiveRank: positive.rank,
    }));
  }
}
console.log('PASS: six original-source five-word all-secret obstructions + six GP29 cube plants');
