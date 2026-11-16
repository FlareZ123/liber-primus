"use strict";
/**
 * SFT: original LP2 square-page double-root and two-rune prediction gate.
 *
 * Node 22 / CommonJS; no dependencies, writes or guessed English keys.
 * This source report is exploratory. It does not recover manuscript plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const gp = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));

/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;

/**
 * Horner evaluation of a high-degree-first polynomial and its derivative.
 * @param {number[]} coefficients
 * @param {number} root
 * @returns {{value: number, derivative: number}}
 */
function jet(coefficients, root) {
  let value = 0;
  let derivative = 0;
  for (const digit of coefficients) {
    derivative = mod(derivative * root + value);
    value = mod(value * root + digit);
  }
  return {value, derivative};
}

/**
 * Determine the two trailing source-GP29 symbols necessary for a double root
 * at a chosen field value. The initial n-2 source digits alone determine them.
 * @param {number[]} prefix
 * @param {number} root
 * @returns {number[]}
 */
function predictTail(prefix, root) {
  const {value, derivative} = jet(prefix, root);
  const atRoot = mod(root * root * value);
  const firstDerivative = mod(root * root * derivative + 2 * root * value);
  const penultimate = mod(-firstDerivative);
  const last = mod(-atRoot - root * penultimate);
  return [penultimate, last];
}

/**
 * Outermost first, top-left start, clockwise concentric square traversal,
 * retaining exactly every original symbol.
 * @param {number[]} source
 * @returns {number[]}
 */
function peelSquare(source) {
  const width = Math.sqrt(source.length);
  assert(Number.isInteger(width));
  const out = [];
  for (let depth = 0; depth < Math.floor(width / 2); depth++) {
    const high = width - 1 - depth;
    for (let x = depth; x <= high; x++) out.push(source[depth * width + x]);
    for (let y = depth + 1; y <= high; y++) out.push(source[y * width + high]);
    for (let x = high - 1; x >= depth; x--) out.push(source[high * width + x]);
    for (let y = high - 1; y > depth; y--) out.push(source[y * width + depth]);
  }
  if (width % 2) {
    const center = Math.floor(width / 2);
    out.push(source[center * width + center]);
  }
  assert.equal(out.length, source.length);
  assert.deepEqual([...out].sort((a, b) => a - b), [...source].sort((a, b) => a - b));
  return out;
}

/**
 * Every repeated field root on the unmodified source-order polynomial.
 * @param {number[]} original
 * @returns {number[]}
 */
function doubleRoots(original) {
  const result = [];
  for (let root = 0; root < 29; root++) {
    const x = jet(original, root);
    if (x.value === 0 && x.derivative === 0) result.push(root);
  }
  return result;
}

/**
 * @param {number[]} source
 * @param {number} root
 * @returns {{any: number, same: number, sameShifts: number[]}}
 */
function cyclicControls(source, root) {
  let any = 0;
  let same = 0;
  const sameShifts = [];
  for (let shift = 0; shift < source.length; shift++) {
    const rotated = source.slice(shift).concat(source.slice(0, shift));
    const hit = doubleRoots(rotated);
    if (hit.length > 0) any++;
    if (hit.includes(root)) {
      same++;
      sameShifts.push(shift);
    }
  }
  return {any, same, sameShifts};
}

/**
 * @param {number[]} input
 * @returns {number}
 */
function ioc(input) {
  const counts = Array(29).fill(0);
  for (const value of input) counts[value]++;
  const matches = counts.reduce((sum, n) => sum + n * (n - 1), 0);
  return matches / input.length / (input.length - 1);
}

/**
 * Divide high-first coefficients by (X-root) twice, confirming exact zeros.
 * @param {number[]} input
 * @param {number} root
 * @returns {number[]}
 */
