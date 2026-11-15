'use strict';

/**
 * Source-fixed 2013 telnet prime omission versus the LP2 256-cell table
 * and terminal 76+85+95 rune spans. Run with Node.js 22 on Windows 11.
 *
 * Source witness: neuroretransmit/cicada, 2013/004-first-onion/README.md,
 * commit 1f9037324873664116cb3578a3e05ff3dd0300a5.
 *
 * This tests direct consumers of a proposed cross-era cardinality bridge.
 * It does not assert that Cicada selected this relation or prove plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const mod29 = value => ((value % 29) + 29) % 29;

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const values = [];
  for (let n = 2; values.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) values.push(n);
  }
  return values;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (values.length * (values.length - 1));
}

const primes = firstPrimes(256);
const missing = primes.map((prime, index) => ({ prime, index })).filter(item => item.prime >= 73 && item.prime <= 1223);
const visible = primes.filter(prime => prime <= 71 || prime >= 1229);

assert.equal(primes[19], 71);
assert.equal(primes[20], 73);
assert.equal(primes[199], 1223);
assert.equal(primes[200], 1229);
assert.equal(primes[255], 1619);
assert.equal(missing.length, 180);
assert.equal(visible.length, 76);
assert.equal(grid.bytes.length, 256);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);

let clock = 0;
const p56Plain = corpus.pages[56].indices.map((cipher, index) => {
  if (index === 56) {
    assert.equal(cipher, 0, 'Original p56 literal-F bypass');
    return 0;
  }
  return mod29(cipher - (primes[clock++] - 1));
});
assert.equal(clock, 84);
assert.deepEqual(p56Plain.slice(0, 5), [24, 9, 18, 9, 23], 'P56 opens AN END');
const known180 = p56Plain.concat(corpus.pages[57].indices);
assert.equal(known180.length, missing.length);

const anchors = missing.map(({ index }, j) => ({ index, byte: grid.bytes[index], rune: known180[j] }));
const lookup = new Map();
let conflicts = 0;
let firstConflict = null;
let directMatches = 0;
for (const item of anchors) {
  if (mod29(item.byte) === item.rune) directMatches++;
  if (lookup.has(item.byte) && lookup.get(item.byte) !== item.rune) {
    conflicts++;
    if (firstConflict === null) firstConflict = { ...item, prior: lookup.get(item.byte) };
  } else {
    lookup.set(item.byte, item.rune);
  }
}
assert.equal(lookup.size, 130);
assert.equal(conflicts, 44);
assert.equal(directMatches, 4);
assert.deepEqual(firstConflict, { index: 38, byte: 133, rune: 17, prior: 18 });
let bestAffine = { a: -1, b: -1, matches: -1 };
for (let a = 1; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    const matches = anchors.reduce((sum, entry) => sum + (mod29(a * entry.byte + b) === entry.rune ? 1 : 0), 0);
    if (matches > bestAffine.matches) bestAffine = { a, b, matches };
  }
}
assert.deepEqual(bestAffine, { a: 2, b: 22, matches: 16 });
const planted = anchors.map(item => mod29(item.byte));
assert.equal(planted.filter((v, j) => v === mod29(anchors[j].byte)).length, 180);
const plantedMap = new Map();
for (const item of anchors) {
  const v = mod29(item.byte);
  if (plantedMap.has(item.byte)) assert.equal(plantedMap.get(item.byte), v);
  plantedMap.set(item.byte, v);
}

const original55 = corpus.pages[55].indices;
const decode = (key, sign) => original55.map((value, i) => mod29(value + sign * (key[i] - 1)));
const inverse = decode(visible, -1);
const reverse = decode(visible, 1);
const restored = inverse.map((value, i) => mod29(value + visible[i] - 1));
assert.deepEqual(restored, original55, 'Reversible arithmetic positive (not a cryptographic solve)');
assert.ok(Math.abs(ioc(inverse) - 0.03543859649122807) < 1e-12);
assert.ok(Math.abs(ioc(reverse) - 0.030526315789473683) < 1e-12);

const transliterate = values => values.map(value => corpus.translit[value]).join(' ');
console.log('2013 missing prime rank interval:', 20, 'through', 199, 'count', missing.length);
console.log('2013 visible prime subset in first 256:', visible.length, 'first', visible[0], 'last', visible.at(-1));
console.log('Original LP2 source lengths: p55=76 p56=85 p57=95 grid=256');
console.log('Known original plaintext p56+57 anchors:', known180.length, 'p56 literal-F key clocks:', clock);
console.log('Direct p50 table byte mod29 agreement:', directMatches, '/180');
console.log('Any stateless byte->GP lookup conflicts:', conflicts, 'first', JSON.stringify(firstConflict));
console.log('Best invertible affine byte->GP map:', JSON.stringify(bestAffine));
console.log('Planted direct table lookup: 180/180, no conflicting repeated byte inputs');
console.log('P55 original IoC:', ioc(original55).toFixed(9));
console.log('P55 visible76 prime-minus-one inverse IoC:', ioc(inverse).toFixed(9));
console.log('P55 reverse-sign IoC:', ioc(reverse).toFixed(9));
console.log('P55 prime-minus-one first 40:', transliterate(inverse.slice(0, 40)));
console.log('Result: literal 2013-prime-mask direct table lookup and fixed visible-prime p55 pad recover no plaintext.');
