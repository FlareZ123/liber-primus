'use strict';

/**
 * Finite-state exact original-cipher inverse for the source-selected p50
 * 158 <-> 249 opening bridge as hypothetical p56 prime/totient clock seed.
 *
 * The target is original p0 black runes (after its 13-rune red heading).
 * Both natural directed table addresses and both key signs are frozen.
 * Every legal ciphertext F/zero ambiguity is explored, without plaintext
 * scoring or trial key phases. Original p56 F-transparent encryption is:
 *   P=0: emit C=0 without consuming a prime;
 *   P!=0: emit C=P+sign*(prime[j]-1) mod29; consume prime[j].
 *
 * Run on Windows/Node22:
 * node sims/lp2_p0_158_249_primephi_trueF_original_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const readJson = name => JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'liber-primus', name), 'utf8'));
const corpus = readJson('lp2-corpus.json');
const grid = readJson('lp2-grid-256.json');
const ink = readJson('lp2-ink-annotations.json');
const p0 = corpus.pages.find(p => p.page === 0).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
const red = ink.pages.find(p => p.page === 0).red_spans
  .filter(x => x.start === 0).reduce((sum, x) => sum + x.length, 0);
assert.equal(red, 13);
const cipher = p0.slice(red);
assert.equal(cipher.length, 249);
assert.equal(grid.bytes[158], 249);
assert.equal(grid.bytes[249], 158);
assert.equal(p57.length, 95);

const prime = [];
for (let n = 2; prime.length < 1500; n++) {
  let isPrime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) {isPrime = false; break;}
  }
  if (isPrime) prime.push(n);
}
const key = prime.map(n => (n - 1) % 29);
assert.equal(prime[463], 3301);

/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;

/**
 * Exact set-valued F-transparent decoder, where zero may be literal F
 * (not consuming the key) or an encrypted nonzero rune (consumes the key).
 * @param {number[]} input
 * @param {number} seed
 * @param {-1|1} sign
 * @returns {{firstEmpty:number, maxStates:number, completeStates:number, aliveAtPrefix:number}}
 */
function reachable(input, seed, sign) {
  let state = new Set([seed]);
  let maxStates = 1;
  let aliveAtPrefix = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    const next = new Set();
    for (const j of state) {
      if (c === 0) next.add(j);
      const p = mod(c - sign * key[j]);
      if (p !== 0) next.add(j + 1);
    }
    state = next;
    if (i === 19) aliveAtPrefix = state.size;
    if (state.size > maxStates) maxStates = state.size;
    if (!state.size) {
      return {firstEmpty: i, maxStates, completeStates: 0, aliveAtPrefix};
    }
  }
  return {firstEmpty: -1, maxStates, completeStates: state.size, aliveAtPrefix};
}

/**
 * Produce valid source-native positive controls, honoring F key skips.
 * @param {number[]} plain
 * @param {number} seed
 * @param {-1|1} sign
 * @returns {{cipher:number[], pointer:number, literalF:number}}
 */
function encrypt(plain, seed, sign) {
  const out = [];
  let j = seed, literalF = 0;
  for (const p of plain) {
    if (p === 0) {out.push(0); literalF++; }
    else {out.push(mod(p + sign * key[j])); j++; }
  }
  return {cipher: out, pointer: j, literalF};
}

const native = Array.from({length: 249}, (_, i) => p57[i % p57.length]);
const results = [];
// The original source-center pair contributes two independently frozen
// additional ordinary-prime index candidates: 79 (ordinal index21)
// and 83 (ordinal index22), from original C[364] and C[363].
assert.equal(prime[21],79);
assert.equal(prime[22],83);
for (const seed of [158, 249, 21, 22]) {
  for (const sign of /** @type {const} */ ([1, -1])) {
    const positive = encrypt(native, seed, sign);
    const planted = reachable(positive.cipher, seed, sign);
    assert.equal(planted.firstEmpty, -1);
    assert.ok(planted.completeStates > 0);
    assert.ok(positive.literalF > 0);
    // Inversion retains every valid native transparent-F path,
    // including the actual planted consuming-key trajectory.
    const found = reachable(cipher, seed, sign);
    results.push({sourcePrimeSeed: seed, sign, ...found,
      firstImpossiblePrintedP0Rune: found.firstEmpty < 0 ? null : red + found.firstEmpty});
  }
}

assert.deepEqual(results.map(x => x.firstEmpty), [111, 24, 27, 31, 73, 17, 96, 12]);
assert.deepEqual(results.map(x => x.completeStates), [0, 0, 0, 0, 0, 0, 0, 0]);

console.log(JSON.stringify({
  status: 'exact F-transparent finite-state exclusion of 158/249 counts and original-center GP-prime index21/22 seed pair on original p0 black249',
  source: 'original p0 red13 / black249; opening chapter158 printed words; original p50 158<->249',
  clock: 'zero-based ordinary primes, key phi(prime[j]) modulo29',
  F: 'plaintext rune index0 stays C0 and skips prime; C0 may also arise from consumed non-F',
  results, plantedControls: 'p57 native-GP 249-rune repeated prose under all four seed/sign combinations, each complete',
  caveat: 'only this specific source-typed prime-clock transfer is excluded; no unknown LP2 plaintext recovered'
}, null, 2));
