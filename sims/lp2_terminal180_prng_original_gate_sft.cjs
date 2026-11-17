'use strict';

/**
 * Original LP2 terminal-256 table versus a reversible short-state byte stream.
 *
 * Consumer hypothesis, frozen before scoring original bytes:
 *   table_byte[t] = key_byte[t] XOR GP29_plaintext_index[t].
 * The 32x8 spiral perimeter (76) would carry unknown p55, with the next
 * 180 cells carrying solved p56 (85) plus clear p57 (95).
 *
 * Also checks row/column interior traversal and + / - encoding controls;
 * the finite test does not authenticate the consumer itself.
 *
 * Run: node sims/lp2_terminal180_prng_original_gate_sft.cjs
 * Node.js 22, CommonJS, local canonical repo data only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-grid-256.json'), 'utf8')).bytes;
assert.equal(table.length, 256);
assert.equal(corpus.runes.length, 29);

const cipher56 = corpus.pages.find(p => p.page === 56).indices;
const clear57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(cipher56.length, 85);
assert.equal(clear57.length, 95);

/** @param {number} size @returns {number[]} */
function primes(size) {
  const values = [];
  for (let n = 2; values.length < size; n++) {
    let prime = true;
    for (let j = 2; j * j <= n; j++) {
      if (n % j === 0) { prime = false; break; }
    }
    if (prime) values.push(n);
  }
  return values;
}
const primeList = primes(85);
let primeClock = 0;
const clear56 = cipher56.map((v, i) => i === 56
  ? 0
  : (v - (primeList[primeClock++] - 1) + 2900) % 29);
