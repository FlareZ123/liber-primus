'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpusPath = path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const found = corpus.pages.find(p => p.page === 55);
assert.ok(found, 'missing p55');
const p55 = found.indices;
const primes = [];
for (let n = 2; primes.length < 160; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { prime = false; break; }
  }
  if (prime) primes.push(n);
}

function traceTransparentInverse(ciphertext, primeOrdinal) {
  let states = [{ cursor: 0, plaintext: [] }];
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const next = [];
    for (const state of states) {
      // Literal F is transparent and does not consume the prime stream.
      if (c === 0) {
        next.push({ cursor: state.cursor, plaintext: [...state.plaintext, 0] });
      }
      const prime = primes[primeOrdinal - 1 + state.cursor];
      const key = (prime - 1) % 29;
      const p = ((c - key) % 29 + 29) % 29;
      // If the inverse yields F at a non-F ciphertext, the transparent
      // forward rule makes that branch impossible.
      if (p !== 0) {
        next.push({ cursor: state.cursor + 1, plaintext: [...state.plaintext, p] });
      }
    }
    if (next.length === 0) {
      return {
        deadAt: i,
        cipherIndex: c,
        statesBefore: states.map(s => ({ cursor: s.cursor, plaintext: s.plaintext }))
      };
    }
    states = next;
  }
  return { survivingStates: states };
}

const primeOrdinal = 29; // fixed by 108 = 109 - 1
const firstPrime = primes[primeOrdinal - 1];
const firstKey = firstPrime - 1;
assert.equal(p55.length, 76);
assert.equal(firstPrime, 109);
assert.equal(firstKey, 108);
assert.equal(p55[0], 21);
assert.equal(corpus.translit[p55[0]], 'NG');

const fullPage = traceTransparentInverse(p55, primeOrdinal);
const body = p55.slice(1); // exclude the single incoming carry rune
const carrySkipped = traceTransparentInverse(body, primeOrdinal);

assert.equal(fullPage.deadAt, 0);
assert.equal(fullPage.cipherIndex, 21);
assert.equal(carrySkipped.deadAt, 2);
assert.equal(carrySkipped.cipherIndex, 10);
assert.equal(carrySkipped.statesBefore.length, 1);
assert.deepEqual(carrySkipped.statesBefore[0].plaintext, [4, 23]);
assert.equal(carrySkipped.statesBefore[0].cursor, 2);

console.log(JSON.stringify({
  p55Runes: p55.length,
  incomingCarryIndex: p55[0],
  incomingCarryRune: corpus.translit[p55[0]],
  primeOrdinal,
  firstPrime,
  firstKey,
  firstKeyMod29: firstKey % 29,
  fullPageReset: fullPage,
  carrySkippedBody: {
    bodyRunes: body.length,
    firstThreeCipherIndices: body.slice(0, 3),
    firstThreeKeys: [108, 112, 126],
    firstThreeForcedPlainIndices: [4, 23, 0],
    firstThreeForcedPlainRunes: ['A', 'OE', 'F'],
    firstDeadState: carrySkipped
  },
  legalInversePaths: 0
}, null, 2));
