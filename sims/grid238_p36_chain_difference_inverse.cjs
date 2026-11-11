#!/usr/bin/env node
"use strict";

// Source-fixed test: use the unique degree-238 GF(29) factor of the original
// 256-byte table polynomial and the original 238-rune p36 block as a key
// block for the first-difference chain model:
//   Delta(C)[i] = P[i] + K[i] (mod 29).
//
// The key is anchored at p36: recurrence outputs run backward over the
// 8,705 differences before p36; the 238 p36 runes key the 238 differences
// ending on p36; recurrence outputs run forward over the 4,012 differences
// after p36. No fitted phase, offset, or language-dependent choice.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-grid-256.json"), "utf8"));

const Q = 29;
const mod = x => ((x % Q) + Q) % Q;
const trim = a => {
  let n = a.length;
  while (n > 1 && a[n - 1] === 0) n--;
  return a.slice(0, n);
};
const inv = x => {
  for (let i = 1; i < Q; i++) if (mod(i * x) === 1) return i;
  throw new Error("noninvertible GF(29) element");
};
function divide(poly, factor) {
  const rem = poly.slice();
  const quotient = Array(poly.length - factor.length + 1).fill(0);
  for (let i = quotient.length - 1; i >= 0; i--) {
    const scale = mod(rem[i + factor.length - 1] * inv(factor.at(-1)));
    quotient[i] = scale;
    for (let j = 0; j < factor.length; j++) rem[i + j] = mod(rem[i + j] - scale * factor[j]);
  }
  assert(rem.slice(0, factor.length - 1).every(x => x === 0), "source factor division remainder");
  return trim(quotient);
}

