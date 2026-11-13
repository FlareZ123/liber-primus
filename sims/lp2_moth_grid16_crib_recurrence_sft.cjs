"use strict";
/**
 * Source-linked LP1 moth crib / LP2 numeric-table recurrence gate.
 *
 * Tests a proposed, unconfirmed original p55 terminal plaintext against the
 * degree-16 factor of the original pp49-51 GF(29) numeric-table polynomial.
 * This is a conditional negative cipher test, never a claimed p55 decryption.
 *
 * Single-file test: node sims/lp2_moth_grid16_crib_recurrence_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const readJSON = relativePath => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), "utf8")
);
const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const grid = readJSON("resources/liber-primus/lp2-grid-256.json");
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} n @returns {number} */
function inverse(n) {
  for (let x = 1; x < 29; x++) if (mod(n * x) === 1) return x;
  throw new Error("Noninvertible finite-field value");
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}

/** @param {number[]} square @returns {number} */
function determinant(square) {
  const a = square.map(row => row.map(mod));
  const n = a.length;
  let det = 1;
  for (let i = 0; i < n; i++) {
    let pivot = i;
    while (pivot < n && a[pivot][i] === 0) pivot++;
    if (pivot === n) return 0;
    if (pivot !== i) {
      [a[i], a[pivot]] = [a[pivot], a[i]];
      det = mod(-det);
    }
    det = mod(det * a[i][i]);
    const pivotInverse = inverse(a[i][i]);
    for (let row = i + 1; row < n; row++) {
      const factor = mod(a[row][i] * pivotInverse);
      for (let col = i; col < n; col++)
        a[row][col] = mod(a[row][col] - factor * a[i][col]);
    }
  }
  return det;
}

/** @param {number[]} s @returns {{order:number,connection:number[]}} */
function berlekampMassey(s) {
  let connection = [1], backup = [1], order = 0, shift = 1, prior = 1;
  for (let n = 0; n < s.length; n++) {
    let discrepancy = s[n];
    for (let j = 1; j <= order; j++)
      discrepancy = mod(discrepancy + (connection[j] || 0) * s[n - j]);
    if (discrepancy === 0) {
      shift++;
      continue;
    }
    const previous = connection.slice();
    const scale = mod(discrepancy * inverse(prior));
    while (connection.length < backup.length + shift) connection.push(0);
    for (let j = 0; j < backup.length; j++)
      connection[j + shift] = mod(connection[j + shift] - scale * backup[j]);
    if (2 * order <= n) {
      order = n + 1 - order;
      backup = previous;
      prior = discrepancy;
      shift = 1;
    } else shift++;
  }
  return { order, connection: connection.slice(0, order + 1) };
}

/**
 * Extend the first sixteen GP29 key residues using one fixed source factor.
 * @param {number[]} seed
 * @param {number[]} polynomial ascending-degree coefficients
 * @param {number} length
 * @returns {number[]}
 */
function continueRecurrence(seed, polynomial, length) {
  assert.equal(polynomial.length, 17);
  assert.equal(seed.length, 16);
  const out = seed.slice();
  const zeroCoefficientInverse = inverse(polynomial[0]);
  for (let n = 16; n < length; n++) {
    let value = 0;
    for (let j = 1; j <= 16; j++)
      value = mod(value - polynomial[j] * out[n - j]);
    out.push(mod(value * zeroCoefficientInverse));
  }
  return out;
}

