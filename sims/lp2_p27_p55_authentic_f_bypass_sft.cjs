'use strict';

/**
 * Exact original-input GP29 F-transparent skip test for the 3^8-rune seam.
 * Original ciphertext is held fixed. Both GP29 additive signs and all
 * ciphertext-F ambiguities are admitted without choosing F locations.
 * Run: node sims/lp2_p27_p55_authentic_f_bypass_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const mod29 = value => ((value % 29) + 29) % 29;
const original = corpus.pages.slice(0, 56).flatMap(page => page.indices);
const prefix = original.slice(0, 6561);
const suffix = original.slice(6561);
const physicalFirstHalf = corpus.pages.slice(0, 28)
  .reduce((total, page) => total + page.indices.length, 0);

assert.equal(original.length, 12956);
assert.equal(physicalFirstHalf, 6761);
assert.equal(prefix.length, 3 ** 8);
assert.equal(suffix.length, 6395);
assert.deepEqual(original.slice(6555, 6561), original.slice(-6));
assert.equal(corpus.pages[27].indices.length, 234);
assert.equal(physicalFirstHalf - prefix.length, 200);

/**
 * Reachable key pointers for the actual historical F law:
 * literal plaintext F (zero) emits ciphertext F, consumes zero key symbols.
 * A ciphertext F may ALSO be an encrypted non-F rune and consume one key.
 * @param {number[]} key
 * @param {number[]} cipher
 * @param {-1|1} sign -1: C=P+K; +1: C=K-P
 * @returns {{valid:boolean, firstFailure:number|null, maxStates:number, finalStates:number}}
 */
function reachable(key, cipher, sign) {
  let states = new Set([0]);
  let maxStates = 1;
  for (let offset = 0; offset < cipher.length; offset += 1) {
    const next = new Set();
    for (const pointer of states) {
      if (cipher[offset] === 0) next.add(pointer);
      if (pointer < key.length) {
        const plain = mod29(sign === -1
          ? cipher[offset] - key[pointer] : key[pointer] - cipher[offset]);
        if (plain !== 0) next.add(pointer + 1);
      }
    }
    if (next.size === 0) {
      return {valid: false, firstFailure: offset, maxStates, finalStates: 0};
    }
    states = next;
    maxStates = Math.max(maxStates, states.size);
  }
  return {valid: true, firstFailure: null, maxStates,
    finalStates: states.size};
}

/** Authentic forward encryption, including literal-F transparency. */
function encrypt(key, plaintext) {
  let pointer = 0;
  const cipher = [];
  let bypasses = 0;
  for (const plain of plaintext) {
    if (plain === 0) {
      cipher.push(0);
      bypasses += 1;
    } else {
      assert(pointer < key.length);
      cipher.push(mod29(plain + key[pointer]));
      pointer += 1;
    }
  }
  return {cipher, consumed: pointer, bypasses};
}

const tests = [];
for (const alignment of ['end', 'start']) {
  const key = alignment === 'end'
    ? prefix.slice(prefix.length - suffix.length)
    : prefix.slice(0, suffix.length);
  for (const sign of [-1, 1]) {
    const result = reachable(key, suffix, sign);
    const expected = alignment === 'end' ? 5 : 69;
    assert.equal(result.valid, false);
    assert.equal(result.firstFailure, expected);
    tests.push({alignment, sign, ...result});
  }
}

// The actual solved p56 prime-totient cipher is a positive control.
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}
const primeKey = [];
for (let n = 2; primeKey.length < 200; n += 1) {
  if (isPrime(n)) primeKey.push((n - 1) % 29);
}
const p56 = reachable(primeKey, corpus.pages[56].indices, -1);
assert.equal(p56.valid, true);
assert.equal(corpus.pages[56].indices.length, 85);

// An independently clear p57 source controls literal-F emission and skips.
const nativePlain = [0, ...corpus.pages[57].indices, 0];
const tailKey = prefix.slice(prefix.length - suffix.length);
const plant = encrypt(tailKey, nativePlain);
assert.equal(nativePlain.length, 97);
assert.equal(plant.bypasses, 5);
assert.equal(plant.cipher.length, nativePlain.length);
for (let i = 0; i < nativePlain.length; i += 1) {
  if (nativePlain[i] === 0) assert.equal(plant.cipher[i], 0);
}
const plantInverse = reachable(tailKey, plant.cipher, -1);
assert.equal(plantInverse.valid, true);

console.log(JSON.stringify({
  source: {runes: original.length, prefix: prefix.length,
    suffix: suffix.length, physicalFirstHalf, physicalSecondHalf:
      original.length - physicalFirstHalf},
  rule: 'Authentic plaintext F -> ciphertext F without key advance; encrypted non-F may also yield ciphertext F',
  original: tests,
  positives: {solvedP56: p56, nativeP57Plant: {
    plaintextRunes: nativePlain.length, literalFBypasses: plant.bypasses,
    consumedKeySymbols: plant.consumed, legalInverse: plantInverse
  }},
  decision: 'All four fixed original keys/signs have no complete legal inverse; no plaintext recovered'
}, null, 2));
