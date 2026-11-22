'use strict';

/**
 * Original pp49-51 GF29 table: six-check 250 systematic slots versus
 * the original 2013 Cicada monic x^5 five-of-ten secret-sharing rule.
 *
 * Run on Node.js 22:
 * node sims/lp2_p50_hg_10x25_shamir_gate_sft.cjs
 *
 * Inputs and source links: see im-results/lp2-p50-hg-single-residue-correction.md
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const table = require('../resources/liber-primus/lp2-grid-256.json');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} x */
function inverse(x) {
  for (let i = 1; i < 29; i++) if (mod(i * x) === 1) return i;
  throw new Error('zero denominator');
}

/** @param {number} x @param {number} e */
function pow29(x, e) {
  let v = 1;
  for (let j = 0; j < e; j++) v = mod(v * x);
  return v;
}

/** @param {number[]} y - shares evaluated at x=1..5 @param {number} x */
function interpolate(y, x) {
  assert.equal(y.length, 5);
  let result = 0;
  for (let i = 0; i < 5; i++) {
    let scale = 1;
    for (let j = 0; j < 5; j++)
      if (j !== i)
        scale = mod(scale * mod(x - j - 1) * inverse(mod(i - j)));
    result = mod(result + y[i] * scale);
  }
  return result;
}

/** @param {number[][]} shares @param {boolean} monic */
function evaluate(shares, monic) {
  assert.equal(shares.length, 10);
  assert(shares.every((s) => s.length === 25));
  let predicted = 0;
  const errors = [];
  const recovered = [];
  for (let pos = 0; pos < 25; pos++) {
    const initial = shares.slice(0, 5).map((s, i) =>
      mod(s[pos] - (monic ? pow29(i + 1, 5) : 0)));
    recovered.push(interpolate(initial, 0));
    for (let k = 5; k < 10; k++) {
      const value = mod(interpolate(initial, k + 1) +
        (monic ? pow29(k + 1, 5) : 0));
      const actual = shares[k][pos];
      if (value === actual) predicted++;
      else if (errors.length < 5)
        errors.push({ pos, share: k + 1, predicted: value, observed: actual });
    }
  }
  return { predicted, recovered, errors };
}

assert.equal(table.bytes.length, 256);
const sha = createHash('sha256').update(Buffer.from(table.bytes)).digest('hex');
assert.equal(sha,
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual(table.pages.map((p) => p.tokens.length / 8), [10, 13, 9]);

// Conditional systematic interpretation: six parity coefficients
// are at positions 250-255. Source alone does not select this role.
const first250 = table.bytes.slice(0, 250).map(mod);
const shares = Array.from({ length: 10 }, (_, i) =>
  first250.slice(i * 25, (i + 1) * 25));
const ordinary = evaluate(shares, false);
const historicMonic = evaluate(shares, true);
assert.equal(ordinary.predicted, 5);
assert.equal(historicMonic.predicted, 3);
assert.equal(historicMonic.recovered.length, 25);

// Exact independent 2013-rule positive plant. A 25-symbol source-native
// secret is padded with 4 independent coefficients per symbol; the
// degree-five coefficient is fixed to 1, as in historical 2013 ssss.
const plantedSecret = corpus.pages.find((p) => p.page === 57).indices.slice(0, 25);
assert.equal(plantedSecret.length, 25);
const plantedShares = Array.from({ length: 10 }, () => []);
for (let j = 0; j < 25; j++) {
  const coefficients = [
    plantedSecret[j], mod(7 + j), mod(5 + j * j), mod(3 * j + 2), mod(j + 19), 1
  ];
  for (let x = 1; x <= 10; x++)
    plantedShares[x - 1].push(mod(coefficients.reduceRight(
      (a, c) => a * x + c, 0)));
}
const planted = evaluate(plantedShares, true);
assert.equal(planted.predicted, 125);
assert.deepEqual(planted.recovered, plantedSecret);

console.log(JSON.stringify({
  status: 'PASS',
  hypothesis: 'first 250 GF29 table residues in ten consecutive blocks of 25',
  authentic2013MonicDegreeFive: {
    predictedOf125: historicMonic.predicted,
    firstMismatches: historicMonic.errors,
    first15SecretIndices: historicMonic.recovered.slice(0, 15)
  },
  ordinaryDegreeFourControl: { predictedOf125: ordinary.predicted },
  nativeSolvedPagePositive: { reconstructedSecret: plantedSecret.length,
    predictedOf125: planted.predicted },
  originalUnknownPlaintextRecovered: 0
}, null, 2));
