'use strict';

/**
 * Source-frozen LP2 base59/base60 256-byte wheel with 28 nonzero predecessor
 * steps and a literal F rank-zero exception. This is an experimental inverse,
 * NOT an established Cicada mechanism. Run from any working directory with
 * Node.js 22: node sims/lp2_p50_base59_noF_rank28_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const grid = load('resources/liber-primus/lp2-grid-256.json');
const corpus = load('resources/liber-primus/lp2-corpus.json');
const symbols = grid.alphabet;
const symbols59 = symbols.replace('f', '');
const tokens = grid.pages.flatMap((page) => page.tokens);
const signedMod28 = (x) => ((x % 28) + 28) % 28;

assert.equal(symbols.length, 60);
assert.equal(symbols59.length, 59);
assert.equal(symbols.indexOf('f'), 41);
assert.equal(tokens.length, 256);
assert.ok(tokens.every((token) => token.length === 2 && !token.includes('f')));

/**
 * @param {string} alphabet The original base60 digit string or its no-f derivative.
 * @returns {number[]} 256 byte-compatible values in physically printed order.
 */
function decodeTokens(alphabet) {
  return tokens.map((token) => {
    const high = alphabet.indexOf(token[0]);
    const low = alphabet.indexOf(token[1]);
    assert.ok(high >= 0 && low >= 0);
    return high * alphabet.length + low;
  });
}
const key59 = decodeTokens(symbols59);
const key60 = decodeTokens(symbols);
assert.equal(key59.length, 256);
assert.equal(key60.length, 256);
assert.deepEqual(key60.slice(0, 8), [203, 231, 167, 186, 97, 237, 126, 183]);
assert.deepEqual(key59.slice(0, 8), [200, 227, 164, 183, 96, 233, 124, 180]);

/**
 * Decode the proposed 28-step wheel. The first rune is transmitted unchanged as
 * a physical IV. A repeated ciphertext rune means GP0/F and consumes no table
 * symbol. Every nonrepeat maps bijectively to GP indices 1..28, advancing once.
 *
 * @param {number[]} cipher Original GP29 index tape.
 * @param {number[]} key 256 numerals, cyclic in their original printed order.
 * @param {-1|1} sign Full, fixed plus/minus rival.
 * @returns {{plain:number[], keyUses:number}} Lossless inverse result.
 */
function decrypt(cipher, key, sign) {
  if (cipher.length === 0) return {plain: [], keyUses: 0};
  const plain = [cipher[0]];
  let keyUses = 0;
  for (let i = 1; i < cipher.length; i++) {
    const step = (cipher[i] - cipher[i - 1] + 29) % 29;
    if (step === 0) {
      plain.push(0);
      continue;
    }
    const shift = signedMod28(key[keyUses % key.length]);
    plain.push(1 + signedMod28(step - 1 + sign * shift));
    keyUses++;
  }
  return {plain, keyUses};
}

/**
 * @param {number[]} plain Candidate GP29 plaintext tape.
 * @param {number[]} key 256 source digits.
 * @param {-1|1} sign Same sign as decrypt.
 * @returns {number[]} Fully reversible ciphertext tape.
 */
function encrypt(plain, key, sign) {
  if (plain.length === 0) return [];
  const cipher = [plain[0]];
  let keyUses = 0;
  for (let i = 1; i < plain.length; i++) {
    if (plain[i] === 0) {
      cipher.push(cipher[i - 1]);
      continue;
    }
    const shift = signedMod28(key[keyUses % key.length]);
    const step = 1 + signedMod28(plain[i] - 1 - sign * shift);
    cipher.push((cipher[i - 1] + step) % 29);
    keyUses++;
  }
  return cipher;
}

/** @param {number[]} runes GP29 indices. @returns {number} Ordered-pair IoC. */
function ioc(runes) {
  const freq = Array(29).fill(0);
  for (const x of runes) {
    assert.ok(Number.isInteger(x) && x >= 0 && x < 29);
    freq[x]++;
  }
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) / (runes.length * (runes.length - 1));
}

/** @param {number} first Physical LP2 start page. @param {number} last End inclusive. */
function originalChapter(first, last) {
  return corpus.pages.filter((page) => page.page >= first && page.page <= last)
    .flatMap((page) => page.indices);
}

const native = originalChapter(57, 57);
assert.equal(native.length, 95);
assert.equal(native.filter((rune) => rune === 0).length, 3);
assert.ok(ioc(native) > 0.06);
const chapters = [
  {first: 15, last: 22, length: 1903},
  {first: 33, last: 39, length: 1680},
  {first: 40, last: 53, length: 3008},
  {first: 54, last: 55, length: 308},
];
for (const {first, last, length} of chapters) {
  const original = originalChapter(first, last);
  assert.equal(original.length, length);
  for (const [radix, key] of [[59, key59], [60, key60]]) {
    for (const sign of [-1, 1]) {
      const {plain, keyUses} = decrypt(original, key, sign);
      assert.deepEqual(encrypt(plain, key, sign), original);

      // Independent solved-native positive: true F positions cause skips and
      // authentic original p57 text is recovered, not a self-derived guess.
      const nativeCipher = encrypt(native, key, sign);
      const actualNative = decrypt(nativeCipher, key, sign);
      assert.deepEqual(actualNative.plain, native);
      assert.deepEqual(encrypt(actualNative.plain, key, sign), nativeCipher);
      assert.equal(actualNative.keyUses, 91);

      const score = ioc(plain);
      assert.ok(score > 0.029 && score < 0.039,
        'Unexpected original IoC: ' + score);
      const first70 = plain.slice(0, 70).map((x) => corpus.translit[x]).join('-');
      console.log(JSON.stringify({
        original: 'p' + first + '-p' + last, runes: original.length, radix,
        sign, keyUses, repeats: plain.filter((x) => x === 0).length,
        ioc: score, first70
      }));
    }
  }
}
console.log('PASS: 16 full-original inverse/replay tests and 16 genuine solved-p57 F-skip plants.');
