'use strict';

/**
 * p29 DIRECTION receiver gate for the cuneiform-bounded 2013 prime_echo interval.
 *
 * The 2016 signed clue's zero-based word 29 nominates physical p29.
 * The cuneiform endpoints and red p15 terminal 3299 select primes 1033..3299
 * (290 primes). The p29 page has 277 runes, so a 13-prime trim leaves a
 * 277-entry stream. Both endpoint trims are tested. The only cipher operation
 * is the solved p56 prime-minus-one shift with literal plaintext-F bypass.
 *
 * The inverse keeps BOTH legal histories at ciphertext F:
 *   - plaintext F is transparent and does not consume a key entry;
 *   - encrypted non-F may also produce ciphertext F and consume a key entry.
 * A non-F ciphertext may not decode to plaintext F.
 *
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

function ioc(symbols) {
  const freq = Array(29).fill(0);
  for (const n of symbols) freq[n]++;
  return freq.reduce((sum, count) => sum + count * (count - 1), 0)
    / (symbols.length * (symbols.length - 1));
}

/**
 * Exact p56-F inverse reachability. At ciphertext F, retain both a transparent
 * F (same clock) and any encrypted non-F (advance). At non-F ciphertext, only
 * a consuming non-F plaintext is legal.
 */
function legalInverse(ciphertext, key, keyPrimes) {
  let clocks = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const clock of clocks) {
      if (ciphertext[i] === 0) next.add(clock);
      if (clock < key.length) {
        const plain = mod(ciphertext[i] - key[clock]);
        if (plain !== 0) next.add(clock + 1);
      }
    }
    if (next.size === 0) {
      const priorClocks = [...clocks].sort((a, b) => a - b);
      return {
        ok: false,
        failAt: i,
        ciphertext: ciphertext[i],
        priorClocks,
        impossibleTransitions: priorClocks.map(clock => ({
          keyIndex: clock,
          prime: keyPrimes[clock],
          shift: key[clock],
          wouldDecodeTo: clock < key.length
            ? mod(ciphertext[i] - key[clock])
            : null
        }))
      };
    }
    clocks = next;
  }
  return { ok: true, finalClocks: [...clocks].sort((a, b) => a - b) };
}

function encodeNative(plaintext, key) {
  let clock = 0;
  const ciphertext = plaintext.map(symbol => {
    if (symbol === 0) return 0;
    assert(clock < key.length, 'key covers every consumed native symbol');
    return mod(symbol + key[clock++]);
  });
  return { ciphertext, consumed: clock };
}

function isExactForwardPath(plaintext, ciphertext, key) {
  let clock = 0;
  for (let i = 0; i < plaintext.length; i++) {
    if (plaintext[i] === 0) {
      if (ciphertext[i] !== 0) return false;
    } else {
      if (clock >= key.length || ciphertext[i] !== mod(plaintext[i] + key[clock])) {
        return false;
      }
      clock++;
    }
  }
  return true;
}

const p29 = corpus.pages.find(page => page.page === 29).indices;
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p29.length, 277);
assert.equal(p29.filter(symbol => symbol === 0).length, 8);
assert.equal(p57.length, 95);

const allPrimes = primesBelow(3302);
const start = allPrimes.indexOf(1033);
const stop = allPrimes.indexOf(3301);
assert(start >= 0 && stop > start);
const interval = allPrimes.slice(start, stop); // 1033..3299; 3301 is boundary
assert.equal(interval.length, 290);
assert.equal(interval[0], 1033);
assert.equal(interval[289], 3299);
assert.equal(allPrimes[stop], 3301);

const trims = [
  {
    name: 'drop-first-13',
    keyPrimes: interval.slice(13),
    expectedFailAt: 25,
    expectedClock: 25,
    expectedPrime: 1301,
    expectedCipher: 24
  },
  {
    name: 'drop-last-13',
    keyPrimes: interval.slice(0, 277),
    expectedFailAt: 1,
    expectedClock: 1,
    expectedPrime: 1039,
    expectedCipher: 23
  }
];

const results = [];
for (const trim of trims) {
  const key = trim.keyPrimes.map(prime => mod(prime - 1));
  assert.equal(key.length, 277);

  const gate = legalInverse(p29, key, trim.keyPrimes);
  assert.equal(gate.ok, false);
  assert.equal(gate.failAt, trim.expectedFailAt);
  assert.deepEqual(gate.priorClocks, [trim.expectedClock]);
  assert.equal(gate.ciphertext, trim.expectedCipher);
  assert.equal(gate.impossibleTransitions.length, 1);
  assert.equal(gate.impossibleTransitions[0].prime, trim.expectedPrime);
  assert.equal(gate.impossibleTransitions[0].shift, trim.expectedCipher);
  assert.equal(gate.impossibleTransitions[0].wouldDecodeTo, 0);

  // Source-native positive control: repeat the solved p57 plaintext to p29's
  // exact length, encode with the same key and true F bypass, then require the
  // exact inverse reachability to retain at least one legal history.
  const plant = Array.from({ length: p29.length }, (_, i) => p57[i % p57.length]);
  const encoded = encodeNative(plant, key);
  assert.equal(encoded.ciphertext.length, p29.length);
  assert(isExactForwardPath(plant, encoded.ciphertext, key));
  const positive = legalInverse(encoded.ciphertext, key, trim.keyPrimes);
  assert.equal(positive.ok, true);

  results.push({
    trim: trim.name,
    keyLength: key.length,
    firstPrime: trim.keyPrimes[0],
    lastPrime: trim.keyPrimes.at(-1),
    original: gate,
    nativePositive: {
      p57RepeatedLength: plant.length,
      consumedKeys: encoded.consumed,
      exactForwardPath: true,
      inverseHasLegalPath: true
    }
  });
}

const output = {
  source: 'resources/liber-primus/lp2-corpus.json, physical p29 and solved p57',
  p29: {
    runes: p29.length,
    literalCiphertextFCount: p29.filter(symbol => symbol === 0).length,
    indicesSha256: crypto.createHash('sha256').update(Buffer.from(p29)).digest('hex'),
    rawIoC: ioc(p29)
  },
  primeEcho: {
    interval: [1033, 3299],
    terminalBoundary: 3301,
    count: interval.length,
    trimCount: 13,
    candidateKeyLength: 277,
    keyOperation: '(prime - 1) mod 29',
    p56PlaintextFBypass: true
  },
  results,
  decision: 'Both source-limited 13-prime endpoint trims have zero legal p56-F inverse histories on original p29. The same inverse accepts p57-native planted controls. No LP2 plaintext or key recovered.'
};

console.log(JSON.stringify(output, null, 2));
