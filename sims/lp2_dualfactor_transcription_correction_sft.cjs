'use strict';
// GP29 dual-factor checksum and 2014 seven-glyph finite correction gate.
// Run with Node.js 22: node sims/lp2_dualfactor_transcription_correction_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const witness = JSON.parse(fs.readFileSync(path.join(root, 'resources/cicada2014-sexagesimal-source.json'), 'utf8'));

const H = [3, 26, 24]; // signed 2013 BASE29 3301->3QO, ascending
const G = [27, 5, 15]; // p39 red triad at original local rune119
const HG = [23, 21, 11, 17, 12]; // H * G over GF(29)
const M = 29;
/** @param {number} x @returns {number} */
function mod(x) { return (x % M + M) % M; }
/** @param {number} a @returns {number} */
function invert(a) {
  for (let x = 1; x < M; x += 1) if (mod(a * x) === 1) return x;
  throw new Error('Nonunit');
}
/** @param {number[]} polynomial @param {number[]} factor @returns {number[]} */
function remainder(polynomial, factor) {
  const a = polynomial.map(mod);
  const d = factor.length - 1;
  const inverseLeading = invert(factor[d]);
  for (let i = a.length - d - 1; i >= 0; i -= 1) {
    const ratio = mod(a[i + d] * inverseLeading);
    for (let j = 0; j <= d; j += 1) a[i + j] = mod(a[i + j] - ratio * factor[j]);
  }
  return Array.from({ length: d }, (_, i) => a[i] || 0);
}
/** Original byte list printed first→last is reversed for ascending polynomial coefficients.
 * @param {number[]} bytes
 * @param {number[]} factor
 * @returns {number[]}
 */
function syndrome(bytes, factor = HG) { return remainder(bytes.slice().reverse(), factor); }
/** @param {number[]} v */
function isZero(v) { return v.every(x => x === 0); }
/** @param {number[]} v @returns {string} */
function direction(v) {
  const first = v.find(x => x !== 0);
  assert.notEqual(first, undefined);
  return v.map(x => mod(x * invert(first))).join(',');
}

const original = grid.bytes;
const historic = witness.decimal_values;
assert.equal(original.length, 256);
assert.equal(historic.length, 256);
assert.deepEqual(syndrome(original, H), [0, 0]);
assert.deepEqual(syndrome(original, G), [0, 0]);
assert.deepEqual(syndrome(original, HG), [0, 0, 0, 0]);
assert.deepEqual(syndrome(historic, HG), [25, 1, 10, 21]);

const changes = witness.verification.differences_vs_lp2_canonical_grid;
assert.equal(changes.length, 10);
assert.deepEqual(changes.map(x => x.index), [25, 45, 50, 165, 170, 172, 175, 182, 199, 246]);
const correctedIn2014 = new Set([165, 170, 172]);
const seven = changes.filter(x => !correctedIn2014.has(x.index));
assert.equal(seven.length, 7);
const base = historic.slice();
for (const fix of changes.filter(x => correctedIn2014.has(x.index))) base[fix.index] = fix.lp2_value;

/** @param {number[]} prior @param {typeof changes} options @param {number} mask @returns {number[]} */
function choose(prior, options, mask) {
  const selected = prior.slice();
  for (let j = 0; j < options.length; j += 1) {
    if (mask & (1 << j)) selected[options[j].index] = options[j].lp2_value;
  }
  return selected;
}

/** @param {number[]} prior @param {typeof changes} options @param {number[]} factor @returns {number[]} */
function zeroMasks(prior, options, factor) {
  const passed = [];
  for (let mask = 0; mask < (1 << options.length); mask += 1) {
    if (isZero(syndrome(choose(prior, options, mask), factor))) passed.push(mask);
  }
  return passed;
}
const sevenPassed = {
  H: zeroMasks(base, seven, H),
  G: zeroMasks(base, seven, G),
  HG: zeroMasks(base, seven, HG),
};
assert.deepEqual(sevenPassed, { H: [127], G: [127], HG: [127] });
assert.deepEqual(choose(base, seven, 127), original);
const tenPassed = zeroMasks(historic, changes, HG);
assert.deepEqual(tenPassed, [1015, 1023]);
assert.equal(changes[3].index, 165);
assert.equal(mod(changes[3].lp2_value - changes[3].archive_value), 0);

// A degree-four check encodes four residue equations, sufficient to identify
// any one nonzero GF29 symbol corruption in this length-256 table.
const singletonClasses = new Map();
const checkColumns = [];
for (let exponent = 0; exponent < 256; exponent += 1) {
  const monomial = Array(exponent + 1).fill(0);
  monomial[exponent] = 1;
  const basis = remainder(monomial, HG);
  const key = direction(basis);
  assert.equal(singletonClasses.has(key), false);
  singletonClasses.set(key, { exponent, basis });
  checkColumns.push(basis);
}
assert.equal(singletonClasses.size, 256);

/** @param {number[]} residual */
function identifySingleError(residual) {
  const found = singletonClasses.get(direction(residual));
  assert.ok(found);
  const pivot = found.basis.findIndex(x => x !== 0);
  const delta = mod(residual[pivot] * invert(found.basis[pivot]));
  return { printedIndex: 255 - found.exponent, errorResidue: delta };
}

// Verify all 256 cells x 28 possible nonzero field errors by recomputing the
// syndrome against the actual original printed source table.
let planted = 0;
for (let byteIndex = 0; byteIndex < 256; byteIndex += 1) {
  for (let delta = 1; delta < M; delta += 1) {
    const corrupt = original.slice();
    corrupt[byteIndex] = mod(corrupt[byteIndex] + delta);
    const recovered = identifySingleError(syndrome(corrupt));
    assert.deepEqual(recovered, { printedIndex: byteIndex, errorResidue: delta });
    planted += 1;
  }
}
assert.equal(planted, 7168);

console.log(JSON.stringify({
  originalTableDualRemainder: syndrome(original),
  historical2014Remainder: syndrome(historic),
  historicallyExplicitCorrections: [...correctedIn2014].sort((a, b) => a - b),
  sevenUncorrectedAmbiguities: seven.map(x => x.index),
  sevenOptionMasksPassing: sevenPassed,
  allTenOptionMasksPassing: tenPassed,
  undetectableModulo29Difference: { index: 165, historical: 47, corrected: 18 },
  uniqueSingleErrorSyndromeDirections: singletonClasses.size,
  originalTableSingleErrorPlantsRecovered: planted,
  limitation: 'Original dual factors were discovered by factorization of the adjudicated canonical table. This is a retrospective finite correction capability, not an independently predicted checksum design or an LP2 plaintext recovery.',
}, null, 2));
