'use strict';

/**
 * Original LP2 exact wordwise bidirectional phi-prime key pointer.
 * A distinct historical p56 F-transparent cipher transfer, with direction
 * fixed by preceding ciphertext word's GP sum or original word geometry.
 *
 * Read-only Windows Node22 SFT:
 * node sims/lp2_bidirectional_prime_F_singleton_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const rune = new Map(corpus.runes.map((r, i) => [r, i]));
const cipher = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
const words = [];
const direct = [];
let start = -1;
for (const ch of transcript) {
  if (direct.length === 12956) break;
  if (rune.has(ch)) {
    if (start < 0) start = direct.length;
    direct.push(rune.get(ch));
  } else if (ch !== '/' && ch !== '%' && !/\s/.test(ch) && start >= 0) {
    words.push([start, direct.length]);
    start = -1;
  }
}
if (start >= 0) words.push([start, direct.length]);
assert.equal(words.length, 2896);
assert.deepEqual(direct, cipher);

const pageStart = [];
let pos = 0;
for (const page of corpus.pages) {
  pageStart[page.page] = pos;
  if (page.page <= 55) pos += page.indices.length;
}
assert.equal(pos, 12956);
const primes = [];
const sieve = new Uint8Array(190000);
for (let p = 2; p < sieve.length && primes.length < 9000; p++) {
  if (sieve[p]) continue;
  primes.push((p - 1) % 29);
  if (p * p < sieve.length) {
    for (let j = p * p; j < sieve.length; j += p) sieve[j] = 1;
  }
}
assert.equal(primes.length, 9000);
const mod = n => ((n % 29) + 29) % 29;
const prime = n => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
const rules = [
  ['always-forward', () => true],
  ['previous-GP-sum-even', x => x.prev !== null && x.prev % 2 === 0],
  ['previous-GP-sum-isprime', x => x.prev !== null && prime(x.prev)],
  ['current-word-length-even', x => x.n % 2 === 0],
  ['chapter-word-ordinal-even', x => x.ordinal % 2 === 0]
];

/** Source-only word directions, independent of unknown plaintext. */
function prepare(first, last, rule, polarity) {
  const lo = pageStart[first];
  const hi = pageStart[last] + corpus.pages[last].indices.length;
  const spans = words.filter(([a, b]) => a >= lo && b <= hi);
  assert.equal(spans.at(-1)[1], hi);
  const directions = new Int8Array(hi - lo);
  const singletons = new Uint8Array(hi - lo);
  let previousSum = null;
  let ordinal = 0;
  for (const [a, b] of spans) {
    const total = cipher.slice(a, b).reduce((sum, c) =>
      sum + corpus.prime[c], 0);
    const d = (rule({prev: previousSum, n: b - a,
      ordinal: ++ordinal}) ? 1 : -1) * polarity;
    for (let i = a - lo; i < b - lo; i++) directions[i] = d;
    if (b - a === 1) singletons[a - lo] = 1;
    previousSum = total;
  }
  return {ciphertext: cipher.slice(lo, hi), directions, singletons,
    singletonCount: singletons.reduce((n, x) => n + x, 0)};
}

/**
 * Exact reachability under all original p56 plaintext-F choices.
 * Key pointer moves by the current original word's signed direction
 * only after actually consuming a key value; F bypass holds the pointer.
 * @param {{ciphertext:number[],directions:Int8Array,singletons:Uint8Array}} data
 * @param {number} primeStart
 * @param {boolean} englishSingletons
 */
function reach(data, primeStart, englishSingletons) {
  let states = new Set([0]);
  for (let i = 0; i < data.ciphertext.length; i++) {
    const next = new Set();
    const c = data.ciphertext[i];
    const constrained = englishSingletons && data.singletons[i] !== 0;
    for (const delta of states) {
      const pointer = primeStart + delta;
      if (c === 0 && !constrained) next.add(delta);
      if (pointer >= 0 && pointer < primes.length) {
        const p = mod(c - primes[pointer]);
        if (p !== 0 && (!constrained || [24, 10, 3].includes(p)))
          next.add(delta + data.directions[i]);
      }
    }
    if (!next.size) return i;
    states = next;
  }
  return data.ciphertext.length;
}

/** Genuine solved p56 positive, with original F bypass. */
const known = corpus.pages[56].indices;
const p56 = {ciphertext: known, directions: new Int8Array(known.length).fill(1),
  singletons: new Uint8Array(known.length)};
assert.equal(reach(p56, 0, false), 85);

const result = [];
for (const [first, last] of [[0, 2], [40, 53], [54, 55]]) {
  for (const [name, rule] of rules) {
    for (const polarity of (name === 'always-forward' ? [1] : [1, -1])) {
      const data = prepare(first, last, rule, polarity);
      const complete = [];
      const compatible = [];
      let maximumSingletonReach = 0;
      for (let primeStart = 0; primeStart < 5000; primeStart++) {
        const mechanical = reach(data, primeStart, false);
        const grammar = reach(data, primeStart, true);
        if (mechanical === data.ciphertext.length)
          complete.push({primeStart, grammarReach: grammar});
        if (grammar === data.ciphertext.length)
          compatible.push(primeStart);
        maximumSingletonReach = Math.max(maximumSingletonReach, grammar);
      }
      result.push({pages: 'p' + first + '-' + last, rule: name,
        polarity, runes: data.ciphertext.length,
        printedSingletons: data.singletonCount,
        completeUnconstrained: complete.length, compatible,
        complete, maximumSingletonReach});
    }
  }
}
const group = name => result.filter(x => x.pages === name);
assert.equal(group('p0-2').reduce((n, x) =>
  n + x.completeUnconstrained, 0), 16);
assert.ok(group('p40-53').every(x => x.completeUnconstrained === 0));
assert.equal(group('p54-55').reduce((n, x) =>
  n + x.completeUnconstrained, 0), 22);
assert.ok(result.every(x => x.compatible.length === 0));
console.log(JSON.stringify({
  source: '12956 original runes / 2896 printed words',
  positive: 'historical p56 exact 85/85 prime-F reachability',
  mode: 'first key read at primeStart; within-word read then move +/-1',
  reset: 'prime pointer starts independently per original visual chapter',
  clock: 'plaintext F bypass does not consume or move',
  testedPrimeStarts: '0..4999 inclusive',
  decisions: result,
  conclusion: 'No native GP29-English whole-chapter original inverse with any of nine source-computable word-pointer direction schedules; no original plaintext or key.'
}, null, 2));
