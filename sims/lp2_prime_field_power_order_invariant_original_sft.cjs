'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = location => fs.readFileSync(path.join(root, location), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const knownP57 = corpus.pages.find(p => p.page === 57).indices;
const originalLen = original.length;
const F = 29;
const PHI = F - 1;
const ORDERS = [0, 1, 2, 4, 7, 14, 28];

/** @param {number} a @param {number} exponent @returns {number} */
function power(a, exponent) {
  let n = ((a % F) + F) % F;
  let e = exponent;
  let value = 1;
  while (e > 0) {
    if (e % 2 === 1) value = (value * n) % F;
    n = (n * n) % F;
    e = Math.floor(e / 2);
  }
  return value;
}

/** @param {number} value @returns {number} */
function order(value) {
  if (value === 0) return 0;
  for (let e = 1; e <= PHI; e += 1) {
    if (power(value, e) === 1) return e;
  }
  throw new Error('Nonzero element without order in GF29');
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

/** @param {number} exponent @returns {number} */
function inverseExponent(exponent) {
  for (let k = 1; k < PHI; k += 1) {
    if ((exponent * k) % PHI === 1) return k;
  }
  throw new Error('Exponent is not a GF29 permutation: ' + exponent);
}

/** @param {number[]} runes @returns {Record<number, number>} */
function orderCounts(runes) {
  const counts = Object.fromEntries(ORDERS.map(k => [k, 0]));
  for (const index of runes) counts[order(index)] += 1;
  return counts;
}

/** @param {number[]} indices @returns {number} */
function countClassFour(indices) {
  let result = 0;
  for (const i of indices) if (order(i) === 4) result += 1;
  return result;
}

const translit = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** Original first-party GP29 rune normalization used by known solved controls.
 * @param {string} input
 * @returns {number[]}
 */
function encodeLatin(input) {
  const latin = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < latin.length;) {
    if (latin.startsWith('ING', i)) {
      result.push(21);
      i += 3;
    } else if (latin.startsWith('IO', i)) {
      result.push(27);
      i += 2;
    } else {
      const item = translit.find(entry => latin.startsWith(entry.s, i));
      assert(item, 'Unmapped GP letter at ' + latin.slice(i, i + 7));
      result.push(item.i);
      i += item.s.length;
    }
  }
  return result;
}

/** @param {string} input @returns {number[]} */
function encodeWords(input) {
  const words = input.match(/[A-Za-z]+/g) || [];
  return words.flatMap(encodeLatin);
}

/**
 * Select nonduplicated primary solved LP1 sections; avoid editorial
 * "[Continuation...]" repeats and magic-square integer tables.
 * @returns {number[]}
 */
