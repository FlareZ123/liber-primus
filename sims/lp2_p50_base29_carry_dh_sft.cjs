'use strict';

/**
 * Source-locked LP2 table GF(29) -> GF(29^2) carry experiment.
 * Node 22 CommonJS SFT; run from any current directory:
 *   node sims/lp2_p50_base29_carry_dh_sft.cjs
 *
 * This is an intermediate structural test, not a plaintext decoder.
 * Fixed original source inputs:
 * H=[3,26,24] is the signed 2013 BASE29(3301)=3QO example;
 * R=[23,6,10] is the original p23 centered red triple;
 * G=[27,5,15] is the original p39 red triple.
 * Coefficients of each factor ascend in powers of X.
 * Original 256 base60 table values descend in powers of X.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const grid = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const data = grid.bytes;
const H = [3, 26, 24];
const R = [23, 6, 10];
const G = [27, 5, 15];
const DH = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });

/** @param {number} n @param {number} modulus @returns {number} */
function mod(n, modulus) {
  return ((n % modulus) + modulus) % modulus;
}

/** @param {number} n @param {number} modulus @returns {number} */
function inverse(n, modulus) {
  for (let k = 1; k < modulus; k++)
    if (mod(n * k, modulus) === 1) return k;
  throw new Error('Nonunit ' + n + ' modulo ' + modulus);
}

/**
 * Descending original bytes modulo an ascending-power factor.
 * @param {number[]} sequence
 * @param {number[]} factor
 * @param {number} modulus
 * @returns {number[]}
 */
function remainder(sequence, factor, modulus) {
  const coefficients = sequence.map((n) => mod(n, modulus));
  const descending = factor.slice().reverse();
  const unit = inverse(descending[0], modulus);
  for (let i = 0; i <= coefficients.length - descending.length; i++) {
    const term = mod(coefficients[i] * unit, modulus);
    for (let j = 0; j < descending.length; j++)
      coefficients[i + j] = mod(
        coefficients[i + j] - term * descending[j], modulus);
  }
  return coefficients.slice(1 - factor.length);
}

/**
 * For each table position, returns the coefficients [X,1] of the
 * corresponding monomial modulo a quadratic over Z/modulus.
 * @param {number[]} quadratic
 * @param {number} modulus
 * @returns {number[][]}
 */
function weights(quadratic, modulus) {
  let a = 1, b = 0;
  const unit = inverse(quadratic[2], modulus);
  const ascendingExponentWeights = [];
  for (let e = 0; e < data.length; e++) {
    ascendingExponentWeights.push([b, a]);
    [a, b] = [
      mod(-b * quadratic[0] * unit, modulus),
      mod(a - b * quadratic[1] * unit, modulus),
    ];
  }
  return ascendingExponentWeights.reverse();
}

/** @param {number} base @param {number} power @param {number} modulus */
function modPow(base, power, modulus) {
  let result = 1;
  for (let i = 0; i < power; i++) result = mod(result * base, modulus);
  return result;
}

