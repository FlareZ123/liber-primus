'use strict';

/**
 * An original-input gate for a first-order GF(29) ciphertext-feedback cipher.
 *
 * The proposed model is C_t = P_t + S_t (mod 29),
 * S_(t+1) = a*S_t + b*C_t + c (mod 29), with a shared page IV.
 *
 * Hypotheses intentionally grant the p27/p55 repeated six-rune ciphertext
 * *the stronger condition* of repeated plaintext (equal entering states).
 * The p55 state is provisionally carried across the p55/p56 physical seam.
 * Authentic p56 cleartext starts A, N, E, under its separately established
 * prime-totient key. No further original unknown-page plaintext is assumed.
 *
 * SFT: node sims/lp2_p27_p55_affine_cipherfeedback_state_sft.cjs
 * Works from repository root under Node 22 on Windows 11.
 */
const assert = require('node:assert/strict');
const path = require('node:path');
const corpus = require(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'));

const MOD = 29;

/** @param {number} value @returns {number} */
function gp(value) {
  return ((value % MOD) + MOD) % MOD;
}

/**
 * @param {number} a
 * @param {number} initial
 * @param {number} b
 * @param {number} c
 * @param {readonly number[]} cipher
 * @param {number} length
 * @returns {number}
 */
function evolve(a, initial, b, c, cipher, length) {
  let state = initial;
  for (let index = 0; index < length; index++) {
    state = gp(a * state + b * cipher[index] + c);
  }
  return state;
}

/**
 * @param {readonly number[]} plain
 * @param {{a:number, b:number, c:number, iv:number}} key
 * @returns {number[]}
 */
function encrypt(plain, key) {
  let state = key.iv;
  const cipher = [];
  for (const symbol of plain) {
    const output = gp(symbol + state);
    cipher.push(output);
    state = gp(key.a * state + key.b * output + key.c);
  }
  return cipher;
}

/**
 * @param {readonly number[]} cipher
 * @param {{a:number, b:number, c:number, iv:number}} key
 * @returns {number[]}
 */
function decrypt(cipher, key) {
  let state = key.iv;
  const plain = [];
  for (const symbol of cipher) {
    plain.push(gp(symbol - state));
    state = gp(key.a * state + key.b * symbol + key.c);
  }
  return plain;
}

/** @param {number} page @returns {number[]} */
function original(page) {
  const found = corpus.pages.find((entry) => entry.page === page);
  assert.ok(found, 'Missing original page ' + page);
  return found.indices;
}

const p27 = original(27);
const p55 = original(55);
const p56 = original(56);
const p57 = original(57);

assert.equal(p27.length, 234);
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
assert.deepEqual(p27.slice(28, 34), p55.slice(70, 76));
assert.equal(p27[34], p56[0]);
assert.deepEqual(p56.slice(0, 3), [25, 11, 22]);

// The authentic p56 plaintext starts ANE..., under key offsets 1,2,4.
const known56 = [24, 9, 18];
const knownStates = known56.map((symbol, i) => gp(p56[i] - symbol));
assert.deepEqual(knownStates, [1, 2, 4]);

// Source-native language regression: every 95-rune clear p57 sequence
// exactly survives the model's independently planted forward/inverse.
const planted = { a: 7, b: 11, c: 3, iv: 5 };
assert.deepEqual(decrypt(encrypt(p57, planted), planted), p57);
assert.notDeepEqual(encrypt(p57, planted), p57);

let one = 0;
let two = 0;
let three = 0;
let noninjectiveOne = 0;
let noninjectiveTwo = 0;
const firstP27_35 = new Set();
const firstP27_36 = new Set();
const secondP27_36 = new Set();
const examples = [];

// State is GF(29)-linear in (IV,b,c) for fixed a. Precompute these basis
// coefficients once rather than replaying original page prefixes per key.
for (let a = 0; a < MOD; a++) {
  /** @param {readonly number[]} tape @param {number} length @returns {number[]} */
  const weights = (tape, length) => [
    evolve(a, 1, 0, 0, tape, length),
    evolve(a, 0, 1, 0, tape, length),
    evolve(a, 0, 0, 1, tape, length),
  ];
  const w27 = weights(p27, 28);
  const w55 = weights(p55, 70);
  const wEnd = weights(p55, 76);
  const difference = w27.map((value, index) => gp(value - w55[index]));

  for (let iv = 0; iv < MOD; iv++) {
    for (let b = 0; b < MOD; b++) {
      for (let c = 0; c < MOD; c++) {
        // Equal full six-rune plaintext blocks under identical ciphertext:
        // both entering states must equal, then their six updates agree.
        if (gp(difference[0] * iv + difference[1] * b + difference[2] * c) !== 0) continue;

        const s56_0 = gp(wEnd[0] * iv + wEnd[1] * b + wEnd[2] * c);
        if (s56_0 !== knownStates[0]) continue;

        one++;
        if (a === 0) noninjectiveOne++;

        const s56_1 = gp(a * s56_0 + b * p56[0] + c);
        const p27_35 = gp(p27[35] - s56_1);
        const p27_36 = gp(p27[36] - gp(a * s56_1 + b * p27[35] + c));
        firstP27_35.add(p27_35);
        firstP27_36.add(p27_36);

        if (s56_1 !== knownStates[1]) continue;
        two++;
        if (a === 0) noninjectiveTwo++;
        secondP27_36.add(p27_36);
        if (examples.length < 5) examples.push({ a, iv, b, c, p27_35, p27_36 });

        const s56_2 = gp(a * s56_1 + b * p56[1] + c);
        if (s56_2 === knownStates[2]) three++;
      }
    }
  }
}

assert.equal(one, 841);
assert.equal(noninjectiveOne, 29);
assert.equal(two, 27);
assert.equal(noninjectiveTwo, 0);
assert.equal(three, 0);
assert.equal(firstP27_35.size, 29);
assert.equal(firstP27_36.size, 29);
assert.equal(secondP27_36.size, 19);

// For a != 0, six equal ciphertexts cannot merge distinct entering
// states: their difference after the block is a**6 times the difference.
// The GF(29) multiplicative group has no zero divisors.
for (let a = 1; a < MOD; a++) {
  let power = 1;
  for (let i = 0; i < 6; i++) power = gp(power * a);
  assert.notEqual(power, 0);
}

console.log(JSON.stringify({
  source: 'original LP2 p27, p55, p56, p57 corpus indices',
  model: 'P=C-S; S_next=a*S+b*C+c (mod29), shared page IV; p55/p56 seam carries state',
  assumed_identical_plaintext: 'p27[28..33] equals p55[70..75]',
  solved_p56_key_offsets: knownStates,
  keys_matching_six_plaintext_and_first_p56_A: one,
  of_which_a_zero: noninjectiveOne,
  keys_also_matching_second_p56_N: two,
  of_which_a_zero_after_second: noninjectiveTwo,
  keys_also_matching_third_p56_E: three,
  distinct_unknown_p27_35_with_first_known: firstP27_35.size,
  distinct_unknown_p27_36_with_first_known: firstP27_36.size,
  distinct_unknown_p27_36_with_first_two_known: secondP27_36.size,
  first_five_two_rune_candidates: examples,
  p57_planted_forward_inverse: '95/95',
}, null, 2));
