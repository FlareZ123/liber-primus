'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpusPath = path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const page = number => {
  const found = corpus.pages.find(p => p.page === number);
  assert.ok(found, `missing page ${number}`);
  return found.indices;
};
const p55 = page(55);
const primes = [];
for (let n = 2; primes.length < 40; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { prime = false; break; }
  }
  if (prime) primes.push(n);
}

const primeOrdinal = 29; // fixed by 108 = 109 - 1
const firstPrime = primes[primeOrdinal - 1];
const firstKey = firstPrime - 1;
const c0 = p55[0];
const plaintext0 = ((c0 - firstKey) % 29 + 29) % 29;

assert.equal(p55.length, 76);
assert.equal(firstPrime, 109);
assert.equal(firstKey, 108);
assert.equal(firstKey % 29, 21);
assert.equal(c0, 21);
assert.equal(corpus.translit[c0], 'NG');
assert.equal(plaintext0, 0); // F
assert.notEqual(c0, 0); // ciphertext is NG, not transparent F

console.log(JSON.stringify({
  p55Runes: p55.length,
  p55FirstCipherIndex: c0,
  p55FirstCipherRune: corpus.translit[c0],
  primeOrdinal,
  prime: firstPrime,
  key: firstKey,
  keyMod29: firstKey % 29,
  forcedPlaintextIndex: plaintext0,
  forcedPlaintextRune: corpus.translit[plaintext0],
  contradiction: 'p56-transparent F must be ciphertext F; p55 starts with non-F NG',
  legalInversePaths: 0
}, null, 2));
