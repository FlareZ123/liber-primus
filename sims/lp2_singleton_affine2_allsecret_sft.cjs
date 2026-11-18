#!/usr/bin/env node
'use strict';

/**
 * Standalone all-secret original-source affine order-two GP29 key gate.
 * Windows 11 / Node.js 22, CommonJS, read-only.
 *
 * Hypothetical K[i+2]=(a*K[i+1]+b*K[i]+c) mod29 for arbitrary
 * a,b,c,K[0],K[1] in F29: 29^5 = 20,511,149 exact models per clock.
 * Every complete cipher word of one rune must be A or I in ordinary
 * native-GP English; grant archaic poetic O as an additional option.
 * Tests both the whole book and independent visual-chapter resets.
 *
 * Run: node sims/lp2_singleton_affine2_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} p */
function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');

const pages = gp.pages.filter((p) => p.page <= 55);
const sourceCipher = pages.flatMap((p) => p.indices);
assert.equal(pages.length, 56);
assert.equal(sourceCipher.length, 12956);
assert.equal(gp.runes.length, 29);
const fragmentPages = transcription.split('%').slice(0, 55);
assert.equal(fragmentPages.length, 55);
const joined = fragmentPages.join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const runeIndices = new Map(gp.runes.map((s, i) => [s, i]));
assert.deepEqual([...joined].filter((s) => runeIndices.has(s))
  .map((s) => runeIndices.get(s)), sourceCipher,
  'Source text and original ciphertext index vectors must agree');
const printedWords = [...joined.matchAll(new RegExp(
  '[' + gp.runes.join('') + ']+', 'gu'
))].map((m) => m[0]);
assert.equal(printedWords.length, 2896);
const singletonPositions = [];
let cursor = 0;
for (const word of printedWords) {
  const length = [...word].length;
  if (length === 1) singletonPositions.push(cursor);
  cursor += length;
}
assert.equal(cursor, 12956);
assert.equal(singletonPositions.length, 83);
const pageRanges = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const chapterRuneCounts = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
let chapterOrigin = 0;
const chapters = pageRanges.map(([first, last], i) => {
  const length = pages.filter((p) => p.page >= first && p.page <= last)
    .reduce((total, p) => total + p.indices.length, 0);
  assert.equal(length, chapterRuneCounts[i]);
  const origin = chapterOrigin;
  chapterOrigin += length;
  const absolute = singletonPositions.filter((p) => p >= origin && p < chapterOrigin);
  return {
    name: 'chapter ' + (i + 1) + ' (p' + first + '-p' + last + ')',
    offsets: absolute.map((p) => p - origin),
    cipher: absolute.map((p) => sourceCipher[p])
  };
});
assert.equal(chapterOrigin, 12956);
assert.deepEqual(chapters.map((c) => c.offsets.length), [5, 8, 11, 18, 5, 12, 9, 13, 2]);
const [A, I, O] = ['A', 'I', 'O'].map((r) => gp.translit.indexOf(r));
assert.deepEqual([A, I, O], [24, 10, 3]);

/**
 * Evaluate sampled keystream basis for recurrence K[i+2]=a*K[i+1]+b*K[i]+bias.
 * K[i]=u[i]*K[0]+v[i]*K[1]+w[i]*bias (mod29).
 *
 * @param {number} a
 * @param {number} b
 * @param {number[]} offsets
 * @param {Int16Array} u
 * @param {Int16Array} v
 * @param {Int16Array} w
 */
function forms(a, b, offsets, u, v, w) {
  let u0 = 1; let u1 = 0;
  let v0 = 0; let v1 = 1;
  let w0 = 0; let w1 = 0;
  let site = 0;
  for (let i = 0; i <= offsets[offsets.length - 1]; i++) {
    let x; let y; let z;
    if (i === 0) {
      x = 1; y = 0; z = 0;
    } else if (i === 1) {
      x = 0; y = 1; z = 0;
    } else {
      x = (a * u1 + b * u0) % 29;
      y = (a * v1 + b * v0) % 29;
      z = (a * w1 + b * w0 + 1) % 29;
      u0 = u1; u1 = x;
      v0 = v1; v1 = y;
      w0 = w1; w1 = z;
    }
    if (i === offsets[site]) {
      u[site] = x;
      v[site] = y;
      w[site] = z;
      site++;
    }
  }
  assert.equal(site, offsets.length);
}

/**
 * Exhaust exactly 29^5 possible affine two-state streams.
 * Negative controls always exhaust, while the planted positive can exit on
 * the first full 83-word match.
 *
 * @param {{name:string,offsets:number[],cipher:number[]}} scope
 * @param {boolean} [firstPositive]
 */
