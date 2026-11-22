"use strict";

/**
 * Bounded original-input test: the 464-prime 2013 live-ISO prime_echo
 * sequence as a continuous, repeating GP29 additive key.
 *
 * Frozen models only:
 *   K_i = p_i mod 29
 *   K_i = phi(p_i) = p_i - 1 mod 29
 *   P_i = C_i +/- K_(i mod 464) mod 29
 *
 * Clock starts at the first rune of physical p0 and continues across page
 * boundaries. No phase, reset, reversal, permutation, or fitted parameter.
 *
 * Run from repository root:
 *   node sims/prime_echo_464_periodic_key_sft.cjs
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) if (isPrime(n)) out.push(n);
  return out;
}
const mod29 = n => ((n % 29) + 29) % 29;
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const transliterate = values => values.map(i => corpus.translit[i]).join("");

const sourcePages = corpus.pages
  .filter(p => p.page >= 0 && p.page <= 55)
  .sort((a, b) => a.page - b.page);
assert.equal(sourcePages[0].page, 0);
assert.equal(sourcePages.at(-1).page, 55);
const ciphertext = sourcePages.flatMap(p => p.indices);
assert.equal(ciphertext.length, 12956);

const primes = firstPrimes(464);
assert.equal(primes[0], 2);
assert.equal(primes[173], 1033); // archived BASE29 1033 marker
assert.equal(primes[463], 3301); // archived DH 3301 / prime_echo endpoint
assert.equal(primes.length, 16 * 29);

const primeKey = primes.map(p => mod29(p));
const totientKey = primes.map(p => mod29(p - 1));
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);

function decode(input, key, sign) {
  return input.map((c, i) => mod29(c + sign * key[i % 464]));
}
function encode(input, key, sign) {
  return input.map((p, i) => mod29(p - sign * key[i % 464]));
}

const plant = Array.from({ length: ciphertext.length }, (_, i) => p57[i % p57.length]);
const cases = [];
for (const [reducer, key] of [["prime", primeKey], ["totient", totientKey]]) {
  for (const sign of [-1, 1]) {
    const recovered = decode(ciphertext, key, sign);
    assert.deepEqual(encode(recovered, key, sign), ciphertext,
      "exact original-cipher reencryption");

    const plantedCiphertext = encode(plant, key, sign);
    assert.deepEqual(decode(plantedCiphertext, key, sign), plant,
      "source-native positive-control recovery");

    cases.push({
      reducer,
      sign,
      period: 464,
      phase: 0,
      clock: "continuous across physical pages",
      ioc: ioc(recovered),
      first96: transliterate(recovered.slice(0, 96)),
      last96: transliterate(recovered.slice(-96)),
      originalReencryptedExactly: true,
      repeatedP57PlantRecoveredExactly: true
    });
  }
}

// phi(p)=p-1 changes every prime-key symbol by -1. Thus the corresponding
// decoded streams are only global one-symbol alphabet relabelings.
const primeMinus = decode(ciphertext, primeKey, -1);
const phiMinus = decode(ciphertext, totientKey, -1);
const primePlus = decode(ciphertext, primeKey, 1);
const phiPlus = decode(ciphertext, totientKey, 1);
assert.deepEqual(phiMinus, primeMinus.map(x => mod29(x + 1)));
assert.deepEqual(phiPlus, primePlus.map(x => mod29(x - 1)));

console.log(JSON.stringify({
  source: "2013 live-ISO prime_echo prime sequence",
  primeCount: primes.length,
  endpoints: [primes[0], primes.at(-1)],
  sourceMarkers: { p174: primes[173], p464: primes[463] },
  keyConstruction: "prime or Euler-totient residues modulo GP29",
  originalLength: ciphertext.length,
  originalIoC: ioc(ciphertext),
  cases
}, null, 2));
