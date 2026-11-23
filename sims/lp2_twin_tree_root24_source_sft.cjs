'use strict';

/**
 * Original LP2 paired-tree root-24 experiment.
 *
 * Research input: intact physical LP2 p10/p11 rune tapes, original GP29
 * ordering, and the Cicada identifier 3301. No ciphertext characters are
 * edited; the high-degree-first convention follows printed rune order.
 *
 * Node.js 22 SFT: node sims/lp2_twin_tree_root24_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
/** @param {number} n @returns {number} */
const mod = n => (n % 29 + 29) % 29;
/** @param {number[]} highFirst @param {number} x @returns {number} */
function evaluate(highFirst, x) {
  return highFirst.reduce((value, coefficient) =>
    mod(value * x + coefficient), 0);
}
/**
 * Divide the source polynomial by (X - root), with a single exact remainder.
 * @param {number[]} highFirst
 * @param {number} root
 * @returns {{quotient:number[],remainder:number}}
 */
function divideLinear(highFirst, root) {
  assert.ok(highFirst.length >= 2);
  const quotient = [];
  let carry = highFirst[0];
  for (let j = 1; j < highFirst.length; j++) {
    quotient.push(carry);
    carry = mod(carry * root + highFirst[j]);
  }
  return {quotient, remainder:carry};
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((acc, n) => acc + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} a @returns {string} */
const roman = a => a.map(v => corpus.translit[v]).join('');
/**
 * Forward multiply by X - root; positional result is one rune longer.
 * @param {number[]} q
 * @param {number} root
 * @returns {number[]}
 */
function multiplyLinear(q, root) {
  const full = Array(q.length + 1).fill(0);
  for (let i = 0; i < q.length; i++) {
    full[i] = mod(full[i] + q[i]);
    full[i + 1] = mod(full[i + 1] - root * q[i]);
  }
  return full;
}

assert.equal(corpus.runes.length, 29);
assert.equal(corpus.pages.length, 58);
const r = mod(3301);
assert.equal(r, 24);
const pages = corpus.pages.filter(page =>
  page.page < 56 && page.runic_count > 0);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, page) => n + page.indices.length, 0), 12956);

// Fix the field element by the historical number 3301 and evaluate *all*
// original ciphertext page tapes, avoiding a selected-page-only report.
const highZeros = pages.filter(page => evaluate(page.indices, r) === 0)
  .map(page => page.page);
const lowZeros = pages.filter(page =>
  evaluate(page.indices.slice().reverse(), r) === 0)
  .map(page => page.page);
assert.deepEqual(highZeros, [10, 11, 29, 36]);
assert.deepEqual(lowZeros, [19, 27, 48]);
const p9 = corpus.pages[9].indices;
const p10 = corpus.pages[10].indices;
const p11 = corpus.pages[11].indices;
const p12 = corpus.pages[12].indices;
assert.equal(evaluate(p9, r), 8);
assert.equal(evaluate(p12, r), 23);
const treePages = corpus.pages.slice(8, 15);
const treeResidues = treePages.map(page => evaluate(page.indices, r));
assert.deepEqual(treeResidues, [7, 8, 0, 0, 23, 9, 18]);
assert.equal(p10.length, 263);
assert.equal(p11.length, 273);
const a = divideLinear(p10, r);
const b = divideLinear(p11, r);
assert.equal(a.remainder, 0);
assert.equal(b.remainder, 0);
assert.equal(a.quotient.length, 262);
assert.equal(b.quotient.length, 272);
assert.equal(evaluate(a.quotient, r), 6);
assert.equal(evaluate(b.quotient, r), 9);
assert.deepEqual(multiplyLinear(a.quotient, r), p10);
assert.deepEqual(multiplyLinear(b.quotient, r), p11);

const results = [];
for (const [orientation, rhs] of [
  ['same-printed-order', b.quotient],
  ['opposed-marginal-mirror', b.quotient.slice().reverse()]
]) {
  for (const sign of [-1, 1]) {
    const candidate = a.quotient.map((value, i) =>
      mod(value + sign * rhs[i]));
    results.push({orientation, sign, runeCount:candidate.length,
      ioc:ioc(candidate), romanPrefix:roman(candidate.slice(0, 60))});
  }
}
assert.equal(results.length, 4);
const targetIoCs = [
  0.03436576876955924, 0.03439501623234184,
  0.03518469772747214, 0.03421953145564622
];
for (let i = 0; i < results.length; i++) {
  assert.ok(Math.abs(results[i].ioc - targetIoCs[i]) < 1e-12);
}

// Real, creator-solved native GP29 source verifies that this polynomial
// forward/reverse operation would recover plaintext if it were planted.
const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
const planted = Array.from({length:262}, (_, i) => solved[i % solved.length]);
const synthetic = multiplyLinear(planted, r);
assert.equal(synthetic.length, 263);
assert.deepEqual(divideLinear(synthetic, r),
  {quotient:planted, remainder:0});
assert.ok(ioc(planted) > 0.06);
assert.ok(results.every(result => result.ioc < 0.04));

console.log(JSON.stringify({
  source: {r, originalUnknownPages:pages.length, originalRunes:12956,
    highDegreeFirstRoots:highZeros, lowDegreeFirstRoots:lowZeros,
    distinctiveOriginalPages:[10,11], treeChapterPageResidues:treeResidues,
    p10AndP11Lengths:[p10.length,p11.length],
    neighborResidues:{p9:evaluate(p9,r),p12:evaluate(p12,r)},
    rootMultiplicities:{
      p10LinearQuotientAtRoot:evaluate(a.quotient,r),
      p11LinearQuotientAtRoot:evaluate(b.quotient,r)
    }
  },
  directCandidate: {
    quotientRunes:[a.quotient.length,b.quotient.length],
    quotientIoCs:[ioc(a.quotient),ioc(b.quotient)],
    mirroredPageCombination:results,
    nativeGP29PlantRecovered:true,
    originalP10AndP11ExactlyReconstructed:true
  },
  decision:'A source-shared simple root is observed on illustrated twin ' +
    'pages; four source-motivated merged readouts yield no unknown prose.'
}, null, 2));
