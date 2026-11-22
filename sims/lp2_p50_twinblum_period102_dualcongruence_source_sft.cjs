'use strict';

/**
 * Conditional 1031/512 and 3301/-102 source-byte CRT repair for original p50.
 * The 102 is independently derived from 2013 lower-twin BBS QR orders.
 * These post hoc congruences do not prove Cicada-authored checksums or decode LP2.
 * Read-only; Windows 11 / Node.js 22 compatible.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const load = (p) => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', p), 'utf8'));
const grid = load('base60-grid.json');
const corpus = load('lp2-corpus.json');
const ink = load('lp2-ink-annotations.json');
const echo = fs.readFileSync(path.join(root, 'resources/historical/cicada2013-os-original-prime-echo.sh'), 'utf8');
const orig = grid.byte_rows.flat();
const upper3301 = 3301n, lower1031 = 1031n;
const F = 36528277968n;
const norm = (v, m) => (v % m + m) % m;

/** @param {bigint} value @param {bigint} exponent @param {bigint} modulus @returns {bigint} */
function power(value, exponent, modulus) {
  let result = 1n;
  for (let v = value % modulus, e = exponent; e > 0n; e /= 2n, v = v * v % modulus) {
    if (e & 1n) result = result * v % modulus;
  }
  return result;
}
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
/** @param {bigint} modulus @returns {number} */
function twoOrder(modulus) {
  let v = 1n;
  for (let i = 1; i <= Number(modulus); i++) {
    v = v * 2n % modulus;
    if (v === 1n) return i;
  }
  throw new Error('No multiplicative order of 2');
}
/** @param {readonly number[]} bytes @param {bigint} modulus @returns {bigint} */
function remainder(bytes, modulus) {
  return bytes.reduce((r, b) => (r * 256n + BigInt(b)) % modulus, 0n);
}
/** @param {number[]} bytes @param {number[]} divisor @returns {number[]} */
function poly29(bytes, divisor) {
  const c = bytes.map((v) => v % 29).reverse();
  const inv = Number(power(BigInt(divisor.at(-1)), 27n, 29n));
  for (let i = c.length - divisor.length; i >= 0; i--) {
    const scale = c[i + divisor.length - 1] * inv % 29;
    for (let j = 0; j < divisor.length; j++) {
      c[i + j] = (c[i + j] - scale * divisor[j] % 29 + 29) % 29;
    }
  }
  return c.slice(0, divisor.length - 1);
}
/** @param {number[]} arr @returns {string} */
function hex(arr) {
  return arr.map((v) => v.toString(16).padStart(2, '0')).join('');
}

