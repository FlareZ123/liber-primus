'use strict';
/**
 * LP2 first-chapter 729-rune modular BASE29 multiplication receiver.
 * This distinct integer/carry operation uses the 13 conditional GP prime
 * block lengths (sum729) as block-local multipliers, rather than additive
 * Caesar shifts or per-word BASE29 ciphers. No fitted secret parameters.
 *
 * Windows 11 / Node22:
 * node sims/lp2_p0_prime729_modular_product_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const c = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const cipher = c.pages.slice(0, 3).flatMap(p => p.indices);
const clear = c.pages.find(p => p.page === 57).indices;
assert.deepEqual(c.pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);
assert.equal(cipher.length, 729);
assert.equal(clear.length, 95);
const lengths = [103, 97, 23, 71, 107, 97, 67, 7, 2, 23, 2, 59, 71];
assert.equal(lengths.reduce((a, b) => a + b, 0), 729);
assert.ok(lengths.every(k => k !== 29 && k > 0));
const num = 29n;
/**
 * @param {bigint} value
 * @param {bigint} modulus
 * @returns {bigint}
 */
function inverse(value, modulus) {
  let [a, b, t, u] = [modulus, value, 0n, 1n];
  while (b !== 0n) {
    const q = a / b;
    [a, b] = [b, a - q * b];
    [t, u] = [u, t - q * u];
  }
  assert.equal(a, 1n, 'block multiplier must be a unit');
  return ((t % modulus) + modulus) % modulus;
}
/**
 * @param {number[]} symbols
 * @param {boolean} little
 * @returns {bigint}
 */
function pack(symbols, little) {
  const digits = little ? [...symbols].reverse() : symbols;
  return digits.reduce((n, digit) => num * n + BigInt(digit), 0n);
}
/**
 * @param {bigint} packed
 * @param {number} length
 * @param {boolean} little
 * @returns {number[]}
 */
function unpack(packed, length, little) {
  const digits = Array(length);
  for (let i = length - 1; i >= 0; i--) {
    digits[i] = Number(packed % num);
    packed /= num;
  }
  assert.equal(packed, 0n);
  return little ? digits.reverse() : digits;
}
/**
 * Applies each GP-prime-length block's own multiplication in Z/(29^length).
 * @param {number[]} input
 * @param {boolean} little
 * @param {boolean} decrypt true means divide by block prime, false multiply
 * @returns {number[]}
 */
function transform(input, little, decrypt) {
  assert.equal(input.length, 729);
  let offset = 0;
  const output = [];
  for (const size of lengths) {
    const block = input.slice(offset, offset + size);
    const modulus = num ** BigInt(size);
    const multiplier = BigInt(size);
    const scalar = decrypt ? inverse(multiplier, modulus) : multiplier;
    const value = pack(block, little) * scalar % modulus;
    output.push(...unpack(value, size, little));
    offset += size;
  }
  assert.equal(offset, input.length);
  return output;
}
/** @param {number[]} seq */
function ic(seq) {
  const counts = Array(29).fill(0);
  for (const x of seq) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (seq.length * (seq.length - 1));
}
const originalIoC = ic(cipher);
const native = Array.from({length: 729}, (_, i) => clear[i % 95]);
const nativeIc = ic(native);
assert.ok(originalIoC < 0.04);
assert.ok(nativeIc > 0.055);

const observed = [];
for (const little of [false, true]) {
  const nativeCipher = transform(native, little, false);
  assert.deepEqual(transform(nativeCipher, little, true), native,
    'source-native 729-rune synthetic ciphertext decrypts exactly');
  assert.deepEqual(transform(transform(native, little, true), little, false), native);
  for (const decrypt of [true, false]) {
    const output = transform(cipher, little, decrypt);
    assert.deepEqual(transform(output, little, !decrypt), cipher);
    const pageIoCs = [output.slice(0, 262),
      output.slice(262, 528), output.slice(528)]
      .map(ic);
    const result = {
      digits: little ? 'least-significant-first' : 'most-significant-first',
      operation: decrypt ? 'modular divide by block prime' : 'modular multiply by block prime',
      fullIoC: ic(output),
      pageIoCs,
      opening40: output.slice(0, 40).map(i => c.translit[i]).join(' ')
    };
    assert.ok(result.fullIoC < 0.04);
    assert.ok(pageIoCs.every(x => x < 0.04));
    observed.push(result);
    console.log(JSON.stringify(result));
  }
}
assert.equal(observed.length, 4);
console.log(JSON.stringify({
  result: 'PASS bounded original-cipher negative; no coherent GP29 plaintext',
  source: 'conditional 2016 EPIPHANY SEEKS p0-title residual; all 13 keyprime lengths',
  languagePositiveIc: nativeIc,
  encryptedOriginalIc: originalIoC,
  controls: 'two original digit orientations; direct and inverse; 729/729 native GP plants'
}));
