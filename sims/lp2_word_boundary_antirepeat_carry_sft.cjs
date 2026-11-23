'use strict';

/**
 * Original-input LP2 printed-word boundary carry gate.
 * Run: node sims/lp2_word_boundary_antirepeat_carry_sft.cjs
 * No third-party packages and no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const input = (name) => fs.readFileSync(path.join(root, 'resources', name), 'utf8');
const corpus = JSON.parse(input('liber-primus/lp2-corpus.json'));
const tape = input('liber-primus/lp2-transcription.txt');
const solved = JSON.parse(input('external/relikd-solved-gp29-native-v1.json'));
const gp = new Map(corpus.runes.map((glyph, index) => [glyph, index]));

/** @type {{value:number,before:string}[]} */
const locations = [];
let before = '';
for (const glyph of tape) {
  if (gp.has(glyph)) {
    locations.push({ value: gp.get(glyph), before });
    before = '';
  } else {
    before += glyph;
  }
}
assert.equal(locations.length, 13136, 'full 58-page source rune count');

/** @type {Array<{page:number,pairs:Array<[number,number]>}>} */
const boundaryByPage = [];
let wordInside = 0;
let wordInsideEqual = 0;
let boundaryCount = 0;
let boundaryEqual = 0;
let allTransitions = 0;
let allEqual = 0;
let cursor = 0;
for (const page of corpus.pages) {
  const current = locations.slice(cursor, cursor + page.indices.length);
  assert.equal(current.length, page.indices.length);
  for (let index = 0; index < current.length; index++) {
    assert.equal(current[index].value, page.indices[index],
      'original transcription/corpus mismatch page ' + page.page + ' rune ' + index);
  }
  cursor += page.indices.length;
  if (page.page > 55) continue;
  /** @type {Array<[number,number]>} */
  const pairs = [];
  for (let i = 1; i < current.length; i++) {
    const previous = current[i - 1].value;
    const following = current[i].value;
    allTransitions++;
    if (previous === following) allEqual++;
    if (/[-.]/u.test(current[i].before)) {
      pairs.push([previous, following]);
      boundaryCount++;
      if (previous === following) boundaryEqual++;
    } else {
      wordInside++;
      if (previous === following) wordInsideEqual++;
    }
  }
  boundaryByPage.push({ page: page.page, pairs });
}
assert.equal(cursor, locations.length);
assert.deepEqual(
  { allTransitions, allEqual, boundaryCount, boundaryEqual, wordInside, wordInsideEqual },
  { allTransitions: 12901, allEqual: 86, boundaryCount: 2873,
    boundaryEqual: 23, wordInside: 10028, wordInsideEqual: 63 });

/**
 * Under a per-page uniform permutation of the observed successor glyphs,
 * hold every predecessor glyph fixed. This preserves original per-page
 * first/last rune inventories and the number of printed word boundaries.
 *
 * @param {Array<[number,number]>} pairs
 * @returns {{expected:number,variance:number}}
 */
function exactPermutationMoments(pairs) {
  const n = pairs.length;
  if (n < 2) return { expected: 0, variance: 0 };
  const first = Array(29).fill(0);
  const next = Array(29).fill(0);
  for (const [a, b] of pairs) { first[a]++; next[b]++; }
  const t = first.reduce((sum, a, i) => sum + a * next[i], 0);
  const mean = t / n;
  const sumSquare = first.reduce((sum, a, i) => sum + a * next[i] ** 2, 0);
  const sameFirst = first.reduce((sum, a, i) => sum + a * (a - 1) * next[i], 0);
  const factorialMoment = (t * t - sumSquare - sameFirst) / (n * (n - 1));
  return { expected: mean, variance: factorialMoment + mean - mean * mean };
}
assert.deepEqual(exactPermutationMoments([[0, 0], [1, 1]]),
  { expected: 1, variance: 1 }, 'two-symbol exact permutation control');
const moments = boundaryByPage
  .map(({ pairs }) => exactPermutationMoments(pairs))
  .reduce((out, item) => ({
    expected: out.expected + item.expected,
    variance: out.variance + item.variance,
  }), { expected: 0, variance: 0 });
const z = (boundaryEqual - moments.expected) / Math.sqrt(moments.variance);
assert.ok(Math.abs(moments.expected - 100.77990995074072) < 1e-9);
assert.ok(Math.abs(moments.variance - 95.47022280407451) < 1e-9);
assert.ok(Math.abs(z - (-7.960373915803229)) < 1e-9);

/** The native solved reference includes genuine first-release and final LP2 plaintext. */
let nativeBoundaries = 0;
let nativeEqual = 0;
for (const section of solved.sections) {
  let previous = null;
  let separator = false;
  for (const glyph of section.source_text) {
    if (gp.has(glyph)) {
      const current = gp.get(glyph);
      if (previous !== null && separator) {
        nativeBoundaries++;
        if (current === previous) nativeEqual++;
      }
      previous = current;
      separator = false;
    } else if (glyph === '•' || glyph === '⁚' || /\s/u.test(glyph)) {
      separator = true;
    }
  }
}
assert.deepEqual({ nativeBoundaries, nativeEqual },
  { nativeBoundaries: 726, nativeEqual: 24 });

console.log('PASS original LP2 source: ' + allTransitions +
  ' within-page transitions, ' + allEqual + ' adjacent equals');
console.log('PASS printed boundaries: ' + boundaryEqual + '/' + boundaryCount +
  ' equals; within same printed word and page: ' +
  wordInsideEqual + '/' + wordInside);
console.log('PASS original page-conditioned permutation null E=' +
  moments.expected.toFixed(12) + ', variance=' +
  moments.variance.toFixed(12) + ', z=' + z.toFixed(9));
console.log('PASS solved-native word boundaries: ' +
  nativeEqual + '/' + nativeBoundaries + ' equals');
console.log('Classification: cross-word dependence constraint, no unknown plaintext or key.');
