#!/usr/bin/env node
'use strict';

// Source-locked test of the five-forward + five-reverse interpretation of the
// five 201-rune strands on original LP2 pp23-26 as ten shares of Cicada's
// historical 5-of-10 ssss 0.5 monic-quintic scheme.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const pages = new Map(corpus.pages.map(p => [p.page, p]));
const p23 = pages.get(23).indices;
const p24 = pages.get(24).indices;
const p25 = pages.get(25).indices;
const p26 = pages.get(26).indices;

assert.equal(p23.length, 213);
assert.equal(p24.length, 270);
assert.equal(p25.length, 273);
assert.equal(p26.length, 265);
assert.equal(p23.slice(0, 16).length, 16); // original p23 red heading
const source = [...p23.slice(16), ...p24, ...p25, ...p26];
assert.equal(source.length, 1005);
assert.equal(source.every(x => Number.isInteger(x) && x >= 0 && x < 29), true);

const sourceDigest = crypto.createHash('sha256')
  .update(Buffer.from(source.join(','), 'utf8')).digest('hex');

function base29(digits) {
  let n = 0n;
  for (const d of digits) n = n * 29n + BigInt(d);
  return n;
}
function bitLength(n) {
  return n === 0n ? 0 : n.toString(2).length;
}
function carrylessMultiply(a, b) {
  let out = 0n;
  while (b !== 0n) {
    if ((b & 1n) !== 0n) out ^= a;
    a <<= 1n;
    b >>= 1n;
  }
  return out;
}

// Historical ssss 0.5 field polynomial for a 984-bit value:
// x^984 + x^24 + x^9 + x^3 + 1.
const FIELD_DEGREE = 984;
const FIELD_POLY = (1n << 984n) | (1n << 24n) | (1n << 9n) | (1n << 3n) | 1n;
function reduceField(a) {
  while (bitLength(a) > FIELD_DEGREE) {
    const shift = BigInt(bitLength(a) - FIELD_DEGREE - 1);
    a ^= FIELD_POLY << shift;
  }
  return a;
}
function fieldMultiplyBySmallPolynomial(a, b) {
  return reduceField(carrylessMultiply(a, b));
}
function fieldBuffer(a) {
  assert.ok(bitLength(a) <= FIELD_DEGREE);
  return Buffer.from(a.toString(16).padStart(246, '0'), 'hex');
}
function combinations(n, k, start = 0, prefix = []) {
  if (k === 0) return [prefix];
  const out = [];
  for (let i = start; i <= n - k; i++) {
    out.push(...combinations(n, k - 1, i + 1, [...prefix, i]));
  }
  return out;
}
const SIX_SUBSETS = combinations(10, 6);
assert.equal(SIX_SUBSETS.length, 210);

// For six evaluations of a monic degree-five polynomial over characteristic 2,
// sum_i(W_i*y_i) = D, where D is the product of all 15 pairwise (x_i XOR x_j)
// differences and W_i is the product of the 10 pairwise differences among the
// other five x-values. Historical decimal share IDs are x=1..10.
function testTenShares(values) {
  assert.equal(values.length, 10);
  assert.equal(values.every(v => bitLength(v) <= FIELD_DEGREE), true);
  let passed = 0;
  let firstFailure = null;
  let maxResidualBits = 0;
  for (const subset of SIX_SUBSETS) {
    const xs = subset.map(i => BigInt(i + 1));
    const ys = subset.map(i => values[i]);
    let D = 1n;
    for (let i = 0; i < 6; i++) {
      for (let j = i + 1; j < 6; j++) D = carrylessMultiply(D, xs[i] ^ xs[j]);
    }
    let lhs = 0n;
    for (let i = 0; i < 6; i++) {
      let W = 1n;
      for (let j = 0; j < 6; j++) {
        for (let k = j + 1; k < 6; k++) {
          if (j !== i && k !== i) W = carrylessMultiply(W, xs[j] ^ xs[k]);
        }
      }
      lhs ^= fieldMultiplyBySmallPolynomial(ys[i], W);
    }
    const residual = lhs ^ D;
    if (residual === 0n) {
      passed++;
    } else {
      const rb = bitLength(residual);
      maxResidualBits = Math.max(maxResidualBits, rb);
      if (firstFailure === null) {
        firstFailure = {
          shareIds: subset.map(i => i + 1),
          residualBits: rb,
          residualHexPrefix: residual.toString(16).padStart(246, '0').slice(0, 32)
        };
      }
    }
  }
  const setDigest = crypto.createHash('sha256')
    .update(Buffer.concat(values.map(fieldBuffer))).digest('hex');
  return {
    passedSixPointIdentities: passed,
    totalSixPointIdentities: SIX_SUBSETS.length,
    firstFailure,
    maxResidualBits,
    shareBitLengths: values.map(bitLength),
    orderedShareSetSha256: setDigest
  };
}