// The original source prints 256 base-60 tokens across physical pp49-51.
assert.equal(grid.bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(grid.bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
// Polynomial factors obtained from the exact table, constant term first.
const factors = [
  [25, 10, 1], // (X+5)^2
  [11, 18, 1], // source BASE29 quadratic
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
const factor16 = factors.reduce(multiply, [1]);
assert.deepEqual(
  factor16,
  [13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]
);
const tablePolynomial = grid.bytes.slice().reverse().map(mod);
for (let i = tablePolynomial.length - factor16.length; i >= 0; i--) {
  const coefficient = tablePolynomial[i + factor16.length - 1];
  for (let j = 0; j < factor16.length; j++)
    tablePolynomial[i + j] =
      mod(tablePolynomial[i + j] - coefficient * factor16[j]);
}
assert(tablePolynomial.slice(0, 16).every(x => x === 0),
  "Degree-16 source factor must divide the unaltered original table");

// Exact original LP1 physical-p5 source spelling: FUNCTION uses IA (IO),
// and THINGS uses NG (ING). Same moth appears on LP2 p55.
const words = [
  "ᚦᛖ", "ᛏᚩᛏᛁᛖᚾᛏ", "ᚠᚢᚾᚳᛏᛡᚾ",
  "ᛁᛋ", "ᛋᚪᚳᚱᛖᛞ", "ᚪᛚᛚ", "ᚦᛝᛋ"
];
assert.deepEqual(words.map(w => [...w].length), [2,7,7,2,6,3,3]);
const hypothesis = [...words.join("")].map(r => corpus.runes.indexOf(r));
assert.equal(hypothesis.length, 30);
assert(hypothesis.every(x => x >= 0));
const p55 = corpus.pages[55].indices;
assert.equal(p55.length, 76);
const actual = p55.slice(46);
assert.deepEqual(actual, [
  12,18,28,18,10,6,14,6,15,18,15,12,2,2,18,
  15,2,22,5,28,10,19,5,14,23,11,1,17,18,10
]);
const impliedKey = actual.map((x, i) => mod(x - hypothesis[i]));
assert.deepEqual(impliedKey, [
  10,0,12,15,23,25,25,26,28,18,14,3,26,15,20,
  6,21,7,19,4,5,15,16,20,28,20,10,15,26,24
]);

const hankel15 = Array.from({length: 15}, (_, i) =>
  Array.from({length: 15}, (_, j) => impliedKey[i + j]));
const hankelDeterminant = determinant(hankel15);
assert.equal(hankelDeterminant, 5,
  "Nonzero 15x15 Hankel determinant excludes every order<=14 GF29 recurrence");
const linearComplexity = berlekampMassey(impliedKey);
assert.equal(linearComplexity.order, 15);

// Both source-readable polynomial directions, fixed before checking heldout.
const candidates = [
  { name: "high-to-low-factor", coefficients: factor16.slice().reverse() },
  { name: "low-to-high-factor", coefficients: factor16.slice() }
].map(({name, coefficients}) => {
  const predicted = continueRecurrence(impliedKey.slice(0,16), coefficients, 30);
  const matchOffsets = [];
  for (let i = 16; i < 30; i++)
    if (predicted[i] === impliedKey[i]) matchOffsets.push(i);
  // A correct source-model plant must recover every untouched suffix symbol.
  const plantedCipher = hypothesis.map((x, i) => mod(x + predicted[i]));
  const recoveredKey = plantedCipher.map((x, i) => mod(x - hypothesis[i]));
  assert.deepEqual(recoveredKey, predicted);
  const plantPrediction = continueRecurrence(
    recoveredKey.slice(0,16), coefficients,30
  );
  assert.deepEqual(plantPrediction, recoveredKey);
  return {
    name,
    predictedHeldout: predicted.slice(16),
    actualHeldout: impliedKey.slice(16),
    matchedHeldout: matchOffsets.length,
    matchOffsets,
    plantedHeldoutRecovered: 14
  };
});
assert.deepEqual(candidates.map(x => x.matchedHeldout), [1,1]);
assert.deepEqual(candidates.map(x => x.matchOffsets), [[24],[28]]);

/**
 * Source-extension: even a completely secret constant affine output register
 * cannot repair the observed table-factor recurrence on this fixed crib.
 * The recurrence annihilates K; hence E(C)=a E(P)+b E(1).
 * @param {number[]} sequence
 * @param {number[]} polynomial
 * @returns {number[]}
 */
function recurrenceResidual(sequence, polynomial) {
  return Array.from({length: 14}, (_, i) => {
    const n = i + 16;
    let value = 0;
    for (let j = 0; j <= 16; j++)
      value = mod(value + polynomial[j] * sequence[n-j]);
    return value;
  });
}

const affineSecretExtension = [
  { name:"high-to-low-factor", coefficients:factor16.slice().reverse() },
  { name:"low-to-high-factor", coefficients:factor16.slice() }
].map(({name, coefficients}, orientation) => {
  const ec = recurrenceResidual(actual, coefficients);
  const ep = recurrenceResidual(hypothesis, coefficients);
  const e1 = recurrenceResidual(Array(30).fill(1), coefficients);
  assert(e1.every(x => x === 5));
  assert.notEqual(mod(ep[1] - ep[0]), 0);
  const a = mod((ec[1] - ec[0]) * inverse(mod(ep[1]-ep[0])));
  const b = mod((ec[0] - a*ep[0])*inverse(e1[0]));
  assert.equal(ec[0],mod(a*ep[0]+b*e1[0]));
  assert.equal(ec[1],mod(a*ep[1]+b*e1[1]));
  const predictedThird = mod(a*ep[2]+b*e1[2]);
  assert.notEqual(ec[2],predictedThird);
  const expected = orientation===0
    ? {a:10,b:28,third:14,actual:0}
    : {a:28,b:3,third:20,actual:5};
  assert.deepEqual({a,b,third:predictedThird,actual:ec[2]},expected);

  let best=0, fullyMatching=0;
  const matchingHistogram=Array(15).fill(0);
  for (let multiplier=1;multiplier<29;multiplier++) {
    for (let offset=0;offset<29;offset++) {
      const matches=ec.filter((v,i) =>
        v===mod(multiplier*ep[i]+offset*e1[i])).length;
      matchingHistogram[matches]++;
      best=Math.max(best,matches);
      if(matches===14)fullyMatching++;
    }
  }
  assert.equal(best,4);
  assert.equal(fullyMatching,0);
  assert.equal(matchingHistogram.reduce((s,x)=>s+x,0),812);

  // Positive-control: source-derived key with a hidden nontrivial affine
  // register obeys all fourteen full original-format recurrence equations.
  const plantedKey=continueRecurrence(impliedKey.slice(0,16),coefficients,30);
  const planted=hypothesis.map((p,i)=>mod(7*p+3+plantedKey[i]));
  const plantedResidual=recurrenceResidual(planted,coefficients);
  assert(plantedResidual.every((v,i)=>v===mod(7*ep[i]+3*e1[i])));

  return {
    orientation:name,
    exactFirstTwoEquationCandidate:{a,b},
    thirdSourcePrediction:predictedThird,
    thirdOriginalValue:ec[2],
    distinctSecretAffinePairsChecked:812,
    fullConsistentPairs:fullyMatching,
    bestFourteenEquationMatches:best,
    matchingHistogram,
    plantedAllFourteenConstraintsSatisfied:true
  };
});

console.log(JSON.stringify({
  classification: "Conditional original-p55 crib exclusion; no plaintext recovered",
  input: "p55 indices 46..75, LP1-p5 same-moth seven-word source conjecture",
  authenticTableBytes: 256,
  sourceFactorDegree: 16,
  impliedKeyLength: 30,
  hankel15DetMod29: hankelDeterminant,
  minimumHomogeneousGF29RecurrenceOrder: linearComplexity.order,
  fixedSourceFactorPrediction: candidates,
  affineSecretExtension,
  interpretation: "The assumed crib is incompatible with all homogeneous additive-pad GF29 LFSRs of order <=14 and with both natural orientations of the exact degree-16 table factor."
}, null, 2));
