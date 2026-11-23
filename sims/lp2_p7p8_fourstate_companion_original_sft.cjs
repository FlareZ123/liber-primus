'use strict';

// Bounded source-motivated p7-quartic / p8-XIXM four-state test.
// Run from any directory with Node 22: node sims/lp2_p7p8_fourstate_companion_original_sft.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const getPage = (n) => {
  const p = corpus.pages.find((x) => x.page === n);
  assert.ok(p, 'missing physical page ' + n);
  return p.indices;
};
const mod = (x) => ((x % 29) + 29) % 29;
const seed = getPage(8).slice(0, 4);
const p8 = getPage(8);
const p9 = getPage(9);
const p8Black = p8.slice(12);
const carry = p9.slice(0, 5);
const aligned248 = p8Black.concat(carry);
const stream300 = p8Black.concat(p9.slice(0, 57));

assert.deepEqual(p8.slice(0, 12), [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17]);
assert.deepEqual(seed, [14, 10, 14, 19]);
assert.equal(p8.length, 255);
assert.equal(p8Black.length, 243);
assert.deepEqual(carry, [26, 7, 25, 6, 11]);
assert.equal(aligned248.length, 248);
assert.equal(aligned248.length % 4, 0);
assert.equal(p8.length + carry.length, 260);
assert.equal((p8.length + carry.length) % 4, 0);
assert.equal(stream300.length, 300);
assert.equal(stream300.length % 4, 0);

const A = [
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
  [9, 16, 25, 7],
];

function transpose(M) {
  return M[0].map((_, j) => M.map((row) => row[j]));
}
function inverse(M) {
  const n = M.length;
  const a = M.map((row, i) => row.map(mod).concat(
    row.map((_, j) => (i === j ? 1 : 0))
  ));
  for (let j = 0; j < n; j += 1) {
    let pivot = j;
    while (pivot < n && a[pivot][j] === 0) pivot += 1;
    assert.ok(pivot < n, 'singular companion matrix');
    [a[j], a[pivot]] = [a[pivot], a[j]];
    let invPivot = 1;
    while (mod(a[j][j] * invPivot) !== 1) invPivot += 1;
    a[j] = a[j].map((x) => mod(x * invPivot));
    for (let i = 0; i < n; i += 1) {
      if (i === j) continue;
      const f = a[i][j];
      a[i] = a[i].map((x, k) => mod(x - f * a[j][k]));
    }
  }
  return a.map((row) => row.slice(n));
}
function matVec(M, v) {
  return M.map((row) => row.reduce((s, x, i) => mod(s + x * v[i]), 0));
}
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x] += 1;
  const n = a.length;
  return counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
}
function preview(a) {
  return a.slice(0, 60).map((x) => corpus.translit[x]).join(' ');
}
function blockTransform(cipher, initial, M, sign) {
  const out = [];
  let state = initial.slice();
  for (let off = 0; off + 4 <= cipher.length; off += 4) {
    for (let j = 0; j < 4; j += 1) out.push(mod(cipher[off + j] + sign * state[j]));
    state = matVec(M, state);
  }
  return out;
}
function scalarLfsr(cipher, initial, sign) {
  const key = initial.slice();
  for (let i = 0; i + 4 < cipher.length; i += 1) {
    key.push(mod(9 * key[i] + 16 * key[i + 1] + 25 * key[i + 2] + 7 * key[i + 3]));
  }
  return cipher.map((x, i) => mod(x + sign * key[i]));
}
function vigenere4(cipher, initial, sign) {
  return cipher.map((x, i) => mod(x + sign * initial[i % 4]));
}
function affineBlocks(cipher, M, offset, sign) {
  const out = [];
  for (let off = 0; off + 4 <= cipher.length; off += 4) {
    const transformed = matVec(M, cipher.slice(off, off + 4));
    for (let j = 0; j < 4; j += 1) out.push(mod(transformed[j] + sign * offset[j]));
  }
  return out;
}
function encryptBlocks(plain, initial, M) {
  const out = [];
  let state = initial.slice();
  for (let off = 0; off + 4 <= plain.length; off += 4) {
    for (let j = 0; j < 4; j += 1) out.push(mod(plain[off + j] + state[j]));
    state = matVec(M, state);
  }
  return out;
}
function encryptAffine(plain, M, offset) {
  const out = [];
  for (let off = 0; off + 4 <= plain.length; off += 4) {
    const transformed = matVec(M, plain.slice(off, off + 4));
    for (let j = 0; j < 4; j += 1) out.push(mod(transformed[j] + offset[j]));
  }
  return out;
}