function makeLanes(kind) {
  if (kind === 'quintet-columns') {
    return Array.from({ length: 5 }, (_, col) =>
      Array.from({ length: 201 }, (_, row) => source[row * 5 + col]));
  }
  if (kind === 'five-consecutive-blocks') {
    return Array.from({ length: 5 }, (_, i) => source.slice(i * 201, (i + 1) * 201));
  }
  throw new Error('unknown lane layout');
}

const results = [];
for (const layout of ['quintet-columns', 'five-consecutive-blocks']) {
  const lanes = makeLanes(layout);
  assert.equal(lanes.length, 5);
  assert.equal(lanes.every(x => x.length === 201), true);
  const forward = lanes.map(base29);
  const reverse = lanes.map(x => base29([...x].reverse()));
  const orders = [
    { name: 'forward-then-reverse', values: [...forward, ...reverse] },
    { name: 'interleaved-forward-reverse', values: lanes.flatMap((_, i) => [forward[i], reverse[i]]) }
  ];
  for (const order of orders) {
    const result = testTenShares(order.values);
    results.push({ layout, idAssignment: order.name, ...result });
    assert.equal(result.passedSixPointIdentities, 0);
  }
}

// Algebraic positive control: construct ten genuine evaluations of a monic
// quintic in the same GF(2^984), then require all 210 six-point identities.
const coefficients = [
  (1n << 983n) | BigInt('0x123456789abcdef'),
  (1n << 977n) | BigInt('0xdeadbeefcafebabe'),
  (1n << 900n) | BigInt('0xfeedface12345678'),
  (1n << 700n) | BigInt('0x9876543210fedcba'),
  (1n << 500n) | BigInt('0xabcdef0123456789')
]; // c4,c3,c2,c1,c0
function evaluateMonicQuintic(x) {
  let y = 1n;
  for (const c of coefficients) y = fieldMultiplyBySmallPolynomial(y, BigInt(x)) ^ c;
  return y;
}
const planted = Array.from({ length: 10 }, (_, i) => evaluateMonicQuintic(i + 1));
const positiveControl = testTenShares(planted);
assert.equal(positiveControl.passedSixPointIdentities, 210);

const output = {
  test: 'five forward + five reverse 201-rune strands as ten historical ssss shares',
  field: 'GF(2^984), x^984+x^24+x^9+x^3+1',
  polynomial: 'monic quintic x^5+c4*x^4+c3*x^3+c2*x^2+c1*x+c0',
  shareIds: 'decimal 01..10, x=1..10',
  source: {
    file: 'resources/liber-primus/lp2-corpus.json',
    pages: [23, 24, 25, 26],
    pageRuneCounts: [p23.length, p24.length, p25.length, p26.length],
    removedP23RedHeadingRunes: 16,
    remainingSourceRunes: source.length,
    laneLength: 201,
    sourceSequenceSha256: sourceDigest
  },
  results,
  positiveControl: {
    passedSixPointIdentities: positiveControl.passedSixPointIdentities,
    totalSixPointIdentities: positiveControl.totalSixPointIdentities,
    shareSetSha256: positiveControl.orderedShareSetSha256
  }
};
process.stdout.write(JSON.stringify(output, null, 2) + '\n');
