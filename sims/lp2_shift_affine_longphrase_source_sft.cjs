'use strict';

/**
 * Source-exact GP29 constant-shift and affine-equivalent repeated substring census.
 * Original unknown LP2 pp0..55 only. No English scoring, key search, or reslicing.
 *
 * Node.js 22 / Windows 11:
 *   node sims/lp2_shift_affine_longphrase_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

/** @typedef {{ page:number, indices:number[] }} Page */
/** @typedef {{ start:number, end:number, runes:string }} RuneWord */
/** @typedef {[number, number]} IndexPair */

const data = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
/** @type {Page[]} */
const pages = data.pages.filter((p) => p.page <= 55);
const values = pages.flatMap((p) => p.indices);
assert.equal(pages.length, 56);
assert.equal(values.length, 12956);

const inverse = new Int8Array(29);
for (let a = 1; a < 29; a++) {
  for (let b = 1; b < 29; b++) {
    if ((a * b) % 29 === 1) {
      inverse[a] = b;
      break;
    }
  }
  assert.ok(inverse[a] > 0);
}

/**
 * Canonical form for a contiguous word under all 29 additive shifts,
 * or all 812 invertible affine transforms of GF(29).
 *
 * @param {number[]} source Full original rune-index stream.
 * @param {number} i Zero-based substring offset.
 * @param {number} len Contiguous substring length.
 * @param {'shift'|'affine'} mode Equivalence family.
 * @returns {string} Exact normalized rune-key.
 */
function canonical(source, i, len, mode) {
  const base = source[i];
  let mul = 1;
  if (mode === 'affine') {
    let firstDifferent = i + 1;
    while (firstDifferent < i + len && source[firstDifferent] === base) firstDifferent++;
    if (firstDifferent === i + len) return 'all-same:' + len;
    mul = inverse[(source[firstDifferent] - base + 29) % 29];
  }
  const norm = [];
  for (let k = 0; k < len; k++) {
    norm.push((((source[i + k] - base + 29) % 29) * mul) % 29);
  }
  return norm.join(',');
}

/**
 * Find all non-overlapping equivalent literal contiguous substrings.
 * No calls to a plaintext dictionary, statistical fitter, or key-seeded decoder.
 *
 * @param {number[]} source Rune indices.
 * @param {number} len Substring length.
 * @param {'shift'|'affine'} mode Equivalence family.
 * @returns {IndexPair[]} Pairs in scan order (later offset ascending).
 */
function scan(source, len, mode) {
  /** @type {Map<string, number[]>} */
  const seen = new Map();
  /** @type {IndexPair[]} */
  const pairs = [];
  for (let i = 0; i + len <= source.length; i++) {
    const key = canonical(source, i, len, mode);
    const earlier = seen.get(key);
    if (earlier) {
      for (const j of earlier) if (i - j >= len) pairs.push([j, i]);
      earlier.push(i);
    } else seen.set(key, [i]);
  }
  return pairs;
}

const expectedShift6 = [[2264, 5092], [9078, 10995], [6555, 12950]];
const shift6 = scan(values, 6, 'shift');
const shift7 = scan(values, 7, 'shift');
const affine6 = scan(values, 6, 'affine');
const affine7 = scan(values, 7, 'affine');
const affine8 = scan(values, 8, 'affine');
assert.deepEqual(shift6, expectedShift6);
assert.deepEqual(shift7, []);
assert.equal(affine6.length, 109);
assert.deepEqual(affine7, [[3214, 8143]]);
assert.deepEqual(affine8, []);

// Word segmentation respects the original printed word ends only.
// Source line breaks and physical-page '%' markers do not close a word.
const runes = new Set(data.runes);
const raw = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8')
  .split('%').slice(0, 55).join('%');
/** @type {RuneWord[]} */
const words = [];
let pending = '';
let start = 0;
let runeIndex = 0;
function finishWord() {
  if (!pending) return;
  words.push({ start, end: runeIndex, runes: pending });
  pending = '';
}
for (const ch of raw) {
  if (runes.has(ch)) {
    if (!pending) start = runeIndex;
    pending += ch;
    runeIndex++;
  } else if ('-.&$§'.includes(ch)) finishWord();
}
finishWord();
assert.equal(words.length, 2896);
assert.equal(runeIndex, values.length);

/** @type {Set<number>} */
const completeThreeThreeStarts = new Set();
for (let i = 0; i < words.length - 1; i++) {
  const a = words[i], b = words[i + 1];
  if (a.end === b.start && a.end - a.start === 3 && b.end - b.start === 3) {
    completeThreeThreeStarts.add(a.start);
  }
}
const wordAlignedShift6 = shift6.filter(([i, j]) =>
  completeThreeThreeStarts.has(i) && completeThreeThreeStarts.has(j));
assert.deepEqual(wordAlignedShift6, [[6555, 12950]]);

const cuts = [0];
for (const p of pages) cuts.push(cuts.at(-1) + p.indices.length);
/**
 * @param {number} global Index in original LP2 unsolved corpus.
 * @returns {string}
 */
function place(global) {
  const page = pages.findIndex((p, i) => cuts[i] <= global && global < cuts[i + 1]);
  assert.ok(page >= 0);
  return 'p' + page + '[' + (global - cuts[page]) + ']';
}

// Calibrate scanners on direct planted affine and Caesar-equivalent repeats.
// The original array remains unchanged and is scanned separately above.
const affinePlant = values.slice();
for (let k = 0; k < 9; k++) affinePlant[5000 + k] = (7 * values[100 + k] + 3) % 29;
assert.ok(scan(affinePlant, 9, 'affine').some(([a, b]) => a === 100 && b === 5000));
const shiftPlant = values.slice();
for (let k = 0; k < 8; k++) shiftPlant[9000 + k] = (values[7000 + k] + 9) % 29;
assert.ok(scan(shiftPlant, 8, 'shift').some(([a, b]) => a === 7000 && b === 9000));

console.log('Original LP2 unknown runes:', values.length, '; complete original words:', words.length);
console.log('Six-rune non-overlapping same-Caesar-shift pairs:', shift6.length);
for (const [i, j] of shift6) {
  const shift = (values[j] - values[i] + 29) % 29;
  console.log('  ', place(i), place(j), 'shift=' + shift,
    'complete 3+3 words=' + (completeThreeThreeStarts.has(i) &&
      completeThreeThreeStarts.has(j)));
}
console.log('Seven-rune same-shift pairs:', shift7.length);
console.log('Six-rune affine pairs:', affine6.length);
console.log('Seven-rune affine pairs:', affine7.map(([i, j]) => place(i) + ' / ' + place(j)));
console.log('Eight-rune affine pairs:', affine8.length);
console.log('Positive controls: independent shift-8 and affine-9 plants both detected.');
console.log('PASS: only the historical p27/p55 DJU-BEI echo is 3+3-word aligned even allowing any Caesar shift.');
