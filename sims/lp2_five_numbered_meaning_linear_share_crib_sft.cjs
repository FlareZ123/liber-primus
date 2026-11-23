'use strict';
// Original-input, source-fixed test: five LP2 numbered passages -> GF(29) linear/affine decoding.
// Node 22: node sims/lp2_five_numbered_meaning_linear_share_crib_sft.cjs
const assert = require('node:assert/strict');
const path = require('node:path');
const corpus = require(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'));
const p = corpus.pages;
const F = 29;
const mod = n => ((n % F) + F) % F;
const inv = n => {
  for (let k = 1; k < F; k++) if (mod(k * n) === 1) return k;
  throw Error('Not a unit in GF29: ' + n);
};
const segments = [
  p[36].indices.slice(99, 238),
  p[37].indices.slice(0, 91),
  p[37].indices.slice(91, 189),
  p[37].indices.slice(189, 228).concat(p[38].indices.slice(0, 57)),
  p[38].indices.slice(57, 186)
];
assert.deepEqual(segments.map(x => x.length), [139, 91, 98, 96, 129]);
assert.deepEqual(segments.map(x => x.slice(0, 4)), [
  [20, 2, 12, 22], [9, 26, 18, 14], [23, 1, 13, 7],
  [21, 11, 15, 11], [8, 25, 14, 2]
]);
const N = 91, CRIB = [19, 28, 9, 21]; // canonical GP29 MEANING, ING contracted.
const shares = segments.map(x => x.slice(0, N));
function ioc(a) {
  const counts = Array(F).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((s, v) => s + v * (v - 1), 0) / (a.length * (a.length - 1));
}
function decode(ss, coef, b = 0) {
  return Array.from({length: N}, (_, i) =>
    mod(b + ss.reduce((s, stream, j) => s + coef[j] * stream[i], 0)));
}
function rref(ss) {
  const mat = Array.from({length: 4}, (_, i) => [
    ...ss.map(stream => stream[i]), 1, CRIB[i]
  ]);
  const pivots = [];
  let row = 0;
  for (let c = 0; c < 6 && row < 4; c++) {
    let r = row;
    while (r < 4 && mod(mat[r][c]) === 0) r++;
    if (r === 4) continue;
    [mat[row], mat[r]] = [mat[r], mat[row]];
    const scale = inv(mat[row][c]);
    mat[row] = mat[row].map(x => mod(x * scale));
    for (let k = 0; k < 4; k++) if (k !== row) {
      const f = mat[k][c];
      mat[k] = mat[k].map((x, j) => mod(x - f * mat[row][j]));
    }
    pivots.push(c);
    row++;
  }
  // The 4 original first-word equations have independent share coordinates 1-4.
  assert.deepEqual(pivots, [0, 1, 2, 3]);
  return mat;
}
const mat = rref(shares);
assert.deepEqual(mat, [
  [1,0,0,0,19,13,26],
  [0,1,0,0,21,10, 4],
  [0,0,1,0,28,25,12],
  [0,0,0,1, 2,14,11]
]);
function solveAll(ss) {
  const m = rref(ss), solutions = [];
  for (let fifth = 0; fifth < F; fifth++)
    for (let b = 0; b < F; b++) {
      const coef = [0, 0, 0, 0, fifth];
      for (let j = 0; j < 4; j++) coef[j] =
        mod(m[j][6] - m[j][4] * fifth - m[j][5] * b);
      const out = decode(ss, coef, b);
      assert.deepEqual(out.slice(0, 4), CRIB);
      solutions.push({fifth, b, coef, out,
        train: ioc(out.slice(4, 47)),
        heldout: ioc(out.slice(47, 91)),
        all: ioc(out.slice(4, 91))});
    }
  assert.equal(solutions.length, 841);
  return solutions;
}
const candidates = solveAll(shares);
const sorted = [...candidates].sort((a, b) => b.train - a.train);
const best = sorted[0];
assert.equal(best.fifth, 11);
assert.equal(best.b, 2);
assert.deepEqual(best.coef, [23, 14, 2, 19, 11]);
assert(Math.abs(best.train - 0.058693244739756366) < 1e-12);
assert(Math.abs(best.heldout - 0.03171247357293869) < 1e-12);
// Homogeneous five-share model is affine with b=0, 29 coefficient solutions.
const homogeneous = candidates.filter(c => c.b === 0).sort((a,b) => b.train-a.train);
assert.equal(homogeneous.length, 29);
assert.deepEqual(homogeneous[0].coef, [27,28,15,5,3]);
assert(Math.abs(homogeneous[0].train - 0.05204872646733112) < 1e-12);
assert(Math.abs(homogeneous[0].heldout - 0.03171247357293869) < 1e-12);
const avg = Array.from({length: N}, (_, i) =>
  mod(6 * shares.reduce((s, v) => s + v[i], 0))); // 5^(-1) == 6 mod29
assert(Math.abs(ioc(avg) - 0.03492063492063492) < 1e-12);
// Distinct, source-native positive: encrypt 91 actual solved rune positions,
// prepending the independent source crib. The secret affine vector must occur
// among the 841 solutions and invert every position, including the held-out end.
const plain = CRIB.concat(p[57].indices.slice(4, 91));
assert.equal(plain.length, N);
const hiddenCoef = [5,7,13,17,23], hiddenB = 11;
const synthetic = Array.from({length: 5}, () => []);
for (let i = 0; i < N; i++) {
  const t = i + 1;
  for (let k = 0; k < 4; k++)
    synthetic[k].push(mod(t ** k));
  const rem = mod(plain[i] - hiddenB -
    synthetic.slice(0,4).reduce((s, arr, k) => s + arr[i] * hiddenCoef[k], 0));
  synthetic[4].push(mod(rem * inv(hiddenCoef[4])));
}
const planted = solveAll(synthetic);
const recovered = planted.find(x => x.fifth === hiddenCoef[4] && x.b === hiddenB);
assert(recovered);
assert.deepEqual(recovered.coef, hiddenCoef);
assert.deepEqual(recovered.out, plain);
const fmt = c => ({
  fifth: c.fifth, constant: c.b, coeff: c.coef,
  fit43: Number(c.train.toFixed(9)),
  withheld44: Number(c.heldout.toFixed(9)),
  first32_GP: c.out.slice(0,32).map(x => corpus.translit[x]).join('')
});
console.log(JSON.stringify({
  source: 'LP2 pp36-38, physical numbered units 1-5',
  lengths: segments.map(x => x.length),
  known_four_runes: CRIB,
  arithmetic_mean_91_IoC: ioc(avg),
  linear_n: homogeneous.length, linear_best: fmt(homogeneous[0]),
  affine_n: candidates.length, affine_best: fmt(best),
  native_GP_reference_heldout44_IoC: ioc(p[57].indices.slice(47,91)),
  independent_native_GP_plant: '91/91 exact recovered at secret vector',
  conclusion: 'No coherent 87-rune continuation; best train fit collapses on 44-runic holdout.'
}, null, 2));
