'use strict';

/**
 * Exact key-independent native-GP equality test for a 300-column floral
 * inter-block CBC-like feedback model, over 10 complete and 1 short block.
 * C[b,i] = C[b-1,i] + K[i] + pi[i](P[b,i]) mod29 for b>=1,
 * with 300 arbitrary secret K entries and 300 arbitrary secret bijections.
 * No Cicada source selects this opcode; length geometry motivates the test.
 *
 * Windows Node.js22 SFT:
 *   node sims/lp2_floral_300column_cbc_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } =
  require('./lp2_native_gp_source_orthography_sft.cjs');
const base = path.join(__dirname, '..');
/** @param {string} rel Repository-relative path. @returns {string} UTF8 data. */
const read = (rel) => fs.readFileSync(path.join(base, rel), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const head = gp.pages.filter((p) => p.page >= 40 && p.page <= 53)
  .flatMap((p) => p.indices);
const end = gp.pages.filter((p) => p.page >= 54 && p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(head.length, 3008);
assert.equal(end.length, 308);
const original = head.slice(8).concat(end.slice(9));
assert.equal(original.length, 3299);
const mod = (n) => ((n % 29) + 29) % 29;
const lengths = Array(11).fill(300);
lengths[10] = 299;

/** @param {number[]} seq Original-shaped 3299 rune stream.
 * @returns {number[][]} Eleven consecutive phase-aligned rows. */
function rows(seq) {
  assert.equal(seq.length, 3299);
  return lengths.map((len, b) => seq.slice(b * 300, b * 300 + len));
}

/** @param {number[][]} rs Eleven phase-aligned rows.
 * @returns {number[][]} Ten difference rows (last is 299). */
function betweenBlocks(rs) {
  return Array.from({ length: 10 }, (_, b) =>
    rs[b + 1].map((c, i) => mod(c - rs[b][i])));
}

/** @param {number[][]} tapes Ten aligned 300-column tapes.
 * @returns {{equals:number,possible:number}} Same-phase repeated-rune test. */
function alignedEquals(tapes) {
  let equals = 0, possible = 0;
  for (let a = 0; a < tapes.length; a += 1)
    for (let b = a + 1; b < tapes.length; b += 1)
      for (let j = 0; j < Math.min(tapes[a].length, tapes[b].length); j += 1) {
        possible += 1;
        equals += Number(tapes[a][j] === tapes[b][j]);
      }
  return { equals, possible };
}
const sourceReadout = betweenBlocks(rows(original));
const observed = alignedEquals(sourceReadout);
assert.deepEqual(sourceReadout.map((r) => r.length),
  Array(9).fill(300).concat([299]));
assert.deepEqual(observed, { equals: 446, possible: 13491 });

const nativeControls = {};
let gibran;
for (const [name, file] of [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
]) {
  const source = encodeSourceNativeGP(read(file));
  if (name === 'Gibran') gibran = source;
  const counts = [];
  for (let j = 0; j < 300; j += 1) {
    const at = (137 + 7919 * j) % (source.length - 3299);
    const sample = rows(source.slice(at, at + 3299)).slice(1);
    counts.push(alignedEquals(sample).equals);
  }
  const min = Math.min(...counts), max = Math.max(...counts);
  assert.ok(min > observed.equals);
  nativeControls[name] = { sourceNativeWindows: counts.length, min, max,
    originalEqualsAtOrAboveNativeMinimum: false };
}

// Positive: 300 independent nontrivial secret GP29 phase permutations and
// 300 independent phase keys, plus arbitrary first-block cipher state.
let seed = 0x3301cb30;
/** @returns {number} Test-seeded 32-bit unsigned word. */
function next32() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return seed >>> 0;
}
const secret = Array.from({ length: 300 }, () => next32() % 29);
const perm = Array.from({ length: 300 }, () => {
  const a = Array.from({ length: 29 }, (_, i) => i);
  for (let i = 28; i > 0; i -= 1) {
    const j = next32() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
});
const inv = perm.map((p) => {
  const a = new Array(29);
  p.forEach((x, i) => { a[x] = i; });
  return a;
});
const native = gibran.slice(113, 3412);
assert.equal(native.length, 3299);
const nativeRows = rows(native);
const cipherRows = [Array.from({ length: 300 }, () => next32() % 29)];
for (let b = 1; b < 11; b += 1)
  cipherRows.push(nativeRows[b].map((p, i) =>
    mod(cipherRows[b - 1][i] + secret[i] + perm[i][p])));
const planted = betweenBlocks(cipherRows);
const recovered = planted.map((dr, b) =>
  dr.map((v, i) => inv[i][mod(v - secret[i])]));
assert.deepEqual(recovered, nativeRows.slice(1));
const expected = alignedEquals(nativeRows.slice(1));
assert.deepEqual(alignedEquals(planted), expected);
assert.ok(expected.equals > observed.equals);

console.log(JSON.stringify({
  original: { sourcePages: '40..53 + 54..55', printedBlackLengths: [3000,299],
    firstFullBlocks: 10, lastShortBlock: 299,
    originalInterblockDifferenceEquals: observed,
    sourceFirstDifferenceRunes: sourceReadout[0].slice(0,20) },
  nativeControls,
  positivePlant: { recoveredGP29Runes: 2999,
    secretPhaseAlphabets: 300, phaseKeyEntries: 300,
    nativeEquals: expected.equals, plantedEquals: alignedEquals(planted).equals },
  decision: 'One-tap across-300-column CBC with a shared phase key is contradicted by original equality, despite any unknown 300 GP29 phase permutations.'
}, null, 2));
