/** Frozen source test: 2013 PRIMES 264-token tail vs LP2 p40 red8 + printed 32x8 table.
 * This rules out only direct stationary prime-residue -> table-residue maps.
 * It does not identify a historical cipher, key, or plaintext.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

/** @param {string} name */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
}
/** @param {number} count */
function firstPrimes(count) {
  /** @type {number[]} */
  const out = [];
  for (let n = 2; out.length < count; n++) {
    if (out.every(p => p * p > n || n % p !== 0)) out.push(n);
  }
  return out;
}
/** @param {number[]} values @param {number[]} order */
function columns(values, order) {
  return values.map((_, i) => values[8 * Math.floor(i / 8) + order[i % 8]]);
}
/** @param {number[]} primeWindow @param {number[]} bytes */
function gate(primeWindow, bytes) {
  assert.equal(primeWindow.length, 256);
  assert.equal(bytes.length, 256);
  const x = primeWindow.map(v => v % 29), y = bytes.map(v => v % 29);
  /** @type {Map<number,number>} */
  const mapping = new Map();
  let conflicts = 0;
  for (let i = 0; i < 256; i++) {
    if (!mapping.has(x[i])) mapping.set(x[i], y[i]);
    else if (mapping.get(x[i]) !== y[i]) conflicts++;
  }
  let best = { slope: 1, intercept: 0, hits: -1 };
  for (let slope = 1; slope < 29; slope++) {
    for (let intercept = 0; intercept < 29; intercept++) {
      let hits = 0;
      for (let i = 0; i < 256; i++) {
        if ((slope * x[i] + intercept) % 29 === y[i]) hits++;
      }
      if (hits > best.hits) best = { slope, intercept, hits };
    }
  }
  return { conflicts, distinctInputs: mapping.size, best };
}
const corpus = load('lp2-corpus.json');
const grid = load('base60-grid.json');
const ink = load('lp2-ink-annotations.json');
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const red = ink.pages.find(p => p.page === 40).red_spans;
assert.equal(red.length, 1);
assert.equal(red[0].start, 0);
assert.equal(red[0].length, 8);
const heading = [...red[0].runes].map(r => alphabet.get(r));
assert.deepEqual(heading, [0, 9, 19, 26, 6, 23, 25, 8]);
const rank = heading.map((n, i) => ({ n, i })).sort((a, b) => a.n - b.n).map(z => z.i);
assert.deepEqual(rank, [0, 4, 7, 1, 2, 5, 6, 3]);
const inverse = rank.map((_, i) => rank.indexOf(i));
const values = grid.byte_rows.flat();
assert.equal(grid.byte_rows.length, 32);
assert.equal(values.length, 256);
const primes = firstPrimes(464);
assert.deepEqual([primes[19], primes[20], primes[199], primes[200], primes[463]], [71, 73, 1223, 1229, 3301]);
const tail = primes.slice(200);
assert.equal(tail.length, 264);
assert.deepEqual(tail.slice(-8), [3229, 3251, 3253, 3257, 3259, 3271, 3299, 3301]);

// Exact positive plant: a secret but fixed invertible GF29 affine codebook.
const planted = tail.slice(0, 256).map(p => (7 * (p % 29) + 11) % 29);
assert.deepEqual(gate(tail.slice(0, 256), planted), {
  conflicts: 0, distinctInputs: 28, best: { slope: 7, intercept: 11, hits: 256 }
});
for (const [window, key] of [['first256', tail.slice(0, 256)], ['last256', tail.slice(8)]]) {
  for (const [order, target] of [
    ['printed', values],
    ['red8-rank', columns(values, rank)],
    ['red8-inverse', columns(values, inverse)]
  ]) {
    const result = gate(key, target);
    console.log(JSON.stringify({ window, order, ...result }));
    assert.ok(result.conflicts >= 214);
    assert.ok(result.best.hits <= 21);
  }
}
console.log('PASS: exact 264=8+256 relation, six original direct-map obstructions, and complete positive plant. No unknown plaintext.');
