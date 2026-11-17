'use strict';
/**
 * LP2 single-rune A/I cryptanalytic gate for source-derived GF(29) LFSR keys.
 *
 * Every printed one-rune English word would decrypt to A or I, optionally O.
 * An unknown additive keystream whose characteristic polynomial is fixed by
 * a visible source can then be solved exactly from a handful of these cribs.
 *
 * Reads only original checked-in sources. Node.js 22 / Windows 11 SFT:
 * node sims/lp2_singleton_crib_source_poly_lfsr_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const corpus = JSON.parse(source('resources/liber-primus/lp2-corpus.json'));
const transcript = source('resources/liber-primus/lp2-transcription.txt');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const originalPages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const originalTape = originalPages.flatMap((page) => page.indices);
assert.equal(originalTape.length, 12956);
assert.equal(originalPages.length, 55);

// '%' separates rune-bearing physical pages; the numeric-only p50 has none.
// The first 55 segments belong to unsolved p0..55. '&' and '$' mark sections.
const printed = transcript.split('%').slice(0, originalPages.length).join('')
  .replace(/[&$\/\r\n]/g, '');
const words = printed.split(/[-.]/).filter((w) =>
  Array.from(w).some((r) => runeIndex.has(r))).map((word) =>
  Array.from(word).filter((r) => runeIndex.has(r)).map((r) => runeIndex.get(r)));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), originalTape);
const singletons = [];
let offset = 0;
for (const word of words) {
  if (word.length === 1) singletons.push({index: offset, value: word[0]});
  offset += word.length;
}
assert.equal(offset, 12956);
assert.equal(singletons.length, 83);
assert.deepEqual(singletons.slice(0, 5).map((p) => p.index),
  [176, 244, 350, 530, 644]);

const mod = (n) => ((n % 29) + 29) % 29;
/** @param {number} a @returns {number} */
function inverse(a) {
  for (let i = 1; i < 29; i++) if (mod(i * a) === 1) return i;
  throw Error('noninvertible nonzero GF29 coefficient');
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const p = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++) p[i + j] = mod(p[i + j] + a[i] * b[j]);
  return p;
}
const H = [3, 26, 24];         // Signed 2013 BASE29(3301)=3QO, low degree first
const G = [27, 5, 15];         // Original p39 red GP29 triad, low degree first
const HG = multiply(H, G);
assert.deepEqual(HG, [23, 21, 11, 17, 12]);
const P15 = [7, 10, 27, 14, 1]; // Signed-p15 matrix characteristic polynomial
const families = [
  ['2013 H', H], ['p39 G', G], ['H times G', HG],
  ['signed p15 chi', P15],
  ['(H times G) times (x-1)', multiply(HG, [28, 1])],
  ['signed p15 chi times (x-1)', multiply(P15, [28, 1])]
];
assert.deepEqual(families[4][1], [6, 2, 10, 23, 5, 12]);
assert.deepEqual(families[5][1], [22, 26, 12, 13, 13, 1]);

