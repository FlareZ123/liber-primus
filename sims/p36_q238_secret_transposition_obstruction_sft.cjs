/**
 * Q238 / p36 stationary-symbol transfer gate.
 *
 * Direct source arithmetic over GF(29) without plaintext fitting.
 * Run from repository root: node sims/p36_q238_secret_transposition_obstruction_sft.cjs
 *
 * @typedef {number[]} Vector
 */
'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { join } = require('node:path');

const ROOT = join(__dirname, '..');
const MOD = 29;
const GRID_HASH = '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';
const Q238_HASH = '9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3';

/**
 * @param {Vector} a
 * @param {Vector} b
 * @returns {Vector}
 */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] = (result[i + j] + a[i] * b[j]) % MOD;
    }
  }
  return result;
}

/**
 * Monic polynomial long division; ascending coefficient convention.
 * @param {Vector} source
 * @param {Vector} divisor
 * @returns {{ quotient: Vector, remainder: Vector }}
 */
function divide(source, divisor) {
  assert.equal(divisor[divisor.length - 1], 1);
  const remainder = source.slice();
  const quotient = Array(source.length - divisor.length + 1).fill(0);
  for (let i = source.length - 1; i >= divisor.length - 1; i--) {
    const coefficient = remainder[i];
    const at = i - divisor.length + 1;
    quotient[at] = coefficient;
    for (let j = 0; j < divisor.length; j++) {
      remainder[at + j] = (remainder[at + j] - coefficient * divisor[j] + MOD * MOD) % MOD;
    }
  }
  return { quotient, remainder: remainder.slice(0, divisor.length - 1) };
}

/**
 * @param {Vector} symbols
 * @param {number} alphabetSize
 * @returns {Vector}
 */
function histogram(symbols, alphabetSize) {
  const counts = Array(alphabetSize).fill(0);
  for (const symbol of symbols) {
    assert(Number.isInteger(symbol) && symbol >= 0 && symbol < alphabetSize);
    counts[symbol]++;
  }
  return counts;
}

/**
 * Invariant under any bijective symbol relabeling and arbitrary position
 * permutation. Each frequency is an integer-valued symbol multiplicity.
 *
 * @param {Vector} symbols
 * @param {number} alphabetSize
 * @returns {Vector}
 */
function multiplicitySpectrum(symbols, alphabetSize) {
  return histogram(symbols, alphabetSize).filter(n => n !== 0).sort((a, b) => a - b);
}

/**
 * Optimistic maximum matching after an arbitrary bijection of symbol labels
 * AND an arbitrary rearrangement of positions. A mismatch is a necessary
 * symbol alteration; no assumption about a particular secret alphabet.
 *
 * @param {Vector} source
 * @param {Vector} target
 * @param {number} alphabetSize
 * @returns {number}
 */
function minimumSymbolChanges(source, target, alphabetSize) {
  assert.equal(source.length, target.length);
  const a = histogram(source, alphabetSize).sort((x, y) => y - x);
  const b = histogram(target, alphabetSize).sort((x, y) => y - x);
  let best = 0;
  for (let i = 0; i < alphabetSize; i++) best += Math.min(a[i], b[i]);
  return source.length - best;
}

/**
 * @param {Vector} values
 * @param {'adjacent'|'halves'} kind
 * @returns {Vector}
 */
function packPairs(values, kind) {
  assert.equal(values.length, 238);
  return Array.from({ length: 119 }, (_, i) => {
    const left = kind === 'adjacent' ? values[2 * i] : values[i];
    const right = kind === 'adjacent' ? values[2 * i + 1] : values[i + 119];
    return left + MOD * right;
  });
}

