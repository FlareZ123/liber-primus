// Source-frozen 2013 Parable three-prime Blum-Blum-Shub bridge to LP2.
// Run: node sims/lp2_2013_parable_bbs_original_sft.cjs
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
/** @param {number} x @returns {boolean} */
function isPrime(x) {
  for (let candidate = 2; candidate * candidate <= x; candidate++) {
    if (x % candidate === 0) return false;
  }
  return x > 1;
}

const p55 = corpus.pages.find((page) => page.page === 55).indices;
assert.equal(p55.length, 76);
const p57 = corpus.pages.find((page) => page.page === 57);
assert.equal(p57.indices.length, 95);

const parableId3 = 1595277641;
const primeFactors = [1259, 1031, 1229];
assert.equal(primeFactors.reduce((product, prime) => product * prime, 1), parableId3);
assert.deepEqual(primeFactors.map((p) => p % 4), [3, 3, 1]);
const [p, q, seed] = primeFactors;
const modulus = p * q;
assert.equal(modulus, 1298029);
assert.ok(primeFactors.every(isPrime), 'all three p57 clause sums must be prime');

// The exact original seed has a 612-bit recurrent state cycle.
const initialState = seed * seed % modulus;
let cycleState = initialState;
let statePeriod = 0;
do {
  cycleState = cycleState * cycleState % modulus;
  statePeriod++;
  assert.ok(statePeriod <= modulus);
} while (cycleState !== initialState);
assert.equal(statePeriod, 612);


/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}
assert.equal(gcd(seed, modulus), 1);

const c60 = grid.byte_rows.flat();
const alphabet59 = grid.alphabet.replace('f', '');
const c59 = grid.rows.flat().map((token) =>
  59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]));
assert.equal(c60.length, 256);
assert.equal(c59.length, 256);
const sourceByteLag = 153; // (2 * 612) / 8 whole bytes.
const sourceLagMatches = {
  base60: c60.slice(0, 256 - sourceByteLag).filter((x, i) => x === c60[i + sourceByteLag]).length,
  base59: c59.slice(0, 256 - sourceByteLag).filter((x, i) => x === c59[i + sourceByteLag]).length
};
assert.deepEqual(sourceLagMatches, { base60: 0, base59: 0 });


/**
 * Standard BBS construction: Blum primes p,q; seed s, state x0=s^2 mod pq.
 * Bit is least significant bit of each state. Two conventional first-bit
 * choices and two non-arbitrary within-byte bit-packing orders are tried.
 * @param {boolean} emitInitial
 * @param {boolean} packLowBitFirst
 * @returns {number[]}
 */
function bbsBytes(emitInitial, packLowBitFirst) {
  let state = seed * seed % modulus;
  const out = [];
  for (let i = 0; i < 256; i++) {
    let value = 0;
    for (let j = 0; j < 8; j++) {
      if (!emitInitial) state = state * state % modulus;
      const bit = state & 1;
      value |= bit << (packLowBitFirst ? j : 7 - j);
      if (emitInitial) state = state * state % modulus;
    }
    out.push(value);
  }
  return out;
}

/** @param {number[]} bytes @returns {number} */
function printableCount(bytes) {
  return bytes.filter((x) => x >= 32 && x <= 126).length;
}

