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

const grid = readJson('resources/liber-primus/base60-grid.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every((row) => row.length === 8));
assert.deepEqual(bytes.slice(0, 4), [203, 231, 167, 186]);

// H is the signed 2013 BASE29 3301 -> 3QO polynomial.
// G is the p39 red triad's independently source-linked polynomial.
const H = [3, 26, 24];
const G = [27, 5, 15];
const F = multiplyPolynomial(H, G);
assert.deepEqual(F, [23, 21, 11, 17, 12]);

// The table is printed in descending-power order; polynomial division uses
// ascending coefficients. Keep the 252-slot quotient, including its
// source-inherited leading zero.
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

const p36 = corpus.pages.find((p) => p.page === 36).indices;
assert.equal(p36.length, 238);

// In the BASE29 most-significant-first serialization, omit the formal
// leading zero and reverse the ascending-power quotient coefficients.
// A GF29 multiplicative-group pad requires every key symbol to be nonzero.
const canonicalKey = quotient.slice(0, 251).reverse();
const canonicalKeyZeroPositions = canonicalKey.map((x, i) => x === 0 ? i : -1).filter((i) => i >= 0);
assert.deepEqual(canonicalKeyZeroPositions, [74, 119, 139, 169, 236]);
assert(canonicalKeyZeroPositions.every((i) => p36[i] !== 0));

// Reuse the established held-out GP trigram score from the p36/Q238 SFT.
const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
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
    const token = tokens.find((t) => word.startsWith(t.s, i));
    if (token) {
      reference.push(token.i);
      i += token.s.length;
    } else {
      i++;
    }
  }
}
const train = reference.slice(0, Math.floor(reference.length * 0.8));
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
    logp += Math.log(((trigramCounts.get(k) || 0) + 0.05) / (trigramTotal + 0.05 * 29 ** 3));
  }
  return {
    ioc: counts.reduce((s, c) => s + c * (c - 1), 0) / (sequence.length * (sequence.length - 1)),
    trigramNatsPerRune: logp / (sequence.length - 2),
  };
}

const nativeWindows = [];
for (let i = 0; i + p36.length <= reference.length; i++) {
  nativeWindows.push(score(reference.slice(i, i + p36.length)).trigramNatsPerRune);
}
nativeWindows.sort((a, b) => a - b);
const raw = score(p36);
const quotientScore = score(quotient);
const trials = [];

for (const orientation of ['ascending-quotient', 'printed-order-reversed']) {
  const key = orientation === 'ascending-quotient' ? quotient : quotient.slice().reverse();
  for (const phase of [0, 151]) {
    for (const sign of [-1, 1]) {
      const decoded = p36.map((c, i) => mod(c + sign * key[(i + phase) % key.length]));
      const row = { orientation, phase, sign, ...score(decoded) };

      // Exact source-native round-trip control for this key, sign and phase.
      const plant = reference.slice(0, p36.length);
      const plantedCipher = plant.map((p, i) => mod(p - sign * key[(i + phase) % key.length]));
      const recovered = plantedCipher.map((c, i) => mod(c + sign * key[(i + phase) % key.length]));
      assert.deepEqual(recovered, plant);
      row.positiveControlRunes = recovered.length;
      trials.push(row);
    }
  }
}

const best = trials.slice().sort((a, b) => b.trigramNatsPerRune - a.trigramNatsPerRune)[0];
assert(best.trigramNatsPerRune < nativeWindows[0]);

console.log(JSON.stringify({
  source: {
    tableBytes: bytes.length,
    H,
    G,
    productF: F,
    quotientSlots: quotient.length,
    quotientNonzeroSymbols: quotient.filter((x) => x !== 0).length,
    quotientTrailingSlot: quotient[251],
    canonicalKeyZeroPositions,
    p36CipherAtZero: canonicalKeyZeroPositions.map((i) => p36[i]),
    p36Runes: p36.length,
  },
  rawP36: raw,
  quotientAsText: quotientScore,
  native238Windows: {
    count: nativeWindows.length,
    minimum: nativeWindows[0],
    median: nativeWindows[Math.floor(nativeWindows.length / 2)],
    maximum: nativeWindows.at(-1),
  },
  trials,
  best,
  decision: 'The source-derived p50 Q252 quotient is not a direct additive GP29 key for source-selected p36 under either coefficient orientation, signs, or phases 0/151. Its canonical most-significant-first digits also cannot form an invertible per-rune GF29 multiplicative-group pad: five zero key digits align with nonzero p36 ciphertext runes.'
}, null, 2));