function main() {
  const grid = JSON.parse(readFileSync(join(ROOT, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
  const corpus = JSON.parse(readFileSync(join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const bytes = grid.byte_rows.flat();
  const p36 = corpus.pages[36].indices;
  assert.equal(bytes.length, 256);
  assert.equal(p36.length, 238);
  assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'), GRID_HASH);

  // All small factors are independently frozen from the original table.
  // The polynomial is P(X) = -small(X) * Q238(X), interpreted as high-to-low
  // printed byte residues. x+5 occurs twice.
  const small = [
    [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
    [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
  ].reduce(multiply, [1]);
  assert.equal(small.length, 17);
  const highToLow = bytes.map(value => value % MOD);
  assert.equal(highToLow[0], 0);
  // Remove the leading zero coefficient of the printed 256-slot polynomial.
  const { quotient, remainder } = divide(highToLow.reverse().slice(0, -1), small);
  assert(remainder.every(n => n === 0));
  const qHigh = quotient.map(n => (MOD - n) % MOD).reverse();
  assert.equal(qHigh.length, 239);
  assert.equal(qHigh[0], 1);
  assert.equal(createHash('sha256').update(Buffer.from(qHigh)).digest('hex'), Q238_HASH);
  const q238 = qHigh.slice(1);

  const rawSpectrum = multiplicitySpectrum(q238, MOD);
  const p36Spectrum = multiplicitySpectrum(p36, MOD);
  const symbolEdits = minimumSymbolChanges(q238, p36, MOD);
  assert.notDeepEqual(rawSpectrum, p36Spectrum);
  assert.equal(symbolEdits, 16);
  assert.equal(new Set(q238).size, MOD);
  assert.equal(new Set(p36).size, MOD);

  // Blind positive: arbitrary invertible secret alphabet and index shuffle
  // preserve the necessary multiset criterion.
  const planted = Array.from({ length: 238 }, (_, i) => (7 * q238[(97 * i) % 238] + 13) % MOD);
  assert.deepEqual(multiplicitySpectrum(planted, MOD), rawSpectrum);

  /** @type {Array<{source: string, target: string, inputDistinct: number, outputDistinct: number, forcedEdits: number}>} */
  const pairCases = [];
  for (const sourceKind of ['adjacent', 'halves']) {
    for (const targetKind of ['adjacent', 'halves']) {
      const source = packPairs(q238, sourceKind);
      const target = packPairs(p36, targetKind);
      const inputDistinct = new Set(source).size;
      const outputDistinct = new Set(target).size;
      const forcedEdits = minimumSymbolChanges(source, target, MOD * MOD);
      assert.equal(inputDistinct, 109);
      assert(outputDistinct === 111 || outputDistinct === 114);
      assert(inputDistinct < outputDistinct,
        'Even a many-to-one stationary map cannot increase distinct paired symbols.');
      assert(forcedEdits >= 2);
      pairCases.push({ source: sourceKind, target: targetKind,
        inputDistinct, outputDistinct, forcedEdits });
    }
  }
  assert.deepEqual(pairCases.map(p => p.forcedEdits), [5, 3, 5, 2]);

  // The other immediate 238-symbol view keeps the monic leading unit and
  // discards the constant coefficient. It is a separate natural endpoint
  // convention, so test it independently rather than generalizing from the
  // nonleading coefficient stream above.
  const alternate238 = qHigh.slice(0, -1);
  const alternateEdits = minimumSymbolChanges(alternate238, p36, MOD);
  assert.equal(alternate238.length, 238);
  assert.equal(new Set(alternate238).size, MOD);
  assert.notDeepEqual(multiplicitySpectrum(alternate238, MOD), p36Spectrum);
  assert.equal(alternateEdits, 16);

  /** @type {Array<{source: string, target: string, inputDistinct: number, outputDistinct: number, forcedEdits: number, noDeterministicMap: boolean}>} */
  const alternatePairs = [];
  for (const sourceKind of ['adjacent', 'halves']) {
    for (const targetKind of ['adjacent', 'halves']) {
      const source = packPairs(alternate238, sourceKind);
      const target = packPairs(p36, targetKind);
      const inputDistinct = new Set(source).size;
      const outputDistinct = new Set(target).size;
      const forcedEdits = minimumSymbolChanges(source, target, MOD * MOD);
      // Distinct-output growth forbids a stationary function. The remaining
      // 112 -> 111 case still forbids an invertible stationary function:
      // any pair-alphabet bijection preserves multiplicity spectra exactly.
      assert(forcedEdits > 0);
      alternatePairs.push({
        source: sourceKind, target: targetKind, inputDistinct,
        outputDistinct, forcedEdits,
        noDeterministicMap: inputDistinct < outputDistinct
      });
    }
  }
  assert.deepEqual(alternatePairs.map(p => p.forcedEdits), [2, 1, 5, 2]);
  assert.deepEqual(alternatePairs.map(p => p.noDeterministicMap), [true, false, true, true]);

  // Full 841-symbol permutation + arbitrary pair-position permutation plant.
  const originalPairs = packPairs(q238, 'adjacent');
  const pairedPlant = Array.from({ length: 119 }, (_, i) =>
    (31 * originalPairs[(37 * i) % 119] + 71) % (MOD * MOD));
  assert.deepEqual(
    multiplicitySpectrum(originalPairs, MOD * MOD),
    multiplicitySpectrum(pairedPlant, MOD * MOD)
  );

  console.log(JSON.stringify({
    source: 'authentic base60-grid.json and physical p36',
    q238Degree: 238,
    comparedGPsymbols: 238,
    stationarySymbolRelabelingPossible: false,
    minimumEditsAfterAnySecretRelabelingAndAnyPermutation: symbolEdits,
    sourceGPFrequencySpectrum: rawSpectrum,
    p36GPFrequencySpectrum: p36Spectrum,
    pairedModels: pairCases,
    alternate238Endpoint: 'retain monic coefficient, discard constant coefficient',
    alternate238MinSymbolEdits: alternateEdits,
    alternate238Pairs: alternatePairs,
    originalPolynomialDivisionRemainder: remainder,
    positiveControls: '29-symbol and 841-symbol blind secret-permutation plants pass'
  }, null, 2));
}

main();
