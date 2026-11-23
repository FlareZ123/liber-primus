'use strict';

/**
 * Single-file test (Node.js 22, CommonJS) for the physical p40–p55
 * 3,301-transition observation and its lossless 29-symbol difference tape.
 *
 * Run from any directory with Node.js:
 *   node sims/lp2_floral_3301_transition_sft.cjs
 *
 * Source: resources/liber-primus/lp2-corpus.json (original LP2 p50 included).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const unknown = corpus.pages.filter((page) => page.page >= 0 && page.page <= 55);
const floral = unknown.filter((page) => page.page >= 40 && page.page <= 55);
const modulus = 29;

assert.equal(unknown.length, 56);
assert.equal(floral.length, 16);
for (let i = 0; i < unknown.length; i += 1) {
  assert.equal(unknown[i].page, i);
}
assert.equal(floral[10].page, 50);
assert.equal(floral[10].indices.length, 0);

const totalRunes = floral.reduce((sum, page) => sum + page.indices.length, 0);
const activePages = floral.filter((page) => page.indices.length > 0);
const edges = floral.reduce((sum, page) =>
  sum + Math.max(page.indices.length - 1, 0), 0);
const edgeCountsByPage = floral.map((page) => Math.max(page.indices.length - 1, 0));

assert.equal(totalRunes, 3316);
assert.equal(activePages.length, 15);
assert.equal(edges, 3301);
assert.deepEqual(edgeCountsByPage, [
  230, 272, 271, 273, 272, 269, 269, 273,
  270, 65, 0, 91, 262, 178, 231, 75
]);

// The transport is lossless because each physical rune-bearing page retains
// its first GP29 rune. This is a ciphertext transformation, not a plaintext
// decoder and no hidden key is inferred.
const transport = floral.map((page) => {
  const sequence = page.indices;
  const deltas = sequence.slice(1).map((value, index) =>
    (value - sequence[index] + modulus) % modulus);
  return {
    page: page.page,
    head: sequence.length ? sequence[0] : null,
    deltas
  };
});
assert.equal(transport.reduce((sum, entry) => sum + entry.deltas.length, 0), 3301);

for (let i = 0; i < floral.length; i += 1) {
  const entry = transport[i];
  const restored = entry.head === null ? [] : [entry.head];
  for (const difference of entry.deltas) {
    restored.push((restored[restored.length - 1] + difference) % modulus);
  }
  assert.deepEqual(restored, floral[i].indices, `round-trip physical p${entry.page}`);
}

// Uniqueness within the explicitly bounded family of every contiguous
// physical p0–p55 interval (56 * 57 / 2 = 1,596 candidates).
const exactIntervals = [];
let intervalCount = 0;
for (let start = 0; start < unknown.length; start += 1) {
  let count = 0;
  for (let end = start; end < unknown.length; end += 1) {
    count += Math.max(unknown[end].indices.length - 1, 0);
    intervalCount += 1;
    if (count === 3301) exactIntervals.push([start, end]);
  }
}
assert.equal(intervalCount, 1596);
assert.deepEqual(exactIntervals, [[40, 55]]);

// A fourfold exhaustive nonself-edge cycle (812 possible ordered pairs) is
// incompatible with the observed broad original edge-multiplicity spectrum.
const matrix = Array.from({ length: modulus }, () => Array(modulus).fill(0));
for (const page of floral) {
  for (let index = 1; index < page.indices.length; index += 1) {
    matrix[page.indices[index - 1]][page.indices[index]] += 1;
  }
}
let equalEdges = 0;
const nonselfHistogram = new Map();
for (let predecessor = 0; predecessor < modulus; predecessor += 1) {
  equalEdges += matrix[predecessor][predecessor];
  for (let successor = 0; successor < modulus; successor += 1) {
    if (predecessor === successor) continue;
    const n = matrix[predecessor][successor];
    nonselfHistogram.set(n, (nonselfHistogram.get(n) || 0) + 1);
  }
}
assert.equal(equalEdges, 21);
assert.equal(nonselfHistogram.get(0), 11);
assert.equal(nonselfHistogram.get(14), 1);
assert.equal(Array.from(nonselfHistogram.values()).reduce((a, b) => a + b, 0), 812);

console.log('PASS: p40–55 total GP29 runes:', totalRunes);
console.log('PASS: active rune-bearing pages:', activePages.length);
console.log('PASS: within-page transitions:', edges);
console.log('PASS: exact intervals in 1,596 tested:', JSON.stringify(exactIntervals));
console.log('PASS: 15 page heads + 3,301 GP29 differences restore the original 3,316 runes');
console.log('PASS: equal-edge events:', equalEdges);
console.log('PASS: distinct nonself ordered-edge multiplicities:',
  JSON.stringify(Array.from(nonselfHistogram.entries()).sort((a, b) => a[0] - b[0])));
