'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');

const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;

/** @param {[number,number]} x @param {[number,number]} y @returns {[number,number]} */
function mul(x, y) {
  return [
    mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1]),
  ];
}

/** @param {[number,number]} x @param {number} n @returns {[number,number]} */
function pow(x, n) {
  /** @type {[number,number]} */ let acc = [1, 0];
  let base = x;
  let exponent = n;
  while (exponent > 0) {
    if (exponent & 1) acc = mul(acc, base);
    base = mul(base, base);
    exponent = Math.floor(exponent / 2);
  }
  return acc;
}

/** @param {number[]} coefficients @returns {[number,number]} */
function evaluate(coefficients) {
  /** @type {[number,number]} */ let acc = [0, 0];
  /** @type {[number,number]} */ let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [
      mod(acc[0] + coefficient * power[0]),
      mod(acc[1] + coefficient * power[1]),
    ];
    power = mul(power, [0, 1]);
  }
  return acc;
}

/** @param {number} a @param {number} b @returns {[number,number]} */
function H(a, b) {
  return [mod(a - b), mod(a + b)];
}

/** @template T @param {T[]} values @returns {T[][]} */
function permutations(values) {
  if (values.length <= 1) return [values.slice()];
  return values.flatMap((value, index) =>
    permutations(values.slice(0, index).concat(values.slice(index + 1))).map((rest) => [value, ...rest]));
}

const words = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .match(/\b[A-Za-z]+\b/g)
  .filter((word) => !['BEGIN', 'PGP', 'SIGNED', 'MESSAGE', 'Hash', 'SHA'].includes(word))
  .map((word) => word.toUpperCase());

const Q = [17, 24];
assert.deepEqual(pow(Q, 840), [1, 0]);

const directedPages = [17, 19, 10, 16];
const counts = directedPages.map((page) => corpus.pages[page].runic_count);
assert.deepEqual(counts, [273, 271, 263, 267]);

const minimum = Math.min(...counts);
assert.equal(minimum, 263);
const tailLengths = counts.map((count) => count - minimum);
assert.deepEqual(tailLengths, [10, 8, 0, 4]);
assert.equal(tailLengths.reduce((sum, value) => sum + value, 0), 22);

const tails = Object.fromEntries(
  directedPages.map((page) => [page, corpus.pages[page].indices.slice(minimum)]),
);
assert.deepEqual(Object.fromEntries(directedPages.map((page) => [page, tails[page].length])), {
  17: 10,
  19: 8,
  10: 0,
  16: 4,
});

const sourceOrder = [17, 19, 16];
const sourcePacket = sourceOrder.flatMap((page) => tails[page]);
assert.equal(sourcePacket.length, 22);
const sourceResidue = evaluate(sourcePacket);
assert.deepEqual(sourceResidue, [13, 19]);
const qOutput = mul(Q, sourceResidue);
assert.deepEqual(qOutput, [12, 2]);
assert.deepEqual(qOutput.map((index) => words[index]), ['THE', 'PATH']);

const directedCounts = qOutput.map((page) => corpus.pages[page].runic_count);
const directedResidues = directedCounts.map((count) => count % MOD);
assert.deepEqual(directedCounts, [261, 201]);
assert.deepEqual(directedResidues, [0, 27]);
assert.deepEqual(H(...directedResidues), [2, 27]);

const orderResults = permutations(sourceOrder).map((order) => {
  const packet = order.flatMap((page) => tails[page]);
  const residue = evaluate(packet);
  const output = mul(Q, residue);
  const pageCounts = output.map((page) => corpus.pages[page].runic_count);
  const countResidues = pageCounts.map((count) => count % MOD);
  return {
    order,
    output,
    words: output.map((index) => words[index]),
    pageCounts,
    countResidues,
    h: H(...countResidues),
  };
});
assert.equal(orderResults.length, 6);
const kClosureOrders = orderResults.filter((item) => item.h[0] === 2 && item.h[1] === 27);
assert.deepEqual(kClosureOrders.map((item) => item.order), [[17, 19, 16]]);

const scalarHits = [];
const exactCoordinateHits = [];
const phraseHits = [];
for (let exponent = 0; exponent < 840; exponent += 1) {
  const scalar = pow(Q, exponent);
  const output = mul(scalar, sourceResidue);
  if (output[0] === 12 && output[1] === 2) exactCoordinateHits.push({exponent, scalar, output});
  if (words[output[0]] === 'THE' && words[output[1]] === 'PATH') phraseHits.push({exponent, scalar, output});
  const pageCounts = output.map((page) => corpus.pages[page].runic_count);
  const countResidues = pageCounts.map((count) => count % MOD);
  const h = H(...countResidues);
  if (h[0] === 2 && h[1] === 27) {
    scalarHits.push({exponent, scalar, output, pageCounts, countResidues, h});
  }
}

assert.deepEqual(exactCoordinateHits.map((item) => item.exponent), [1]);
assert.equal(phraseHits.length, 6);
assert.deepEqual(scalarHits.map((item) => item.exponent), [1, 13]);
assert.deepEqual(scalarHits[0].output, [12, 2]);
assert.deepEqual(scalarHits[1].output, [4, 2]);

const result = {
  status: 'PASS',
  classification: 'post-discovery Q-tail navigation/state continuation; no unknown plaintext',
  directedPages,
  counts,
  minimum,
  tailLengths,
  tailLengthSum: 22,
  sourceOrder,
  sourcePacketLength: sourcePacket.length,
  sourceResidue,
  qOutput,
  qWords: qOutput.map((index) => words[index]),
  qDirectedPageCounts: directedCounts,
  qDirectedCountResidues: directedResidues,
  qDirectedH: H(...directedResidues),
  orderResults,
  charge: {
    nonzeroScalars: 840,
    exactCoordinateHitExponents: exactCoordinateHits.map((item) => item.exponent),
    textPhraseHitCount: phraseHits.length,
    kMinusKReceiverHitExponents: scalarHits.map((item) => item.exponent),
  },
  boundary: 'Q was independently fixed before this receiver. THE/PATH text is secondary because THE has duplicate signed-word indices. No p12/p2 plaintext is claimed.',
};

console.log(JSON.stringify(result, null, 2));
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), JSON.stringify(result, null, 2));
}
