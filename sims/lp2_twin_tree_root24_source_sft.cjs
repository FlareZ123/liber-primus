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
// A red squared root on p39 is not a globally planted page-section factor.
const sourceChapterBounds = [
  [0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]
];
const sectionResidues24 = sourceChapterBounds.map(([lo,hi]) =>
  evaluate(corpus.pages.slice(lo,hi + 1)
    .flatMap(page => page.indices), r));
assert.deepEqual(sectionResidues24, [22,22,6,17,8,18,14,13,7]);
const originalWhole = corpus.pages.slice(0,56).flatMap(x => x.indices);
assert.equal(originalWhole.length, 12956);
assert.equal(evaluate(originalWhole,r), 2);

const p9 = corpus.pages[9].indices;
const p10 = corpus.pages[10].indices;
const p11 = corpus.pages[11].indices;
const p12 = corpus.pages[12].indices;
assert.equal(evaluate(p9, r), 8);
assert.equal(evaluate(p12, r), 23);
const treePages = corpus.pages.slice(8, 15);
const treeResidues = treePages.map(page => evaluate(page.indices, r));
assert.deepEqual(treeResidues, [7, 8, 0, 0, 23, 9, 18]);
// Rival shared linear factor within the same reused seven-page tree chapter.
assert.equal(evaluate(corpus.pages[8].indices, 22), 0);
assert.equal(evaluate(corpus.pages[13].indices, 22), 0);
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

// Source-visible arithmetic 7 on p10 is a candidate factor selector that
// exists independently of the 3301 residue. The same tree stencil reappears
// on p12; the opposite stencil from p11 reappears on p13.
const transcription = fs.readFileSync(path.resolve(__dirname, '..',
  'resources/liber-primus/lp2-transcription.txt'), 'utf8').split('%');
assert.deepEqual(transcription.slice(8, 15)
  .map(text => (text.match(/\d+/g) || [])), [[], [], ['7'], [], [], [], []]);
assert.ok(transcription[10].includes('-7-ᚷ-'));
const numericSeven = 7;
const gpG = corpus.runes.indexOf('ᚷ');
assert.equal(gpG, 6);
assert.equal(corpus.prime[gpG], 17);
assert.equal(numericSeven + corpus.prime[gpG], r);
const sevenPowers = [];
let power = 1;
for (let k = 1; k <= 7; k++) {
  power = mod(power * numericSeven);
  sevenPowers.push(power);
}
assert.deepEqual(sevenPowers, [7,20,24,23,16,25,1]);
assert.equal(sevenPowers[2], r);
assert.equal(numericSeven * corpus.prime[gpG], 119);
assert.equal(evaluate(a.quotient, r), gpG);
const q7 = divideLinear(p10, numericSeven);
assert.equal(q7.remainder, 0);
assert.equal(evaluate(q7.quotient, numericSeven), 5);

assert.equal(evaluate(p10, numericSeven), 0);
const p10Twice = divideLinear(a.quotient, numericSeven);
assert.equal(p10Twice.remainder, 0);
assert.equal(p10Twice.quotient.length, p12.length);
const p13 = corpus.pages[13].indices;
assert.equal(b.quotient.length, p13.length);
assert.deepEqual(multiplyLinear(
  multiplyLinear(p10Twice.quotient, numericSeven), r), p10);
assert.deepEqual(multiplyLinear(b.quotient, r), p11);

/**
 * Is there an exact source-fixed copied stream, even after allowing any
 * single global affine GP29 alphabet map?
 * @param {number[]} quotient
 * @param {number[]} counterpart
 * @returns {{length:number,exactSymbolMatches:number,
 *   bestAffine:{slope:number,offset:number,matches:number},
 *   differenceIoC:number}}
 */
function compareSameTree(quotient, counterpart) {
  assert.equal(quotient.length, counterpart.length);
  const n = quotient.length;
  const exactSymbolMatches = quotient.reduce(
    (count, value, i) => count + Number(value === counterpart[i]), 0);
  let bestAffine = {slope:1, offset:0, matches:exactSymbolMatches};
  for (let slope = 1; slope < 29; slope++) {
    for (let offset = 0; offset < 29; offset++) {
      let matches = 0;
      for (let i = 0; i < n; i++) {
        if (mod(slope * quotient[i] + offset) === counterpart[i]) matches++;
      }
      if (matches > bestAffine.matches) {
        bestAffine = {slope, offset, matches};
      }
    }
  }
  // A fixed global S29 substitution must preserve *every* equality
  // pattern. The following exact certificates exclude all 29! bijections.
  let forwardWitness = null;
  let inverseWitness = null;
  let forwardConflicts = 0;
  let inverseConflicts = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (quotient[i] === quotient[j] &&
          counterpart[i] !== counterpart[j]) {
        forwardConflicts++;
        if (forwardWitness === null) forwardWitness = [
          i, j, quotient[i], counterpart[i], counterpart[j]];
      }
      if (quotient[i] !== quotient[j] &&
          counterpart[i] === counterpart[j]) {
        inverseConflicts++;
        if (inverseWitness === null) inverseWitness = [
          i, j, quotient[i], quotient[j], counterpart[i]];
      }
    }
  }
  const difference = quotient.map((value, i) =>
    mod(value - counterpart[i]));
  return {length:n, exactSymbolMatches, bestAffine,
    differenceIoC:ioc(difference),
    allGlobalSubstitutionsImpossible:forwardConflicts > 0,
    sourceEqualTargetUnequal:{count:forwardConflicts,witness:forwardWitness},
    sourceUnequalTargetEqual:{count:inverseConflicts,witness:inverseWitness}};
}
const sameTreeTransfers = [
  compareSameTree(p10Twice.quotient, p12),
  compareSameTree(b.quotient, p13)
];
assert.deepEqual(sameTreeTransfers.map(result =>
  [result.length, result.exactSymbolMatches, result.bestAffine.matches]),
  [[261, 5, 18], [272, 12, 21]]);
assert.ok(sameTreeTransfers.every(result => result.differenceIoC < 0.04));
assert.deepEqual(sameTreeTransfers.map(result => [
  result.sourceEqualTargetUnequal.count,
  result.sourceUnequalTargetEqual.count,
  result.sourceEqualTargetUnequal.witness,
  result.sourceUnequalTargetEqual.witness]), [
    [1145, 1102, [0,23,5,5,1], [0,3,5,25,5]],
    [1229, 1192, [0,23,27,6,26], [0,4,27,20,6]]
  ]);


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
    sourceChapterResiduesAt24:sectionResidues24,
    fullBookResidueAt24:evaluate(originalWhole,r),
    distinctiveOriginalPages:[10,11], treeChapterPageResidues:treeResidues,
    p10AndP11Lengths:[p10.length,p11.length],
    p10Literal7IsRoot:evaluate(p10,numericSeven) === 0,
    printedFollowingG:{index:gpG, prime:corpus.prime[gpG],
      sumMod29:numericSeven+corpus.prime[gpG], sevenPowers,
      product:numericSeven*corpus.prime[gpG]},
    p10DerivativeAt24:evaluate(a.quotient,r),
    originalSameTreeReceiverLengths:[p12.length,p13.length],
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
    identicalTreeQuotientTransfers:sameTreeTransfers,
    nativeGP29PlantRecovered:true,
    originalP10AndP11ExactlyReconstructed:true
  },
  decision:'A source-shared simple root is observed on illustrated twin ' +
    'pages; source numeral7 gives a second exact p10 factor, but the ' +
    'two complete same-tree quotient transfers and four merged readouts ' +
    'yield no unknown prose.'
}, null, 2));
