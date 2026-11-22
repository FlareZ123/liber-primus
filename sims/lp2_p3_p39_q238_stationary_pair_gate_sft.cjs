'use strict';

/**
 * Source-marked p3/p39 119-pair versus Q238 all-secret lookup gate.
 * Run: node sims/lp2_p3_p39_q238_stationary_pair_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const mod = (v) => (v % 29 + 29) % 29;
const factor = [16, 9, 3, 17, 23, 27, 16, 3, 23, 3, 18, 22, 14, 18, 12, 4, 28];
assert.equal(grid.bytes.length, 256);
const residue = grid.bytes.slice().reverse().map(mod);
assert.equal(residue[255], 0);
const q = Array(239).fill(0);
for (let degree = 254; degree >= 16; degree--) {
  const coefficient = mod(residue[degree] * 28);
  q[degree - 16] = coefficient;
  for (let j = 0; j <= 16; j++) {
    residue[degree - 16 + j] = mod(residue[degree - 16 + j] - coefficient * factor[j]);
  }
}
assert.deepEqual(residue.slice(0, 16), Array(16).fill(0));
assert.equal(q[238], 1);

function prefix(pageNumber) {
  const page = corpus.pages.find((p) => p.page === pageNumber);
  assert.ok(page && page.indices.length >= 119);
  return page.indices.slice(0, 119);
}
const left = prefix(3);
const right = prefix(39);

/**
 * Repeated inputs must have repeated outputs for every deterministic
 * stationary codebook, including secret noninjective functions.
 * @param {number[][]} x Input GP29 coordinate pairs
 * @param {number[][]} y Output GP29 coordinate pairs
 */
function audit(x, y) {
  const f = new Map();
  const r = new Map();
  let forward = 0;
  let backward = 0;
  let witness = null;
  for (let i = 0; i < x.length; i++) {
    const input = x[i].join(',');
    const output = y[i].join(',');
    const old = f.get(input);
    if (old && old.output !== output) {
      forward++;
      if (!witness) witness = { input, first: old.index, second: i, firstOutput: old.output, secondOutput: output };
    } else if (!old) f.set(input, { output, index: i });
    if (r.has(output) && r.get(output) !== input) backward++;
    else if (!r.has(output)) r.set(output, input);
  }
  return { forward, backward, uniqueInputs: f.size, uniqueOutputs: r.size, witness };
}

const cases = [];
for (const reverse3 of [false, true]) {
  for (const reverse39 of [false, true]) {
    for (const reverseQ of [false, true]) {
      for (const layout of ['adjacent', 'halves']) {
        const x = Array.from({ length: 119 }, (_, i) => [
          left[reverse3 ? 118 - i : i],
          right[reverse39 ? 118 - i : i]
        ]);
        const coefficients = reverseQ ? q.slice(0, 238).reverse() : q.slice(0, 238);
        const y = Array.from({ length: 119 }, (_, i) => layout === 'adjacent'
          ? [coefficients[2 * i], coefficients[2 * i + 1]]
          : [coefficients[i], coefficients[119 + i]]);
        const result = audit(x, y);
        assert.ok(result.forward > 0);
        assert.ok(result.backward > 0);
        cases.push({ reverse3, reverse39, reverseQ, layout, ...result });
      }
    }
  }
}
assert.equal(cases.length, 16);
assert.equal(Math.min(...cases.map((x) => x.forward)), 7);
const x = Array.from({ length: 119 }, (_, i) => [left[i], right[i]]);
const planted = x.map(([a, b]) => [mod(2 * a + 3 * b + 5), mod(7 * a + 11 * b + 13)]);
const control = audit(x, planted);
assert.equal(control.forward, 0);
assert.equal(control.backward, 0);
assert.equal(mod(2 * 11 - 3 * 7), 1);

console.log(JSON.stringify({
  originalInputs: 'physical p3 and p39 first 119 runes, exact Q238 quotient from 256 grid bytes',
  cases,
  plantedFullRankAffineControl: control
}, null, 2));
console.log('PASS: sixteen original alignments contradict every stationary deterministic pair map; planted secret bijection passes.');
