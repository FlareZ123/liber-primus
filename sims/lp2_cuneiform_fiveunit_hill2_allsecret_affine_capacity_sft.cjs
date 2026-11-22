'use strict';

/**
 * LP2 pp36–38: all-secret affine 2x2 Hill key-capacity gate.
 * Source: two-row sexagesimal illustration, five red numbered units.
 * Use one fixed, arbitrary invertible GF(29) matrix per intact unit;
 * allow both unknown row output translations (different per unit).
 *
 * Each complete rune pair (C0,C1) is mapped to a plaintext pair
 * P0 = a*C0+b*C1+e, P1 = c*C0+d*C1+f (mod29).
 * In an odd-length unit its final original rune is outside this proposed
 * Hill2 block law, and is omitted from the capacity comparison.
 *
 * This script maximizes a strict upper bound on GP29 symbol coincidence
 * simultaneously across ALL 682,080 invertible 2x2 keys and ALL 29^2
 * affine output translations, without enumerating those translations.
 * A rearrangement relaxation makes the bound more generous still.
 *
 * Read-only Windows11 Node22:
 * node sims/lp2_cuneiform_fiveunit_hill2_allsecret_affine_capacity_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} f @returns {string} */
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const pages = corpus.pages;
const units = [
  pages[36].indices.slice(99, 238),
  pages[37].indices.slice(0, 91),
  pages[37].indices.slice(91, 189),
  pages[37].indices.slice(189, 228).concat(pages[38].indices.slice(0, 57)),
  pages[38].indices.slice(57, 186)
];
const lengths = [139, 91, 98, 96, 129];
assert.deepEqual(units.map(x => x.length), lengths);
assert.equal(units.flat().length, 553);
const MOD = 29;
const ROWS = MOD * MOD;

/** @param {number} x @returns {number} */
const mod = x => (x % MOD + MOD) % MOD;

/** @param {number[]} tape @returns {number} */
function ioc(tape) {
  const counts = Array(MOD).fill(0);
  for (const v of tape) counts[v]++;
  return counts.reduce((s, v) => s + v * (v - 1), 0) / (tape.length * (tape.length - 1));
}

/** @param {number[][]} blocks @returns {number[][]} */
function evenBlocks(blocks) {
  return blocks.map(x => x.slice(0, x.length - x.length % 2));
}

/**
 * Compute a universal upper bound for ANY fixed invertible affine Hill2
 * matrix over GF(29), with free independent translations of its two
 * output coordinates. No plaintext scoring, guessed key, or cryptographic
 * state hypothesis enters the bound.
 *
 * For each nonzero row vector (a,b), histogram the output of that row
 * on all source ciphertext pairs; for two rows collect A and B.
 * Both unknown additive translations leave their histograms unchanged,
 * merely relabeling bins. Thus:
 * max sum_x (A[x] + B[x + delta])^2
 * <= sum A[x]^2 + sum B[x]^2 + 2 sum sorted(A)[x]*sorted(B)[x],
 * by rearrangement inequality. Sort-alignment can exceed every legal
 * GF29 offset, so this is deliberately an upper bound, never an exact
 * decryption or falsely optimistic plaintext.
 *
 * @param {number[][]} blocks
 * @returns {{counted:number,upper:number,ratio:string,matrices:number,best:number[]}}
 */
function maxCapacity(blocks) {
  const pairs = [];
  for (const x of blocks) {
    for (let i = 0; i + 1 < x.length; i += 2) pairs.push(x[i] * MOD + x[i + 1]);
  }
  const n = 2 * pairs.length;
  assert(n > 0 && n < 100000);
  const hists = [];
  const squares = new Int32Array(ROWS);
  for (let row = 0; row < ROWS; row++) {
    const a = Math.floor(row / MOD), b = row % MOD;
    const h = new Uint16Array(MOD);
    for (const encoded of pairs) {
      const x = Math.floor(encoded / MOD);
      const y = encoded % MOD;
      h[(a * x + b * y) % MOD]++;
    }
    hists.push(Array.from(h).sort((x, y) => y - x));
    squares[row] = h.reduce((s, v) => s + v * v, 0);
  }
  let maximum = -1;
  let best = [];
  let checked = 0;
  for (let row1 = 0; row1 < ROWS; row1++) {
    const a = Math.floor(row1 / MOD), b = row1 % MOD;
    const H = hists[row1];
    for (let row2 = 0; row2 < ROWS; row2++) {
      const c = Math.floor(row2 / MOD), d = row2 % MOD;
      if (mod(a * d - b * c) === 0) continue;
      checked++;
      const T = hists[row2];
      let dot = 0;
      for (let k = 0; k < MOD; k++) dot += H[k] * T[k];
      const upperNumerator = squares[row1] + squares[row2] + 2 * dot - n;
      if (upperNumerator > maximum) {
        maximum = upperNumerator;
        best = [a, b, c, d];
      }
    }
  }
  assert.equal(checked, 682080);
  return {counted: n, upper: maximum / (n * (n - 1)),
    ratio: maximum + '/' + (n * (n - 1)), matrices: checked, best};
}

/** @param {number[][]} blocks @returns {number[]} */
function flatEven(blocks) { return evenBlocks(blocks).flat(); }

