'use strict';
/**
 * Source-frozen cross-round 464-prime / 58-page / 8-column original LP2 gate.
 * SFT: node sims/lp2_2013_2014_prime464_58page8_sft.cjs
 *
 * The 2014 distributor records <title>133</title> and <div id="331">,
 * 133+331=464. It lists 58 LP2 image files 0.jpg..57.jpg, and the
 * contemporaneous LP2 numeral grid prints 8 columns. The original 2013
 * cicadaOS prime_echo prints precisely the first 464 ascending primes.
 * Hypothesis (unprovided by the author): assign 8 consecutive primes to
 * each physical LP2 image in distributor order; use repeated per-page
 * (prime - 1) mod 29 as a Vigenere shift, allowing plaintext F to pass
 * unchanged without key advance as in the *actually solved* p56 cipher.
 *
 * Dynamic programming over all eight phases exactly handles both readings
 * of ciphertext F. It rejects only this defined candidate, not any other
 * use of the 464 prime values, 2014 HTML numbers or original 256-cell grid.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
const html = read('resources/cicada2014-onion7-index.html');
const primeSource = read('resources/historical/cicada2013-os-original-prime-echo.sh');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const title = /^<head><title>(\d+)<\/title><\/head>$/m.exec(html);
const div = /<div id="(\d+)">/u.exec(html);
assert(title && div, 'Original 2014 HTML title and id');
const htmlNumbers = [Number(title[1]), Number(div[1])];
assert.deepEqual(htmlNumbers, [133, 331]);
assert.equal(htmlNumbers[0] + htmlNumbers[1], 464);
const imageFiles = [...html.matchAll(/<img src="(\d+)\.jpg"\s*\/>/gu)]
  .map(m => Number(m[1]));
assert.deepEqual(imageFiles, Array.from({ length: 58 }, (_, j) => j));
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));
assert.equal(grid.rows.flat().length, 256);
const primes = [...primeSource.matchAll(/echo(?: -n)?\s+"(\d+)/gu)]
  .map(m => Number(m[1]));
assert.equal(primes.length, 464);
assert.equal(primes[0], 2);
assert.equal(primes[primes.length - 1], 3301);
assert.equal(primes[173], 1033);
/** @param {number} page @returns {number[]} */
function pageKey(page) {
  assert(Number.isInteger(page) && page >= 0 && page < 58);
  return primes.slice(page * 8, (page + 1) * 8)
    .map(p => (p - 1) % 29);
}
/**
 * Every surviving phase represents an F-skip interpretation.
 * A ciphertext F may mean literal plaintext F (phase unchanged) or an
 * encrypted non-F (phase advances). Non-F ciphertext cannot encode
 * plaintext F, since the real p56 rule would have passed that F through.
 * @param {number[]} C
 * @param {number[]} K
 * @returns {{firstImpossible:number, survivingPhases:number[], reachableBeforeContradiction:number[]}}
 */
function reachable(C, K) {
  let phases = new Set([0]);
  for (let offset = 0; offset < C.length; offset++) {
    const next = new Set();
    const c = C[offset];
    assert(Number.isInteger(c) && c >= 0 && c < 29);
    for (const k of phases) {
      const candidate = (c - K[k] + 29) % 29;
      if (candidate !== 0) next.add((k + 1) % 8);
      if (c === 0) next.add(k);
    }
    if (next.size === 0)
      return { firstImpossible: offset, survivingPhases: [],
        reachableBeforeContradiction: [...phases].sort((a,b)=>a-b) };
    phases = next;
  }
  return { firstImpossible: -1,
    survivingPhases: [...phases].sort((a,b)=>a-b),
    reachableBeforeContradiction: [...phases].sort((a,b)=>a-b) };
}
/**
 * Encrypts under the authentic p56 F rule with the *hypothetical* per-page key.
 * @param {number[]} P
 * @param {number[]} K
 * @returns {{C:number[],lastPhase:number}}
 */
