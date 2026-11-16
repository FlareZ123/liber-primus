'use strict';

// Original-stage 2014 Stage11 HTML 133/331 prime-rank seed gate.
// Conditional on a VERY SPECIFIC unverified hypothesis: author intended
// HTML attributes as one-based starts in the genuine p56 phi(prime) cipher.
// Retains both additive signs and every possible literal-plaintext-F branch.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

require('./authentic_lp2_p56_totient_regression.cjs');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(
  path.join(root, 'resources/historical/stage11-2014-index.html'), 'utf8'
);
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
assert.match(html, /<title>133<\/title>/);
assert.match(html, /<div id="331">/);
assert.equal(133 + 331, 16 * corpus.runes.length);
assert.equal(corpus.runes.length, 29);

/** @type {number[]} */
const primes = [];
for (let n = 2; primes.length < 3500; n++) {
  if (primes.every((p) => p * p > n || n % p !== 0)) primes.push(n);
}
assert.equal(primes[463], 3301);

/**
 * Check every possible plaintext-F bypass without lexical scoring, preserving
 * the exact physical p33–39 ciphertext stream continuously across pages.
 * For source rune C=F (index0), plaintext may be literal F with no key
 * consumption OR non-F with prime consumption when the cipher allows it.
 * @param {number} primeBase Zero-based start index in the prime stream
 * @param {-1|1} sign Decode arithmetic sign
 * @returns {{firstImpossibleAt:number|null, states:number, maxStates:number}}
 */
function exactFContinuity(primeBase, sign) {
  let live = new Set([0]);
  let maxStates = 1;
  let total = 0;
  for (let page = 33; page <= 39; page++) {
    for (const sourceRune of corpus.pages[page].indices) {
      const next = new Set();
      for (const consumed of live) {
        if (sourceRune === 0) next.add(consumed);
        const shift = primes[primeBase + consumed] - 1;
        const plain = ((sourceRune + sign * shift) % 29 + 29) % 29;
        if (plain !== 0) next.add(consumed + 1);
      }
      total++;
      live = next;
      maxStates = Math.max(maxStates, live.size);
      if (live.size === 0) return { firstImpossibleAt: total, states: 0, maxStates };
    }
  }
  return { firstImpossibleAt: null, states: live.size, maxStates };
}

assert.equal(corpus.pages.slice(33, 40).reduce((n, p) => n + p.indices.length, 0), 1680);
const tests = [
  { rank: 133, sign: -1, firstImpossibleAt: 33 },
  { rank: 133, sign: 1, firstImpossibleAt: 181 },
  { rank: 331, sign: -1, firstImpossibleAt: 55 },
  { rank: 331, sign: 1, firstImpossibleAt: 70 }
];
for (const test of tests) {
  const result = exactFContinuity(test.rank - 1, test.sign);
  assert.equal(result.firstImpossibleAt, test.firstImpossibleAt);
  assert.equal(result.states, 0);
}
console.log(JSON.stringify({
  status: 'PASS: source HTML exact; 464th prime 3301; all four direct starts infeasible',
  originalCiphertext: 'LP2 pp33-39, exactly 1680 runes, full F branch survival',
  tests,
  conclusion: 'No original full-chapter native p56 phi-prime inverse under rank 133/331'
}, null, 2));
