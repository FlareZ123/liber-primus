"use strict";

/**
 * A source-only Berlekamp–Massey continuation of the conditional 2016
 * EPIPHANY SEECS crib at the authentic p0 red 8|5 marker.
 * This is a bounded decoder test, not a claimed Cicada-supplied key.
 * @module lp2_p0_epiphany_bm6_original_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;

/** Inverse in the prime field GF(29). */
function inverse(x) {
  assert.notEqual(mod(x), 0);
  for (let i = 1; i < MOD; i++) if (mod(i * x) === 1) return i;
  throw new Error("noninvertible field element");
}

/** Standard Berlekamp–Massey, canonical shortest recurrence for a prefix. */
function berlekampMassey(sequence) {
  const C = new Array(sequence.length + 1).fill(0);
  const B = new Array(sequence.length + 1).fill(0);
  C[0] = 1;
  B[0] = 1;
  let L = 0, m = 1, b = 1;
  for (let n = 0; n < sequence.length; n++) {
    let delta = sequence[n];
    for (let i = 1; i <= L; i++) delta += C[i] * sequence[n - i];
    delta = mod(delta);
    if (delta === 0) {
      m++;
      continue;
    }
    const T = C.slice();
    const quotient = mod(delta * inverse(b));
    for (let j = 0; j + m < C.length; j++) {
      C[j + m] = mod(C[j + m] - quotient * B[j]);
    }
    if (2 * L <= n) {
      L = n + 1 - L;
      B.splice(0, B.length, ...T);
      b = delta;
      m = 1;
    } else {
      m++;
    }
  }
  return {order: L, coefficients: C.slice(0, L + 1)};
}

/** Extend exactly the key defined by the returned recurrence. */
function extend(prefix, polynomial, size) {
  const out = prefix.slice();
  for (let i = out.length; i < size; i++) {
    let value = 0;
    for (let j = 1; j < polynomial.length; j++) {
      value -= polynomial[j] * out[i - j];
    }
    out.push(mod(value));
  }
  return out;
}

/**
 * Exact finite-state inverse of the authentic solved-page F-transparent
 * additive rule. It includes every possible literal-F skip and permits
 * ciphertext F from a non-F plaintext.
 */
function inverseStates(cipher, key, startOffset) {
  let states = new Set([startOffset]);
  let largest = 1;
  for (let i = startOffset; i < cipher.length; i++) {
    const next = new Set();
    for (const clock of states) {
      if (clock >= key.length) continue;
      if (mod(cipher[i] - key[clock]) !== 0) next.add(clock + 1);
      if (cipher[i] === 0) next.add(clock);
    }
    if (!next.size) return {firstImpossible: i, priorClocks: [...states], largest};
    states = next;
    largest = Math.max(largest, states.size);
  }
  return {firstImpossible: null, survivingClocks: [...states], largest};
}

/** Authentic positive: forward-encode with literal plaintext-F bypass. */
function forward(plain, key, startOffset) {
  let clock = startOffset;
  const cipher = [];
  for (const symbol of plain) {
    cipher.push(symbol === 0 ? 0 : mod(symbol + key[clock++]));
  }
  return {cipher, clock};
}

