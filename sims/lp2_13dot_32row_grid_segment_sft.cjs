'use strict';
// Exact 31 thirteen-dot-delimiter / 32-row-grid cipher-consumer gate.
// Run from repository root: node sims/lp2_13dot_32row_grid_segment_sft.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const ink = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8')).byte_rows;
/** @param {number[]} xs */
function ioc(xs) {
  if (xs.length < 2) return null;
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((acc, n) => acc + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
/** @param {number[]} xs @param {number} sign */
function transfer(xs, sign) {
  assert.equal(xs.length, 13136);
  const out = [];
  for (let group = 0; group < 32; group++) {
    for (let j = 0; j < boundaries[group + 1] - boundaries[group]; j++) {
      const k = grid[group][j % 8] % 29;
      const x = xs[boundaries[group] + j];
      out.push(((x + sign * k) % 29 + 29) % 29);
    }
  }
  return out;
}
assert.equal(corpus.pages.length, 58);
assert.equal(grid.length, 32);
assert(grid.every(row => row.length === 8 && row.every(x => Number.isInteger(x) && x >= 0 && x < 256)));
const ciphertext = corpus.pages.flatMap(p => p.indices);
assert.equal(ciphertext.length, 13136);
assert.equal(corpus.pages.slice(0, 56).reduce((s, p) => s + p.indices.length, 0), 12956);
const markerEvents = [];
let pageStart = 0;
for (const page of corpus.pages) {
  const marks = ink.pages.find(p => p.page === page.page)?.large_punctuation || [];
  for (const event of marks) {
    if (event[1] === 13) {
      assert(Number.isInteger(event[0]) && event[0] >= 0 && event[0] <= page.indices.length);
      markerEvents.push({ page: page.page, local: event[0], absolute: pageStart + event[0], color: event[2] });
    }
  }
  pageStart += page.indices.length;
}
markerEvents.sort((a, b) => a.absolute - b.absolute);
assert.equal(markerEvents.length, 31);
const boundaries = [0, ...markerEvents.map(e => e.absolute), ciphertext.length];
assert.equal(boundaries.length, 33);
assert(boundaries.every((n, i) => i === 0 || n >= boundaries[i - 1]));
const emptyGroups = [];
for (let i = 0; i < 32; i++) {
  if (boundaries[i] === boundaries[i + 1]) emptyGroups.push(i);
}
assert.deepEqual(emptyGroups, [8, 11]);
assert.equal(markerEvents.filter(e => e.page === 7 && e.local === 194).length, 2);
assert(markerEvents.some(e => e.page === 15 && e.local === 0));
const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
const planted = ciphertext.map((_, i) => solved[i % solved.length]);
const readings = [];
for (const sign of [-1, 1]) {
  const enc = transfer(planted, -sign);
  const dec = transfer(enc, sign);
  assert.deepEqual(dec, planted);
  const plain = transfer(ciphertext, sign);
  const unknown = plain.slice(0, 12956);
  assert.equal(unknown.length, 12956);
  const back = transfer(plain, -sign);
  assert.deepEqual(back, ciphertext);
  readings.push({
    sign,
    unsolved_ioc: ioc(unknown),
    planted_ioc: ioc(planted.slice(0, 12956)),
    segments_with_at_least_80_runes: boundaries.slice(0, -1).map((a, i) => ({
      id: i, from: a, length: boundaries[i + 1] - a,
      ioc: ioc(plain.slice(a, boundaries[i + 1]))
    })).filter(s => s.length >= 80)
  });
}
assert(Math.abs(readings[0].unsolved_ioc - 0.03447444183317249) < 1e-12);
assert(Math.abs(readings[1].unsolved_ioc - 0.034485463908423115) < 1e-12);
console.log(JSON.stringify({
  original_runes: ciphertext.length,
  original_13dot_marks: markerEvents.length,
  segments: 32,
  empty_groups: emptyGroups,
  empty_marker_pairs: [
    markerEvents.filter(e => e.page === 7 && e.local === 194),
    markerEvents.filter(e => (e.page === 14 && e.local === 137) || (e.page === 15 && e.local === 0))
  ],
  segment_lengths: boundaries.slice(0, -1).map((n, i) => boundaries[i + 1] - n),
  row_count: grid.length, row_width: 8,
  readings
}, null, 2));