assert.equal(orig.length, 256);
assert.equal(createHash('sha256').update(Buffer.from(orig)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert(echo.includes('"1033\t"; sleep 2'));
assert(echo.includes('"3301\t"; sleep 2'));
const allTwinPrimes = [1031, 1033, 3299, 3301];
for (const p of allTwinPrimes) {
  for (let d = 2; d * d <= p; d++) assert.notEqual(p % d, 0);
}
assert.equal(1031 % 4, 3);
assert.equal(3299 % 4, 3);
assert.equal(3301 % 4, 1);
assert.equal(1033 % 4, 1);
const gpQrOrders = [BigInt((1031 - 1) / 2), BigInt((3299 - 1) / 2)];
const ord2 = gpQrOrders.map(twoOrder);
assert.deepEqual(ord2, [204, 48]);
const periodBits = ord2[0] * ord2[1] / Number(gcd(BigInt(ord2[0]), BigInt(ord2[1])));
assert.equal(periodBits, 816);
const periodBytes = periodBits / 8;
assert.equal(periodBytes, 102);
const target3301 = BigInt(3301 - periodBytes);
assert.equal(target3301, 3199n);

const redSum = (page) => {
  const source = ink.pages.find((p) => p.page === page).red_spans.find((s) => s.start === 0);
  return [...source.runes].reduce((acc, rune) => acc + corpus.prime[corpus.runes.indexOf(rune)], 0);
};
assert.equal(redSum(27), 1109);
assert.equal(redSum(54), 597);
const target1031 = BigInt(redSum(27) - redSum(54));
assert.equal(target1031, 512n);
const p57 = corpus.pages.find((p) => p.page === 57);
assert.equal(p57.indices.slice(37, 67).reduce((s, i) => s + corpus.prime[i], 0), 1031);
assert.equal(remainder(orig, lower1031), target1031);
assert.equal(remainder(orig, upper3301), target3301);
assert.equal(remainder(orig, F), 0n);
const H = [3, 26, 24], G = [27, 5, 15];
assert.deepEqual(poly29(orig, H), [0, 0]);
assert.deepEqual(poly29(orig, G), [0, 0]);

// The 12 original geometries/radices are fixed historical alternatives.
const flat = grid.rows.flat();
const column = Array.from({ length: 8 }, (_, i) => grid.rows.map((row) => row[i])).flat();
const geometries = [
  ['row-major', flat],
  ['reversed', [...flat].reverse()],
  ['column', column],
  ['reversed-column', [...column].reverse()],
  ['reversed-within-row', grid.rows.flatMap((row) => [...row].reverse())],
  ['reversed-rows', [...grid.rows].reverse().flat()],
];
const matchingGeometries = [];
for (const [direction, cells] of geometries) {
  for (const [radix, alphabet] of [[60, grid.alphabet], [59, grid.alphabet.replace('f', '')]]) {
    const values = cells.map((v) => radix * alphabet.indexOf(v[0]) + alphabet.indexOf(v[1]));
    if (remainder(values, lower1031) === target1031 &&
      remainder(values, upper3301) === target3301) matchingGeometries.push([direction, radix]);
  }
}
assert.deepEqual(matchingGeometries, [['row-major', 60]]);

// Original archived 2014 source offers exactly these 12 independent binary/text/case choices.
const historic = [
  [25, 224, 198], [45, 81, 107], [50, 21, 47], [165, 18, 47],
  [170, 254, 194], [172, 148, 174], [175, 44, 18], [182, 141, 167],
  [199, 21, 47], [215, 5, 84], [237, 58, 32], [246, 224, 198],
];
const legacy = [...orig];
for (const [position, old] of historic) legacy[position] = old;
const pass1031 = [], pass3301 = [], passBoth = [];
for (let mask = 0; mask < 4096; mask++) {
  const test = [...legacy];
  historic.forEach(([position, , alternate], i) => {
    if (mask & (1 << i)) test[position] = alternate;
  });
  const a = remainder(test, lower1031) === target1031;
  const b = remainder(test, upper3301) === target3301;
  if (a) pass1031.push(mask);
  if (b) pass3301.push(mask);
  if (a && b) {
    passBoth.push(mask);
    assert.deepEqual(test, orig, 'Checksum repair must reconstruct original independently held-out cells');
  }
}
assert.equal(pass1031.length, 5);
assert.equal(pass3301.length, 2);
assert.deepEqual(passBoth, [0xfc7]);

// The older F/H/G p50 factors and both source-number congruences together
// reconstruct eight genuine withheld terminal bytes, while nine remain ambiguous.
/** @param {number} suffixLength @returns {{integerCandidates:number, fullyConsistent:string[], original:string}} */
function reconstruct(suffixLength) {
  const prefix = orig.slice(0, orig.length - suffixLength);
  const shift = 1n << BigInt(suffixLength * 8);
  const prefixInt = prefix.reduce((s, v) => s * 256n + BigInt(v), 0n);
  let candidate = norm(-prefixInt * shift, F), stride = F;
  for (const [modulus, target] of [[lower1031, target1031], [upper3301, target3301]]) {
    assert.equal(gcd(stride, modulus), 1n);
    const residue = norm(target - prefixInt * shift, modulus);
    candidate += stride * norm((residue - norm(candidate, modulus)) *
      power(stride % modulus, modulus - 2n, modulus), modulus);
    stride *= modulus;
  }
  const knownZero = prefix.concat(Array(suffixLength).fill(0));
  const hBase = poly29(knownZero, H), gBase = poly29(knownZero, G);
  const weightsH = [], weightsG = [];
  for (let i = 0; i < suffixLength; i++) {
    const unit = Array(256).fill(0);
    unit[256 - suffixLength + i] = 1;
    weightsH.push(poly29(unit, H));
    weightsG.push(poly29(unit, G));
  }
  const matches = [];
  let count = 0;
  for (let number = candidate; number < shift; number += stride) {
    count++;
    const bytes = Array(suffixLength);
    let value = number;
    for (let i = suffixLength - 1; i >= 0; i--) {
      bytes[i] = Number(value & 255n);
      value >>= 8n;
    }
    let [h0, h1] = hBase, [g0, g1] = gBase;
    for (let i = 0; i < suffixLength; i++) {
      const digit = bytes[i] % 29;
      h0 += digit * weightsH[i][0];
      h1 += digit * weightsH[i][1];
      g0 += digit * weightsG[i][0];
      g1 += digit * weightsG[i][1];
    }
    if (h0 % 29 === 0 && h1 % 29 === 0 && g0 % 29 === 0 && g1 % 29 === 0) {
      matches.push(hex(bytes));
    }
  }
  return { integerCandidates: count, fullyConsistent: matches, original: hex(orig.slice(256 - suffixLength)) };
}
const eight = reconstruct(8), nine = reconstruct(9);
assert.equal(eight.integerCandidates, 148);
assert.deepEqual(eight.fullyConsistent, ['719eace6b424bd50']);
assert.equal(eight.original, eight.fullyConsistent[0]);
assert.equal(nine.integerCandidates, 37986);
assert.deepEqual(nine.fullyConsistent, ['c0719eace6b424bd50', 'd893c344f01267c900']);
assert(nine.fullyConsistent.includes(nine.original));
console.log(JSON.stringify({
  original256Sha256: createHash('sha256').update(Buffer.from(orig)).digest('hex'),
  sourceTwinPrimes: allTwinPrimes, sourceLowerBlumModulus: 1031 * 3299,
  bbsBitPeriodUpperBound: periodBits, standardPackedBytePeriod: periodBytes,
  conditionallyMatchedCongruences: { mod1031: Number(target1031), mod3301: Number(target3301) },
  naturalGeometryMatches: matchingGeometries,
  archivalCorrection: { alternatives: 4096, pass1031: pass1031.length,
    pass3301: pass3301.length, both: passBoth.map((v) => v.toString(16)) },
  withheldEight: eight,
  withheldNine: nine,
  claim: 'Exact retrospective conditional repair, not an authenticated creator checksum or unknown plaintext'
}, null, 2));
