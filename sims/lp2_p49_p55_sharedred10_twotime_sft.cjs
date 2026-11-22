'use strict';

/**
 * Exploratory p49 vs p55 shared-key test. Source correction:
 * p49 has a 10-dot mark while p55 has a DIFFERENT 13-dot mark.
 * Original stencil census provides NO original shared-key selector.
 * This arithmetic comparison is retired as an unselected negative control.
 *
 * For a repeated GP29 additive pad C_i=P_i+K_i (mod29), subtraction of
 * the two original ciphertexts removes ANY unknown pad. Source-native
 * GP English then has a testable key-independent difference likelihood.
 *
 * Evidence here is conditional, not a historical decryption.
 * Windows 11, Node.js 22, one self-contained runnable test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native = [
  ['Shakespeare', encodeSourceNativeGP(read('resources/control/shakespeare_first300k.txt'))],
  ['Gibran', encodeSourceNativeGP(read('resources/control/gibran_prophet_58585.txt'))],
  ['Emerson', encodeSourceNativeGP(read('resources/control/emerson_essays_2944.txt'))]
];

const frequencies = Array(29).fill(0);
for (const value of native[0][1].slice(0, 100000)) frequencies[value]++;
assert.equal(frequencies.reduce((a, b) => a + b, 0), 100000);
const differenceProb = Array(29).fill(0);
for (let x = 0; x < 29; x++) {
  for (let y = 0; y < 29; y++) {
    differenceProb[(x - y + 29) % 29] += frequencies[x] * frequencies[y] / 1e10;
  }
}
const logWeights = differenceProb.map((x) => Math.log(29 * x));

/**
 * Key-cancelled native-GP English difference log likelihood relative to
 * a uniform random 29-symbol difference stream.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {{llr:number, zeros:number}}
 */
function score(a, b) {
  assert.equal(a.length, b.length);
  let llr = 0;
  let zeros = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] - b[i] + 29) % 29;
    llr += logWeights[d];
    if (d === 0) zeros++;
  }
  return { llr, zeros };
}

const p48 = gp.pages[48].indices;
const p49 = gp.pages[49].indices;
const p55 = gp.pages[55].indices;
const preTable = p48.slice(-72).concat(p49);
assert.equal(preTable.length, 138);
assert.equal(p49.length, 66);
assert.equal(p55.length, 76);
const frozenPairs = [
  {name: 'p49-start → p55-start', left: p49, right: p55.slice(0, 66), value: -1.9340878917658881, zeros: 3, rank: 44},
  {name: 'p49-red-end → p55-red-end', left: p49, right: p55.slice(-66), value: -1.3043043033105899, zeros: 1, rank: 33},
  {name: 'pretable138 last76 → p55 entire', left: preTable.slice(-76), right: p55, value: -1.6255074244330026, zeros: 1, rank: 35},
  {name: 'pretable138 first76 → p55 entire', left: preTable.slice(0, 76), right: p55, value: -2.071443350958962, zeros: 2, rank: 47}
];
for (const pair of frozenPairs) {
  const actual = score(pair.left, pair.right);
  assert.ok(Math.abs(actual.llr - pair.value) < 1e-9, 'original likelihood changed');
  assert.equal(actual.zeros, pair.zeros);
  const rotations = p55.map((_, rotation) => {
    const b = pair.left.map((__, i) => p55[(i + rotation) % p55.length]);
    return score(pair.left, b).llr;
  });
  assert.equal(rotations.filter((value) => value >= actual.llr - 1e-9).length, pair.rank);
  const corpusControls = [];
  for (const [name, source] of native) {
    const holdout = name === 'Shakespeare' ? source.slice(100000) : source;
    const span = holdout.length - pair.left.length - 5033;
    assert.ok(span > 6000);
    const values = [];
    for (let j = 0; j < 250; j++) {
      const offset = (j * 7919 + 733) % span;
      const a = holdout.slice(offset, offset + pair.left.length);
      const b = holdout.slice(offset + 5033, offset + 5033 + pair.left.length);
      const k = a.map((_, i) => (17 * i + 7) % 29);
      const encA = a.map((v, i) => (v + k[i]) % 29);
      const encB = b.map((v, i) => (v + k[i]) % 29);
      const nativeScore = score(a, b).llr;
      const cipherScore = score(encA, encB).llr;
      assert.ok(Math.abs(nativeScore - cipherScore) < 1e-10);
      values.push(cipherScore);
    }
    values.sort((a, b) => a - b);
    corpusControls.push({
      name, total: values.length,
      atOrBelowActual: values.filter((v) => v <= actual.llr).length,
      median: values[125]
    });
  }
  console.log(pair.name, JSON.stringify({
    n: pair.left.length, ...actual,
    exactSourceRotationRank: pair.rank + '/76', corpusControls
  }));
}
console.log('PASS: unselected p49/p55 GP29 shared-pad negative; all positive native controls. Source correction: p49=10 dots, p55=13 dots.');
