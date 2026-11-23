'use strict';

/**
 * Original LP2 p8 red title and p8/p9 carried-word receiving block.
 * Red word1 XIXM reversed becomes canonical Roman MXIX, prime1019.
 * The separate complete red word2 has GP0 product 3.
 * Both provide a mathematically fixed inverse of x -> x^3 mod1019.
 * Pack exactly two GP29 symbols as one integer 0..840, then walk the
 * p=1019 permutation until the next integer returns to that range.
 *
 * This is a candidate prime-modulus format-preserving operation, not a
 * first-party instruction. Test both pair big-endian conventions and both
 * cube/inverse directions without fitted key/phase.
 *
 * Run on Windows 11 with Node 22:
 * node sims/lp2_p8_roman1019_cubepair_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const annotations = JSON.parse(fs.readFileSync(
  path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const p8 = corpus.pages.find((p) => p.page === 8).indices;
const p9 = corpus.pages.find((p) => p.page === 9).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
assert.deepEqual(annotations.pages.find((p) => p.page === 8).red_spans
  .map((r) => [r.start, r.length]), [[0, 12]]);
assert.deepEqual(p8.slice(0, 4), [14, 10, 14, 19]);
assert.equal(p8.slice(0, 4).map((n) => corpus.translit[n]).join(''), 'XIXM');
assert.equal(p8.slice(4, 12).reduce((n, v) => n * v % 29, 1), 3);
assert.deepEqual([p8.length, p9.length, p57.length], [255, 268, 95]);
const receiver = p8.slice(12).concat(p9.slice(0, 5));
assert.equal(receiver.length, 248);
const prime = 1019n;
const domain = 29n ** 2n;
const cube = 3n;
const inverseCube = 679n;
assert.equal(cube * inverseCube % (prime - 1n), 1n);
assert.equal(domain, 841n);
const isPrime = (n) => {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return n > 1;
};
assert(isPrime(Number(prime)));

/**
 * @param {bigint} a
 * @param {bigint} exp
 * @returns {bigint}
 */
function modularPow(a, exp) {
  let x = a, e = exp, y = 1n;
  while (e > 0n) {
    if (e % 2n === 1n) y = y * x % prime;
    x = x * x % prime;
    e /= 2n;
  }
  return y;
}
/**
 * @param {bigint} x
 * @param {bigint} exp
 * @returns {bigint}
 */
function walk(x, exp) {
  let y = x;
  do { y = modularPow(y, exp); } while (y >= domain);
  return y;
}
/**
 * @param {number[]} tape
 * @param {bigint} exp
 * @param {boolean} littleEndian
 * @returns {number[]}
 */
function transform(tape, exp, littleEndian) {
  assert.equal(tape.length % 2, 0);
  const out = [];
  for (let i = 0; i < tape.length; i += 2) {
    const hi = BigInt(littleEndian ? tape[i + 1] : tape[i]);
    const lo = BigInt(littleEndian ? tape[i] : tape[i + 1]);
    const x = walk(hi * 29n + lo, exp);
    const a = Number(x / 29n), b = Number(x % 29n);
    out.push(...(littleEndian ? [b, a] : [a, b]));
  }
  return out;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const symbol of a) counts[symbol]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}
const native = Array.from({length:248}, (_, i) => p57[i % p57.length]);
const results = [];
for (const littleEndian of [false, true]) {
  for (const [label, exp, undo] of [
    ['cube', cube, inverseCube],
    ['inverseCube', inverseCube, cube]
  ]) {
    const plaintext = transform(receiver, exp, littleEndian);
    assert.deepEqual(transform(plaintext, undo, littleEndian), receiver);
    const plantedCipher = transform(native, undo, littleEndian);
    assert.deepEqual(transform(plantedCipher, exp, littleEndian), native);
    results.push({
      pairOrder: littleEndian ? 'LSB-first' : 'MSB-first',
      inverse: label,
      outputIoc: ioc(plaintext),
      first75Rnes: plaintext.slice(0, 75).map(x=>corpus.translit[x]).join(''),
      exactOriginalForwardReplay: true,
      exactNativePlantRecovery: true
    });
  }
}
const expected = [0.03477210395716338, 0.03464150450568108,
  0.03506595272299856, 0.03310696095076401];
for (let i = 0; i < results.length; i++)
  assert(Math.abs(results[i].outputIoc - expected[i]) < 1e-12);
const crossPlant = transform(native, inverseCube, false);
const wrong = transform(crossPlant, cube, true);
const wrongPositions = wrong.filter((v, i) => v !== native[i]).length;
assert(wrongPositions > 0);
console.log(JSON.stringify({
  source: {
    originalRedWord1: 'XIXM',
    reversedRomanPrime: Number(prime),
    originalRedWord2ProductGP29: 3,
    p8BlackOriginalRunes: 243,
    p9PrintedCarryRunes: 5,
    completeReceiverRunes: receiver.length,
    GP29PairDomain: Number(domain)
  },
  experiment: {
    conditionalRule: 'GF1019 cubic permutation cycle-walk over base29 digraphs',
    originalIoC: ioc(receiver),
    genuineSolved95IoC: ioc(p57),
    orientationAndExponentReadings: results,
    wrongOrientationPlantPositionsChanged: wrongPositions,
    sourceSelectsCycleWalk: false,
    newUnknownPlaintextRecovered: false
  }
}, null, 2));