assert.equal(primeClock, 84);
const translit = indices => indices.map(i => corpus.translit[i]).join('');
assert.equal(translit(clear56), 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
assert.ok(translit(clear57).startsWith('PARABLELICETHEINSTAR'));

/** @param {number} height @param {number} width @returns {number[]} */
function spiralPositions(height, width) {
  let top = 0, bottom = height - 1, left = 0, right = width - 1;
  const positions = [];
  while (top <= bottom && left <= right) {
    for (let x = left; x <= right; x++) positions.push(top * width + x);
    top++;
    for (let y = top; y <= bottom; y++) positions.push(y * width + right);
    right--;
    if (top <= bottom) {
      for (let x = right; x >= left; x--) positions.push(bottom * width + x);
      bottom--;
    }
    if (left <= right) {
      for (let y = bottom; y >= top; y--) positions.push(y * width + left);
      left++;
    }
  }
  return positions;
}
const spiral = spiralPositions(32, 8);
assert.equal(spiral.length, 256);
assert.equal(new Set(spiral).size, 256);
const outer = spiral.slice(0, 76);
const innerSpiral = spiral.slice(76);
const interiorRows = [];
const interiorColumns = [];
for (let row = 1; row < 31; row++) for (let col = 1; col < 7; col++) interiorRows.push(row * 8 + col);
for (let col = 1; col < 7; col++) for (let row = 1; row < 31; row++) interiorColumns.push(row * 8 + col);
assert.equal(outer.length, 76);
assert.equal(innerSpiral.length, 180);
assert.deepEqual(new Set(innerSpiral), new Set(interiorRows));

/** @param {number} a @param {number} b @returns {number} */
function gfMultiply(a, b) {
  let value = 0;
  while (b) {
    if (b & 1) value ^= a;
    b >>>= 1;
    a <<= 1;
    if (a & 256) a ^= 0x11b;
  }
  return value;
}

/**
 * Fit all 256 multipliers, deducing the offset from the first two bytes.
 * The returned matches count covers all n-1 adjacent transitions.
 * @param {number[]} key @param {'ring'|'gf'} field
 * @returns {{a:number,b:number,matches:number}}
 */
function fitAffine(key, field) {
  let best = { a: 0, b: 0, matches: -1 };
  for (let a = 0; a < 256; a++) {
    const b = field === 'ring'
      ? ((key[1] - a * key[0]) & 255)
      : (key[1] ^ gfMultiply(a, key[0]));
    let count = 0;
    for (let i = 0; i + 1 < key.length; i++) {
      const next = field === 'ring'
        ? ((a * key[i] + b) & 255)
        : (gfMultiply(a, key[i]) ^ b);
      if (next === key[i + 1]) count++;
    }
    if (count > best.matches) best = { a, b, matches: count };
  }
  return best;
}

/**
 * Berlekamp-Massey binary linear complexity, MSB-first serialization.
 * A binary LFSR of 32 bits or fewer has complexity <=32 when observed
 * as a consecutive bitstream.
 * @param {number[]} key @returns {number}
 */
function linearComplexity(key) {
  const bits = [];
  for (const byte of key) {
    for (let bit = 7; bit >= 0; bit--) bits.push((byte >>> bit) & 1);
  }
  const connection = [1];
  let previous = [1], length = 0, last = -1;
  for (let i = 0; i < bits.length; i++) {
    let discrepancy = bits[i];
    for (let j = 1; j <= length; j++) discrepancy ^= (connection[j] || 0) & bits[i - j];
    if (!discrepancy) continue;
    const prior = connection.slice();
    const shift = i - last;
    for (let j = 0; j < previous.length; j++) {
      connection[j + shift] = (connection[j + shift] || 0) ^ previous[j];
    }
    if (2 * length <= i) {
      length = i + 1 - length;
      previous = prior;
      last = i;
    }
  }
  return length;
}

/** @param {number[]} bytes @param {number[]} known @param {'xor'|'minus'|'plus'} op */
function deriveKey(bytes, known, op) {
  assert.equal(bytes.length, known.length);
  return bytes.map((v, i) => op === 'xor' ? (v ^ known[i])
    : op === 'minus' ? ((v - known[i]) & 255)
    : ((v + known[i]) & 255));
}

/** @param {number[]} key @returns {{add2:number,xor2:number}} */
function secondOrder(key) {
  let add2 = 0, xor2 = 0;
  for (let i = 2; i < key.length; i++) {
    if (key[i] === ((key[i - 1] + key[i - 2]) & 255)) add2++;
    if (key[i] === (key[i - 1] ^ key[i - 2])) xor2++;
  }
  return { add2, xor2 };
}
const readings = [
  ['row', interiorRows],
  ['column', interiorColumns],
  ['spiral', innerSpiral],
  ['reverse-spiral', innerSpiral.slice().reverse()]
];
const results = [];
for (const [order, positions] of readings) {
  const bytes = positions.map(i => table[i]);
  for (const p56Mode of ['plain', 'cipher']) {
    const known = [...(p56Mode === 'plain' ? clear56 : cipher56), ...clear57];
    for (const operation of ['xor', 'minus', 'plus']) {
      const k = deriveKey(bytes, known, operation);
      results.push({
        order, p56Mode, operation,
        affineRing: fitAffine(k, 'ring'),
        affineGF256: fitAffine(k, 'gf'),
        ...secondOrder(k),
        binaryLinearComplexity: linearComplexity(k)
      });
    }
  }
}
assert.equal(results.length, 24);
const maxRing = Math.max(...results.map(x => x.affineRing.matches));
const maxGF = Math.max(...results.map(x => x.affineGF256.matches));
const minBM = Math.min(...results.map(x => x.binaryLinearComplexity));
const maxBM = Math.max(...results.map(x => x.binaryLinearComplexity));
const maxAdd2 = Math.max(...results.map(x => x.add2));
const maxXor2 = Math.max(...results.map(x => x.xor2));
assert.deepEqual([maxRing, maxGF, minBM, maxBM, maxAdd2, maxXor2], [7, 6, 719, 722, 2, 3]);

// Synthetic *complete* 256-table proof: encode a hidden 76-rune p55 plant
// and the 180 genuine known runes, fit the key on the latter, invert the
// recurrence backwards across the perimeter, and recover every plant rune.
const planted = clear57.slice(0, 76);
const known180 = [...clear56, ...clear57];
const allPlain = [...planted, ...known180];
assert.equal(allPlain.length, 256);
const synthetic = new Array(256);
const allKey = [157];
for (let i = 1; i < 256; i++) allKey.push((109 * allKey[i - 1] + 89) & 255);
for (let i = 0; i < 256; i++) synthetic[spiral[i]] = allKey[i] ^ allPlain[i];
const recoveredKnown = innerSpiral.map((pos, i) => synthetic[pos] ^ known180[i]);
const fit = fitAffine(recoveredKnown, 'ring');
assert.equal(fit.matches, 179);
assert.equal(fit.a, 109);
assert.equal(fit.b, 89);
let modularInverse = -1;
for (let candidate = 1; candidate < 256; candidate += 2) {
  if (((candidate * fit.a) & 255) === 1) modularInverse = candidate;
}
assert.notEqual(modularInverse, -1);
const recoveredFullKey = new Array(256);
recoveredFullKey[76] = recoveredKnown[0];
for (let i = 75; i >= 0; i--) {
  recoveredFullKey[i] = (modularInverse * (recoveredFullKey[i + 1] - fit.b)) & 255;
}
const recoveredPlant = outer.map((pos, i) => synthetic[pos] ^ recoveredFullKey[i]);
assert.deepEqual(recoveredPlant, planted);

// Independent known-byte GF256-positive. Its fixed affine recurrence has
// 179/179 known interior transitions and is recovered without a secret oracle.
const gfKey = [73];
for (let i = 1; i < 256; i++) gfKey.push(gfMultiply(0xa3, gfKey[i - 1]) ^ 0x5d);
const gfInner = gfKey.slice(76);
const gfFit = fitAffine(gfInner, 'gf');
assert.equal(gfFit.matches, 179);
assert.equal(gfFit.a, 0xa3);
assert.equal(gfFit.b, 0x5d);

// Binary 32-state feedback positive, sampled as 180 consecutive bytes.
const bits = Array.from({ length: 32 }, (_, i) => ((i * 7 + (i >>> 2)) & 1));
for (let i = 32; i < 256 * 8; i++) {
  bits.push(bits[i - 1] ^ bits[i - 3] ^ bits[i - 7] ^ bits[i - 32]);
}
const bitKeys = [];
for (let i = 0; i < 256; i++) {
  let b = 0;
  for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
  bitKeys.push(b);
}
const bmPlant = linearComplexity(bitKeys.slice(76));
assert.ok(bmPlant <= 32);

console.log('PASS canonical original p56 85/85 transparent-F solved control; p57 clear 95');
console.log('PASS source shape 32x8 -> perimeter76 + interior180');
console.log('PASS LCG synthetic: 179/179 known transitions, recovered all 76 hidden p55 runes');
console.log('PASS GF256 affine positive: 179/179 known transitions');
console.log('PASS binary LFSR <=32 positive: complexity=' + bmPlant);
console.log('ORIGINAL ' + JSON.stringify({
  registrations: 24, knownBytesPerRegistration: 180, maxRing,
  maxGF, minBM, maxBM, maxAdd2, maxXor2,
  strongest: results.filter(x => x.affineRing.matches === maxRing ||
    x.affineGF256.matches === maxGF)
}));
console.log('DECISION: no original exact byte-affine/GF256 or <=32-bit LFSR decoder in these fixed table-to-GP29 registrations; no p55 plaintext recovered.');
