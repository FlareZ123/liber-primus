'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const mod = (x) => ((x % 29) + 29) % 29;

function inverse29(x) {
  for (let i = 1; i < 29; i++) if (mod(i * x) === 1) return i;
  throw new Error('no inverse in GF29');
}

function multiplyPolynomial(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  }
  return out;
}

function phi(n) {
  let x = n;
  let result = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      result -= result / p;
    }
  }
  if (x > 1) result -= result / x;
  return result;
}

function determinant3(A) {
  return mod(
    A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
    A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
    A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])
  );
}

function inverseMatrixMod29(A) {
  const n = A.length;
  const M = A.map((row, i) => row.map(mod).concat(
    Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
  ));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && M[pivot][col] === 0) pivot++;
    if (pivot === n) throw new Error('singular Hill key over GF(29)');
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const scale = inverse29(M[col][col]);
    M[col] = M[col].map((v) => mod(v * scale));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col];
      M[row] = M[row].map((v, j) => mod(v - factor * M[col][j]));
    }
  }
  return M.map((row) => row.slice(n));
}

function applyBlocks(M, sequence) {
  assert.equal(sequence.length % 3, 0);
  const out = [];
  for (let i = 0; i < sequence.length; i += 3) {
    const block = sequence.slice(i, i + 3);
    for (let row = 0; row < 3; row++) {
      out.push(mod(M[row].reduce((sum, value, col) => sum + value * block[col], 0)));
    }
  }
  return out;
}

const grid = readJson('resources/liber-primus/base60-grid.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every((row) => row.length === 8));
assert.deepEqual(bytes.slice(0, 4), [203, 231, 167, 186]);

// H is the signed 2013 BASE29 3301 -> 3QO polynomial.
// G is the independently source-linked p39 red-triad polynomial.
const H = [3, 26, 24];
const G = [27, 5, 15];
const F = multiplyPolynomial(H, G);
assert.deepEqual(F, [23, 21, 11, 17, 12]);

// The printed table is descending-power order; division uses ascending coefficients.
// Preserve all 252 quotient slots, including the source-inherited leading zero.
const remainder = bytes.slice().reverse().map(mod);
const quotient = Array(252).fill(0);
const leadInverse = inverse29(F[4]);
for (let i = 255; i >= 4; i--) {
  const coefficient = mod(remainder[i] * leadInverse);
  quotient[i - 4] = coefficient;
  for (let j = 0; j < F.length; j++) {
    remainder[i - 4 + j] = mod(remainder[i - 4 + j] - coefficient * F[j]);
  }
}
assert.deepEqual(remainder.slice(0, 4), [0, 0, 0, 0]);
assert.equal(quotient.length, 252);
assert.equal(quotient[251], 0);

// p57's circumference instruction motivates stripping the 2014 page-05
// Wisdom 5x5 square to its central 3x3. Page-05 names totient as sacred.
const magicText = readText('resources/cicada2014-openpuff-magic-squares.txt').replace(/\s+/g, ' ');
const wisdom = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
for (const row of wisdom) assert(magicText.includes(row.join(' ')));
const inner3 = wisdom.slice(1, 4).map((row) => row.slice(1, 4));
assert.deepEqual(inner3, [
  [199, 130, 320],
  [245, 91, 245],
  [320, 130, 199]
]);
const keyMatrix = inner3.map((row) => row.map((n) => phi(n) % 29));
assert.deepEqual(keyMatrix, [
  [24, 19, 12],
  [23, 14, 23],
  [12, 19, 24]
]);
const determinant = determinant3(keyMatrix);
assert.equal(determinant, 26);
const inverse = inverseMatrixMod29(keyMatrix);
assert.deepEqual(inverse, [
  [24, 18, 7],
  [5, 1, 5],
  [7, 18, 24]
]);

// Q252 contains exactly 84 Hill-3 blocks. The printed-table descending order
// is primary; ascending coefficient order is the sole orientation control.
const descending = quotient.slice().reverse();
const ascending = quotient.slice();
assert.equal(descending.length, 252);
assert.equal(descending[0], 0);
assert.equal(descending.length / 3, 84);

const corpusTokens = corpus.translit
  .map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
const prose = readText('resources/liber-primus/lp1-plaintext-reference.txt')
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith('#') && !line.trim().startsWith('['))
  .join(' ')
  .replace(/[0-9a-f]{64,}/gi, ' ')
  .toUpperCase();
