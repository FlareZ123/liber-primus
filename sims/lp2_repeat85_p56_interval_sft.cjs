'use strict';

/**
 * Independent source-to-known-plaintext gate: 86 ciphertext doublets produce
 * 85 intervening spans; test their fixed numeric readouts against solved LP2 p56.
 * Run from the repository root: node sims/lp2_repeat85_p56_interval_sft.cjs
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

function firstPrimes(count) {
  const result = [];
  for (let n = 2; result.length < count; n++) {
    if (result.every(p => p * p > n || n % p !== 0)) result.push(n);
  }
  return result;
}

const MOD = 29;
const pages = corpus.pages.slice(0, 56);
const cipher = pages.flatMap(page => page.indices);
assert.equal(cipher.length, 12956);
const events = [];
let offset = 0;
for (const page of pages) {
  for (let i = 1; i < page.indices.length; i++) {
    if (page.indices[i] === page.indices[i - 1]) events.push(offset + i);
  }
  offset += page.indices.length;
}
assert.equal(events.length, 86);
assert.equal(events[0], 122);
assert.equal(events.at(-1), 12939);

const primes = firstPrimes(100);
const known = corpus.pages[56].indices;
assert.equal(known.length, 85);
const clear = [];
let primeClock = 0;
for (let i = 0; i < known.length; i++) {
  // The independently solved p56 uses one transparent literal F at offset 56.
  if (i === 56) {
    assert.equal(known[i], 0);
    clear.push(0);
    continue;
  }
  clear.push((known[i] - ((primes[primeClock++] - 1) % MOD) + MOD) % MOD);
}
assert.equal(primeClock, 84);
const clearLatin = clear.map(x => corpus.translit[x]).join('');
assert.equal(clearLatin, 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
let k = 0;
const forward = clear.map((p, i) => i === 56 ? 0 : (p + primes[k++] - 1) % MOD);
assert.deepEqual(forward, known);

const spans = events.slice(0, -1).map((start, i) =>
  cipher.slice(start, events[i + 1]));
assert.equal(spans.length, clear.length);
const features = new Map([
  ['prime-weight sum, including first repeat', span => span.reduce((sum, n) => sum + corpus.prime[n], 0) % MOD],
  ['prime-weight sum, strictly between repeats', span => span.slice(1).reduce((sum, n) => sum + corpus.prime[n], 0) % MOD],
  ['GP29 index sum', span => span.reduce((sum, n) => sum + n, 0) % MOD],
  ['interval length mod29', span => span.length % MOD]
]);

function testAlphabet(input, expected) {
  const forwardMap = new Map();
  const reverseMap = new Map();
  for (let i = 0; i < input.length; i++) {
    const x = input[i];
    const y = expected[i];
    if (forwardMap.has(x) && forwardMap.get(x).value !== y)
      return { kind: 'not a function', earlier: forwardMap.get(x).at, later: i, input: x,
        expectedEarlier: forwardMap.get(x).value, expectedLater: y };
    if (reverseMap.has(y) && reverseMap.get(y).value !== x)
      return { kind: 'not injective', earlier: reverseMap.get(y).at, later: i, output: y,
        inputEarlier: reverseMap.get(y).value, inputLater: x };
    forwardMap.set(x, { at: i, value: y });
    reverseMap.set(y, { at: i, value: x });
  }
  return null;
}

console.log('Original: 12,956 unknown runes, 86 same-page adjacent repeats, 85 intervals.');
console.log('Solved p56 positive control:', clearLatin);
for (const [name, read] of features) {
  const values = spans.map(read);
  const identical = values.filter((v, i) => v === clear[i]).length;
  const directAtbash = values.filter((v, i) => MOD - 1 - v === clear[i]).length;
  const witness = testAlphabet(values, clear);
  assert(witness, 'Unexpected successful original fixed-bijection candidate');
  let bestAffine = { count: -1, mult: 0, add: 0 };
  for (let mult = 1; mult < MOD; mult++) {
    for (let add = 0; add < MOD; add++) {
      const count = values.reduce((sum, v, i) =>
        sum + ( (mult * v + add) % MOD === clear[i] ), 0);
      if (count > bestAffine.count) bestAffine = { count, mult, add };
    }
  }
  console.log(JSON.stringify({name, identical, directAtbash, witness,
    eventGlobalPositions: [events[witness.earlier], events[witness.later]], bestAffine}));

  // The same key-free gate accepts genuine one-to-one synthetic alphabet plants.
  const secretMap = values.map(v => (7 * v + 13) % MOD);
  assert.equal(testAlphabet(values, secretMap), null);
  assert.deepEqual(secretMap.map(y => (25 * (y - 13 + MOD)) % MOD), values);
}
console.log('PASS: all four original readouts violate every fixed 29-symbol bijection; planted bijections pass.');