const unknownPerUnit = units.map((unit, j) => ({unit: j + 1, ...maxCapacity([unit])}));
const unknownFirstTwo = maxCapacity(units.slice(0, 2));
const unknownAllFive = maxCapacity(units);
const expected = [
  0.04760393525864805, 0.05393258426966292, 0.053650326109825376,
  0.05416666666666667, 0.05031988188976378
];
for (let i = 0; i < 5; i++) assert.equal(unknownPerUnit[i].upper, expected[i]);
assert.equal(unknownFirstTwo.upper, 0.042120720302960046);
assert.equal(unknownAllFive.upper, 0.03797317436661699);
assert.deepEqual(unknownPerUnit.map(x => x.counted), [138, 90, 98, 96, 128]);
assert.equal(unknownAllFive.counted, 550);

// Native solved-LP1/LP2 GP29 text provides a genuine source-native
// plaintext plant. Preserve all five exact original unit lengths.
const gp = new Map(solved.runes.map((r, i) => [r, i]));
assert.deepEqual(solved.runes, corpus.runes);
const native = solved.sections.flatMap(section =>
  [...section.source_text].map(r => gp.get(r)).filter(v => v !== undefined));
assert(native.length >= 553);
let offset = 0;
const control = lengths.map(n => {
  const segment = native.slice(offset, offset + n);
  offset += n;
  return segment;
});
assert.deepEqual(control.map(x => x.length), lengths);
const donorUnitIoCs = evenBlocks(control).map(ioc);
const donorAllIoC = ioc(flatEven(control));
assert(donorAllIoC > unknownAllFive.upper);
for (let i = 0; i < 5; i++)
  assert(donorUnitIoCs[i] > unknownPerUnit[i].upper);

// Each native unit gets a different arbitrarily selected invertible
// affine 2x2 encryption matrix, with different offsets on its two rows.
const encryptionMatrices = [
  [17, 13, 26, 1], [3, 8, 5, 2], [5, 7, 9, 14],
  [3, 21, 13, 2], [11, 1, 8, 2]
];
const encrypted = control.map((unit, j) => {
  const [a, b, c, d] = encryptionMatrices[j];
  assert.notEqual(mod(a * d - b * c), 0);
  const out = [];
  for (let i = 0; i + 1 < unit.length; i += 2) {
    out.push(mod(a * unit[i] + b * unit[i + 1] + j));
    out.push(mod(c * unit[i] + d * unit[i + 1] + 11 + j));
  }
  if (unit.length % 2) out.push(unit.at(-1));
  return out;
});
const recovered = encrypted.map((unit, j) => {
  const [a, b, c, d] = encryptionMatrices[j];
  const determinant = mod(a * d - b * c);
  const inverseDet = Array.from({length: MOD}, (_, v) => v)
    .find(v => mod(v * determinant) === 1);
  assert.notEqual(inverseDet, undefined);
  const out = [];
  for (let i = 0; i + 1 < unit.length; i += 2) {
    const x = mod(unit[i] - j), y = mod(unit[i + 1] - 11 - j);
    out.push(mod(inverseDet * (d * x - b * y)));
    out.push(mod(inverseDet * (a * y - c * x)));
  }
  if (unit.length % 2) out.push(unit.at(-1));
  return out;
});
assert.deepEqual(recovered, control, 'five independent encrypted source-native controls recover 553/553 GP29 symbols');

// The actual unknown key is not needed for the bound. In contrast,
// when a true English plant has been encrypted with a secret affine
// Hill2 key, its bound MUST admit the real English concentration.
const plantedPerUnit = encrypted.map(unit => maxCapacity([unit]));
for (let j = 0; j < 5; j++)
  assert(plantedPerUnit[j].upper >= donorUnitIoCs[j]);
const sameKeyMatrix = encryptionMatrices[0];
const encryptSameKey = control.map(unit => {
  const [a, b, c, d] = sameKeyMatrix;
  const coded = [];
  for (let i = 0; i + 1 < unit.length; i += 2) {
    coded.push(mod(a * unit[i] + b * unit[i + 1] + 4));
    coded.push(mod(c * unit[i] + d * unit[i + 1] + 9));
  }
  if (unit.length % 2) coded.push(unit.at(-1));
  return coded;
});
const plantedSharedKey = maxCapacity(encryptSameKey);
assert(plantedSharedKey.upper >= donorAllIoC);

console.log(JSON.stringify({
  decision: 'SOURCE-TYPED ALL-SECRET HILL2+AFFINE CAPACITY EXCLUSION',
  sourceUnitLengths: lengths, sourceCountedEvenSymbols: unknownAllFive.counted,
  allInvertibleMatricesPerUnit: 682080, independentTranslationsPerMatrix: 841,
  originalPerUnit: unknownPerUnit, originalFirstTwo: unknownFirstTwo,
  originalAllFiveSharedKey: unknownAllFive,
  solvedNativeGPPositive: {
    totalAvailableNativeRunes: native.length,
    donorUnitEvenIoCs: donorUnitIoCs,
    donorAllEvenIoC: donorAllIoC,
    originalLengthMatchedRunesRecovered: recovered.flat().length,
    differentSecretKeysPlantCapacities: plantedPerUnit.map(x => x.upper),
    sameSecretKeyPlantCapacity: plantedSharedKey.upper
  }
}, null, 2));