function encrypt(P, K) {
  let phase = 0;
  const C = [];
  for (const p of P) {
    if (p === 0) C.push(0);
    else {
      C.push((p + K[phase]) % 29);
      phase = (phase + 1) % 8;
    }
  }
  return { C, lastPhase: phase };
}
assert.equal(corpus.pages.length, 58);
assert.deepEqual(corpus.pages.map(p => p.page), imageFiles);
assert.equal(corpus.pages.find(p => p.page === 50).indices.length, 0);
assert.equal(corpus.pages.slice(0, 56)
  .reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(corpus.pages.slice(56)
  .reduce((n, p) => n + p.indices.length, 0), 180);
const results = [];
for (const page of corpus.pages) {
  const key = pageKey(page.page);
  const test = reachable(page.indices, key);
  results.push({ page: page.page, runes: page.indices.length,
    firstImpossible: test.firstImpossible,
    survivingPhases: test.survivingPhases });
}
const unknown = results.filter(p => p.page < 56 && p.runes > 0);
const contradicted = unknown.filter(p => p.firstImpossible >= 0);
const survivors = unknown.filter(p => p.firstImpossible < 0);
assert.equal(unknown.length, 55);
assert.equal(contradicted.length, 53);
assert.deepEqual(survivors.map(p => p.page), [0, 15]);
assert.deepEqual(survivors.map(p => p.survivingPhases), [[0, 6, 7], [3, 4]]);
assert.deepEqual(results.filter(p => p.page >= 56).map(p => p.firstImpossible),
  [6, 2]);
// Independent forward positive: native solved-p57 text as the complete
// length-matched payload, with all authentic plaintext-F interrupts retained.
const native = corpus.pages.find(p => p.page === 57).indices;
assert.equal(native.length, 95);
let recoveredRunners = 0, plantedRunes = 0;
for (const page of corpus.pages) {
  const message = Array.from({ length: page.indices.length },
    (_, j) => native[j % native.length]);
  const generated = encrypt(message, pageKey(page.page));
  assert.equal(generated.C.length, message.length);
  const verdict = reachable(generated.C, pageKey(page.page));
  assert.equal(verdict.firstImpossible, -1,
    'A native plaintext encrypted by the candidate must never fail its gate');
  assert(verdict.survivingPhases.includes(generated.lastPhase));
  plantedRunes += message.length;
  recoveredRunners++;
}
assert.equal(recoveredRunners, 58);
assert.equal(plantedRunes, 13136);
const noSkip = corpus.pages.slice(0, 56).flatMap(p =>
  p.indices.map((c, i) => (c - pageKey(p.page)[i % 8] + 29) % 29));
const count = Array(29).fill(0);
for (const n of noSkip) count[n]++;
const ioc = count.reduce((sum, n) => sum + n * (n - 1), 0)
  / (noSkip.length * (noSkip.length - 1));
console.log(JSON.stringify({
  crossSource: { distributorHTML: { title: 133, divID: 331,
    sum: 464, imageCount: 58 }, primeEchoCount: primes.length,
    lastPrime: 3301, printedGridColumns: grid.rows[0].length,
    primeGroupSize: 8, arithmeticIdentity: '133+331 = 464 = 58*8' },
  hypothesis: 'page-local repeated 8-prime totient shifts, exhaustive F-skip',
  original: { unknownPages: unknown.length,
    impossibleUnknownPages: contradicted.length,
    compatibleUnknownPages: survivors,
    impossibleFirstFifteen: results.filter(p => p.page < 15).map(p => ({
      page: p.page, firstImpossible: p.firstImpossible
    })), solvedPageImpossible: results.filter(p => p.page >= 56),
    noSkipAllUnknownIoC: ioc },
  nativePositive: { pages: recoveredRunners, nativeSourceRunes: native.length,
    totalRunesAccepted: plantedRunes },
  conclusion: 'Direct original-input 8-primes-per-page shift model excluded across 53/55 unknown rune pages; arithmetic cross-source relation is a lead, not evidence of an author-selected cipher or recovered plaintext.'
}, null, 2));