function exhaust(scope, firstPositive = false) {
  const count = scope.offsets.length;
  const u = new Int16Array(count);
  const v = new Int16Array(count);
  const w = new Int16Array(count);
  let tried = 0;
  let maxAI = 0;
  let maxAIO = 0;
  let survivorsAI = 0;
  let survivorsAIO = 0;
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      forms(a, b, scope.offsets, u, v, w);
      for (let initial0 = 0; initial0 < 29; initial0++) {
        for (let initial1 = 0; initial1 < 29; initial1++) {
          for (let bias = 0; bias < 29; bias++) {
            tried++;
            let prefixAI = 0;
            let prefixAIO = 0;
            let stillAI = true;
            for (let site = 0; site < count; site++) {
              const key = (u[site] * initial0 + v[site] * initial1 +
                w[site] * bias) % 29;
              const plaintext = (scope.cipher[site] - key + 29) % 29;
              const isAI = plaintext === A || plaintext === I;
              if (!isAI) stillAI = false;
              if (!isAI && plaintext !== O) break;
              prefixAIO++;
              if (stillAI) prefixAI++;
            }
            if (prefixAI > maxAI) maxAI = prefixAI;
            if (prefixAIO > maxAIO) maxAIO = prefixAIO;
            if (prefixAIO === count) {
              survivorsAIO++;
              if (prefixAI === count) survivorsAI++;
              if (firstPositive) {
                return { tried, survivorsAI, survivorsAIO,
                  maxAI, maxAIO };
              }
            }
          }
        }
      }
    }
  }
  assert.equal(tried, 29 ** 5);
  return { tried, survivorsAI, survivorsAIO, maxAI, maxAIO };
}

/** Encrypt real solved p57 runes and 83 source-position A/I/O positives. */
function positiveControl() {
  const a = 2; const b = 3; const bias = 5;
  const key = new Uint8Array(12956);
  key[0] = 7; key[1] = 11;
  for (let i = 2; i < key.length; i++) {
    key[i] = (a * key[i - 1] + b * key[i - 2] + bias) % 29;
  }
  const solvedP57 = gp.pages.find((p) => p.page === 57).indices;
  assert.equal(solvedP57.length, 95);
  const encryptedP57 = solvedP57.map((plain, i) => (plain + key[i]) % 29);
  assert.deepEqual(encryptedP57.map((cipher, i) =>
    (cipher - key[i] + 29) % 29), solvedP57);
  const planted = singletonPositions.map((position, i) =>
    ([A, I, O][i % 3] + key[position]) % 29);
  const recovered = planted.map((cipher, i) =>
    (cipher - key[singletonPositions[i]] + 29) % 29);
  assert.deepEqual(recovered, singletonPositions.map((_, i) => [A, I, O][i % 3]));
  const detected = exhaust({
    name: 'original word positions, native A/I/O source plant',
    offsets: singletonPositions,
    cipher: planted
  }, true);
  assert(detected.survivorsAIO > 0, 'A genuine original-shaped plant is recovered');
  return { solvedP57: 95, plantedSingletonWords: 83,
    searchedBeforePlantHit: detected.tried, hiddenParameters: { a, b, bias, k0: 7, k1: 11 } };
}

const continuous = exhaust({
  name: 'original continuous p0-p55 book',
  offsets: singletonPositions,
  cipher: singletonPositions.map((p) => sourceCipher[p])
});
assert.equal(continuous.survivorsAI, 0);
assert.equal(continuous.survivorsAIO, 0);
assert.equal(continuous.maxAIO, 7);

const chapterDecisions = chapters.map((scope) => {
  if (scope.offsets.length < 8) {
    return { scope: scope.name, singletonCount: scope.offsets.length,
      result: 'underconstrained: omitted from exhaustive exclusion' };
  }
  const outcome = exhaust(scope);
  assert.equal(outcome.survivorsAIO, 0);
  assert.equal(outcome.survivorsAI, 0);
  return { scope: scope.name, singletonCount: scope.offsets.length,
    result: 'zero native-English singleton-compatible keys',
    models: outcome.tried, maxAIOPrefix: outcome.maxAIO,
    forcedFirstFailureWord: outcome.maxAIO + 1 };
});
const positive = positiveControl();

console.log(JSON.stringify({
  status: 'PASS',
  genuineSourceRunes: sourceCipher.length,
  sourcePrintedWords: printedWords.length,
  originalSingletonWords: singletonPositions.length,
  gpEnglishChoices: { A, I, O },
  modelsPerClock: 29 ** 5,
  originalContinuous: continuous,
  chapterResets: chapterDecisions,
  positive,
  conclusion: 'The complete unknown-coefficient affine-order2 direct GP29 cipher fails on original English singleton words under continuous or six independent visual-chapter clocks.'
}, null, 2));