const chapterPages = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
let boundary = 0;
const chapters = chapterPages.map(([first, last]) => {
  const length = originalPages.filter((p) => p.page >= first && p.page <= last)
    .reduce((s, p) => s + p.indices.length, 0);
  const item = {name: 'p' + first + '..' + last, start: boundary, end: boundary + length};
  boundary += length;
  return item;
});
assert.equal(boundary, 12956);
assert.deepEqual(chapters.map((s) => s.end - s.start),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

/**
 * Field rank without fitting a plaintext, key, or arbitrary clock.
 * @param {number[][]} sourceRows @param {number} ncols @returns {number}
 */
function rank(sourceRows, ncols) {
  const a = sourceRows.map((row) => row.slice());
  let pivot = 0;
  for (let col = 0; col < ncols && pivot < a.length; col++) {
    let chosen = pivot;
    while (chosen < a.length && !a[chosen][col]) chosen++;
    if (chosen === a.length) continue;
    [a[pivot], a[chosen]] = [a[chosen], a[pivot]];
    const div = inverse(a[pivot][col]);
    for (let j = col; j < ncols; j++) a[pivot][j] = mod(a[pivot][j] * div);
    for (let i = pivot + 1; i < a.length; i++) {
      const factor = a[i][col];
      for (let j = col; j < ncols; j++) a[i][j] = mod(a[i][j] - factor * a[pivot][j]);
    }
    pivot++;
  }
  return pivot;
}
/**
 * Invert one full-rank source-only observation matrix over GF(29).
 * @param {number[][]} rows @param {number[]} values @returns {number[]}
 */
function solve(rows, values) {
  const r = values.length;
  const a = rows.map((row, i) => row.concat(values[i]));
  for (let col = 0; col < r; col++) {
    let i = col;
    while (i < r && !a[i][col]) i++;
    assert.ok(i < r, 'basis should have full rank');
    [a[col], a[i]] = [a[i], a[col]];
    const div = inverse(a[col][col]);
    for (let j = col; j <= r; j++) a[col][j] = mod(a[col][j] * div);
    for (let k = 0; k < r; k++) {
      if (k === col) continue;
      const factor = a[k][col];
      for (let j = col; j <= r; j++) a[k][j] = mod(a[k][j] - factor * a[col][j]);
    }
  }
  return a.map((row) => row[r]);
}
/**
 * The nth keystream symbol is a linear function of the unknown first r
 * symbols, with a completely fixed source characteristic polynomial.
 * @param {number[]} polynomial ascending GF29 coefficients
 * @param {number} count
 * @returns {number[][]}
 */
function coefficientRows(polynomial, count) {
  const r = polynomial.length - 1;
  const scale = inverse(polynomial[r]);
  const coefficients = polynomial.slice(0, r).map((x) => mod(-x * scale));
  const rows = Array.from({length: Math.max(count, r)}, () => Array(r).fill(0));
  for (let i = 0; i < r; i++) rows[i][i] = 1;
  for (let n = r; n < count; n++) {
    for (let j = 0; j < r; j++) {
      let sum = 0;
      for (let k = 0; k < r; k++)
        sum += coefficients[k] * rows[n - r + k][j];
      rows[n][j] = mod(sum);
    }
  }
  return rows;
}
/**
 * Exhaust every 2^r or 3^r initial-secret assignment implied by independent
 * A/I(/O) words. There are no arbitrary secret-key guesses outside this set.
 * @param {{index:number,value:number}[]} observations
 * @param {number[]} polynomial
 * @param {number} start
 * @param {number} end
 * @param {number[]} permitted GP29 A/I or A/I/O
 * @returns {{observations:number,rank:number,maxMatched:number|null,
 *   exactSeeds:number|null,exampleSeed:number[]|null}}
 */
function gate(observations, polynomial, start, end, permitted) {
  const r = polynomial.length - 1;
  const selected = observations.filter((p) => p.index >= start && p.index < end);
  const count = Math.max(r, ...selected.map((p) => p.index - start + 1));
  const rows = coefficientRows(polynomial, count);
  const tagged = selected.map((p) => ({value:p.value, vector:rows[p.index - start]}));
  const independent = [];
  for (const obs of tagged) {
    if (rank(independent.map((p) => p.vector).concat([obs.vector]), r) >
        independent.length) independent.push(obs);
    if (independent.length === r) break;
  }
  if (independent.length < r)
    return {observations: selected.length, rank: independent.length,
      maxMatched: null, exactSeeds: null, exampleSeed: null};

  let best = -1;
  let exactSeeds = 0;
  let exampleSeed = null;
  for (let assignment = 0; assignment < permitted.length ** r; assignment++) {
    let choice = assignment;
    const requiredKeys = independent.map((p) => {
      const plain = permitted[choice % permitted.length];
      choice = Math.floor(choice / permitted.length);
      return mod(p.value - plain);
    });
    const seed = solve(independent.map((p) => p.vector), requiredKeys);
    let matched = 0;
    for (const item of tagged) {
      const k = mod(item.vector.reduce((s, v, i) => s + v * seed[i], 0));
      if (permitted.includes(mod(item.value - k))) matched++;
    }
    if (matched > best) best = matched;
    if (matched === selected.length) {
      exactSeeds++;
      exampleSeed = seed;
    }
  }
  return {observations: selected.length, rank: r,
    maxMatched: best, exactSeeds, exampleSeed};
}

console.log('Original LP2: ' + originalTape.length + ' runes, ' +
  words.length + ' printed words, ' + singletons.length + ' one-rune words.');
console.log('Conditional plaintext singleton sets: A/I=24,10; A/I/O=24,10,3.');
for (const [name, polynomial] of families) {
  const wholeAI = gate(singletons, polynomial, 0, 12956, [24, 10]);
  const wholeAIO = gate(singletons, polynomial, 0, 12956, [24, 10, 3]);
  assert.equal(wholeAI.exactSeeds, 0);
  assert.equal(wholeAIO.exactSeeds, 0);

  // A source-matched encrypted positive: 83 A/I symbols at the same original
  // positions under a secret source-recurrence seed; exactly recover the seed.
  const plantedSeed = [2, 3, 5, 7, 11].slice(0, polynomial.length - 1);
  const rows = coefficientRows(polynomial, 12956);
  const planted = singletons.map((p, i) => ({
    index: p.index,
    value: mod(p.value - p.value +
      (i % 2 ? 24 : 10) +
      rows[p.index].reduce((s, v, j) => s + v * plantedSeed[j], 0))
  }));
  const plantedResult = gate(planted, polynomial, 0, 12956, [24, 10]);
  assert.equal(plantedResult.exactSeeds, 1);
  assert.deepEqual(plantedResult.exampleSeed, plantedSeed);

  console.log('\n' + name + ' | degree ' + (polynomial.length - 1) +
    ' | coefficients low-to-high ' + polynomial.join(','));
  console.log('  Whole-book A/I: ' + wholeAI.maxMatched + '/83 maximum; zero keys.');
  console.log('  Whole-book A/I/O: ' + wholeAIO.maxMatched + '/83 maximum; zero keys.');
  for (const ch of chapters) {
    const a = gate(singletons, polynomial, ch.start, ch.end, [24, 10]);
    const b = gate(singletons, polynomial, ch.start, ch.end, [24, 10, 3]);
    const result = (z) => z.exactSeeds === null ? 'insufficient rank ' +
      z.rank + '/' + (polynomial.length - 1) : 'maximum ' +
      z.maxMatched + '/' + z.observations + ', candidate keys ' + z.exactSeeds;
    console.log('  ' + ch.name + ' (' + a.observations + ' short words): A/I ' +
      result(a) + '; A/I/O ' + result(b));
  }
  console.log('  Independent planted 83-anchor hidden seed: recovered exactly.');
}
