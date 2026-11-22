#!/usr/bin/env node
'use strict';
/**
 * Original LP2 p27–p32 six-row 2013 prime_echo inverse, Node 22 CommonJS SFT.
 * Each page uses one 29-prime row; check all p56-legal plaintext-F masks.
 * Source content is read-only. No language scoring or fit parameters.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const primes = [...read('resources/historical/cicada2013-os-original-prime-echo.sh')
  .matchAll(/echo\s*(?:-n\s*)?"(\d+)\t";\s*sleep/g)].map((m) => Number(m[1]));
const mod = (x) => ((x % 29) + 29) % 29;
assert.equal(primes.length, 464);
assert.equal(primes[173], 1033);
assert.equal(primes[463], 3301);
const rows = Array.from({length: 6}, (_, i) => primes.slice(29 * i, 29 * (i + 1)));
const pages = corpus.pages.slice(27, 33);
assert.deepEqual(pages.map((p) => p.indices.length), [234, 269, 277, 263, 269, 121]);
/**
 * Every ciphertext F may consume a key and decrypt non-F, or represent
 * literal plaintext F and skip one prime. Any non-F output forced to F is
 * impossible for this historically verified p56 encoder.
 * @param {number[]} cipher
 * @param {number[]} key
 * @returns {{offset:number,cipherIndex:number,keyPrimes:number[]}|null}
 */
function contradiction(cipher, key) {
  let states = new Set([0]);
  for (let offset = 0; offset < cipher.length; offset++) {
    const c = cipher[offset];
    const next = new Set();
    for (const phase of states) {
      if (c === 0) next.add(phase);
      if (mod(c - key[phase] + 1) !== 0) next.add((phase + 1) % 29);
    }
    if (next.size === 0) return {
      offset, cipherIndex: c, keyPrimes: [...states].map((phase) => key[phase])
    };
    states = next;
  }
  return null;
}
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const freq = Array(29).fill(0);
  for (const symbol of seq) freq[symbol]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) / (seq.length * (seq.length - 1));
}
const failures = pages.map((page, j) => contradiction(page.indices, rows[j]));
assert.deepEqual(failures, [
  {offset: 33, cipherIndex: 10, keyPrimes: [11]},
  {offset: 9, cipherIndex: 21, keyPrimes: [167]},
  {offset: 4, cipherIndex: 16, keyPrimes: [307]},
  {offset: 38, cipherIndex: 15, keyPrimes: [509]},
  {offset: 52, cipherIndex: 13, keyPrimes: [797]},
  {offset: 9, cipherIndex: 7, keyPrimes: [907]}
]);
const ordinary = pages.flatMap((page, j) => page.indices.map((c, i) => {
  const shift = rows[j][i % 29] - 1, p = mod(c - shift);
  assert.equal(mod(p + shift), c);
  return p;
}));
assert.equal(ordinary.length, 1433);
// Reproduce authentic p56, preserving original plaintext "EUERY"/"SEEC".
const p56Text = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const tokens = corpus.translit.map((text, index) => ({text, index}))
  .sort((a, b) => b.text.length - a.text.length);
const p56 = [];
for (const word of p56Text.split(' ')) {
  for (let i = 0; i < word.length;) {
    const hit = tokens.find((item) => word.startsWith(item.text, i));
    assert.ok(hit);
    p56.push(hit.index);
    i += hit.text.length;
  }
}
assert.equal(p56.length, 85);
let primeClock = 0;
assert.deepEqual(p56.map((v) => v === 0 ? 0 : mod(v + primes[primeClock++] - 1)),
  corpus.pages[56].indices);
assert.equal(primeClock, 84);
console.log(JSON.stringify({
  sourcePrimeCount: primes.length, firstPauseRank: 174, firstPausePrime: 1033,
  hypothesis: 'Source-ordered six prime rows of 29; p27-p32 page reset; p56 phi(prime)-1/F-skip',
  sourceOriginalRuneCounts: pages.map((page) => page.indices.length),
  firstContradictions: failures.map((hit, j) => ({page: j + 27, ...hit, rune: corpus.translit[hit.cipherIndex]})),
  ordinaryNoSkipIoC: ioc(ordinary),
  p56Positive: {runes: p56.length, primesConsumed: primeClock, exact: true},
  conclusion: 'All six source-original pages fail exact p56-compatible F reachability; no unknown plaintext'
}, null, 2));