// Exact, previously established small factors of the table polynomial,
// in ascending coefficient order.
const smallFactors = [
  [5, 1],
  [5, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
let residual = trim(grid.bytes.slice().reverse().map(mod));
for (const factor of smallFactors) residual = divide(residual, factor);
const R238 = residual.map(x => mod(x * inv(residual.at(-1))));
assert.equal(R238.length, 239);
assert.equal(R238[0], 5);
assert.equal(R238[238], 1);

const pages = corpus.pages
  .filter(p => p.page <= 55 && p.status === "unsolved" && p.indices.length)
  .sort((a, b) => a.page - b.page);
const all = pages.flatMap(p => p.indices);
const p36 = pages.find(p => p.page === 36).indices.slice();
const before = pages.filter(p => p.page < 36).flatMap(p => p.indices);
const after = pages.filter(p => p.page > 36).flatMap(p => p.indices);
const p36Start = before.length;
assert.equal(all.length, 12956);
assert.equal(p36Start, 8706);
assert.equal(p36.length, 238);
assert.equal(after.length, 4012);

const differences = all.slice(1).map((x, i) => mod(x - all[i]));
assert.equal(differences.length, 12955);

function next(state) {
  let sum = 0;
  for (let j = 0; j < 238; j++) sum -= R238[j] * state[j];
  const value = mod(sum);
  state.shift();
  state.push(value);
  return value;
}
function previous(state) {
  let sum = state[237];
  for (let j = 1; j < 238; j++) sum += R238[j] * state[j - 1];
  const value = mod(-inv(R238[0]) * sum);
  state.pop();
  state.unshift(value);
  return value;
}
function makeAnchoredKey(reverseSeed) {
  const orientedSeed = reverseSeed ? p36.slice().reverse() : p36.slice();
  const state = orientedSeed.slice();

  const beforeReverse = [];
  for (let i = 0; i < p36Start - 1; i++) beforeReverse.push(previous(state));
  const keyBefore = beforeReverse.reverse(); // differences ending at rune positions 1..8705

  const keyOnP36 = orientedSeed.slice(); // differences ending at positions 8706..8943

  const keyAfter = [];
  for (let i = 0; i < after.length; i++) keyAfter.push(next(state)); // positions 8944..12955

  const key = [...keyBefore, ...keyOnP36, ...keyAfter];
  assert.equal(key.length, differences.length);
  return { key, keyBefore, keyOnP36, keyAfter };
}
function ioc(values) {
  const counts = Array(Q).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}
function top(values) {
  const counts = Array(Q).fill(0);
  for (const x of values) counts[x]++;
  return counts.map((count, index) => ({
    rune: corpus.translit[index], index, count, frequency: count / values.length
  })).sort((a, b) => b.count - a.count).slice(0, 8);
}
function prefix(values) {
  return values.slice(0, 100).map(x => corpus.translit[x]).join("");
}

const deltaCounts = Array(Q).fill(0);
for (const x of differences) deltaCounts[x]++;
const nonzero = deltaCounts.slice(1);
const nonzeroExpected = nonzero.reduce((a, b) => a + b, 0) / 28;
const nonzeroChiSquare = nonzero.reduce((sum, n) => sum + (n - nonzeroExpected) ** 2 / nonzeroExpected, 0);

const completeVariants = [];
const stateOnlyVariants = [];
for (const reverseSeed of [false, true]) {
  const { key, keyBefore, keyAfter } = makeAnchoredKey(reverseSeed);
  for (const sign of [-1, 1]) {
    const plain = differences.map((d, i) => mod(d + sign * key[i]));
    completeVariants.push({
      seedOrder: reverseSeed ? "reversed" : "printed",
      sign,
      symbols: plain.length,
      ioc: ioc(plain),
      top: top(plain),
      prefix: prefix(plain),
      exactDeltaKeyMatches: differences.filter((d, i) => d === key[i]).length
    });
  }

  // Alternative clock: p36 is only a state page, not a key block. Exclude
  // the 238 differences ending on p36 and test the two surrounding ranges.
  const outsideDifferences = [
    ...differences.slice(0, p36Start - 1),
    ...differences.slice(p36Start + p36.length - 1)
  ];
  const outsideKey = [...keyBefore, ...keyAfter];
  assert.equal(outsideDifferences.length, 12717);
  assert.equal(outsideKey.length, outsideDifferences.length);
  for (const sign of [-1, 1]) {
    const plain = outsideDifferences.map((d, i) => mod(d + sign * outsideKey[i]));
    stateOnlyVariants.push({
      seedOrder: reverseSeed ? "reversed" : "printed",
      sign,
      symbols: plain.length,
      ioc: ioc(plain),
      top: top(plain),
      prefix: prefix(plain)
    });
  }
}

const known = corpus.pages.find(p => p.page === 57).indices;
const planted = Array.from({ length: all.length }, (_, i) => known[i % known.length]);

// Zero-suppressed variant: the contemporary 2014 discussion explicitly
// described deleting zeroes from 1033/3301 to obtain 133/331. As a separate,
// clue-motivated (but not authenticated) extension, suppress zero outputs of
// the p36 recurrence so the key alphabet is exactly the 28 nonzero GP steps.
function collectNonzero(step, state, wanted) {
  const values = [];
  let generated = 0;
  let skippedZero = 0;
  while (values.length < wanted) {
    const value = step(state);
    generated++;
    if (value === 0) skippedZero++;
    else values.push(value);
    assert(generated < wanted * 2, "unexpected zero-suppression rate");
  }
  return { values, generated, skippedZero };
}
const zeroSuppressedVariants = [];
const zeroSuppressedControls = [];
for (const reverseSeed of [false, true]) {
  const orientedSeed = reverseSeed ? p36.slice().reverse() : p36.slice();

  const beforeState = orientedSeed.slice();
  const beforeRaw = collectNonzero(previous, beforeState, p36Start - 1);
  const keyBefore = beforeRaw.values.reverse();

  const afterState = orientedSeed.slice();
  const afterRaw = collectNonzero(next, afterState, after.length);
  const keyAfter = afterRaw.values.slice();

  const key = [...keyBefore, ...keyAfter];
  const outsideDifferences = [
    ...differences.slice(0, p36Start - 1),
    ...differences.slice(p36Start + p36.length - 1)
  ];
  assert.equal(key.length, 12717);
  assert.equal(outsideDifferences.length, key.length);
  assert(key.every(x => x !== 0));

  for (const sign of [-1, 1]) {
    const plain = outsideDifferences.map((d, i) => mod(d + sign * key[i]));
    zeroSuppressedVariants.push({
      seedOrder: reverseSeed ? "reversed" : "printed",
      sign,
      symbols: plain.length,
      ioc: ioc(plain),
      top: top(plain),
      prefix: prefix(plain),
      beforeGenerated: beforeRaw.generated,
      beforeSkippedZero: beforeRaw.skippedZero,
      afterGenerated: afterRaw.generated,
      afterSkippedZero: afterRaw.skippedZero
    });
  }

  // Positive control for the same disjoint outside-p36 clock.
  const plantedOutside = [
    ...planted.slice(1, p36Start),
    ...planted.slice(p36Start + p36.length)
  ];
  const syntheticCipher = [planted[0]];
  let keyIndex = 0;
  for (let i = 1; i < planted.length; i++) {
    const outside = i < p36Start || i >= p36Start + p36.length;
    const k = outside ? key[keyIndex++] : 0; // arbitrary key inside excluded p36
    syntheticCipher.push(mod(syntheticCipher[i - 1] + planted[i] + k));
  }
  assert.equal(keyIndex, key.length);
  const syntheticDifferences = syntheticCipher.slice(1).map((x, i) => mod(x - syntheticCipher[i]));
  const syntheticOutside = [
    ...syntheticDifferences.slice(0, p36Start - 1),
    ...syntheticDifferences.slice(p36Start + p36.length - 1)
  ];
  const recovered = syntheticOutside.map((d, i) => mod(d - key[i]));
  assert(recovered.every((x, i) => x === plantedOutside[i]));
  zeroSuppressedControls.push({
    seedOrder: reverseSeed ? "reversed" : "printed",
    recoveredSymbols: recovered.length,
    exactRoundTrip: true
  });
}

// Positive control: encrypt a known p57-derived stream under the exact
// chain-additive model and recover every difference-domain plaintext rune.
const controlKey = makeAnchoredKey(false).key;
const syntheticCipher = [planted[0]];
for (let i = 1; i < planted.length; i++) {
  syntheticCipher.push(mod(syntheticCipher[i - 1] + planted[i] + controlKey[i - 1]));
}
const syntheticDifferences = syntheticCipher.slice(1).map((x, i) => mod(x - syntheticCipher[i]));
const syntheticRecovered = syntheticDifferences.map((d, i) => mod(d - controlKey[i]));
assert(syntheticRecovered.every((x, i) => x === planted[i + 1]));

const output = {
  model: "Delta(C)[i] = P[i] + K[i] mod 29; K is the p36-anchored R238 recurrence key",
  source: {
    corpus: "resources/liber-primus/lp2-corpus.json",
    table: "resources/liber-primus/lp2-grid-256.json",
    recurrence: "unique monic degree-238 factor after exact small-factor division"
  },
  input: {
    unknownRunes: all.length,
    differenceSymbols: differences.length,
    p36Start: p36Start,
    p36SeedLength: p36.length,
    beforeDifferences: p36Start - 1,
    p36KeyBlock: p36.length,
    afterDifferences: after.length,
    rawCipherIoC: ioc(all),
    rawDifferenceIoC: ioc(differences),
    zeroSteps: deltaCounts[0],
    nonzeroStepCounts: nonzero,
    nonzeroStepMin: Math.min(...nonzero),
    nonzeroStepMax: Math.max(...nonzero),
    nonzeroStepChiSquare: nonzeroChiSquare,
    nonzeroStepDegreesOfFreedom: 27,
    p57NativeIoC: ioc(known)
  },
  completeVariants,
  stateOnlyVariants,
  zeroSuppressedVariants,
  zeroSuppressedPositiveControls: zeroSuppressedControls,
  positiveControl: {
    recoveredSymbols: syntheticRecovered.length,
    exactRoundTrip: true
  }
};
console.log(JSON.stringify(output, null, 2));
