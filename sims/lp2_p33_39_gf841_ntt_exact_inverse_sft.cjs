'use strict';

/**
 * A complete, source-selected 840-point finite-field NTT inverse on the
 * original pp33-39, plus source-native solved-p57 encryption/decryption plants.
 * Run using Node.js 22: node sims/lp2_p33_39_gf841_ntt_exact_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const MODULUS = 29;
const LENGTH = 840;
const ROOT = [19, 13];

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % MODULUS) + MODULUS) % MODULUS;
}

/**
 * Field F29[u]/(u*u - 3*u - 8).
 * @param {[number,number]} left
 * @param {[number,number]} right
 * @returns {[number,number]}
 */
function multiply(left, right) {
  const [a, b] = left;
  const [c, d] = right;
  return [mod(a * c + 8 * b * d), mod(a * d + b * c + 3 * b * d)];
}

/** @type {Array<[number,number]>} */
const powers = [[1, 0]];
for (let i = 1; i <= LENGTH; i += 1) {
  powers.push(multiply(powers[powers.length - 1], ROOT));
}
assert.deepEqual(powers[30], [11, 0]);
assert.deepEqual(powers[420], [28, 0]);
assert.deepEqual(powers[840], [1, 0]);
assert.equal(new Set(powers.slice(0, LENGTH).map(([a, b]) => 29 * a + b)).size, 840);

/**
 * Evaluate the finite-field Fourier map at all 840 group powers. The inverse
 * uses exponent -jk and multiplier 1/840 == -1 modulo 29.
 * @param {number[]} runes
 * @param {boolean} inverse
 * @returns {number[]}
 */
function transform(runes, inverse) {
  assert.equal(runes.length, 2 * LENGTH);
  const out = [];
  for (let k = 0; k < LENGTH; k += 1) {
    const step = powers[(inverse ? LENGTH - k : k) % LENGTH];
    /** @type {[number,number]} */
    let power = [1, 0];
    let a = 0;
    let b = 0;
    for (let j = 0; j < LENGTH; j += 1) {
      const [x, y] = multiply(power, [runes[2 * j], runes[2 * j + 1]]);
      a += x;
      b += y;
      power = multiply(power, step);
    }
    out.push(mod(inverse ? -a : a), mod(inverse ? -b : b));
  }
  return out;
}

/**
 * Reverse whole-pair order and/or the two basis coefficients. These reflect
 * only the two printed orientation ambiguities, no fitted key/phase.
 * @param {number[]} original
 * @param {boolean} reverse
 * @param {boolean} swap
 * @returns {number[]}
 */
function orient(original, reverse, swap) {
  const pairs = Array.from({length: LENGTH},
    (_, i) => [original[2 * i], original[2 * i + 1]]);
  if (reverse) pairs.reverse();
  if (swap) {
    for (const pair of pairs) pair.reverse();
  }
  return pairs.flat();
}

/** @param {number[]} symbols @returns {number} */
function normalizedIoc(symbols) {
  const bins = Array(29).fill(0);
  for (const x of symbols) bins[x] += 1;
  return 29 * bins.reduce((sum, n) => sum + n * (n - 1), 0)
    / (symbols.length * (symbols.length - 1));
}

function main() {
  const physical = corpus.pages.filter(p => p.page >= 33 && p.page <= 39);
  assert.deepEqual(physical.map(p => p.indices.length),
    [214, 261, 271, 238, 228, 228, 240]);
  const input = physical.flatMap(p => p.indices);
  assert.equal(input.length, 1680);
  const solved = corpus.pages.find(p => p.page === 57).indices;
  assert.equal(solved.length, 95);

  const plant = Array.from({length: 1680}, (_, i) => solved[i % solved.length]);
  const encrypted = transform(plant, false);
  const decrypted = transform(encrypted, true);
  assert.deepEqual(decrypted, plant, 'source-native GP plaintext recovered');
  assert.deepEqual(transform(transform(plant, true), false), plant,
    'both finite-field Fourier directions invert exactly');

  const sourceIoc = normalizedIoc(input);
  const benchmark = normalizedIoc(plant);
  /** @type {Array<{reversed:boolean,swapped:boolean,inverse:boolean,ioc:number,opening:string}>} */
  const results = [];
  for (const reversed of [false, true]) {
    for (const swapped of [false, true]) {
      const oriented = orient(input, reversed, swapped);
      for (const inverse of [false, true]) {
        const output = transform(oriented, inverse);
        const ioc = normalizedIoc(output);
        const opening = output.slice(0, 40).map(x => corpus.translit[x]).join('');
        results.push({reversed, swapped, inverse, ioc, opening});
        assert.ok(ioc < 1.15, 'no original output has native-GP concentration');
      }
    }
  }
  assert.ok(Math.abs(sourceIoc - 0.9964406250886298) < 1e-9);
  assert.ok(Math.abs(Math.max(...results.map(r => r.ioc))
    - 1.012150089) < 1e-7);
  console.log(JSON.stringify({
    event: 'original_gf841_840point_ntt',
    exact_source: 'LP2 physical pp33-39, 1680 canonical GP runes',
    field: 'GF29[u]/(u^2-3u-8)',
    source_primitive_generator: ROOT,
    source_generator_order: 840,
    no_free_parameters: true,
    original_ioc29: sourceIoc,
    solved_p57_1680rune_plant_ioc29: benchmark,
    planted_exact_gp_recovery: decrypted.length,
    variants: results,
    plaintext_recovered: 0
  }));
}

main();
