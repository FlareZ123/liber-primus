'use strict';
/**
 * Agent22, 2026-11-17. Exhaustive source-constrained BASE29 opening-title
 * ordering gate. This is a conditional arithmetic observation, not a cipher
 * decryption or an authorship p-value.
 *
 * Windows Node 22 SFT: node sims/lp2_red13_base29_congruence_order_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'resources/historical/stage11-2014-index.html'), 'utf8');
assert.match(html, /<title>133<\/title>/);
assert.match(html, /<div id="331">/);

const original = [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5];
const page0 = corpus.pages.find(p => p.page === 0);
assert.deepEqual(page0.indices.slice(0, 13), original);
assert.equal(corpus.pages.find(p => p.page === 55).indices.length, 76);
const primes = corpus.prime;
const sumPrimes = letters => letters.reduce((s, x) => s + primes[x], 0);
assert.equal(sumPrimes(original.slice(0, 8)), 347);
assert.equal(sumPrimes(original.slice(8)), 315);
assert.equal((347 + 315) / 2, 331);
assert.equal(original.reduce((s, x) => s + x, 0), 181);

/** @param {number[]} digits @returns {bigint} */
function numeral(digits) {
  let result = 0n;
  for (const d of digits) result = 29n * result + BigInt(d);
  return result;
}

/** @param {number[]} values @param {number} k @param {number} [offset] @param {number[]} [picked] */
function* subsets(values, k, offset = 0, picked = []) {
  if (picked.length === k) {
    yield picked.slice();
    return;
  }
  for (let i = offset; i <= values.length - (k - picked.length); i++) {
    picked.push(values[i]);
    yield* subsets(values, k, i + 1, picked);
    picked.pop();
  }
}

/** @param {number[]} letters @returns {Generator<number[]>} */
function* uniqueOrders(letters) {
  const counter = new Map();
  for (const x of letters) counter.set(x, (counter.get(x) || 0) + 1);
  const keys = [...counter.keys()].sort((a, b) => a - b);
  const result = Array(letters.length);
  /** @param {number} pos */
  function* visit(pos) {
    if (pos === result.length) {
      yield result.slice();
      return;
    }
    for (const x of keys) {
      if (!counter.get(x)) continue;
      counter.set(x, counter.get(x) - 1);
      result[pos] = x;
      yield* visit(pos + 1);
      counter.set(x, counter.get(x) + 1);
    }
  }
  yield* visit(0);
}

const remaining = original.slice(1, 8).concat(original.slice(9));
assert.equal(remaining.length, 11);
const allocations = new Map();
for (const seven of subsets(remaining, 7)) {
  if (sumPrimes(seven) !== 347 - primes[15]) continue;
  const sorted = seven.slice().sort((a, b) => a - b);
  allocations.set(sorted.join(','), sorted);
}
assert.equal(allocations.size, 2);

let total = 0;
const counts = Array(8).fill(0);
const candidates = [];
for (const seven of allocations.values()) {
  const inventory = new Map();
  for (const x of remaining) inventory.set(x, (inventory.get(x) || 0) + 1);
  for (const x of seven) inventory.set(x, inventory.get(x) - 1);
  const four = [...inventory.entries()].flatMap(([x, n]) => Array(n).fill(x));
  assert.equal(four.length, 4);
  for (const head of uniqueOrders(seven)) {
    const base = numeral([15, ...head]) * (29n ** 5n) + 15n * (29n ** 4n);
    for (const tail of uniqueOrders(four)) {
      const n = base + numeral(tail);
      const year = n % 2014n === 133n;
      const page = n % 133n === 76n;
      const ink = n % 256n === 225n;
      assert.equal(year && !page, false, '133 cannot be independent of 2014 under this multiset');
      counts[Number(year) * 4 + Number(page) * 2 + Number(ink)]++;
      total++;
      if (year && ink) candidates.push({title: [15, ...head, 15, ...tail], N: n.toString()});
    }
  }
}

const actual = numeral(original);
assert.equal(actual, 5412445423142629857n);
assert.equal(actual % 2014n, 133n);
assert.equal(actual % 133n, 76n);
assert.equal(actual % 256n, 225n);
assert.equal(29n % 7n, 1n);
assert.equal(181 % 7, 6);
assert.equal(76 % 7, 6);
assert.equal(76 % 19, 0);
assert.equal(2014 % 19, 0);
assert.equal(total, 241920);
assert.deepEqual(counts, [225286, 3749, 12422, 208, 0, 0, 252, 3]);
assert.deepEqual(candidates.map(x => x.N).sort(), [
  '5309379764496786145',
  '5412445423142629857',
  '5565588968468162017'
]);

console.log(JSON.stringify({
  title: original,
  titleN: actual.toString(),
  yearResidue: (actual % 2014n).toString(),
  html133Residue: (actual % 133n).toString(),
  grid256Residue: (actual % 256n).toString(),
  allocations: allocations.size,
  candidateCount: total,
  residueMaskCounts: counts,
  exactConditionalFrequency: candidates.length / total,
  matchingTitles: candidates,
  interpretation: '2 independent congruence constraints conditional on fixed title inventory, not authorship significance or decrypted plaintext'
}, null, 2));