/**
 * Solve a four-coordinate parity system modulo 29², with row pivots
 * restricted to units. Its determinant is nonzero modulo 29.
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function solveFour(matrix) {
  const modulus = 841;
  const A = matrix.map((row) => row.map((n) => mod(n, modulus)));
  for (let col = 0; col < 4; col++) {
    let pivot = col;
    while (pivot < 4 && A[pivot][col] % 29 === 0) pivot++;
    assert.ok(pivot < 4, 'Four-coordinate tail must be invertible');
    [A[pivot], A[col]] = [A[col], A[pivot]];
    const scale = inverse(A[col][col], modulus);
    for (let j = col; j < 5; j++) A[col][j] = mod(A[col][j] * scale, modulus);
    for (let row = 0; row < 4; row++) {
      if (row === col) continue;
      const multiplier = A[row][col];
      for (let j = col; j < 5; j++)
        A[row][j] = mod(A[row][j] - multiplier * A[col][j], modulus);
    }
  }
  return A.map((row) => row[4]);
}

assert.equal(data.length, 256);
assert.equal(grid.pages.length, 3);
assert.ok(data.every((n) => Number.isInteger(n) && n >= 0 && n <= 255));
assert.equal(crypto.createHash('sha256').update(Buffer.from(data)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual([modPow(DH.g, DH.a, DH.p), modPow(DH.g, DH.b, DH.p),
  modPow(DH.A, DH.b, DH.p)], [DH.A, DH.B, DH.K]);

for (const [name, factor, expected29, expected841, expected24389] of [
  ['H', H, [0, 0], [232, 145], [3596, 11078]],
  ['R', R, [0, 0], [87, 783], [22794, 11716]],
  ['G', G, [0, 0], [435, 58], [8004, 15196]],
]) {
  assert.deepEqual(remainder(data, factor, 29), expected29, name + ' mod29');
  assert.deepEqual(remainder(data, factor, 841), expected841, name + ' mod841');
  assert.deepEqual(remainder(data, factor, 24389), expected24389,
    name + ' mod29^3');
}

const expectedCarry = [DH.A, DH.g, DH.b, DH.K]; // H X,1; then G X,1
assert.deepEqual([...remainder(data, H, 841), ...remainder(data, G, 841)]
  .map((x) => x / 29), expectedCarry);
assert.deepEqual([...remainder(data, H, 24389),
  ...remainder(data, G, 24389)].map((x) => Math.floor(x / 841)),
  [4, 13, 9, 18]); // No assumed continuation to a second DH register

// The source-conditional reverse-character alternative uses radix 73.
// It has the same mod29 zero checks, but a different higher-digit payload.
const tokens = grid.pages.flatMap((page) => page.tokens);
const reverse73 = tokens.map((token) =>
  73 * grid.alphabet.indexOf(token[1]) + grid.alphabet.indexOf(token[0]));
assert.equal(reverse73.length, 256);
assert.ok(Math.max(...reverse73) > 255);
assert.deepEqual(remainder(reverse73, H, 29), [0, 0]);
assert.deepEqual(remainder(reverse73, G, 29), [0, 0]);
assert.deepEqual([...remainder(reverse73, H, 841),
  ...remainder(reverse73, G, 841)].map((x) => x / 29),
  [27, 22, 23, 10]);

// Reconstruct the last four actual bytes from the first 252, the two
// literal factor checks and the source-associated first carry register.
// This is an IN-SAMPLE reconstruction: its DH target was recognized
// after the original last four byte values had been examined.
const wholeWeights = data.map((_, i) => [
  ...weights(H, 841)[i], ...weights(G, 841)[i]]);
const target = expectedCarry.map((n) => n * 29);
const firstRemainders = [0, 0, 0, 0];
for (let i = 0; i < 252; i++)
  for (let row = 0; row < 4; row++)
    firstRemainders[row] = mod(
      firstRemainders[row] + data[i] * wholeWeights[i][row], 841);
const matrix = Array.from({ length: 4 }, (_, row) => [
  ...Array.from({ length: 4 }, (_, j) => wholeWeights[252 + j][row]),
  mod(target[row] - firstRemainders[row], 841),
]);
const inferredTail = solveFour(matrix);
assert.deepEqual(firstRemainders, [524, 781, 562, 103]);
assert.deepEqual(inferredTail, [180, 36, 189, 80]);
assert.deepEqual(inferredTail, data.slice(252));
assert.ok(inferredTail.every((n) => n < 256));

// Read each mod29-syndrome carry pair as zero-based (row,column).
// This source-typed operation is a hypothesis, not an authenticated command.
const xy0 = [expectedCarry[0] * 8 + expectedCarry[1],
  expectedCarry[2] * 8 + expectedCarry[3]];
const xy1 = [(expectedCarry[0] - 1) * 8 + expectedCarry[1] - 1,
  (expectedCarry[2] - 1) * 8 + expectedCarry[3] - 1];
assert.deepEqual(xy0, [69, 122]);
assert.deepEqual(xy0.map((i) => data[i]), [73, 86]);
assert.equal(String.fromCharCode(...xy0.map((i) => data[i])), 'IV');
assert.deepEqual(xy1, [60, 113]);
assert.deepEqual(xy1.map((i) => data[i]), [106, 143]);

// One source-shaped IV continuation, fixed before decrypting: p23 red16
// rune values or GP primes as the 16-byte CBC IV, the first16 p50 bytes
// as AES-128 key, and the remaining240 printed bytes as ciphertext.
// This reverses the roles of the previously rejected p23-key/table-IV
// AES test. It remains only an exploratory role assignment.
const sourceIVs = [
  ['p23 red GP indices', [1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]],
  ['p23 red GP primes', [3,97,19,79,17,47,89,17,31,61,31,41,59,61,31,103]],
];
const frozenAesReadouts = [
  [128, 0, 240, 81, 30, '6ac2d31a38fae8bb61a8a82569b8c3c1'],
  [128, 1, 240, 81, 30, '68bbc7402fdba6ac7484bd004294d6bc'],
  [256, 0, 224, 82, 25, 'c0ed25d470f67014163e5cebf87450f8'],
  [256, 1, 224, 81, 26, 'c294318e67d73e03031249ced3584585'],
];
for (const [bits, ivType, n, ascii, gp, expectedStart] of frozenAesReadouts) {
  const [name, iv] = sourceIVs[ivType];
  const keyLength = bits / 8;
  const decoder = crypto.createDecipheriv('aes-' + bits + '-cbc',
    Buffer.from(data.slice(0, keyLength)), Buffer.from(iv));
  decoder.setAutoPadding(false);
  const plain = Buffer.concat([decoder.update(Buffer.from(data.slice(keyLength))),
    decoder.final()]);
  assert.equal(plain.length, n, name + bits);
  assert.equal(plain.subarray(0, 16).toString('hex'), expectedStart, name + bits);
  assert.equal([...plain].filter((v) => v >= 32 && v <= 126).length, ascii);
  assert.equal([...plain].filter((v) => v <= 28).length, gp);
}

// Roman-numeral IV=4 could select a full 16-character original row as
// AES-128/CBC IV. For both natural row4 conventions, use the exact p23
// red16 raw indices or raw GP primes as the key; decrypt all original
// 256 table bytes. Four literal source combinations, no tuned key/phase.
const candidatePrintedIVs = [
  ['fourth printed row', tokens.slice(24, 32).join('')],
  ['zero-indexed fourth row', tokens.slice(32, 40).join('')],
];
assert.deepEqual(candidatePrintedIVs.map(([, iv]) => iv),
  ['1n3I2r0P2U162L2D', '1t1s3H0d0s1K2D05']);
const aesCBCReadouts = [];
const expectedRows = [
  [
    [75, 25, 'fadc839863364e6a7cc98047fdb5ba2c'],
    [85, 35, '29aab4439409f8a41e7d230d7ced9146'],
  ],
  [
    [74, 26, 'fac681a2620c4e5e7eef803afdbdb85d'],
    [87, 34, '29b0b6799533f8901c5b23707ce59337'],
  ],
];
for (let row = 0; row < candidatePrintedIVs.length; row++) {
  const [rowName, asciiIV] = candidatePrintedIVs[row];
  for (let keyVariant = 0; keyVariant < sourceIVs.length; keyVariant++) {
    const [keyName, rawKey] = sourceIVs[keyVariant];
    const aes = crypto.createDecipheriv('aes-128-cbc',
      Buffer.from(rawKey), Buffer.from(asciiIV, 'ascii'));
    aes.setAutoPadding(false);
    const plain = Buffer.concat([aes.update(Buffer.from(data)), aes.final()]);
    const [printable, gp, firstHex] = expectedRows[row][keyVariant];
    assert.equal(plain.length, 256);
    assert.equal(plain.subarray(0, 16).toString('hex'), firstHex);
    assert.equal([...plain].filter((n) => n >= 32 && n <= 126).length,
      printable);
    assert.equal([...plain].filter((n) => n < 29).length, gp);
    aesCBCReadouts.push({rowName, keyName, printable, gp});
  }
}
// All AES-CBC original bytes after the first16 are independent of the IV.
// Thus no OTHER candidate 16-byte IV can repair the nonlinguistic suffix
// under either fixed 16-byte p23 key without replacing the key or ciphertext.
for (let keyVariant = 0; keyVariant < sourceIVs.length; keyVariant++) {
  const decrypt = (iv) => {
    const aes = crypto.createDecipheriv('aes-128-cbc',
      Buffer.from(sourceIVs[keyVariant][1]), Buffer.from(iv, 'ascii'));
    aes.setAutoPadding(false);
    return Buffer.concat([aes.update(Buffer.from(data)), aes.final()]);
  };
  assert.deepEqual(decrypt(candidatePrintedIVs[0][1]).subarray(16),
    decrypt(candidatePrintedIVs[1][1]).subarray(16));
}

const changed = data.slice();
changed[0] += 29; // Still a valid byte; unchanged full mod29 factorization
assert.ok(changed[0] <= 255);
assert.deepEqual(remainder(changed, H, 29), [0, 0]);
assert.deepEqual(remainder(changed, G, 29), [0, 0]);
assert.notDeepEqual([...remainder(changed, H, 841),
  ...remainder(changed, G, 841)].map((x) => x / 29), expectedCarry);

// Exact-byte-multiset null: shuffle high byte lifts only within equal
// residue classes. Every trial preserves all 256 original byte values
// as a multiset, each byte's modulo29 remainder at its original position,
// both first-order factors, and the original byte range.
const groups = Array.from({ length: 29 }, () => []);
for (let i = 0; i < data.length; i++)
  groups[data[i] % 29].push({ index: i, q: Math.floor(data[i] / 29) });
const weight29 = data.map((_, i) => wholeWeights[i].map((x) => x % 29));
let seed = 0x3301bc23;
/** @param {number} bound @returns {number} */
function randomInt(bound) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % bound;
}
const trials = 300000;
const counts = { exactFour: 0, exactH: 0, exactG: 0, allInDHSet: 0,
  validXY: 0, bothUppercase: 0, bothRoman: 0, exactIV: 0 };
