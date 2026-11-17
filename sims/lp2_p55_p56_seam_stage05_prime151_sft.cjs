'use strict';

/**
 * Source-locked two-layer LP2 p55/p56 seam test.
 * Physical p55 has 76 GP runes. Append the first original p56 ciphertext
 * rune to get 77 = 11*7 source runes. The original 2014 Stage05 7-way
 * permutation and the solved p56 consecutive-prime/F-transparent algorithm
 * provide two historically attested operations.
 *
 * FIND on the solved p57 page has GP-prime sum151, supplying a provisional
 * exact starting prime. Combining the operations is a research hypothesis,
 * not an attributed Cicada instruction. No source-derived secret seed is fit.
 *
 * Run: node sims/lp2_p55_p56_seam_stage05_prime151_sft.cjs
 * Read-only. Node22/Windows11 compatible.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'));
const gp = corpus.translit;
const MODULUS = 29;
const mod = (x) => (x % MODULUS + MODULUS) % MODULUS;
const inverse = [0, 6, 2, 5, 1, 4, 3];
const forward = Array(7).fill(0);
inverse.forEach((src, i) => { forward[src] = i; });

/** @param {number[]} input @param {number[]} order @returns {number[]} */
function permute(input, order) {
  assert.equal(input.length % 7, 0);
  const result = [];
  for (let i = 0; i < input.length; i += 7)
    for (let j = 0; j < 7; j++) result.push(input[i + order[j]]);
  return result;
}

/** @param {number} first @param {number} needed @returns {number[]} */
function primeSequence(first, needed) {
  const result = [];
  for (let value = first; result.length < needed; value++) {
    let prime = true;
    for (let div = 2; div * div <= value; div++)
      if (value % div === 0) { prime = false; break; }
    if (prime) result.push(value);
  }
  return result;
}

const prime = primeSequence(151, 100);

/**
 * The known p56 F rule is strict: decoded GP F must have been transmitted
 * literally as ciphertext GP F, and must not consume a prime. Since a
 * ciphertext F can also represent an encrypted non-F, branch both ways.
 * @param {number[]} ciphertext
 * @param {number} sign
 * @returns {{plain:number[],clock:number,skips:number[]}[]}
 */
function inversePrime(ciphertext, sign) {
  /** @type {{plain:number[],clock:number,skips:number[]}[]} */
  let states = [{ plain: [], clock: 0, skips: [] }];
  for (let i = 0; i < ciphertext.length; i++) {
    const next = [];
    for (const state of states) {
      const value = mod(ciphertext[i] + sign * (prime[state.clock] - 1));
      if (value !== 0) next.push({
        plain: [...state.plain, value],
        clock: state.clock + 1,
        skips: state.skips
      });
      if (ciphertext[i] === 0) next.push({
        plain: [...state.plain, 0],
        clock: state.clock,
        skips: [...state.skips, i]
      });
    }
    states = next;
  }
  return states;
}

/** @param {number[]} plaintext @param {number} sign @returns {number[]} */
function forwardPrime(plaintext, sign) {
  let clock = 0;
  return plaintext.map((value) => {
    if (value === 0) return 0;
    const result = mod(value - sign * (prime[clock] - 1));
    clock++;
    return result;
  });
}

/**
 * @param {number[]} ciphertext
 * @param {number[]} order
 * @param {number} sign
 * @param {'permThenPrime'|'primeThenPerm'} operation
 * @returns {{plain:number[],clock:number,skips:number[]}[]}
 */
function decipher(ciphertext, order, sign, operation) {
  const pre = operation === 'permThenPrime'
    ? permute(ciphertext, order) : ciphertext;
  const states = inversePrime(pre, sign);
  return states.map((state) => ({
    ...state,
    plain: operation === 'primeThenPerm'
      ? permute(state.plain, order) : state.plain
  }));
}

/**
 * @param {number[]} plaintext
 * @param {number[]} order
 * @param {number[]} reverse
 * @param {number} sign
 * @param {'permThenPrime'|'primeThenPerm'} operation
 * @returns {number[]}
 */
function encipher(plaintext, order, reverse, sign, operation) {
  return operation === 'permThenPrime'
    ? permute(forwardPrime(plaintext, sign), reverse)
    : forwardPrime(permute(plaintext, reverse), sign);
}

/** @param {number[]} sequence @returns {string} */
function romanize(sequence) {
  return sequence.map((value) => gp[value]).join('');
}

function main() {
  const find = ['F', 'I', 'N', 'D'];
  const sum = find.reduce((s, rune) =>
    s + corpus.prime[gp.indexOf(rune)], 0);
  assert.equal(sum, 151);
  assert.equal(prime[0], 151);

  const page55 = corpus.pages[55].indices;
  const page56 = corpus.pages[56].indices;
  const page57 = corpus.pages[57].indices;
  assert.equal(page55.length, 76);
  assert.equal(page56.length, 85);
  assert.equal(page57.length, 95);
  assert.equal(page56[0], 25); // Ciphertext AE, verified solved plaintext A.
  const source = page55.concat(page56[0]);
  const positivePlaintext = page57.slice(0, 77);
  assert.equal(source.length, 77);
  assert.equal(positivePlaintext.length, 77);
  assert.equal(source.filter((v) => v === 0).length, 3);

  const results = [];
  let totalPlanted = 0;
  for (const [orientation, order, reverse] of [
    ['inverse', inverse, forward], ['forward', forward, inverse]
  ]) {
    for (const sign of [-1, +1]) {
      for (const operation of ['permThenPrime', 'primeThenPerm']) {
        const states = decipher(source, order, sign, operation);
        const matchingP56A = states.filter((s) => s.plain[76] === 24);
        for (const state of states) assert.deepEqual(
          encipher(state.plain, order, reverse, sign, operation),
          source, 'Original-cipher round-trip must be exact');
        const plant = encipher(positivePlaintext, order, reverse, sign, operation);
        const recovered = decipher(plant, order, sign, operation);
        const exactPlants = recovered.filter((s) =>
          s.plain.every((value, i) => value === positivePlaintext[i]));
        assert.equal(exactPlants.length, 1, '77/77 native-GP plant required');
        totalPlanted++;

        const result = {
          orientation,
          sign,
          operation,
          originalSurvivors: states.length,
          p56PlainACompatible: matchingP56A.length,
          survivingTerminalPlainRunes: states.map((s) => gp[s.plain[76]]),
          sourceFSkipPaths: states.map((s) => s.skips),
          first12: states.length ? romanize(states[0].plain.slice(0, 12)) : null,
          exactPlantedRecoveries: exactPlants.length
        };
        assert.equal(result.p56PlainACompatible, 0);
        results.push(result);
      }
    }
  }
  assert.equal(totalPlanted, 8);
  assert.deepEqual(results.map((r) => r.originalSurvivors),
    [0, 0, 0, 2, 0, 0, 2, 2]);
  assert.deepEqual(results.map((r) => r.survivingTerminalPlainRunes),
    [[], [], [], ['D', 'D'], [], [], ['H', 'H'], ['U', 'U']]);
  console.log(JSON.stringify({
    status: 'PASS: original 77-rune seam family has zero known-anchor decodes',
    originalP55Runes: page55.length,
    firstP56CipherRune: gp[page56[0]],
    firstP56EstablishedPlainRune: 'A',
    sourceFINDPrimeSum: sum,
    originalTwoLayerVariants: results,
    nativePositiveDecodes: totalPlanted,
    recoveredUnknownOriginalPlaintext: false
  }, null, 2));
}

if (require.main === module) main();
module.exports = {
  decipher, encipher, forwardPrime, inversePrime, permute
};
