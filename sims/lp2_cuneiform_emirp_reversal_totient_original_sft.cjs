'use strict';

/**
 * Source-constrained question: do the 2014 reversed 1033 <-> 3301 cuneiform
 * primes, or Stage11 reversed HTML numbers 133 <-> 331, tell the reader to
 * reverse decimal prime digits before applying the ACTUALLY SOLVED p56
 * Euler-totient/F-transparent GP29 key law to the five 2014 numbered items?
 *
 * Two natural locked interpretations:
 *   A. Ascending emirp primes from source 1033 or 3301 (first 13 is control),
 *      with the prime itself or phi(prime) as source key;
 *   B. Ascending ordinary primes from source 2, 1033 or 3301, each prime's
 *      decimal digits reversed BEFORE calculating Euler phi of the integer.
 *
 * All five ORIGINAL intact numbered items, real F clock holds, no fitted
 * offsets, no arbitrary later-stage cipher, no GP29 alphabet permutation.
 * Source-native 95/95 known plaintext positive controls in every model.
 *
 * Windows 11, Node.js 22, CommonJS. Pure, read-only; no network/deps.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages;
const items = [
  pages[36].indices.slice(99),
  pages[37].indices.slice(0, 91),
  pages[37].indices.slice(91, 189),
  pages[37].indices.slice(189).concat(pages[38].indices.slice(0, 57)),
  pages[38].indices.slice(57, 186)
];
const original = items.flat();
assert.deepEqual(items.map(x => x.length), [139, 91, 98, 96, 129]);
assert.equal(original.length, 553);
assert.equal(original.filter(x => x === 0).length, 12);
assert.equal(pages[57].indices.length, 95);

const html = read('resources/external/cicada2014-stage11-onion7-original-index.html');
assert(html.includes('<title>133</title>'));
assert(html.includes('<div id="331">'));
assert.equal(133 + 331, 464);
const squareText = read('resources/cicada2014-openpuff-magic-squares.txt');
const cells = squareText.trim().split(/\n\s*\n/u)
  .map(group => group.trim().split(/\r?\n/u)
    .map(line => line.trim().split(/\s+/u).map(Number)));
const middle = cells.find(group => group.length === 7);
assert(middle);
assert.equal(middle[3][3], 331);
for (const row of middle) assert.equal(row.reduce((a, b) => a + b, 0), 1033);

/** @param {number} n */
function reverseDigits(n) {
  return Number(String(n).split('').reverse().join(''));
}

/** @param {number} n */
function totient(n) {
  let result = n, rest = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p === 0) {
      result -= Math.floor(result / p);
      while (rest % p === 0) rest /= p;
    }
  }
  if (rest > 1) result -= Math.floor(result / rest);
  return result;
}

/** @param {number} bound */
function getPrimes(bound) {
  const flags = new Uint8Array(bound + 1);
  flags.fill(1, 2);
  for (let p = 2; p * p <= bound; p++) {
    if (flags[p]) for (let i = p * p; i <= bound; i += p) flags[i] = 0;
  }
  const list = [];
  for (let i = 2; i <= bound; i++) if (flags[i]) list.push(i);
  return {list, flags};
}
const {list: primes, flags} = getPrimes(150000);
const emirps = primes.filter(p => {
  const rev = reverseDigits(p);
  return rev !== p && rev < flags.length && flags[rev] === 1;
});
assert.equal(reverseDigits(1033), 3301);
assert.equal(reverseDigits(3301), 1033);
assert(flags[1033] && flags[3301]);
assert.equal(primes.indexOf(3301), 463); // 3301 is prime #464
assert.equal(primes.indexOf(1033), 173);
assert.equal(emirps.indexOf(1033), 39);
assert.equal(emirps.indexOf(3301), 114);
const mod = n => ((n % 29) + 29) % 29;

/**
 * Exhaustively handles ciphertext-F as either literal (no key advance)
 * or ordinary key-consuming ciphertext. Ordinary candidate plaintext-F is
 * forbidden under the author-demonstrated p56 rule.
 *
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} start
 * @param {number} sign
 * @returns {number} Longest legally decipherable prefix
 */
function legalPrefix(ciphertext, key, start, sign) {
  let states = new Set([0]);
  let prefix = 0;
  for (const symbol of ciphertext) {
    const next = new Set();
    for (const consumed of states) {
      const at = start + consumed;
      if (at >= key.length) continue;
      const ordinary = mod(symbol - sign * key[at]);
      if (ordinary !== 0) next.add(consumed + 1);
      if (symbol === 0) next.add(consumed);
    }
    if (next.size === 0) break;
    states = next;
    prefix++;
  }
  return prefix;
}

/** @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} start
 * @param {number} sign
 */
function encrypt(plaintext, key, start, sign) {
  let consumed = 0;
  return plaintext.map(symbol => {
    if (symbol === 0) return 0;
    assert(start + consumed < key.length);
    const encoded = mod(symbol + sign * key[start + consumed]);
    consumed++;
    return encoded;
  });
}

const models = [];
for (const startPrime of [13, 1033, 3301]) {
  for (const usePhi of [false, true]) {
    const key = emirps.map(p => mod(p - (usePhi ? 1 : 0)));
    const start = emirps.indexOf(startPrime);
    assert(start >= 0);
    for (const sign of [-1, 1]) {
      models.push({kind:'emirp', startPrime, usePhi, sign, key, start});
    }
  }
}
for (const startPrime of [2, 1033, 3301]) {
  const key = primes.map(p => mod(totient(reverseDigits(p))));
  const start = primes.indexOf(startPrime);
  assert(start >= 0);
  for (const sign of [-1, 1]) {
    models.push({kind:'reversed-prime-totient', startPrime,
      usePhi:true, sign, key, start});
  }
}
assert.equal(models.length, 18);
const expectedContinuous = [
  7,76,3,27,    // emirp start 13, prime and phi, signs -/+
  9,4,56,7,     // emirp start 1033
  55,4,21,17,   // emirp start 3301
  24,1,         // phi(reverse prime), start 2
  4,84,         // start 1033
  7,20          // start 3301
];
const results = [];
for (const [i, model] of models.entries()) {
  const {key, start, sign} = model;
  const reached = legalPrefix(original, key, start, sign);
  const perItem = items.map(x => legalPrefix(x, key, start, sign));
  assert.equal(reached, expectedContinuous[i], `original family ${i}`);
  assert(reached < 553, `no complete historical inverse model ${i}`);
  assert(perItem.some((len, j) => len < items[j].length),
    `no fully legal same-start reset across all five ${i}`);

  const native = pages[57].indices;
  const synthetic = encrypt(native, key, start, sign);
  assert.equal(legalPrefix(synthetic, key, start, sign), 95,
    `source-native 95/95 F-transparent positive family ${i}`);
  // All 95/95 original clear runes are reproduced by the same forward codec.
  assert.deepEqual(encrypt(native, key, start, sign), synthetic);
  results.push({kind:model.kind, seed:model.startPrime,
    shift:model.usePhi?'phi':'prime', sign,
    originalContinuousPrefix:reached, originalItemPrefixes:perItem,
    nativePlant:95});
}
console.log(JSON.stringify({
  source:'2014 reversed HTML 133/331; original cuneiform emirps 1033/3301',
  realOriginalRenum:[139, 91, 98, 96, 129],
  tested:results.length, fullOriginalSurvivors:0,
  nextDecision:'No direct native GP29 key transfer from these two source-reversal operations',
  results
}, null, 2));
