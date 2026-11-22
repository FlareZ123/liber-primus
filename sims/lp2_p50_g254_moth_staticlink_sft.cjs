'use strict';

/**
 * LP2 original-input p39-G quotient (254 symbols) versus the p53/p55 moth pair.
 * Tests exact stationary relabeling, cyclic alignment, and second-order
 * recurrence of the additive difference. No plaintext or secret key is fitted.
 *
 * Run on Windows 11 / Node.js 22:
 *   node sims/lp2_p50_g254_moth_staticlink_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const root = path.resolve(__dirname, '..');
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const grid = load('resources/liber-primus/lp2-grid-256.json');
const corpus = load('resources/liber-primus/lp2-corpus.json');
const bytes = grid.pages.flatMap(page => page.bytes);
const sha = createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(sha, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual(grid.pages.map(page => page.bytes.length), [80, 104, 72]);

/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;

/**
 * Divide the original row-major 256 field residues by
 * G(X)=15X^2+5X+27=15(X-24)^2 over GF(29).
 * @param {number[]} numbers
 * @returns {{quotient:number[], remainder:number[]}}
 */
function divideByG(numbers) {
  const residual = numbers.map(value => value % 29);
  const quotient = [];
  const coeff = [15, 5, 27];
  for (let i = 0; i < 254; i++) {
    const q = mod(2 * residual[i]); // inverse of 15 mod29
    quotient.push(q);
    for (let j = 0; j < 3; j++) {
      residual[i + j] = mod(residual[i + j] - q * coeff[j]);
    }
  }
  return {quotient, remainder: residual.slice(254)};
}

/**
 * Test a completely arbitrary fixed source-index -> target-symbol lookup,
 * granting 29 independent output labels (no bijection assumed).
 * @param {number[]} x
 * @param {number[]} y
 */
function fixedLookup(x, y) {
  assert.equal(x.length, y.length);
  const rows = Array.from({length: 29}, () => Array(29).fill(0));
  const cx = Array(29).fill(0);
  const cy = Array(29).fill(0);
  for (let i = 0; i < x.length; i++) {
    rows[x[i]][y[i]]++;
    cx[x[i]]++;
    cy[y[i]]++;
  }
  let mismatch = 0;
  let agreeingPairs = 0;
  let inputPairs = 0;
  let mi = 0;
  for (let a = 0; a < 29; a++) {
    mismatch += cx[a] - Math.max(...rows[a]);
    inputPairs += cx[a] * (cx[a] - 1) / 2;
    for (let b = 0; b < 29; b++) {
      const n = rows[a][b];
      agreeingPairs += n * (n - 1) / 2;
      if (n) mi += n / x.length * Math.log2(n * x.length / (cx[a] * cy[b]));
    }
  }
  const equalHistogram = cx.slice().sort((a, b) => a - b)
    .every((n, i) => n === cy.slice().sort((a, b) => a - b)[i]);
  return {mismatch, equalHistogram, agreeingPairs, inputPairs, mi};
}

/**
 * Exact minimum number of changed symbols after allowing an arbitrary
 * permutation of all positions and any secret fixed bijective GP29 alphabet.
 * Sorting both occurrence-count vectors minimizes L1 assignment cost.
 * @param {number[]} source
 * @param {number[]} target
 * @returns {number}
 */
function minChangesAfterReorderAndRelabel(source, target) {
  assert.equal(source.length, target.length);
  const counts = sequence => Array.from({length: 29}, (_, value) =>
    sequence.filter(x => x === value).length).sort((a, b) => a - b);
  const a = counts(source);
  const b = counts(target);
  return a.reduce((sum, count, i) => sum + Math.abs(count - b[i]), 0) / 2;
}

/** @param {number} x @returns {number} */
function inv(x) {
  for (let i = 1; i < 29; i++) if (mod(i * x) === 1) return i;
  throw new Error('zero pivot');
}

/**
 * Berlekamp-Massey over GF29; L is the exact shortest homogeneous
 * linear feedback register fitting the complete given sequence.
 * @param {number[]} seq
 * @returns {number}
 */
