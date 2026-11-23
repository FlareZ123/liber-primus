'use strict';

/**
 * Director #2401: original p0–p2 edge-derived 29-rune tabula recta and the
 * separate original p0 red13 title key. No fitted phase, hidden F skip,
 * page reset, or search over competing alphabets.
 * Read-only Windows 11 / Node.js 22 single-file test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const runeIndex = new Map(source.runes.map((r, i) => [r, i]));

/** @param {string} page @returns {number[][]} */
function linesOnPage(page) {
  return page.split('/').map(line => [...line].filter(r => runeIndex.has(r))
    .map(r => runeIndex.get(r))).filter(line => line.length);
}
const originalPages = transcript.split('%').slice(0, 3).map(linesOnPage);
const title = originalPages[0][0].slice(0, 13);
const lines = [
  { page: 0, indices: originalPages[0][0].slice(13) },
  ...originalPages.flatMap((pageLines, p) =>
    pageLines.slice(p === 0 ? 1 : 0).map(indices => ({ page: p, indices })))
];
const widths = [
  7,23,19,22,24,21,21,23,23,20,23,23,
  24,23,23,21,23,23,22,21,21,21,21,23,
  21,24,22,25,23,21,24,22,19
];
assert.equal(lines.length, 33);
assert.deepEqual(lines.map(l => l.indices.length), widths);
assert.equal(title.length, 13);
assert.deepEqual(title, source.pages[0].indices.slice(0, 13));

const edge = lines.flatMap(l => [l.indices[0], l.indices.at(-1)]);
const coreByPage = Array.from({ length: 3 }, (_, p) =>
  lines.filter(l => l.page === p).flatMap(l => l.indices.slice(1, -1)));
const original = coreByPage.flat();
const alphabet = [...new Set(edge)];
assert.equal(original.length, 650);
assert.equal(edge.length, 66);
assert.deepEqual(coreByPage.map(p => p.length), [225, 242, 183]);
assert.deepEqual(alphabet, [
  2,22,3,27,13,0,15,10,25,9,18,6,17,11,21,
  28,12,16,7,24,8,19,20,1,4,23,5,26,14
]);
let seen = new Set(), coverAt = 0;
for (let i = 0; i < edge.length; i++) {
  seen.add(edge[i]);
  if (seen.size === 29) { coverAt = i + 1; break; }
}
assert.equal(coverAt, 46);
// Strict original-source roundtrip through all 33 printed line boundaries.
let i = 0;
for (const l of lines) {
  const interior = original.slice(i, i + l.indices.length - 2);
  assert.deepEqual([l.indices[0], ...interior, l.indices.at(-1)], l.indices);
  i += interior.length;
}
assert.equal(i, 650);
for (let p = 0; p < 3; p++) {
  const actual = lines.filter(l => l.page === p).flatMap(l => l.indices);
  const expected = p === 0 ? source.pages[p].indices.slice(13) : source.pages[p].indices;
  assert.deepEqual(actual, expected, 'exact original page and title split');
}

/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
const rank = Array(29).fill(-1);
for (let j = 0; j < alphabet.length; j++) rank[alphabet[j]] = j;
assert.ok(rank.every(j => j >= 0));
/**
 * Historically attested ordinary 2014 Vigenere tabula-recta arithmetic,
 * replacing the published GP alphabet with the complete printed edge order.
 * The key is the disjoint original red13 heading and advances at each body rune.
 * @param {number[]} values
 * @param {1|-1} sign
 * @returns {number[]}
 */
function apply(values, sign) {
  return values.map((v, pos) =>
    alphabet[mod(rank[v] + sign * rank[title[pos % 13]])]);
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const f = Array(29).fill(0);
  for (const v of values) f[v]++;
  return f.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} values @returns {string} */
function show(values) {
  return values.map(x => source.translit[x]).join(' ');
}
const native = source.pages[57].indices;
assert.equal(native.length, 95);
const positive = Array.from({ length: 650 }, (_, j) => native[j % 95]);

const outcomes = [];
for (const sign of /** @type {Array<1|-1>} */ ([-1, 1])) {
  const decoded = apply(original, sign);
  assert.deepEqual(apply(decoded, /** @type {1|-1} */ (-sign)), original);
  // Native-plaintext plant, same literal key and custom alphabet.
  const planted = apply(positive, /** @type {1|-1} */ (-sign));
  assert.deepEqual(apply(planted, sign), positive);
  outcomes.push({
    sign: sign === -1 ? 'historical subtraction' : 'opposite direction',
    all650IoC: ioc(decoded),
    openingP0_225IoC: ioc(decoded.slice(0, 225)),
    untouchedP1P2_425IoC: ioc(decoded.slice(225)),
    first150OriginalCandidate: show(decoded.slice(0, 150)),
    complete650Candidate: show(decoded),
    exactOriginalReplay: true,
    native650PositiveRecovery: true
  });
}
const expected = [
  [0.034505155861088065, 0.034761904761904765, 0.03497225305216426],
  [0.034604717316581726, 0.03492063492063492, 0.03431742508324084]
];
for (let i = 0; i < outcomes.length; i++) {
  assert.ok(Math.abs(outcomes[i].all650IoC - expected[i][0]) < 1e-12);
  assert.ok(Math.abs(outcomes[i].openingP0_225IoC - expected[i][1]) < 1e-12);
  assert.ok(Math.abs(outcomes[i].untouchedP1P2_425IoC - expected[i][2]) < 1e-12);
}
console.log(JSON.stringify({
  source: 'original 17–19.jpg',
  sourceLengths: coreByPage.map(x => x.length),
  outerRunePositions: 66,
  fullAlphabetCoverTime: coverAt,
  customAlphabetIndices: alphabet,
  red13KeyIndices: title,
  originalCoreIoC: ioc(original),
  controls: { solvedP57NativeLength: native.length, plantedLength: positive.length },
  outcomes
}, null, 2));
console.log('PASS: complete original p0–p2 line-rune reconstruction; both historical orientations; p0/p1–2; exact original replay and 650/650 native plant');