function main() {
  const pages = corpus.pages.filter(p => p.status === "unsolved" && p.indices.length);
  const cipher = pages.flatMap(p => p.indices);
  assert.equal(pages.length, 55);
  assert.equal(cipher.length, 12956);
  assert.equal(corpus.pages[0].indices.length, 262);
  assert.deepEqual(cipher.slice(0, 13),
    [15,8,18,3,6,19,27,0,15,26,18,21,5]);

  // 2016 first-party "epiphany seeks" is a CONJECTURED, not verified title.
  // Canonical GP K->C spelling is SEECS.
  const crib = "EPIPHANYSEECS";
  const plain = [...crib].map(ch => {
    const index = corpus.translit.indexOf(ch);
    assert(index >= 0, "source character outside GP");
    return index;
  });
  assert.deepEqual(plain,
    [18,13,10,13,8,24,9,26,15,18,18,5,15]);
  const seed = plain.map((symbol, i) => mod(cipher[i] - symbol));
  assert.deepEqual(seed, [26,24,8,19,27,24,18,3,0,8,0,16,19]);

  const bm = berlekampMassey(seed);
  assert.equal(bm.order, 6);
  assert.deepEqual(bm.coefficients, [1,9,13,23,22,17,23]);
  assert.ok(2 * bm.order < seed.length, "the prefix fixes the recurrence");
  const key = extend(seed, bm.coefficients, 13000);
  assert.deepEqual(key.slice(13, 22), [14,22,10,4,11,26,7,3,20]);

  // The conjectured title gives no free p0 reset: start immediately at 13.
  const original = inverseStates(cipher, key, 13);
  assert.equal(original.firstImpossible, 20);
  assert.deepEqual(original.priorClocks, [20]);
  assert.equal(cipher[20], 3); // O
  assert.equal(key[20], 3); // impossible non-F C=K forces plain F

  // Reverse the title-derived tape, as optionally suggested by the p0
  // 180-degree mirrored cross. No historical decipherment opcode selects it.
  const reversedBm = berlekampMassey([...seed].reverse());
  assert.equal(reversedBm.order, 6);
  assert.deepEqual(reversedBm.coefficients, [1,2,6,1,22,13,24]);
  const backwardTape = extend([...seed].reverse(), reversedBm.coefficients, 13000);
  const reverseKey = seed.concat(backwardTape.slice(13));
  const reversedSource = inverseStates(cipher, reverseKey, 13);
  assert.equal(reversedSource.firstImpossible, 286);
  assert.deepEqual(reversedSource.priorClocks, [282]);
  assert.equal(cipher[286], 27);
  assert.equal(reverseKey[282], 27);

  // Source-native GP29 IoC on 267 contiguous positions with a direct
  // additive inverse of the unfitted reverse key, before the first failure.
  const count = new Uint16Array(MOD);
  for (let i = 13; i < 280; i++) count[mod(cipher[i] - reverseKey[i])]++;
  const n = 267;
  const reverseIoc = count.reduce((sum, v) => sum + v * (v - 1), 0) /
    (n * (n - 1));
  assert.ok(Math.abs(reverseIoc - 0.03469347526118668) < 1e-14);

  // Matched original-input null: random order-at-most-six GF29 recurrences
  // and exact all-F-mask inverse, with no plaintext-dependent fitting.
  let rng = 0x3301ac1d;
  function random(n) {
    rng ^= rng << 13;
    rng ^= rng >>> 17;
    rng ^= rng << 5;
    return (rng >>> 0) % n;
  }
  let nullAtLeast286 = 0;
  const first500 = cipher.slice(0, 500);
  for (let trial = 0; trial < 4000; trial++) {
    const state = Array.from({length: 6}, () => random(MOD));
    const polynomial = [1, ...Array.from({length: 6}, () => random(MOD))];
    const future = extend(state, polynomial, 550);
    const randomKey = seed.concat(future.slice(13));
    const test = inverseStates(first500, randomKey, 13);
    if (test.firstImpossible === null || test.firstImpossible >= 286)
      nullAtLeast286++;
  }
  assert.equal(nullAtLeast286, 172);

  // Real native-GP source controls: p57 PARABLE is original cleartext.
  const control = corpus.pages[57].indices;
  assert.equal(control.length, 95);
  const planted = forward(control, key, 13);
  const received = inverseStates(
    [...cipher.slice(0, 13), ...planted.cipher], key, 13
  );
  assert.equal(received.firstImpossible, null);
  assert.ok(received.survivingClocks.includes(planted.clock));
  assert.deepEqual(forward(control, key, 13).cipher, planted.cipher);

  console.log(JSON.stringify({
    original_runes: cipher.length,
    heading_cipher_8plus5: cipher.slice(0, 13),
    conditional_crib: crib,
    conditional_key_seed: seed,
    minimal_bm_order: bm.order,
    minimal_bm_polynomial: bm.coefficients,
    first_future_key: key.slice(13, 22),
    first_impossible_original_rune: original.firstImpossible,
    prior_clock_states: original.priorClocks,
    reversed_bm_polynomial: reversedBm.coefficients,
    reverse_first_impossible_rune: reversedSource.firstImpossible,
    reverse_rune_ioc_before_failure: reverseIoc,
    random6_null_reaching_rune286: nullAtLeast286,
    random6_null_trials: 4000,
    p57_plant_reencrypts: true,
    original_unknown_plaintext_recovered: false
  }, null, 2));
}
if (require.main === module) main();

module.exports = {
  berlekampMassey, extend, inverseStates, forward
};
