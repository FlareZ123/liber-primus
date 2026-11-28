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

/** @param {number} a @param {number} b @returns {[number,number]} */
function H(a, b) {
  return [mod(a - b), mod(a + b)];
}

const words = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .match(/\b[A-Za-z]+\b/g)
  .filter((word) => !['BEGIN', 'PGP', 'SIGNED', 'MESSAGE', 'Hash', 'SHA'].includes(word))
  .map((word) => word.toUpperCase());

const Q = [17, 24];
const tailResidue = [13, 19];
assert.deepEqual(pow(Q, 840), [1, 0]);

const scalarHits = [];
for (let exponent = 0; exponent < 840; exponent += 1) {
  const scalar = pow(Q, exponent);
  const output = mul(scalar, tailResidue);
  const counts = output.map((page) => corpus.pages[page].runic_count);
  const residues = counts.map((count) => count % MOD);
  const h = H(...residues);
  if (h[0] === 2 && h[1] === 27) {
    scalarHits.push({
      exponent,
      scalar,
      output,
      words: output.map((index) => words[index]),
      counts,
      residues,
      h,
    });
  }
}
assert.deepEqual(scalarHits.map((item) => item.exponent), [1, 13]);
assert.deepEqual(scalarHits[0].output, [12, 2]);
assert.deepEqual(scalarHits[0].words, ['THE', 'PATH']);
assert.deepEqual(scalarHits[1].output, [4, 2]);
assert.deepEqual(scalarHits[1].words, ['EMPTY', 'PATH']);

const physicalKMinusK = [];
const physicalMinusQZero = [];
for (let first = 0; first < MOD; first += 1) {
  for (let second = 0; second < MOD; second += 1) {
    const counts = [first, second].map((page) => corpus.pages[page].runic_count);
    const residues = counts.map((count) => count % MOD);
    const h = H(...residues);
    if (h[0] === 2 && h[1] === 27) physicalKMinusK.push({pages: [first, second], counts, residues, h});
    if (h[0] === 25 && h[1] === 0) physicalMinusQZero.push({pages: [first, second], counts, residues, h});
  }
}
assert.deepEqual(physicalKMinusK.map((item) => item.pages), [[4, 2], [12, 2]]);
assert.deepEqual(physicalMinusQZero.map((item) => item.pages), [[2, 5], [2, 10], [2, 27]]);

const qBranch = scalarHits[0];
assert.deepEqual(qBranch.output, [12, 2]);
assert.deepEqual(qBranch.h, [2, 27]);

const cyclePages = qBranch.h;
const cycleCounts = cyclePages.map((page) => corpus.pages[page].runic_count);
const cycleResidues = cycleCounts.map((count) => count % MOD);
const cycleH = H(...cycleResidues);
assert.deepEqual(cyclePages, [2, 27]);
assert.deepEqual(cycleCounts, [201, 234]);
assert.deepEqual(cycleResidues, [27, 2]);
assert.deepEqual(cycleH, [25, 0]);

const result = {
  status: 'PASS',
  classification: 'post-discovery THE PATH/EMPTY PATH scalar branch discriminator with p27 cycle closure; no plaintext',
  fixedTailResidue: tailResidue,
  scalarReceiverHits: scalarHits,
  allOrderedPagePairCensus: {
    kMinusK: physicalKMinusK,
    minusQZero: physicalMinusQZero,
  },
  fixedQBranch: {
    output: qBranch.output,
    words: qBranch.words,
    nextDirection: cyclePages,
    nextPageCounts: cycleCounts,
    nextCountResidues: cycleResidues,
    nextH: cycleH,
  },
  boundary: 'Q is independently fixed upstream. The branch labels are authenticated signed-register words, but intentional decoy semantics are not claimed. Recursive page-count iteration is stopped at independently established p27.',
};

console.log(JSON.stringify(result, null, 2));
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), JSON.stringify(result, null, 2));
}
