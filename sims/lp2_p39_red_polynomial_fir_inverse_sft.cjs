#!/usr/bin/env node
'use strict';

/**
 * Source-selected GF(29) finite-impulse-response inverse.
 *
 * The red p39 rune triple [27,5,15] defines a quadratic polynomial.
 * The two possible coefficient orders are applied literally as the
 * coefficients of P[i], P[i-1], P[i-2] for a reversible 2-tap filter:
 *   C[i] = a*P[i] + 5*P[i-1] + d*P[i-2] (mod 29)
 * where (a,d) = (27,15) or (15,27).
 *
 * Every one of the 29^2 starting-state pairs is evaluated, with both
 * directions of the untouched original text. No keys or resegmentation
 * are fitted to English. This tests a direct polynomial-inversion route,
 * not the older, distinct proposal that p39's polynomial seeds an LFSR.
 *
 * Single runnable Windows test:
 *   node sims/lp2_p39_red_polynomial_fir_inverse_sft.cjs
 *
 * Original pages and three historical-literary controls load from
 * repository resources. No network, CLI dependencies or file writes.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const load = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const GP = corpus.translit.map((t, i) => ({t, i}))
  .sort((a, b) => b.t.length - a.t.length);
const COEFFICIENTS = [[27, 5, 15], [15, 5, 27]];
const MODULUS = 29;
const ALPHA = 0.2;

/** @param {number} n @returns {number} */
function mod(n) {
  return (n % MODULUS + MODULUS) % MODULUS;
}

/**
 * Native GP29 encoding used in source-language controls. It preserves
 * specific ING and IO ligatures and normalizes native GP orthography.
 * @param {string} original
 * @returns {number[]}
 */
function gpNative(original) {
  const words = original.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S')
    .match(/[A-Z]+/g) || [];
  const runes = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        runes.push(21);
        i += 3;
      } else if (word.startsWith('IO', i)) {
        runes.push(27);
        i += 2;
      } else {
        const t = GP.find(x => word.startsWith(x.t, i));
        if (t) {
          runes.push(t.i);
          i += t.t.length;
        } else {
          i++;
        }
      }
    }
  }
  return runes;
}

/**
 * @param {number[]} ciphertext
 * @param {number[]} coeff
 * @param {number} prev2 plaintext value immediately before prev1
 * @param {number} prev1 preceding plaintext value
 * @returns {number[]}
 */
function inverse(ciphertext, coeff, prev2, prev1) {
  const [a, b, d] = coeff;
  const inverseA = a === 27 ? 14 : 2;
  const plain = [];
  for (const value of ciphertext) {
    const current = mod(inverseA * (value - b * prev1 - d * prev2));
    plain.push(current);
    prev2 = prev1;
    prev1 = current;
  }
  return plain;
}

/**
 * @param {number[]} plaintext
 * @param {number[]} coeff
 * @param {number} prev2
 * @param {number} prev1
 * @returns {number[]}
 */
function forward(plaintext, coeff, prev2, prev1) {
  const ciphertext = [];
  const [a, b, d] = coeff;
  for (const value of plaintext) {
    ciphertext.push(mod(a * value + b * prev1 + d * prev2));
    prev2 = prev1;
    prev1 = value;
  }
  return ciphertext;
}

/**
 * Fixed native GP trigram likelihood with additive smoothing.
 * @param {number[]} native
 * @returns {Float64Array}
 */
function train(native) {
  const triple = new Uint32Array(29 ** 3);
  const pair = new Uint32Array(29 ** 2);
  for (let i = 2; i < native.length; i++) {
    triple[native[i - 2] * 841 + native[i - 1] * 29 + native[i]]++;
    pair[native[i - 2] * 29 + native[i - 1]]++;
  }
  const ll = new Float64Array(triple.length);
  for (let i = 0; i < ll.length; i++) {
    ll[i] = Math.log((triple[i] + ALPHA) /
      (pair[Math.floor(i / 29)] + 29 * ALPHA));
  }
  return ll;
}

/**
 * @param {number[]} data
 * @param {Float64Array} ll
 * @returns {number}
 */
function score(data, ll) {
  let out = 0;
  for (let i = 2; i < data.length; i++) {
    out += ll[data[i - 2] * 841 + data[i - 1] * 29 + data[i]];
  }
  return out / (data.length - 2);
}

/**
 * Every secret two-rune start is enumerated, without any plaintext guess.
 * @param {number[]} ciphertext
 * @param {number[]} coeff
 * @param {Float64Array} ll
 * @returns {{seed:number[], score:number, plain:number[]}}
 */
