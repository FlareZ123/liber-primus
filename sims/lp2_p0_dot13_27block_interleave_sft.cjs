/** Source-motivated 13-hole/14-blank interleave on the 729-rune LP2 opening. */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const seq = corpus.pages.slice(0, 3).flatMap((page) => page.indices);
const p0 = ink.pages.find((p) => p.page === 0);

assert.deepEqual(corpus.pages.slice(0, 3).map((p) => p.runic_count), [262, 266, 201]);
assert.equal(seq.length, 729); // 27^2, exactly 27 tiles of 3x9=27 cells.
assert.deepEqual(p0.red_spans[0], {
  start: 0, length: 13, runes: 'ᛋᚻᛖᚩᚷᛗᛡᚠᛋᚣᛖᛝᚳ'
});
assert(p0.large_punctuation.some((m) => m[0] === 13 && m[1] === 13 && m[2] === 'red'));

const rows = ['.#.', '#.#', '.#.', '#.#', '.#.', '#.#', '.#.', '#.#', '.#.'];
const occupied = [...rows.join('')].flatMap((ch, i) => ch === '#' ? [i] : []);
const empty = [...rows.join('')].flatMap((ch, i) => ch === '.' ? [i] : []);
assert.deepEqual(occupied, Array.from({ length: 13 }, (_, i) => 2 * i + 1));
assert.deepEqual(empty, Array.from({ length: 14 }, (_, i) => 2 * i));

/** @param {number[]} input @returns {number[]} */
function interleave(input) {
  assert.equal(input.length % 27, 0);
  const out = [];
  for (let k = 0; k < input.length; k += 27) {
    const tile = Array(27);
    occupied.forEach((index, i) => { tile[index] = input[k + i]; });
    empty.forEach((index, i) => { tile[index] = input[k + 13 + i]; });
    out.push(...tile);
  }
  return out;
}

/** @param {number[]} input @returns {number[]} */
function deinterleave(input) {
  assert.equal(input.length % 27, 0);
  const out = [];
  for (let k = 0; k < input.length; k += 27) {
    occupied.forEach((index) => out.push(input[k + index]));
    empty.forEach((index) => out.push(input[k + index]));
  }
  return out;
}

/** @param {number[]} input @returns {number} */
function adjacentEquals(input) {
  return input.slice(1).reduce((n, value, i) => n + Number(value === input[i]), 0);
}

/** @param {number[]} input @returns {number} */
function ioc(input) {
  const counts = Array(29).fill(0);
  input.forEach((value) => { counts[value]++; });
  return counts.reduce((n, count) => n + count * (count - 1), 0) /
    (input.length * (input.length - 1));
}

const routed = interleave(seq);
assert.deepEqual(deinterleave(routed), seq);
const native = corpus.pages.find((p) => p.page === 57).indices;
const plant = Array.from({ length: 729 }, (_, i) => native[i % native.length]);
assert.deepEqual(deinterleave(interleave(plant)), plant);
assert.equal(ioc(routed), ioc(seq)); // Any lossless positional transposition preserves the histogram.
assert.equal(adjacentEquals(seq), 4);
assert.equal(adjacentEquals(routed), 26);
assert.equal(ioc(seq), 0.034082515563997044);

const spell = (arr) => arr.map((index) => corpus.translit[index]).join(' ');
console.log(JSON.stringify({
  source: 'LP2 physical pp0-2, original archive 17-19.jpg',
  sourceWordLengths: [8, 5],
  tile: '3x9 stencil repeated 27 times over 729 GP29 runes',
  occupied, empty,
  originalStart: spell(seq.slice(0, 27)),
  interleavedStart: spell(routed.slice(0, 27)),
  originalAdjacentEquals: adjacentEquals(seq),
  interleavedAdjacentEquals: adjacentEquals(routed),
  originalIoc: ioc(seq),
  interleavedIoc: ioc(routed),
  exactForwardBackwardAll729: true,
  exactNativeSolvedP57PlantAll729: true,
  conclusion: 'This keyless stencil transposition yields no legible original opening and no independent second cipher operation.'
}, null, 2));