function linearComplexity(seq) {
  const n = seq.length;
  let current = Array(n + 1).fill(0);
  let previous = Array(n + 1).fill(0);
  current[0] = previous[0] = 1;
  let length = 0;
  let shift = 1;
  let last = 1;
  for (let step = 0; step < n; step++) {
    let discrepancy = seq[step];
    for (let j = 1; j <= length; j++) {
      discrepancy = mod(discrepancy + current[j] * seq[step - j]);
    }
    if (!discrepancy) {
      shift++;
      continue;
    }
    const saved = current.slice();
    const factor = mod(discrepancy * inv(last));
    for (let j = 0; j + shift <= n; j++) {
      current[j + shift] = mod(current[j + shift] - factor * previous[j]);
    }
    if (2 * length <= step) {
      length = step + 1 - length;
      previous = saved;
      last = discrepancy;
      shift = 1;
    } else {
      shift++;
    }
  }
  return length;
}

/** @param {number[]} k @returns {number} */
function gRecurrenceMatches(k) {
  let count = 0;
  for (let i = 2; i < k.length; i++) {
    if (k[i] === mod(19 * k[i - 1] + 4 * k[i - 2])) count++;
  }
  return count;
}

const page = n => corpus.pages.find(p => p.page === n).indices;
const p53 = page(53);
const p54 = page(54);
const p55 = page(55);
assert.equal(p53.length, 179);
assert.equal(p55.length, 76);
assert.equal(p54[0], 24); // enlarged original A
assert.equal(p55[0], 21); // incoming original NG
const moth = p53.concat(p55.slice(1));
assert.equal(moth.length, 254);

const {quotient, remainder} = divideByG(bytes);
assert.equal(quotient.length, 254);
assert.deepEqual(remainder, [0, 0]);
assert.deepEqual(quotient.slice(0, 12),
  [0, 27, 6, 14, 20, 11, 19, 17, 3, 14, 10, 23]);

// Positive: a planted secret relabeling must be accepted without knowing
// the actual relabeling. Fitting a free 29-way function is intentional.
const planted = quotient.map(q => mod(7 * q + 3));
assert.equal(fixedLookup(quotient, planted).mismatch, 0);
assert.equal(fixedLookup(quotient, planted).equalHistogram, true);
assert.equal(minChangesAfterReorderAndRelabel(quotient, planted.slice().reverse()), 0);

// Positive: an order-two register satisfies the original G recurrence.
const plantK = [24, 21];
while (plantK.length < 254) {
  const n = plantK.length;
  plantK.push(mod(19 * plantK[n - 1] + 4 * plantK[n - 2]));
}
assert.equal(linearComplexity(plantK), 2);
assert.equal(gRecurrenceMatches(plantK), 252);

for (const [name, target, expected] of [
  ['printed', moth, {global: 203, blocks: [138, 46], bm: 127, matches: 7, p: 140}],
  ['reverse', moth.slice().reverse(), {global: 204, blocks: [137, 46], bm: 127, matches: 13, p: 107}],
]) {
  const direct = fixedLookup(quotient, target);
  const byPage = [
    fixedLookup(quotient.slice(0, 179), target.slice(0, 179)),
    fixedLookup(quotient.slice(179), target.slice(179)),
  ];
  const key = quotient.map((q, i) => mod(q - target[i]));
  assert.equal(direct.mismatch, expected.global);
  assert.equal(direct.equalHistogram, false);
  assert.equal(minChangesAfterReorderAndRelabel(quotient, target), 10);
  assert.deepEqual(byPage.map(b => b.mismatch), expected.blocks);
  assert.equal(linearComplexity(key), expected.bm);
  assert.equal(gRecurrenceMatches(key), expected.matches);
  assert.equal(linearComplexity(key.slice(0, 179)), 90);
  assert.equal(linearComplexity(key.slice(179)), 38);

  const shifts = [];
  for (let shift = 1; shift < target.length; shift++) {
    const rotated = target.slice(shift).concat(target.slice(0, shift));
    shifts.push(fixedLookup(quotient, rotated).mi);
  }
  const rank = 1 + shifts.filter(mi => mi >= direct.mi).length;
  assert.equal(rank, expected.p);
  console.log(JSON.stringify({
    direction: name,
    fixedLookupMinMismatches: direct.mismatch,
    allSecretRelabeledTranspositionMinSymbolChanges:
      minChangesAfterReorderAndRelabel(quotient, target),
    perPageMinMismatches: byPage.map(b => b.mismatch),
    equalityPairsMatched: direct.agreeingPairs,
    equalityPairsOnQuotient: direct.inputPairs,
    mutualInfo: direct.mi,
    cyclicRank: rank,
    cyclicTotal: target.length,
    additiveKeyLinearComplexity: linearComplexity(key),
    additiveKeyGMotionMatches: gRecurrenceMatches(key),
  }));
}
console.log('PASS: source-locked 254-runic G/moth static-link gate');
