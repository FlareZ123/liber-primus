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

/**
 * Lossless dot-versus-neighbor subtraction keeps 13 differences plus
 * 14 explicit neighbor symbols per 27-cell tile. The 351 differences
 * could carry native plaintext if this hypothesized numeric consumer
 * were intended, while the retained 378 symbols recover the source.
 *
 * @param {number[]} input
 * @param {13|14} shift 13 pairs each dot with left blank; 14 with right
 * @returns {{differences: number[], mask: number[]}}
 */
function dotDifferences(input, shift) {
  const differences = [];
  const mask = [];
  for (let k = 0; k < input.length; k += 27) {
    const tile = input.slice(k, k + 27);
    const offsets = Array.from({ length: 14 }, (_, i) => (13 + i));
    const mate = Array.from({ length: 13 }, (_, i) => i + shift);
    const extras = offsets.filter((i) => !mate.includes(i));
    assert.equal(extras.length, 1);
    mate.forEach((i, j) => {
      differences.push((tile[j] - tile[i] + 29) % 29);
      mask.push(tile[i]);
    });
    mask.push(tile[extras[0]]);
  }
  return { differences, mask };
}

/**
 * @param {{differences: number[], mask: number[]}} stream
 * @param {13|14} shift
 * @returns {number[]}
 */
function recoverDotDifferences(stream, shift) {
  const out = [];
  for (let k = 0; k < stream.differences.length / 13; k++) {
    const tile = Array(27);
    const d = stream.differences.slice(13 * k, 13 * (k + 1));
    const mask = stream.mask.slice(14 * k, 14 * (k + 1));
    for (let j = 0; j < 13; j++) {
      tile[j + shift] = mask[j];
      tile[j] = (d[j] + mask[j]) % 29;
    }
    tile[shift === 13 ? 26 : 13] = mask[13];
    out.push(...tile);
  }
  return out;
}

const differenceResults = [];
for (const shift of [13, 14]) {
  const stream = dotDifferences(seq, shift);
  assert.equal(stream.differences.length, 351);
  assert.equal(stream.mask.length, 378);
  assert.deepEqual(recoverDotDifferences(stream, shift), seq);
  const planted = dotDifferences(plant, shift);
  assert.deepEqual(recoverDotDifferences(planted, shift), plant);
  const nativeMessage = Array.from({ length: 351 }, (_, i) => native[i % native.length]);
  const nativeMask = Array.from({ length: 378 }, (_, i) => seq[(i * 17) % seq.length]);
  const nativeCipher = recoverDotDifferences(
    { differences: nativeMessage, mask: nativeMask }, shift
  );
  assert.deepEqual(dotDifferences(nativeCipher, shift).differences, nativeMessage);
  assert.equal(nativeCipher.length, 729);
  differenceResults.push({
    sourceNeighbors: shift === 13 ? 'left blank' : 'right blank',
    firstTwenty: stream.differences.slice(0, 20).map((i) => corpus.translit[i]).join(' '),
    ioc: ioc(stream.differences),
    plantedNativeMessageIoc: ioc(nativeMessage),
    plantedNativeMessageRecoveredRunes: nativeMessage.length,
    all729RecoveredFrom351DifferencesAnd378MaskRunes: true
  });
}

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
  differenceResults,
  exactForwardBackwardAll729: true,
  exactNativeSolvedP57PlantAll729: true,
  conclusion: 'This keyless stencil transposition yields no legible original opening and no independent second cipher operation.'
}, null, 2));
