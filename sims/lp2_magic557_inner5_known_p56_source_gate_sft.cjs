'use strict';

/**
 * A single source-frozen, cross-artifact key check:
 * 2014 OpenPuff authentic three magic squares have rows 5×5, 7×7, 5×5.
 * The solved p57 instruction "shed our own circumferences" motivates
 * dropping first and last cells from only the seven wider rows.
 * This produces 5*5 + 7*5 + 5*5 = 85 keys, precisely solved p56's length.
 *
 * Test those keys directly as GP29 additive key residues on the *already
 * solved* p56 page. Compare to its independently authenticated historical
 * (successive prime minus one) key, skipping the literal plaintext F at
 * original zero-based position 56. This prevents cherry-picked unknown prose.
 *
 * This is a conditional hypothesis, not a source-authenticated operation.
 * No rotation, sign, modulus, phase or whitespace clock is optimized.
 *
 * Windows 11: node sims/lp2_magic557_inner5_known_p56_source_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources');
const source = fs.readFileSync(
  path.join(root, 'cicada2014-openpuff-magic-squares.txt'), 'utf8'
);
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const rows = source.trim().split(/\r?\n/).map(row => row.trim())
  .filter(Boolean).map(row => row.split(/\s+/).map(Number));
assert.deepEqual(rows.map(row => row.length),
  [5,5,5,5,5,7,7,7,7,7,7,7,5,5,5,5,5]);
const sourceValues = rows.flatMap(row =>
  row.length === 7 ? row.slice(1, -1) : row);
const keys = sourceValues.map(v => v % 29);
assert.equal(keys.length, 85);
const c = corpus.pages.find(page => page.page === 56).indices;
assert.equal(c.length, 85);

/** @returns {number[]} */
function primes() {
  const out = [];
  for (let p = 2; out.length < 85; p++) {
    let isPrime = true;
    for (let d = 2; d*d <= p; d++) {
      if (p % d === 0) { isPrime = false; break; }
    }
    if (isPrime) out.push(p);
  }
  return out;
}
const sourcePrimes = primes();
const historicalKey = [];
const truePlain = [];
let consumed = 0;
for (let i = 0; i < c.length; i++) {
  if (i === 56) {
    historicalKey.push(null);
    truePlain.push(0); // p56's sole literal transparent plaintext F
  } else {
    const key = (sourcePrimes[consumed++] - 1) % 29;
    historicalKey.push(key);
    truePlain.push((c[i] - key + 29) % 29);
  }
}
assert.equal(consumed, 84);
const originalPlain = truePlain.map(v => corpus.translit[v]).join('');
assert.ok(originalPlain.startsWith('ANENDWITHINTHEDEEPWEB'));
assert.ok(originalPlain.endsWith('SEECOUTTHISPAGE'));

/** @param {number[]} values */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const x of values) hist[x] += 1;
  return hist.reduce((sum, f) => sum + f * (f-1),0) /
    (values.length * (values.length-1));
}
// Independent, *key-independent* obstruction to any scalar map f(value):
// the identical original numeric value 434 occurs at offsets 0 and 24,
// where the known historical p56 key requires two different GP29 shifts.
// Thus every pointwise mapping, including phi(x) mod 29 or modulus changes,
// fails under this exact order without scanning families of functions.
assert.equal(sourceValues[0], 434);
assert.equal(sourceValues[24], 434);
assert.equal(historicalKey[0], 1);
assert.equal(historicalKey[24], 9);
const byValue = new Map();
for (let i = 0; i < sourceValues.length; i++) {
  const key = sourceValues[i];
  if (!byValue.has(key)) byValue.set(key, []);
  byValue.get(key).push(historicalKey[i]);
}
const clashes = [...byValue.values()].filter(values =>
  values.length > 1 && new Set(values.filter(v => v !== null)).size > 1);
assert.equal(byValue.size, 44);
assert.equal(clashes.length, 38);
console.log('Source integers with repeated values: 41 of 44 value classes');
console.log('Contradictory same-value historical-key classes: '+clashes.length);
console.log('Direct witness: 434 at offsets 0,24 -> p56 keys 1,9 (impossible f(434)).');
const keyMatches = keys.flatMap((key,i) =>
  historicalKey[i] === key ? [i] : []);
assert.deepEqual(keyMatches,[14,31]);
const wrongPlain = c.map((v,i) => (v-keys[i]+29)%29);
const wrongPlainText = wrongPlain.map(v => corpus.translit[v]).join('');
assert.deepEqual(wrongPlain.map((v,i) => (v+keys[i])%29), c);
console.log('Original 2014 5×5 / 7×7 / 5×5 row count: '+rows.length);
console.log('Derived five-inner-per-row GP29 key length: '+keys.length);
console.log('Known original p56 GP29 symbols: '+c.length);
console.log('Correct historically solved p56: '+originalPlain);
console.log('Known historical key matches out of 84: '+keyMatches.length);
console.log('Exact match positions: '+JSON.stringify(keyMatches));
console.log('Direct magic-row-key p56 output: '+wrongPlainText);
console.log('Direct magic-row-key output IoC: '+ioc(wrongPlain).toFixed(12));
console.log('Exact forward reconstruction: PASS');
console.log('Result: no p56 key handoff; do not extend this fixed inverse to p55.');
