'use strict';

/**
 * Cuneiform p33-39 1033/3301 GP29 prime-rank endpoint test.
 *
 * Both reversed 4-digit primes have ranks divisible by 29:
 * p[173]=1033=prime #174=6*29, p[463]=3301=prime #464=16*29.
 * The open interval supplies a literal, fixed 290-prime key. Repeated printed
 * headings motivate page reset, and numerical reversal motivates one
 * preregistered within-page reversal comparator.
 *
 * Direct solved-p56 prime-totient transfer, with exact plaintext-F bypass.
 * These observed mathematical coincidences do not authenticate a Cicada key.
 * Node 22 CommonJS, no external packages.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const mod = x => (x % 29 + 29) % 29;

/** @param {number} limit @returns {number[]} */
function primesBelow(limit) {
  const composite = new Uint8Array(limit);
  const result = [];
  for (let n = 2; n < limit; n++) {
    if (composite[n]) continue;
    result.push(n);
    if (n * n < limit) {
      for (let k = n * n; k < limit; k += n) composite[k] = 1;
    }
  }
  return result;
}

/** @param {number[]} x @returns {number} */
function ioc(x) {
  const freq = Array(29).fill(0);
  for (const n of x) freq[n]++;
  return freq.reduce((s, f) => s + f * (f - 1), 0) / (x.length * (x.length - 1));
}

/**
 * Genuine F-transparent p56 inverse feasibility. Literal plaintext F emits
 * ciphertext F and holds the prime clock. Ciphertext F may also be generated
 * from non-F plaintext by consuming the clock. Any non-F ciphertext must
 * consume a key and must not decode to plaintext F.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @returns {{ok:boolean,failAt:number,states:number[]}}
 */
function legalInverse(ciphertext, key) {
  let clocks = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const j of clocks) {
      if (ciphertext[i] === 0) next.add(j);
      if (j < key.length && mod(ciphertext[i] - key[j]) !== 0) next.add(j + 1);
    }
    if (next.size === 0) return { ok: false, failAt: i, states: [...clocks] };
    clocks = next;
  }
  return { ok: true, failAt: -1, states: [...clocks] };
}

/**
 * Authentic p56-F-bypass forward encoder for a planted native GP plaintext.
 * @param {number[]} plaintext
 * @param {number[]} key
 * @returns {number[]}
 */
function encodeNative(plaintext, key) {
  let clock = 0;
  return plaintext.map(n => {
    if (n === 0) return 0;
    assert(clock < key.length, 'fixed prime key covers each page');
    return mod(n + key[clock++]);
  });
}

const allPrimes = primesBelow(10000);
assert.equal(allPrimes.indexOf(1033) + 1, 174);
assert.equal(allPrimes.indexOf(3301) + 1, 464);
assert.equal(174 % 29, 0);
assert.equal(464 % 29, 0);
assert.equal(464 - 174, 290);

const reversiblePairs = [];
for (const p of allPrimes) {
  if (p < 1000 || p > 9999) continue;
  const reversed = Number(String(p).split('').reverse().join(''));
  if (reversed <= p || reversed < 1000) continue;
  if (allPrimes.includes(reversed)) {
    reversiblePairs.push({
      p, reversed, rankP: allPrimes.indexOf(p) + 1,
      rankR: allPrimes.indexOf(reversed) + 1
    });
  }
}
assert.equal(reversiblePairs.length, 102);
const bothDivisible = reversiblePairs.filter(
  x => x.rankP % 29 === 0 && x.rankR % 29 === 0
);
assert.deepEqual(bothDivisible.map(x => [x.p, x.reversed]), [[1033, 3301]]);

// 290 consecutive primes beginning with 1033 and ending with 3299.
// 3301 is a terminal key boundary rather than a 291st consumed symbol.
const primeInterval = allPrimes.slice(173, 463);
const key = primeInterval.map(n => mod(n - 1));
assert.equal(key.length, 290);
assert.equal(primeInterval[0], 1033);
assert.equal(primeInterval[289], 3299);
assert.equal(allPrimes[463], 3301);

const pages = corpus.pages.filter(p => p.page >= 33 && p.page <= 39);
assert.deepEqual(pages.map(p => p.indices.length), [214, 261, 271, 238, 228, 228, 240]);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 1680);
assert(pages.every(p => p.indices.length < key.length));

const raw = pages.flatMap(p => p.indices);
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
assert(p57.includes(0));

const variants = [
  { name: 'printed order', reversePage: false,
    failures: [54, 42, 23, 13, 19, 48, 18] },
  { name: 'reverse runes within each page', reversePage: true,
    failures: [0, 45, 13, 19, 6, 8, 5] }
];
const outcomes = [];
for (const variant of variants) {
  const sourcePages = pages.map(p =>
    variant.reversePage ? p.indices.slice().reverse() : p.indices.slice());
  const inverse = sourcePages.map(seq => seq.map((x, i) => mod(x - key[i])));
  assert.deepEqual(inverse.map((a, j) =>
    a.map((x, i) => mod(x + key[i]))), sourcePages);
  const gate = sourcePages.map(seq => legalInverse(seq, key));
  assert(gate.every(x => !x.ok));
  assert.deepEqual(gate.map(x => x.failAt), variant.failures);

  // Genuine source-native plaintext, with literal F, tests this exact
  // candidate's transparent-F encoding and all inverse clock paths.
  for (const page of sourcePages) {
    const plant = Array.from({ length: page.length }, (_, i) => p57[i % 95]);
    const syntheticCipher = encodeNative(plant, key);
    assert(legalInverse(syntheticCipher, key).ok);
  }

  const full = inverse.flat();
  outcomes.push({
    reading: variant.name,
    noSkipIoC: ioc(full),
    firstP33TwentyGp: inverse[0].slice(0, 20).map(n => corpus.translit[n]).join(' '),
    firstImpossibleFPositions: gate.map(x => x.failAt),
    transparentFAllSevenPagesImpossible: true,
    exactNoSkipReencryption: true,
    sevenNativeP57PlantsPass: true
  });
}
assert.equal(ioc(raw), 0.03436002155478034);
assert(Math.abs(outcomes[0].noSkipIoC - 0.03440256388439831) < 1e-12);
assert(Math.abs(outcomes[1].noSkipIoC - 0.03442241697155336) < 1e-12);

console.log(JSON.stringify({
  source: 'Seven original p33-39 cuneiform pages, exact GP29',
  firstPrime: 1033,
  lastPrime: 3301,
  ordinalMultiplesOf29: [6, 16],
  ordinalGap: 290,
  reversibleFourDigitPrimePairs: reversiblePairs.length,
  bothPrimeRanksMultiplesOf29: bothDivisible,
  sourcePageLengths: pages.map(p => p.indices.length),
  originalIndicesSha256: crypto.createHash('sha256').update(Buffer.from(raw)).digest('hex'),
  originalIoC: ioc(raw),
  key: '290 p-1 mod29 shifts, p174..p463, reset under each repeated page header',
  results: outcomes,
  decision: 'New exact source arithmetic, but this direct solved-p56 prime-stream transfer has no legal transparent-F inverse or readable GP29 output on any original page. No LP2 plaintext.'
}, null, 2));