const romanAlphabet = new Set('IVXLCDM');
const dhSet = new Set([DH.p, DH.g, DH.a, DH.b, DH.A, DH.B, DH.K]);
for (let t = 0; t < trials; t++) {
  const carrier = expectedCarry.slice();
  const candidateValues = data.slice();
  for (const group of groups) {
    if (group.length < 2) continue;
    const lifts = group.map((item) => item.q);
    for (let j = lifts.length - 1; j > 0; j--) {
      const k = randomInt(j + 1);
      [lifts[j], lifts[k]] = [lifts[k], lifts[j]];
    }
    for (let j = 0; j < group.length; j++) {
      const delta = lifts[j] - group[j].q;
      if (delta === 0) continue;
      candidateValues[group[j].index] += 29 * delta;
      const w = weight29[group[j].index];
      for (let k = 0; k < 4; k++) carrier[k] += delta * w[k];
    }
  }
  for (let k = 0; k < 4; k++) carrier[k] = mod(carrier[k], 29);
  if (carrier[0] === DH.A && carrier[1] === DH.g) counts.exactH++;
  if (carrier[2] === DH.b && carrier[3] === DH.K) counts.exactG++;
  if (carrier.every((n, i) => n === expectedCarry[i])) counts.exactFour++;
  if (carrier.every((n) => dhSet.has(n))) counts.allInDHSet++;
  if (carrier[1] < 8 && carrier[3] < 8) {
    counts.validXY++;
    const left = candidateValues[8 * carrier[0] + carrier[1]];
    const right = candidateValues[8 * carrier[2] + carrier[3]];
    if (left === 73 && right === 86) counts.exactIV++;
    if (left >= 65 && left <= 90 && right >= 65 && right <= 90) {
      counts.bothUppercase++;
      if (romanAlphabet.has(String.fromCharCode(left)) &&
        romanAlphabet.has(String.fromCharCode(right))) counts.bothRoman++;
    }
  }
}
assert.deepEqual(counts, {
  exactFour: 1, exactH: 376, exactG: 348, allInDHSet: 1001,
  validXY: 22726, bothUppercase: 399, bothRoman: 47, exactIV: 3,
});

console.log(JSON.stringify({
  status: 'PASS',
  mod29: { H: [0, 0], R: [0, 0], G: [0, 0] },
  carry29: { H: [8, 5], R: [3, 27], G: [15, 2] },
  reverse73Carry: [27, 22, 23, 10],
  secondCarry29: [4, 13, 9, 18],
  inSampleTailReconstruction: inferredTail,
  originalXYZeroBased: { indices: xy0, bytes: [73, 86], ASCII: 'IV' },
  aesCBCOriginalBytes: 'p23-red16 IV/table key and rowIV/table body negative',
  printedRowIVs: candidatePrintedIVs,
  printedRowAesReadouts: aesCBCReadouts,
  null: { trials, seed: '0x3301bc23', counts },
  interpretation: 'Retrospective source-typed IV read; no source-selected LP2 inverse',
}, null, 2));
