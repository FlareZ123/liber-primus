#!/usr/bin/env node
'use strict';

/**
 * Original 2014 title/id -> prime-count -> 32x8 numeric-table pointer gate.
 * Source-only, fixed two-start readout. No cryptanalytic key or plaintext claim.
 * Node.js 22 CommonJS, read-only, from any current directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const html = read('resources/external/cicada2014-stage11-index-archived.html');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const title = Number(html.match(/<title>(\d+)<\/title>/)[1]);
const id = Number(html.match(/<div id="(\d+)">/)[1]);
assert.deepEqual([title, id], [133, 331]);

/** @param {number} n @returns {number} */
function primeCount(n) {
  let total = 0;
  for (let p = 2; p <= n; p++) {
    let isPrime = true;
    for (let d = 2; d * d <= p; d++) {
      if (p % d === 0) { isPrime = false; break; }
    }
    if (isPrime) total++;
  }
  return total;
}
const [titlePrimeCount, idPrimeCount] = [primeCount(title), primeCount(id)];
assert.deepEqual([titlePrimeCount, idPrimeCount, primeCount(3301)],
  [32, 67, 464]);
assert.equal(title + id, 464);
assert.equal(grid.bytes.length, 256);
assert.equal(grid.pages.reduce((n, p) => n + p.rows, 0), 32);
assert(grid.pages.every(p => p.cols === 8));
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const g = grid.bytes;
/** @param {number} first @param {number} hops @returns {number[]} */
function trail(first, hops) {
  const addresses = [first];
  for (let step = 0; step < hops; step++) addresses.push(g[addresses.at(-1)]);
  return addresses;
}
const idRoute = trail(idPrimeCount, 2);
const titleRoute = trail(titlePrimeCount, 4);
assert.deepEqual(idRoute, [67, 192, 0]);
assert.deepEqual(titleRoute, [32, 115, 247, 192, 0]);
assert.deepEqual([tokens[67], tokens[192], tokens[229]], ['3C', '00', '00']);
assert.deepEqual(g.flatMap((v, i) => v === 0 ? [i] : []), [192, 229]);

const red = corpus.pages[0].indices.slice(0, 13);
const sum = a => a.reduce((n, index) => n + corpus.prime[index], 0);
const titleSums = [sum(red.slice(0, 8)), sum(red.slice(8))];
assert.deepEqual(titleSums, [347, 315]);
assert.equal((titleSums[0] + titleSums[1]) / 2, id);
assert.equal(titleSums[0] - titleSums[1], titlePrimeCount);

const all = new Set(Array.from({length: 256}, (_, i) => i));
const largest = new Set();
/** @param {number} seed */
function reaches192(seed) {
  let at = seed;
  const seen = new Set();
  while (!seen.has(at)) {
    if (at === 192) return true;
    seen.add(at);
    at = g[at];
  }
  return false;
}
for (const seed of all) if (reaches192(seed)) largest.add(seed);
assert.equal(largest.size, 252);
assert.deepEqual([...all].filter(i => !largest.has(i)), [9, 158, 227, 249]);
const cycle = trail(192, 11);
assert.deepEqual(cycle, [192, 0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192]);
assert.equal(g[249], 158);
assert.equal(g[158], 249);

const radix59Pointer = 3 * 59 + 12;
assert.equal(radix59Pointer, 189);
assert.notEqual(radix59Pointer, idRoute[1]);

console.log(JSON.stringify({
  classification: 'source-only exploratory prime-count/byte-pointer route; no unknown plaintext',
  archived: {title, id, primeCountOfTitle: titlePrimeCount,
    primeCountOfId: idPrimeCount, primeCountOf3301: primeCount(3301)},
  physical: {gridRows: 32, gridColumns: 8, titleRunePrimeSums: titleSums,
    originalOuterZero: 192, originalInnerZero: 229},
  idRoute, titleRoute, originalToken67: tokens[67], cycle,
  component: {to192: largest.size, other: [...all].filter(i => !largest.has(i))},
  qualification: 'Prime counting, base60 bytes and table pointer-chasing are not instructed by the original source; base59 breaks the direct anchor.'
}, null, 2));
