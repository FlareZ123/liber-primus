/**
 * Original LP2 large punctuation vs adjacent-equal-rune-rate shift test.
 * Node.js 22, zero dependencies. Read-only. Run: node sims/lp2_large_mark_doublet_phase_sft.cjs
 * 29 unique circular cuts = beginning plus all 28 distinct nonterminal LP2 p0..55 marks.
 * Every one of the N possible circular phases is tested with fixed cut spacing.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page <= 55);
const tape = pages.flatMap(p => p.indices);
const n = tape.length;
const starts = new Map();
let pos = 0;
for (const page of pages) {
  starts.set(page.page, pos);
  pos += page.indices.length;
}
assert.equal(pos, 12956);

const sourceMarks = ink.pages.filter(p => p.page <= 55)
  .flatMap(p => (p.large_punctuation || []).map(m => starts.get(p.page) + m[0]));
const marks = [...new Set([0, ...sourceMarks.map(i => i % n)])].sort((a, b) => a - b);
assert.equal(sourceMarks.length, 31);
assert.equal(marks.length, 29);

/** @param {number[]} bits */
function phaseScreen(bits) {
  const count = bits.reduce((s, x) => s + x, 0);
  const prefix = new Float64Array(2 * n + 1);
  for (let i = 0; i < 2 * n; i++) prefix[i + 1] = prefix[i] + bits[i % n];

  /** @param {number} shift */
  function deviance(shift) {
    const cuts = marks.map(x => (x + shift) % n).sort((a, b) => a - b);
    let G = 0;
    for (let i = 0; i < cuts.length; i++) {
      const a = cuts[i];
      const b = cuts[(i + 1) % cuts.length] + (i === cuts.length - 1 ? n : 0);
      const width = b - a;
      const observed = prefix[b] - prefix[a];
      const expected = width * count / n;
      if (observed > 0) G += 2 * observed * Math.log(observed / expected);
      if (width > observed) G += 2 * (width - observed) * Math.log((width - observed) / (width - expected));
    }
    return G;
  }

  const actual = deviance(0);
  let tail = 0;
  let sum = 0;
  for (let shift = 0; shift < n; shift++) {
    const score = deviance(shift);
    sum += score;
    if (score >= actual - 1e-9) tail++;
  }
  return { count, deviance: actual, nullMean: sum / n, tail, p: tail / n };
}

const original = tape.map((v, i) => Number(i > 0 && v === tape[i - 1]));
const real = phaseScreen(original);
assert.equal(real.count, 86);
assert.equal(real.tail, 9289);
assert.ok(Math.abs(real.deviance - 20.520867744466102) < 1e-8);

/* Deterministic original-mark-aligned planted rate heterogeneity.
 * Exactly 86 doubles in the even-numbered source-mark segments, equispaced.
 * Plant tests source-mark sensitivity, not true language/plaintext recovery.
 */
const plant = new Array(n).fill(0);
const segments = marks.map((a, i) => [a, marks[i + 1] === undefined ? n : marks[i + 1]]);
const elevated = segments.filter((_, i) => i % 2 === 0);
const elevatedWidth = elevated.reduce((s, [a, b]) => s + b - a, 0);
let left = 86;
for (let i = 0; i < elevated.length; i++) {
  const [a, b] = elevated[i];
  const q = i === elevated.length - 1 ? left : Math.round(86 * (b - a) / elevatedWidth);
  left -= q;
  for (let j = 1; j <= q; j++) plant[a + Math.floor(j * (b - a) / (q + 1))] = 1;
}
const positive = phaseScreen(plant);
assert.equal(positive.count, 86);
assert.equal(positive.tail, 96);
assert.ok(positive.p < 0.01);
console.log(JSON.stringify({ n, sourceMarkRecords: sourceMarks.length, uniqueCircularCuts: marks.length, original: real, plantedMarkConditionedControl: positive }, null, 2));
console.log('PASS: original-input exact circular phase null and source-aligned positive control');
