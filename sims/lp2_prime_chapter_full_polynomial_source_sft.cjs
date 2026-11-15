'use strict';

/**
 * Source-locked original LP2 polynomial-share inversion.
 * Expands the established first-four 3/5/7/11 equal-strand chapter test
 * from Shamir f(0) to every polynomial coefficient and source-selected
 * all 29 finite-field evaluation points (including 8, 17, 24).
 * No guessed plaintext or secret key.
 * Run: node sims/lp2_prime_chapter_full_polynomial_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const mod = (v) => ((v % 29) + 29) % 29;

/** @param {number} a */
function inverse(a) {
  for (let x = 1; x < 29; x++) if (mod(a * x) === 1) return x;
  throw new Error('noninvertible GF29 element');
}

/** Inverse of a k-by-k Vandermonde at original share abscissae 1...k. */
function vandermondeInverse(k) {
  const m = Array.from({length:k}, (_, j) => {
    let power = 1;
    const row = [];
    for (let i = 0; i < k; i++) {
      row.push(power);
      power = mod(power * (j + 1));
    }
    return row.concat(Array.from({length:k}, (_, i) => +(i === j)));
  });
  for (let col = 0; col < k; col++) {
    let pivot = col;
    while (pivot < k && m[pivot][col] === 0) pivot++;
    assert.ok(pivot < k);
    [m[col], m[pivot]] = [m[pivot], m[col]];
    const scale = inverse(m[col][col]);
    m[col] = m[col].map(v => mod(v * scale));
    for (let j = 0; j < k; j++) {
      if (j === col) continue;
      const q = m[j][col];
      m[j] = m[j].map((v, i) => mod(v - q * m[col][i]));
    }
  }
  return m.map(row => row.slice(k));
}

/** Lagrange weights evaluating f(x) from f(1),...,f(k). */
function evalWeights(k, x) {
  return Array.from({length:k}, (_, j) => {
    let a = 1;
    let b = 1;
    for (let m = 1; m <= k; m++) {
      if (m === j + 1) continue;
      a = mod(a * (x - m));
      b = mod(b * (j + 1 - m));
    }
    return mod(a * inverse(b));
  });
}

/**
 * @param {number[]} source
 * @param {number} k
 * @param {'contiguous'|'interleaved'} layout
 * @param {number[]} weights
 */
function read(source, k, layout, weights) {
  const n = source.length / k;
  assert.equal(n, Math.floor(n));
  return Array.from({length:n}, (_, t) => {
    let value = 0;
    for (let j = 0; j < k; j++) {
      const slot = layout === 'contiguous' ? j * n + t : t * k + j;
      value = mod(value + weights[j] * source[slot]);
    }
    return value;
  });
}
function ioc(a) {
  const hist = Array(29).fill(0);
  for (const v of a) hist[v]++;
  return hist.reduce((sum, v) => sum + v * (v - 1), 0) /
    (a.length * (a.length - 1));
}
/** GP-native source-length plant with exactly predetermined coefficient. */
function plant(plaintext, k, layout, target, point) {
  const n = plaintext.length;
  const out = Array(n * k).fill(0);
  for (let t = 0; t < n; t++) {
    for (let j = 1; j <= k; j++) {
      let value = 0;
      let power = 1;
      const z = mod(j - point);
      for (let i = 0; i < k; i++) {
        const coeff = i === target ? plaintext[t] : mod(13 + 7 * i + 9 * t);
        value = mod(value + coeff * power);
        power = mod(power * z);
      }
      out[layout === 'contiguous' ? (j - 1) * n + t : t * k + j - 1] = value;
    }
  }
  return out;
}
const chapters = [
  {first:0, last:2, k:3, n:243},
  {first:3, last:7, k:5, n:229},
  {first:8, last:14, k:7, n:247},
  {first:15, last:22, k:11, n:173}
];
const english = corpus.pages.find(p => p.page === 57).indices;
assert.equal(english.length, 95);
const results = [];
let coefficients = 0, evaluations = 0, maxCoefficient = 0, maxEvaluation = 0;
for (const {first,last,k,n} of chapters) {
  const input = corpus.pages.filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices);
  assert.equal(input.length, n * k);
  const original = input.slice();
  const inverseMatrix = vandermondeInverse(k);
  for (const layout of ['contiguous','interleaved']) {
    const control = Array.from({length:n}, (_, i) => english[i % english.length]);
    const coeffRows = inverseMatrix.map(weights => read(input, k, layout, weights));
    const evaluated = Array.from({length:29}, (_, x) =>
      read(input, k, layout, evalWeights(k,x)));
    const coeffIoCs = coeffRows.map(ioc);
    const evalIoCs = evaluated.map(ioc);
    coefficients += coeffRows.length;
    evaluations += evaluated.length;
    maxCoefficient = Math.max(maxCoefficient, ...coeffIoCs);
    maxEvaluation = Math.max(maxEvaluation, ...evalIoCs);
    assert.ok(coeffIoCs.every(value => value < 0.049));
    assert.ok(evalIoCs.every(value => value < 0.049));
    for (let target = 0; target < k; target++) {
      const planted = plant(control,k,layout,target,0);
      assert.deepEqual(read(planted,k,layout,inverseMatrix[target]),control);
      // All coefficient rows of a single synthetic polynomial are independent.
      for (let rival = 0; rival < k; rival++) {
        if (rival === target) continue;
        assert.notDeepEqual(read(planted,k,layout,inverseMatrix[rival]),control);
      }
    }
    const at24 = plant(control,k,layout,0,24);
    assert.deepEqual(read(at24,k,layout,evalWeights(k,24)),control);
    // The eight original observations remain unchanged by the decoder.
    assert.deepEqual(input,original);
    results.push({
      chapter:'p'+first+'-p'+last, shareCount:k, strandLength:n, layout,
      coefficientIoCs:coeffIoCs.map(v => +v.toFixed(6)),
      evaluations:{
        sourceRoot24:+evalIoCs[24].toFixed(6),
        matrixRoot8:+evalIoCs[8].toFixed(6),
        matrixRoot17:+evalIoCs[17].toFixed(6),
        secretAtZero:+evalIoCs[0].toFixed(6),
        highestValue:+Math.max(...evalIoCs).toFixed(6),
        highestAt:evalIoCs.indexOf(Math.max(...evalIoCs)),
        lowestValue:+Math.min(...evalIoCs).toFixed(6)
      }
    });
  }
}
assert.equal(coefficients,52);
assert.equal(evaluations,232);
assert.ok(maxCoefficient < 0.038);
assert.ok(maxEvaluation < 0.038);
console.log(JSON.stringify({
  sourceRuneCount:12956, coefficientStreams:coefficients,
  sourcePointStreams:evaluations,
  maximumCoefficientIoC:+maxCoefficient.toFixed(9),
  maximumEvaluationIoC:+maxEvaluation.toFixed(9),
  results
},null,2));