function removeDoubleFactor(input, root) {
  let data = input;
  for (let round = 0; round < 2; round++) {
    const output = [data[0]];
    for (let i = 1; i + 1 < data.length; i++) {
      output.push(mod(data[i] + root * output.at(-1)));
    }
    assert.equal(mod(data.at(-1) + root * output.at(-1)), 0);
    data = output;
  }
  return data;
}

const unknown = gp.pages.filter(p => p.page <= 55 && p.indices.length > 0);
assert.equal(unknown.length, 55);
assert.equal(unknown.reduce((sum, p) => sum + p.indices.length, 0), 12956);
const squarePages = unknown.filter(p => Number.isInteger(Math.sqrt(p.indices.length)))
  .map(p => p.page);
assert.deepEqual(squarePages, [6, 32], "exact-square original-page selector");
const exceptional = unknown.flatMap(p =>
  doubleRoots(p.indices).map(root => [p.page, root]));
assert.deepEqual(exceptional, [[0, 10], [6, 3], [29, 24], [32, 27]]);
const fixtures = [
  {page: 6, root: 3, tail: [24, 15], ringJet: [18, 22],
    any: 6, same: 6, quotientIoc: 0.035842102451792104},
  {page: 32, root: 27, tail: [17, 12], ringJet: [13, 15],
    any: 6, same: 1, quotientIoc: 0.033328585671556755}
];
const results = [];
for (const spec of fixtures) {
  const source = gp.pages[spec.page].indices;
  assert.deepEqual(jet(source, spec.root), {value: 0, derivative: 0});
  const predicted = predictTail(source.slice(0, -2), spec.root);
  assert.deepEqual(predicted, spec.tail, "source-fixed trailing two rune prediction");
  assert.deepEqual(source.slice(-2), predicted);
  const peel = peelSquare(source);
  const ringJet = jet(peel, spec.root);
  assert.deepEqual([ringJet.value, ringJet.derivative], spec.ringJet);
  const control = cyclicControls(source, spec.root);
  assert.equal(control.any, spec.any);
  assert.equal(control.same, spec.same);
  assert.deepEqual(control.sameShifts.slice(0, 1), [0]);
  const quotient = removeDoubleFactor(source, spec.root);
  assert.equal(quotient.length, source.length - 2);
  assert(Math.abs(ioc(quotient) - spec.quotientIoc) < 1e-12);
  // Independent full-length native-GP plaintext plant: withhold source tail.
  const plain = gp.pages[57].indices;
  const plantPrefix = Array.from({length: source.length - 2},
    (_, i) => plain[i % plain.length]);
  const planted = [...plantPrefix, ...predictTail(plantPrefix, spec.root)];
  assert.deepEqual(jet(planted, spec.root), {value: 0, derivative: 0});
  assert.deepEqual(predictTail(planted.slice(0, -2), spec.root),
    planted.slice(-2));
  const tampered = [...planted];
  tampered[tampered.length - 1] = mod(tampered.at(-1) + 1);
  assert.notDeepEqual(jet(tampered, spec.root), {value: 0, derivative: 0});
  results.push({page: spec.page, side: Math.sqrt(source.length),
    root: spec.root, tail: predicted, tailRunes: predicted.map(x => gp.runes[x]).join(""),
    ringJet, quotientIoc: ioc(quotient), cyclic: control});
}
/** @param {number} base @param {number} exponent @returns {number} */
function powMod(base, exponent) {
  let x = 1;
  for (let i = 0; i < exponent; i++) x = mod(x * base);
  return x;
}
assert.equal(powMod(3, 3), 27);
assert.equal(powMod(27, 19), 3);
assert.equal(results[0].cyclic.any * results[1].cyclic.any, 36);
const conditionalRate = 36 / (196 * 121);
assert(Math.abs(conditionalRate - 0.001517962556923596) < 1e-12);
console.log(JSON.stringify({squarePages, exceptionalDoubleRoots: exceptional,
  squarePageOriginals: results, jointAnyRootRotationFraction: conditionalRate,
  plaintextRecovered: false}, null, 2));