const reference = [];
for (const word of prose.match(/[A-Z]+/g) || []) {
  let i = 0;
  while (i < word.length) {
    const token = corpusTokens.find((t) => word.startsWith(t.s, i));
    if (token) {
      reference.push(token.i);
      i += token.s.length;
    } else {
      i++;
    }
  }
}
assert(reference.length > 252);
const split = Math.floor(reference.length * 0.8);
const train = reference.slice(0, split);
const heldout = reference.slice(split);
const trigramCounts = new Map();
let trigramTotal = 0;
for (let i = 0; i + 2 < train.length; i++) {
  const k = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
  trigramCounts.set(k, (trigramCounts.get(k) || 0) + 1);
  trigramTotal++;
}

function score(sequence) {
  const counts = Array(29).fill(0);
  for (const x of sequence) counts[x]++;
  let logp = 0;
  for (let i = 0; i + 2 < sequence.length; i++) {
    const k = sequence[i] * 841 + sequence[i + 1] * 29 + sequence[i + 2];
    logp += Math.log(((trigramCounts.get(k) || 0) + 0.05) /
      (trigramTotal + 0.05 * 29 ** 3));
  }
  return {
    ioc: counts.reduce((sum, count) => sum + count * (count - 1), 0) /
      (sequence.length * (sequence.length - 1)),
    trigramNatsPerRune: logp / (sequence.length - 2)
  };
}

const nativeWindows = [];
for (let i = 0; i + 252 <= heldout.length; i++) {
  nativeWindows.push(score(heldout.slice(i, i + 252)).trigramNatsPerRune);
}
nativeWindows.sort((a, b) => a - b);
assert(nativeWindows.length > 0);

const descendingDecoded = applyBlocks(inverse, descending);
const ascendingDecoded = applyBlocks(inverse, ascending);
assert.deepEqual(applyBlocks(keyMatrix, descendingDecoded), descending);
assert.deepEqual(applyBlocks(keyMatrix, ascendingDecoded), ascending);

// Positive control: a native 252-rune GP plaintext survives Hill encrypt/decrypt.
const plant = reference.slice(0, 252);
const plantedCipher = applyBlocks(keyMatrix, plant);
assert.deepEqual(applyBlocks(inverse, plantedCipher), plant);

const rawDescending = score(descending);
const rawAscending = score(ascending);
const decodedDescending = score(descendingDecoded);
const decodedAscending = score(ascendingDecoded);
assert(decodedDescending.trigramNatsPerRune < nativeWindows[0]);
assert(decodedAscending.trigramNatsPerRune < nativeWindows[0]);

function transliterate(sequence) {
  return sequence.map((i) => corpus.translit[i]).join('');
}

console.log(JSON.stringify({
  source: {
    tableBytes: bytes.length,
    H,
    G,
    productF: F,
    quotientSlots: quotient.length,
    quotientLeadingZero: quotient[251],
    hillBlocks: quotient.length / 3,
    wisdomSquare: wisdom,
    inner3,
    keyMatrix,
    determinantMod29: determinant,
    inverse
  },
  ordering: {
    canonical: 'descending polynomial coefficients, matching printed table direction; all 252 slots retained',
    control: 'ascending polynomial coefficients',
    descendingLeadingSymbol: descending[0]
  },
  raw: {
    descending: rawDescending,
    ascending: rawAscending
  },
  decoded: {
    descending: { ...decodedDescending, prefix: transliterate(descendingDecoded).slice(0, 180) },
    ascending: { ...decodedAscending, prefix: transliterate(ascendingDecoded).slice(0, 180) }
  },
  heldoutNative252Windows: {
    count: nativeWindows.length,
    minimum: nativeWindows[0],
    median: nativeWindows[Math.floor(nativeWindows.length / 2)],
    maximum: nativeWindows.at(-1)
  },
  positiveControlRunes: plant.length,
  exactReencryption: true,
  decision: 'The p57-selected inner-3x3 Wisdom Hill key does not decrypt the source-derived 252-slot Q252 quotient in either source-canonical descending order or ascending coefficient order. Both outputs score below every held-out native LP1-GP 252-rune window. This rejects only this fixed Hill-3 consumer; it does not authenticate Q252 as ciphertext or disprove the p57 circumference clue.'
}, null, 2));
