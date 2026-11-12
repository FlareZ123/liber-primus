'use strict';

/**
 * SFT: finite, source-selected 119-byte GF(29²) discrete-log gate.
 * Original pp49-51: 256 printed base60 cells -> exact GF29 degree16 factor
 * and monic degree238 quotient Q238. Original p3 red triad supplies the
 * primitive field element u, u^2=3u+8, order840.
 * Test whether the 238 nonleading Q coefficients directly encode 119 bytes
 * as (a,b) coordinates of u^byte, byte in 0..255.
 * Run: node sims/lp2_q238_gf841_byte_discrete_log_sft.cjs
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createHash } = require('node:crypto');

const source = JSON.parse(readFileSync(join(__dirname, '..', 'resources',
  'liber-primus', 'base60-grid.json'), 'utf8'));
const bytes = source.rows.flat().map((token) =>
  60 * source.alphabet.indexOf(token[0]) + source.alphabet.indexOf(token[1]));
assert.equal(bytes.length, 256);
assert.equal(bytes[0], 203);
assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number} a @returns {number} */
const mod = (a) => ((a % 29) + 29) % 29;

/**
 * The previously verified exact degree16 small-factor product, ascending.
 * F(X) = 16+9X+...+4X^15+28X^16 (GF29).
 */
const factorAscending = [16, 9, 3, 17, 23, 27, 16, 3, 23,
  3, 18, 22, 14, 18, 12, 4, 28];
const factorDescending = factorAscending.slice().reverse();

// The first original base60 cell, 203=7*29, supplies a zero X^255
// coefficient. Work on the exact remaining degree254 GF29 polynomial.
const remainder = bytes.slice(1).map(mod);
const quotient = [];
for (let i = 0; i < remainder.length - 16; i++) {
  const coefficient = mod(remainder[i] * 28); // inv(28)=28 in GF29.
  quotient.push(coefficient);
  for (let j = 0; j < factorDescending.length; j++) {
    remainder[i + j] = mod(remainder[i + j] -
      coefficient * factorDescending[j]);
  }
}
assert.equal(quotient.length, 239);
assert.equal(quotient[0], 1);
assert.deepEqual(remainder.slice(quotient.length), Array(16).fill(0));
assert.equal(createHash('sha256').update(Buffer.from(quotient)).digest('hex'),
  '9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3');

/**
 * Product in GF29[u] / (u²−3u−8), coordinates [a,b] for a+bu.
 * @param {number[]} z
 * @param {number[]} w
 * @returns {number[]}
 */
function multiply(z, w) {
  const [a, b] = z;
  const [c, d] = w;
  return [mod(a * c + 8 * b * d), mod(a * d + b * c + 3 * b * d)];
}

const powers = [];
const logarithms = new Map();
let z = [1, 0];
for (let n = 0; n < 840; n++) {
  const key = z.join(',');
  assert.equal(logarithms.has(key), false);
  logarithms.set(key, n);
  powers.push(z);
  z = multiply(z, [0, 1]);
}
assert.deepEqual(z, [1, 0]);
assert.equal(logarithms.size, 840); // u primitive, source-selected by p3.
for (let byte = 0; byte < 256; byte++) {
  assert.equal(logarithms.get(powers[byte].join(',')), byte);
}

// 119 bytes are a complete half-block plus 119 per original marked p3/p39
// prefixes. Both source-native coefficient pairings are frozen.
const payload = quotient.slice(1);
assert.equal(payload.length, 238);
/** @param {'adjacent'|'split'} order @param {boolean} swap @returns {number[][]} */
function pairCoordinates(order, swap) {
  const result = [];
  for (let i = 0; i < 119; i++) {
    const pair = order === 'adjacent'
      ? [payload[2 * i], payload[2 * i + 1]]
      : [payload[i], payload[i + 119]];
    result.push(swap ? pair.reverse() : pair);
  }
  return result;
}

/** @param {number[][]} pairs @returns {number[]} */
function decodeLog(pairs) {
  return pairs.map((pair) => logarithms.get(pair.join(',')) ?? -1);
}

/** @param {number[]} values @param {'adjacent'|'split'} order @param {boolean} swap @returns {number[][]} */
function encodeBytes(values, order, swap) {
  assert.equal(values.length, 119);
  const p = values.map((byte) => powers[byte]);
  if (swap) p.forEach((pair, i) => { p[i] = pair.slice().reverse(); });
  return p;
}

const results = [];
for (const order of ['adjacent', 'split']) {
  for (const swap of [false, true]) {
    const exponents = decodeLog(pairCoordinates(order, swap));
    const allBytes = exponents.every((n) => n >= 0 && n <= 255);
    const inByteRange = exponents.filter((n) => n >= 0 && n <= 255).length;
    const inAsciiRange = exponents.filter((n) => n >= 32 && n <= 126).length;
    const validLogs = exponents.filter((n) => n >= 0).length;
    assert.equal(validLogs, 119);
    assert.equal(allBytes, false);

    // Unknown common multiplicative field key u^k adds the SAME k to every
    // field discrete logarithm. Any 119-byte message therefore requires all
    // observed exponents to fit one circular arc of length at most 256 in Z840.
    // The largest consecutive gap measures the smallest possible covering arc
    // WITHOUT enumerating any secret k. This is an all-840-keys exact gate.
    const unique = [...new Set(exponents)].sort((a, b) => a - b);
    const gaps = unique.map((value, i) => (unique[(i + 1) % unique.length] -
      value + 840) % 840);
    const maximumCircularGap = Math.max(...gaps);
    const minimumCircularInclusiveSpan = 841 - maximumCircularGap;
    assert.ok(minimumCircularInclusiveSpan > 256);
    assert.deepEqual(
      encodeBytes(Array.from({ length: 119 }, (_, i) => i), order, swap)
        .map((pair) => logarithms.get((swap ?
          pair.slice().reverse() : pair).join(','))),
      Array.from({ length: 119 }, (_, i) => i)
    );
    results.push({ order, swap, validLogs, inByteRange, inAsciiRange,
      min: Math.min(...exponents), max: Math.max(...exponents),
      uniqueExponentCount: unique.length, maximumCircularGap,
      minimumCircularInclusiveSpan, first24: exponents.slice(0, 24) });
  }
}
assert.deepEqual(results.map((item) => item.inByteRange), [30, 30, 37, 33]);
assert.deepEqual(results.map((item) => item.minimumCircularInclusiveSpan),
  [785, 807, 808, 801]);
console.log(JSON.stringify({
  originalGridBytes: bytes.length, originalQDegree: 238,
  originalNonleadingSlots: payload.length, fieldGroupOrder: powers.length,
  byteCodec: 'u^byte, exactly 0..255, injective and reversible',
  sourcePairings: results,
  outcome: 'No 119-byte exponent codec under ANY common GF841 multiplicative key: every source pairing needs a circular exponent span at least 785, but one 8-bit byte range allows only 256'
}, null, 2));
console.log('PASS: exact original polynomial division, GF841 primitive generator, all 256 byte positives and bounded original exclusions.');