const matrices = {
  forward: A,
  reverse: inverse(A),
  transpose: transpose(A),
};
const results = {};
for (const [name, M] of Object.entries(matrices)) {
  for (const [label, cipher] of [['aligned248', aligned248], ['first300', stream300]]) {
    for (const sign of [-1, 1]) {
      const out = blockTransform(cipher, seed, M, sign);
      results[name + '_' + label + '_sign' + sign] = {
        length: out.length,
        ioc: ioc(out),
        preview: preview(out),
      };
    }
  }
}
const affineMatrices = {
  forward: A,
  inverse: inverse(A),
  transpose: transpose(A),
  transposeInverse: inverse(transpose(A)),
};
const affineResults = {};
for (const [name, M] of Object.entries(affineMatrices)) {
  for (const sign of [-1, 1]) {
    const out = affineBlocks(stream300, M, seed, sign);
    affineResults[name + '_sign' + sign] = {
      length: out.length,
      ioc: ioc(out),
      preview: preview(out),
    };
  }
}
const scalar = {};
const vig4 = {};
for (const sign of [-1, 1]) {
  const a = scalarLfsr(stream300, seed, sign);
  scalar['sign' + sign] = { length: a.length, ioc: ioc(a), preview: preview(a) };
  const b = vigenere4(stream300, seed, sign);
  vig4['sign' + sign] = { length: b.length, ioc: ioc(b), preview: preview(b) };
}

// Positive round-trip controls: the implementation must invert its exact rules.
const plantedPlain = Array.from({ length: 300 }, (_, i) => mod(7 * i + 3));
const plantedCipher = encryptBlocks(plantedPlain, seed, A);
assert.deepEqual(blockTransform(plantedCipher, seed, A, -1), plantedPlain);
const plantedAffineCipher = encryptAffine(plantedPlain, A, seed);
const plantedAffinePlain = affineBlocks(plantedAffineCipher, inverse(A), seed, -1);
assert.deepEqual(plantedAffinePlain, plantedPlain);

// Measure the exact state period for this nonzero seed.
let state = seed.slice();
let statePeriod = 0;
do {
  state = matVec(A, state);
  statePeriod += 1;
  assert.ok(statePeriod <= 100000, 'period search exceeded bound');
} while (state.some((x, i) => x !== seed[i]));
assert.equal(statePeriod, 29470);

const output = {
  source: {
    p8Runes: p8.length,
    p8RedHeading: p8.slice(0, 12),
    seed,
    p8BlackRunes: p8Black.length,
    p9Carry: carry,
    alignedLength: aligned248.length,
    pagePlusCarryLength: p8.length + carry.length,
    first300Length: stream300.length,
  },
  p7PolynomialLowFirst: [11, 26, 8, 15, 2],
  monicCharacteristicPolynomialAscending: [20, 13, 4, 22, 1],
  companionMatrix: A,
  scalarRecurrence: 'k[n+4] = 9*k[n] + 16*k[n+1] + 25*k[n+2] + 7*k[n+3] (mod 29)',
  statePeriod,
  rawIoC: { aligned248: ioc(aligned248), first300: ioc(stream300) },
  blockResults: results,
  scalarLfsr: scalar,
  fixedVigenere4: vig4,
  directAffineMaps: affineResults,
  plantedRoundTrips: 'PASS',
};
process.stdout.write(JSON.stringify(output, null, 2) + '\n');
