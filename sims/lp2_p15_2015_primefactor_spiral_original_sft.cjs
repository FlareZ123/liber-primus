'use strict';

/**
 * Original 17 Jan 2015 #cicadasolvers message proposes factoring the
 * original LP2 p15 clockwise Fibonacci spiral into sixteen prime factors.
 * This source-defined, preexisting proposal is different from the spiral's
 * original generating-prime and Fibonacci-order streams.
 *
 * Exact original-page and native GP29 positive:
 *   node sims/lp2_p15_2015_primefactor_spiral_original_sft.cjs
 *
 * No search/fitted offset: fixed red-center clockwise order, zero key phase,
 * period16 from the supplied sixteen numbers.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

const sourceSpiral = [
  3299, 3298, 3296, 3294,
  3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472,
  1820, 708, 1206, 4516,
];
const contemporaryFactors = [
  3299, 97, 103, 61,
  137, 149, 181, 179,
  197, 31, 43, 103,
  13, 59, 67, 1129,
];

/** @param {number} n @returns {number} */
function largestPrimeFactor(n) {
  let value = n;
  let factor = 1;
  for (let p = 2; p * p <= value; p += 1) {
    while (value % p === 0) {
      factor = p;
      value /= p;
    }
  }
  return Math.max(factor, value);
}
assert.deepEqual(sourceSpiral.map(largestPrimeFactor), contemporaryFactors);

/** @param {number} n @returns {number} */
const gp = (n) => ((n % 29) + 29) % 29;

/** @param {number[]} glyphs @returns {number} */
function ioc(glyphs) {
  const counts = Array(29).fill(0);
  for (const glyph of glyphs) counts[glyph] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (glyphs.length * (glyphs.length - 1));
}

/**
 * Native known-cipher F transparency feasibility; C=F may be literal
 * P=F without consuming the key, or a normal encrypted non-F rune.
 * Every non-F ciphertext always consumes one key symbol. A consumed
 * key decoding to P=F is invalid under the known positive encoder.
 *
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {boolean} cycle
 * @param {1|-1} a
 * @param {1|-1} b
 * @param {number} constant
 * @returns {{survives:boolean, firstContradiction?:number, clocks?:number[]}}
 */
function fehuGate(ciphertext, key, cycle, a, b, constant) {
  let clocks = new Set([0]);
  for (let offset = 0; offset < ciphertext.length; offset += 1) {
    const next = new Set();
    for (const clock of clocks) {
      if (ciphertext[offset] === 0) next.add(clock);
      const index = cycle ? clock % key.length : clock;
      if (index >= key.length) continue;
      const decoded = gp(a * ciphertext[offset] + b * key[index] + constant);
      if (decoded !== 0) next.add(clock + 1);
    }
    if (!next.size) return { survives: false, firstContradiction: offset };
    clocks = next;
  }
  return { survives: true, clocks: [...clocks].sort((a, b) => a - b) };
}

/** @param {number} count @returns {number[]} */
function primes(count) {
  const out = [];
  for (let value = 2; out.length < count; value += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
      if (value % divisor === 0) { prime = false; break; }
    }
    if (prime) out.push(value);
  }
  return out;
}
assert.equal(source.pages[56].indices.length, 85);
const historicalPositive = primes(85).map((p) => gp(p - 1));
const known = fehuGate(source.pages[56].indices, historicalPositive, false, 1, -1, 0);
assert.ok(known.survives, 'historically solved p56 must pass its exact prime-totient F-skip mechanism');
assert.deepEqual(known.clocks, [81, 82, 83, 84, 85]);

const pages = source.pages.slice(16, 23);
const original = pages.flatMap((page) => page.indices);
assert.deepEqual(pages.map((page) => page.indices.length), [267, 273, 260, 271, 269, 273, 131]);
assert.equal(original.length, 1744);

const families = [
  ['largest-original-prime-factor', contemporaryFactors.map(gp)],
  ['totient-of-original-prime-factor', contemporaryFactors.map((p) => gp(p - 1))],
];
const variants = [];
for (const [name, key] of families) {
  for (const a of /** @type {(1|-1)[]} */ ([1, -1])) {
    for (const b of /** @type {(1|-1)[]} */ ([-1, 1])) {
      const offsets = a === -1 ? [0, 28] : [0];
      for (const constant of offsets) {
        // The offset28 variants model historical GP Atbash P=(28-C)+shift.
        // Zero variants model simple additive or sign-reversed Vigenere.
        const plain = original.map((c, i) => gp(a * c + b * key[i % 16] + constant));
        const gate = fehuGate(original, key, true, a, b, constant);
        assert.equal(gate.survives, false);
        assert.ok(gate.firstContradiction < 100);
        variants.push({
          source: name, inputA: a, keySign: b, atbashConstant: constant,
          directIoc: ioc(plain), fehuFirstFailure: gate.firstContradiction,
          startTranslit: plain.slice(0, 22).map((index) => source.translit[index]).join('-'),
        });
      }
    }
  }
}
assert.equal(variants.length, 12);
assert.ok(variants.every((candidate) =>
  candidate.directIoc > 0.0342 && candidate.directIoc < 0.0345));
assert.deepEqual(variants.map((candidate) => candidate.fehuFirstFailure), [
  64, 12, 12, 3, 64, 5,
  5, 96, 96, 12, 5, 20,
]);
console.log(JSON.stringify({
  originalDate: '2015-01-17',
  originalWitness:
    'https://github.com/neuroretransmit/cicada/blob/main/irc-logs/%23cicadasolvers.freenode.2.log#L74352',
  originalP15Spiral: sourceSpiral,
  originalHistoricalFactorSequence: contemporaryFactors,
  originalConsecutiveRuneCount: original.length,
  knownP56Positive: known,
  originalIoc: ioc(original),
  originalVariants: variants,
  conclusion: 'Original 2015 factor operand does not decode source p16-22 under frozen historically attested F-bypass/simple GP29 shift or Atbash',
}, null, 2));
