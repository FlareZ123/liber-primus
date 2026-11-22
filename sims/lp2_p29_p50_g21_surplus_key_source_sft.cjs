'use strict';

/**
 * Original p29 and p50 repeated-root G quotient: exact 21-position surplus
 * as a possible self-carried repeating key, with fully consuming GP29
 * addition/subtraction. A frozen source-derived plaintext-recovery attack.
 *
 * Windows Node22:
 *   node sims/lp2_p29_p50_g21_surplus_key_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const bytes = grid.pages.flatMap(p => p.bytes);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const mod = x => (x % 29 + 29) % 29;

/**
 * Exact high-first polynomial division over GF29 by G(X)=15X²+5X+27.
 * @param {number[]} input
 */
function byG(input) {
  const remaining = input.map(mod);
  const quotient = [];
  for (let i = 0; i + 2 < input.length; i++) {
    const q = mod(2 * remaining[i]); // 15^-1 == 2 mod29
    quotient.push(q);
    for (let j = 0; j < 3; j++) {
      remaining[i + j] = mod(remaining[i + j] - q * [15, 5, 27][j]);
    }
  }
  assert.deepEqual(remaining.slice(-2), [0, 0]);
  return quotient;
}

/** @param {number[]} symbols */
function indexOfCoincidence(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/**
 * @param {number[]} input
 * @param {number[]} key Exactly the source-derived 21-runic key
 * @param {number} sign
 */
function shift(input, key, sign) {
  assert.equal(key.length, 21);
  return input.map((symbol, i) => mod(symbol + sign * key[i % 21]));
}
const page = n => corpus.pages.find(p => p.page === n).indices;
const q29 = byG(page(29));
const q50 = byG(bytes);
assert.equal(q29.length, 275);
assert.equal(q50.length, 254);
const arrangements = [
  {name: 'source21-prefix', key: q29.slice(0, 21),
    p29Body: q29.slice(21)},
  {name: 'source21-suffix', key: q29.slice(-21),
    p29Body: q29.slice(0, 254)}
];
assert.equal(arrangements.every(a => a.p29Body.length === 254), true);
const known = Array.from({length: 254}, (_, i) => page(57)[i % page(57).length]);

const rows = [];
for (const selection of arrangements) {
  for (const sign of [-1, 1]) {
    const plain29 = shift(selection.p29Body, selection.key, sign);
    const plain50 = shift(q50, selection.key, sign);
    assert.deepEqual(shift(plain29, selection.key, -sign), selection.p29Body);
    assert.deepEqual(shift(plain50, selection.key, -sign), q50);
    const encryptedPlant = shift(known, selection.key, -sign);
    assert.deepEqual(shift(encryptedPlant, selection.key, sign), known);
    rows.push({
      arrangement: selection.name, direction: sign,
      p29IoC: indexOfCoincidence(plain29),
      p50IoC: indexOfCoincidence(plain50),
      p29Opening: plain29.slice(0, 72).map(x => corpus.translit[x]).join(''),
      p50Opening: plain50.slice(0, 72).map(x => corpus.translit[x]).join(''),
      plantedSourcePositive: true
    });
  }
}
assert.equal(indexOfCoincidence(q50).toFixed(8), '0.03277209');
assert.equal(indexOfCoincidence(q29).toFixed(8), '0.03405441');
assert.deepEqual(rows.map(r => Number(r.p50IoC.toFixed(8))),
  [0.03383026, 0.03389250, 0.03569761, 0.03414148]);
assert.deepEqual(rows.map(r => Number(r.p29IoC.toFixed(8))),
  [0.03395475, 0.03526190, 0.03470169, 0.03432822]);
console.log(JSON.stringify({
  conclusion: 'no original source-native plaintext recovered',
  source: {p29QuotientLength: q29.length, p50QuotientLength: q50.length,
    sourceSurplus: 21, parentFactor: '15X²+5X+27'},
  baseline: {p29: indexOfCoincidence(q29), p50: indexOfCoincidence(q50)},
  rows
}, null, 2));