function solvedLP1() {
  const document = read('resources/liber-primus/lp1-plaintext-reference.txt');
  const sections = document.split(/^### /m).slice(1);
  const included = new Set([1, 3, 5, 6, 10, 11, 12, 13, 14, 15, 16]);
  const paragraphs = sections.filter(s => included.has(Number(s.match(/^\d+/)[0])))
    .map(s => s.split('\n').slice(1)
      .filter(line => line.length > 0 && !/^\[/.test(line)
        && !/^\s*\d/.test(line))
      .join(' '))
    .join(' ');
  return encodeWords(paragraphs);
}

/** @param {number} count @returns {number[]} */
function primesFromEleven(count) {
  const primes = [];
  for (let p = 11; primes.length < count; p += 1) {
    let valid = true;
    for (let d = 2; d * d <= p; d += 1) {
      if (p % d === 0) { valid = false; break; }
    }
    if (valid) {
      assert.equal(gcd(p, PHI), 1);
      primes.push(p);
    }
  }
  return primes;
}

function main() {
  assert.equal(originalLen, 12956);
  assert.equal(knownP57.length, 95);
  assert.deepEqual(Array.from({ length: F }, (_, i) => order(i))
    .reduce((m, n) => (m[n] = (m[n] || 0) + 1, m), {}),
    { 0: 1, 1: 1, 2: 1, 4: 2, 7: 6, 14: 6, 28: 12 });

  const secretPowerClasses = ORDERS.map(k => ({
    order: k,
    symbols: Array.from({ length: F }, (_, i) => i).filter(i => order(i) === k)
  }));

  const C = orderCounts(original);
  assert.deepEqual(ORDERS.map(x => C[x]),
    [458, 450, 460, 844, 2669, 2688, 5387]);

  const knownP56 = encodeWords('AN END WITHIN THE DEEP WEB THERE EXISTS '
    + 'A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM '
    + 'TO SEEK OUT THIS PAGE');
  assert.equal(knownP56.length, 85);

  const known = knownP56.concat(knownP57);
  assert.equal(known.length, 180);
  const lp1 = solvedLP1();
  assert.equal(lp1.length, 2617);

  const literature = encodeWords(read('resources/control/shakespeare_first300k.txt'));
  assert.equal(literature.length, 217106);

  const beowulf = JSON.parse(
    read('resources/control/beowulf_oe_gp_profile_corrected.json')
  );
  assert.equal(beowulf.allSourceGpRunes, 48012);
  const beowulfClassFour = beowulf.allGpCounts.reduce((sum, n, i) =>
    sum + (order(i) === 4 ? n : 0), 0);

  const count56 = orderCounts(knownP56);
  const count57 = orderCounts(knownP57);
  const countKnown = orderCounts(known);
  const countLP1 = orderCounts(lp1);
  const countShakespeare = orderCounts(literature);
  assert.deepEqual(ORDERS.map(k => countKnown[k]), [4, 9, 0, 2, 39, 37, 89]);
  assert.deepEqual(ORDERS.map(k => countLP1[k]), [41, 129, 17, 32, 649, 472, 1277]);
  assert.equal(countShakespeare[4], 3904);
  assert.equal(beowulfClassFour, 1458);

  // Enumerate every invertible exponent rather than only primes: the
  // invariant is unconditional over all possible adaptive secret exponent
  // schedules, resets, page clocks, and original ciphertext positions.
  const invertibleExponents = Array.from({ length: PHI }, (_, i) => i)
    .filter(x => gcd(x, PHI) === 1);
  assert.deepEqual(invertibleExponents, [1, 3, 5, 9, 11, 13, 15, 17, 19, 23, 25, 27]);
  for (const e of invertibleExponents) {
    for (let x = 0; x < F; x += 1) {
      const encoded = power(x, e);
      const inverse = power(encoded, inverseExponent(e));
      assert.equal(order(encoded), order(x));
      assert.equal(inverse, x);
    }
  }

  // Genuine 180-GP-rune source plant: encrypt each actual solved native
  // rune with a distinct prime exponent from 11 onward, invert all symbols.
  const primeExponents = primesFromEleven(known.length);
  const encryptedPlant = known.map((value, i) => power(value, primeExponents[i]));
  const recovered = encryptedPlant.map((value, i) =>
    power(value, inverseExponent(primeExponents[i] % PHI)));
  assert.deepEqual(recovered, known);
  assert.deepEqual(orderCounts(encryptedPlant), orderCounts(known));

  const results = [
    ['Unknown original p0-p55', original.length, C[4]],
    ['Solved original p56+p57', known.length, countKnown[4]],
    ['Solved original LP1 primary text', lp1.length, countLP1[4]],
    ['Shakespeare native GP control', literature.length, countShakespeare[4]],
    ['Corrected Beowulf Old English GP control', beowulf.allSourceGpRunes,
      beowulfClassFour]
  ].map(([source, runes, eoPlusB]) =>
    ({ source, runes, eoPlusB, fraction: eoPlusB / runes }));
  console.log(JSON.stringify({
    originalSource: 'LP2 p0-p55 unchanged, 12956 GP29 runes',
    field: 29,
    groupOrder: 28,
    fieldOrderClasses: secretPowerClasses,
    invertibleExponents,
    originalClassCounts: C,
    solvedP56ClassCounts: count56,
    solvedP57ClassCounts: count57,
    comparatorRates: results,
    keyIndependentInvariant:
      'Any C=P^e (mod29), with any adaptive position exponent gcd(e,28)=1, '
      + 'requires 844 of 12956 actual plaintext GP symbols in {EO,B}.',
    positivePlant: '180/180 genuine GP rune input decrypted from prime powers',
    conclusion: 'Direct prime-power GP29 cipher without additive '
      + 'or substitution wrapping is strongly inconsistent with '
      + 'author-native English GP29 frequencies; no plaintext recovered.'
  }, null, 2));
}

main();
