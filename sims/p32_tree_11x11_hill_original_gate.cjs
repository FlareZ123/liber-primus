'use strict';
/**
 * Original LP2 physical-p32 11x11 tree-page Hill-key gate.
 *
 * The source-selected tree image has dimensions 563x569.  Original
 * p32 has 121 runes; its 11 top-row GP prime weights sum 563, and the
 * left column sums 569.  Test the consequent candidate 11x11 matrix
 * as a fixed GF29 Hill key without fitting any matrix entries.
 *
 * Run: node sims/p32_tree_11x11_hill_original_gate.cjs
 * @module p32_tree_11x11_hill_original_gate
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('./grid_keyskip_viterbi.cjs');
const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const MOD = 29;
const mod = n => (n % MOD + MOD) % MOD;
const transpose = M => M[0].map((_, j) => M.map(row => row[j]));

/** @param {number[][]} source @returns {{det:number,inverse:number[][]|null}} */
function inverseAndDet(source) {
  const n = source.length;
  const a = source.map((row, i) => row.map(mod).concat(
    Array.from({length:n}, (_, j) => Number(i === j))));
  let determinant = 1;
  for (let j = 0; j < n; j++) {
    let pivot = j;
    while (pivot < n && a[pivot][j] === 0) pivot++;
    if (pivot === n) return {det:0, inverse:null};
    if (pivot !== j) {
      [a[j], a[pivot]] = [a[pivot], a[j]];
      determinant = mod(-determinant);
    }
    const entry = a[j][j];
    determinant = mod(determinant * entry);
    let reciprocal = 1;
    while (mod(entry * reciprocal) !== 1) reciprocal++;
    a[j] = a[j].map(v => mod(v * reciprocal));
    for (let i = 0; i < n; i++) if (i !== j) {
      const factor = a[i][j];
      a[i] = a[i].map((v, col) => mod(v - factor * a[j][col]));
    }
  }
  return {det:determinant, inverse:a.map(row => row.slice(n))};
}

/** @param {number[]} input @param {number[][]} M @param {number} phase */
function transform(input, M, phase = 0) {
  const n = M.length, output = [];
  for (let at = phase; at + n <= input.length; at += n) {
    for (let row = 0; row < n; row++) {
      let sum = 0;
      for (let col = 0; col < n; col++) sum += M[row][col] * input[at + col];
      output.push(mod(sum));
    }
  }
  return output;
}

/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  assert.ok(xs.length > 1);
  const counts = new Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (xs.length * (xs.length - 1));
}

/** @param {number[][]} M @returns {number[]} GF29 eigenvalues */
function scalarEigenvalues(M) {
  const n = M.length, values = [];
  for (let lambda = 0; lambda < 29; lambda++) {
    const shift = M.map((row, i) => row.map(
      (x, j) => mod(x - (i === j ? lambda : 0))));
    if (inverseAndDet(shift).det === 0) values.push(lambda);
  }
  return values;
}

/** Train on original physical pp0-27; hold out pp28-55. */
function originalGate(pages, M, reset, phase) {
  const train = [], heldout = [];
  if (reset === 'page') {
    for (const p of pages) {
      (p.page < 28 ? train : heldout).push(...transform(p.indices, M, phase));
    }
  } else {
    const flat = pages.flatMap(p => p.indices);
    const split = pages.filter(p => p.page < 28)
      .reduce((s, p) => s + p.indices.length, 0);
    for (let at = phase; at + M.length <= flat.length; at += M.length) {
      // Preserve whole 11-rune blocks; discard at most one crossing
      // the training/heldout boundary rather than score leakage.
      if (at < split && at + M.length > split) continue;
      const dest = at + M.length <= split ? train : heldout;
      dest.push(...transform(flat.slice(at, at + M.length), M));
    }
  }
  assert.ok(train.length > 1000 && heldout.length > 1000);
  return {trainN:train.length, heldoutN:heldout.length,
    trainIoC:ioc(train), heldoutIoC:ioc(heldout),
    allIoC:ioc([...train, ...heldout])};
}

function main() {
  const pages = corpus.pages.filter(p => p.status === 'unsolved' &&
    p.indices.length);
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((s,p) => s + p.indices.length, 0), 12956);
  const p32 = pages.find(p => p.page === 32).indices;
  assert.equal(p32.length, 121);
  const sum = xs => xs.reduce((a,b) => a + b, 0);
  assert.equal(sum(p32.slice(0,11).map(i => corpus.prime[i])), 563);
  assert.equal(sum(p32.filter((_,i) => i % 11 === 0)
    .map(i => corpus.prime[i])), 569);

  const known = encode(fs.readFileSync(path.join(ROOT, 'resources',
    'liber-primus', 'lp1-plaintext-reference.txt'), 'utf8'));
  assert.ok(known.length > 3000);
  const variants = [], controls = [], geometry = [];
  for (const [coding, values] of [
    ['GPprime_mod29', p32.map(i => corpus.prime[i] % 29)],
    ['GPindex', p32]]) {
    const M = Array.from({length:11},
      (_,row) => values.slice(row * 11, row * 11 + 11));
    const {det, inverse} = inverseAndDet(M);
    assert.ok(inverse);
    assert.equal(det, coding === 'GPprime_mod29' ? 21 : 8);
    geometry.push({coding, determinant:det, trace:mod(sum(M.map((r,i) => r[i]))),
      scalarEigenvalues:scalarEigenvalues(M)});
    const fixture = known.slice(0, 11 * Math.floor(known.length / 11));
    const encrypted = transform(fixture, M);
    const decrypted = transform(encrypted, inverse);
    assert.deepEqual(decrypted, fixture);
    controls.push({coding, sourceEnglishRunes:fixture.length,
      exactlyRecovered:decrypted.length, reencrypted:encrypted.length});

    for (const [operation, key] of [
      ['matrix', M], ['inverse', inverse],
      ['transpose', transpose(M)], ['inverse-transpose', transpose(inverse)]]) {
      for (const reset of ['book', 'page']) for (let phase = 0; phase < 11; phase++) {
        variants.push({coding, operation, reset, phase,
          ...originalGate(pages, key, reset, phase)});
      }
    }
  }
  assert.deepEqual(geometry.map(x => x.scalarEigenvalues), [[], [24,25]]);
  assert.equal(variants.length, 176);
  const bestTrain = [...variants].sort((a,b) => b.trainIoC - a.trainIoC)[0];
  const bestOriginal = [...variants].sort((a,b) => b.allIoC - a.allIoC)[0];
  const summary = {originalRunes:12956, sourcePage:32,
    physicalTreeImage:'49.jpg', originalChecksum:[563,569],
    rawIoC:ioc(pages.flatMap(p => p.indices)),
    sourceGeometries:geometry, variants:variants.length,
    controls, bestTrain, bestOriginal,
    allIoCRange:[Math.min(...variants.map(v => v.allIoC)),
      Math.max(...variants.map(v => v.allIoC))],
    scope:'Only direct fixed GF29 Hill keys with stated phases and reset clocks; not a general cipher exclusion'};
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  return summary;
}
if (require.main === module) main();
module.exports = {inverseAndDet, transpose, transform, ioc,
  scalarEigenvalues, originalGate, main};