function solve(ciphertext, coeff, ll) {
  let best = {seed: [], score: -Infinity, plain: []};
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      const plain = inverse(ciphertext, coeff, a, b);
      const value = score(plain, ll);
      if (value > best.score) {
        best = {seed: [a, b], score: value, plain};
      }
    }
  }
  return best;
}

function main() {
  assert.equal(corpus.runes.length, 29);
  assert.equal(COEFFICIENTS[0][0] * 14 % 29, 1);
  assert.equal(COEFFICIENTS[1][0] * 2 % 29, 1);
  assert.equal(corpus.pages.filter(x => x.page <= 55)
    .reduce((n, p) => n + p.indices.length, 0), 12956);

  const training = gpNative(
    load('resources/control/shakespeare_first300k.txt') + '\n' +
    load('resources/control/emerson_essays_2944.txt'));
  const withheld = gpNative(
    load('resources/control/gibran_prophet_58585.txt'));
  assert(training.length > 500000 && withheld.length > 60000);
  const ll = train(training);

  const planted = withheld.slice(5000, 5250);
  const seeded = [3, 21];
  const encrypted = forward(planted, COEFFICIENTS[0], ...seeded);
  const plantedWinner = solve(encrypted, COEFFICIENTS[0], ll);
  assert.deepEqual(plantedWinner.seed, seeded);
  assert.deepEqual(plantedWinner.plain, planted);
  assert.deepEqual(forward(plantedWinner.plain, COEFFICIENTS[0], ...seeded),
    encrypted);

  const targets = [
    ['p0-black', corpus.pages[0].indices.slice(13)],
    ['p1', corpus.pages[1].indices],
    ['p29', corpus.pages[29].indices],
    ['p34', corpus.pages[34].indices],
    ['p35', corpus.pages[35].indices],
    ['p36', corpus.pages[36].indices],
    ['p37', corpus.pages[37].indices],
    ['p38', corpus.pages[38].indices],
    ['p39', corpus.pages[39].indices],
    ['p34-p39-whole-chapter', corpus.pages.slice(34, 40)
      .flatMap(p => p.indices)],
    ['p55', corpus.pages[55].indices]
  ];
  const results = [];
  for (const [name, original] of targets) {
    const orientations = [];
    for (const coeff of COEFFICIENTS) {
      for (const direction of ['forward', 'reverse']) {
        const ciphertext = direction === 'forward'
          ? original : original.slice().reverse();
        const winner = solve(ciphertext, coeff, ll);
        const reencoded = forward(winner.plain, coeff, ...winner.seed);
        assert.deepEqual(reencoded, ciphertext);
        orientations.push({
          coeff,
          direction,
          score: winner.score,
          seed: winner.seed,
          initialRunes: winner.plain.slice(0, 36)
            .map(v => corpus.translit[v]).join(' ')
        });
      }
    }
    orientations.sort((a, b) => b.score - a.score);
    results.push({
      page: name,
      originalRunes: original.length,
      best: orientations[0],
      allFourScores: orientations.map(x => ({
        coeff: x.coeff,
        direction: x.direction,
        score: x.score
      }))
    });
  }
  const control = {
    originalGP29Runes: 12956,
    trainingRunes: training.length,
    withheldGibranRunes: withheld.length,
    plantedLength: planted.length,
    plantedSeedRecovered: plantedWinner.seed,
    plantedScore: plantedWinner.score,
    plantedReencryptedExact: true
  };
  // All long originals must fail the frozen native GP reference gate.
  const maxOriginal = Math.max(...results.map(x => x.best.score));
  assert(maxOriginal < -3.8,
    'A page unexpectedly crossed the native reference score gate.');
  assert(plantedWinner.score > -3.5);

  console.log(JSON.stringify({
    classification: 'negative direct p39-polynomial FIR source cipher',
    exactTestedSourceOrders: COEFFICIENTS,
    directions: 2,
    allSecretStartsPerOrder: 841,
    nativeGP29Positive: control,
    originalCandidates: results,
    interpretation: 'No original page yields a native English-like ' +
      'trigram sequence under this precise second-order reversible ' +
      'polynomial filter. Does not exclude changed clocks, nonlocal ' +
      'operators, ciphertext feedback or a different plaintext register.'
  }, null, 2));
}

if (require.main === module) main();

module.exports = {gpNative, mod, inverse, forward, score, train, solve};
