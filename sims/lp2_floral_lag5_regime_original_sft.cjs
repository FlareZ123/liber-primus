'use strict';

/**
 * Source-selected floral p40..55 versus other p0..39 original LP2:
 * compare previously established word-local lag-five equal-glyph feature.
 *
 * No decoder fitting. Source group is independently identified by identical
 * ornamental JPEG margins. Reuses exact canonical cross-page word parser and
 * independently maps every printed rune to physical page by source indices.
 * Windows 11, Node.js 22, read-only SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(
  path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const runes = new Set(Array.from('ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'));
const words = source.split('%').slice(0, 55).join('').replace(/[\/\s]/g, '')
  .split(/[-.&$§]+/).filter(w =>
    w.length > 0 && Array.from(w).every(x => runes.has(x)))
  .map(w => Array.from(w));

assert.equal(words.length, 2896);
const flat = words.flat();
assert.equal(flat.length, 12956);
const byIndex = new Map(corpus.runes.map((c, i) => [c, i]));
const actual = flat.map(x => {
  assert(byIndex.has(x));
  return byIndex.get(x);
});
const canonical = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.deepEqual(actual, canonical);
const pageIds = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices.map(() => p.page));
assert.equal(pageIds.length, actual.length);

const wid = words.flatMap((w, i) => w.map(() => i));
const counts = Array.from({ length: 56 }, (_, page) => ({
  page, inHits: 0, inN: 0, outHits: 0, outN: 0,
}));
for (let pos = 5; pos < flat.length; pos++) {
  const pg = pageIds[pos];
  const same = flat[pos] === flat[pos - 5];
  const w = wid[pos] === wid[pos - 5];
  if (w) {
    counts[pg].inN++;
    counts[pg].inHits += Number(same);
  } else {
    counts[pg].outN++;
    counts[pg].outHits += Number(same);
  }
}
assert.equal(counts.reduce((x, p) => x + p.inN, 0), 2105);
assert.equal(counts.reduce((x, p) => x + p.inHits, 0), 104);
assert.equal(counts.reduce((x, p) => x + p.outN, 0), 10846);
assert.equal(counts.reduce((x, p) => x + p.outHits, 0), 375);
const eligible = counts.filter(p => p.inN > 0);
assert.equal(eligible.length, 55);
const sourceSet = eligible.filter(p => p.page >= 40);
assert.equal(sourceSet.length, 15);
function sum(a, k) { return a.reduce((total, p) => total + p[k], 0); }
function rates(a, k) {
  const num = sum(a, k + 'Hits');
  const den = sum(a, k + 'N');
  return { hits: num, eligible: den, rate: num / den };
}
function contrast(a, b, k) {
  return rates(a, k).rate - rates(b, k).rate;
}
const otherSet = eligible.filter(p => p.page < 40);
const obsIn = contrast(sourceSet, otherSet, 'in');
const obsOut = contrast(sourceSet, otherSet, 'out');

let seed = 0x33012026;
function rand() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const trials = 100000;
let moreIn = 0, moreOut = 0;
let twoIn = 0, twoOut = 0;
const inDist = [];
for (let t = 0; t < trials; t++) {
  const a = eligible.slice();
  for (let j = 54; j > 0; j--) {
    const k = rand() % (j + 1);
    [a[k], a[j]] = [a[j], a[k]];
  }
  const first = a.slice(0, 15);
  const rest = a.slice(15);
  const dIn = contrast(first, rest, 'in');
  const dOut = contrast(first, rest, 'out');
  if (dIn >= obsIn) moreIn++;
  if (dOut >= obsOut) moreOut++;
  if (Math.abs(dIn) >= Math.abs(obsIn)) twoIn++;
  if (Math.abs(dOut) >= Math.abs(obsOut)) twoOut++;
  if (t < 100) inDist.push(dIn);
}
const result = {
  scope: 'source original floral p40..55 versus p0..39',
  withinWordLag5: {
    floral: rates(sourceSet, 'in'),
    other: rates(otherSet, 'in'),
    contrast: obsIn,
    nullOneSidedGe: moreIn,
    nullTwoSidedAbsGe: twoIn,
    permutations: trials,
    pTwoSidedAddOne: (twoIn + 1) / (trials + 1),
  },
  acrossWordLag5: {
    floral: rates(sourceSet, 'out'),
    other: rates(otherSet, 'out'),
    contrast: obsOut,
    nullOneSidedGe: moreOut,
    nullTwoSidedAbsGe: twoOut,
    permutations: trials,
    pTwoSidedAddOne: (twoOut + 1) / (trials + 1),
  },
  test: 'whole-page random label reassignment, fixed original words and ciphertext',
  sourceBytes: 'no transcription rerendering or rune changes',
  status: 'no decoding claim',
};
console.log(JSON.stringify(result, null, 2));