/** @param {number[]} symbols @returns {number} */
function indexOfCoincidence(symbols) {
  const counts = Array(29).fill(0);
  for (const x of symbols) counts[x]++;
  return counts.reduce((n, count) => n + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

const originalIoc = indexOfCoincidence(p55);
const clearP57Ioc = indexOfCoincidence(p57.indices.slice(0, 76));
const targetPhrase = [3, 1, 4, 3, 7, 9]; // source GP29 "OUR OWN"
const requiredKey = p55.slice(-6).map((c, i) => (c - targetPhrase[i] + 29) % 29);
assert.deepEqual(requiredKey, [20, 10, 26, 14, 11, 1]);
const fCipherPositions = p55.flatMap((x, i) => x === 0 ? [i] : []);
assert.deepEqual(fCipherPositions, [15, 25, 41]);

const report = [];
for (const emitInitial of [true, false]) {
  for (const packLowBitFirst of [true, false]) {
    const key = bbsBytes(emitInitial, packLowBitFirst);
    const matches60 = c60.filter((x, i) => x === key[i]).length;
    const matches59 = c59.filter((x, i) => x === key[i]).length;
    const xorPrintable60 = printableCount(c60.map((x, i) => x ^ key[i]));
    const xorPrintable59 = printableCount(c59.map((x, i) => x ^ key[i]));
    const unskippedPad = key.slice(0, 76).map((x) => x % 29);
    const decode = (sign) => p55.map((c, i) => (c + sign * unskippedPad[i] % 29 + 29) % 29);

    // Positive plant: same key and inverse recover 76/76 independent clear p57 runes.
    const plant = p57.indices.slice(0, 76);
    const plantedCipher = plant.map((x, i) => (x + unskippedPad[i]) % 29);
    const recovered = plantedCipher.map((x, i) => (x - unskippedPad[i] + 29) % 29);
    assert.deepEqual(recovered, plant);

    // A literal plaintext F, if exempt as on solved p56, consumes no key;
    // exactly three ciphertext F positions precede the last six p55 symbols.
    const finalSixMatches = [];
    for (let skipped = 0; skipped <= 3; skipped++) {
      const actual = key.slice(70 - skipped, 76 - skipped).map((x) => x % 29);
      const matches = actual.filter((x, i) => x === requiredKey[i]).length;
      assert.ok(matches < 6);
      finalSixMatches.push(matches);
    }

    report.push({
      mode: (emitInitial ? 'initial' : 'after-square') + '/' +
        (packLowBitFirst ? 'low-bit-first' : 'high-bit-first'),
      firstEight: key.slice(0, 8),
      sourceByteMatches: { base60: matches60, base59: matches59 },
      tableXorPrintable: { base60: xorPrintable60, base59: xorPrintable59 },
      p55DirectIoc: { subtract: indexOfCoincidence(decode(-1)),
        add: indexOfCoincidence(decode(1)) },
      p55OurOwnSixCribMatchesByFSkips: finalSixMatches
    });
  }
}

/**
 * Derive a direct GP29 additive pad from the actual BBS bitstream.
 * Five-bit draws reject values 29..31; eight-bit draws reduce modulo29.
 * These are two fixed, ordinary transports, with a continuous source clock.
 * @param {number} length
 * @param {boolean} emitInitial
 * @param {boolean} packLowBitFirst
 * @param {number} chunkBits
 * @returns {number[]}
 */
function fullRunicPad(length, emitInitial, packLowBitFirst, chunkBits) {
  let state = seed * seed % modulus;
  const output = [];
  while (output.length < length) {
    let symbol = 0;
    for (let bit = 0; bit < chunkBits; bit++) {
      if (!emitInitial) state = state * state % modulus;
      symbol |= (state & 1) << (packLowBitFirst ? bit : chunkBits - 1 - bit);
      if (emitInitial) state = state * state % modulus;
    }
    if (chunkBits === 5 && symbol >= 29) continue;
    output.push(symbol % 29);
  }
  return output;
}

const completeOriginal = corpus.pages.filter((page) => page.page <= 55 && page.indices.length)
  .flatMap((page) => page.indices);
assert.equal(completeOriginal.length, 12956);
const fullOriginalReports = [];
for (const chunkBits of [5, 8]) {
  for (const emitInitial of [true, false]) {
    for (const packLowBitFirst of [true, false]) {
      const pad = fullRunicPad(completeOriginal.length, emitInitial, packLowBitFirst, chunkBits);
      const clear = p57.indices.slice();
      const originalPlant = clear.map((x, i) => (x + pad[i]) % 29);
      assert.deepEqual(originalPlant.map((x, i) => (x - pad[i] + 29) % 29), clear);
      for (const sign of [-1, 1]) {
        const decoded = completeOriginal.map((x, i) => (x + sign * pad[i] + 29) % 29);
        fullOriginalReports.push({ chunkBits, emitInitial, packLowBitFirst, sign,
          originalIoc: indexOfCoincidence(decoded) });
      }
    }
  }
}
const completeIocs = fullOriginalReports.map((x) => x.originalIoc);
assert.ok(Math.min(...completeIocs) > 0.0344 && Math.max(...completeIocs) < 0.0346);

assert.deepEqual(report.map((x) => [x.sourceByteMatches.base60, x.sourceByteMatches.base59]), [[1, 3], [0, 2], [0, 1], [1, 0]]);
assert.deepEqual(report.map((x) => x.p55OurOwnSixCribMatchesByFSkips), [[0, 1, 0, 0], [0, 0, 0, 1], [0, 1, 1, 1], [0, 0, 0, 0]]);
console.log(JSON.stringify({ parableId3, primeFactors, modulus, seed, statePeriod, sourceByteLag, sourceLagMatches,
  source: '2013 Parable ID3 plus original LP2 numeric grid and p55/p57 GP29',
  originalP55Ioc: originalIoc, clearP57First76Ioc: clearP57Ioc, report,
  completeOriginalRunes: completeOriginal.length, fullOriginalReports }, null, 2));
console.log('PASS: original source plus standard BBS source-key and planted controls');
