'use strict';
/**
 * Original LP2 five-numbered cuneiform units: exact 16-bit RSA framing gate.
 *
 * Hypothesis: the two physically red GP-prime sums 379 and 173 supply an RSA
 * modulus n=65567=2^16+31. The 553 numbered GP29 runes pack as 553*5 bits,
 * padded by 3 zero bits to exactly 173 16-bit RSA blocks. This is a
 * source-motivated conjecture, not an authenticated Cicada cipher instruction.
 *
 * All 9072 RSA exponents invertible modulo lambda(65567) are tested on all
 * 553 original rune indices, for both bit orders inside each five-bit rune
 * and both 16-bit byte orders, without language fitting or skips. A candidate
 * is accepted only if every result remains 16-bit, every rune remains in
 * 0..28, and the original three zero pad bits reappear.
 *
 * Windows 11 / Node.js 22; read-only single-file original-source test.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const base = path.join(ROOT, 'resources', 'liber-primus');
const gp = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(base, 'lp2-ink-annotations.json'), 'utf8'));
const source = Uint8Array.from(gp.pages.filter((p) => p.page >= 33 && p.page <= 39)
  .flatMap((p) => p.indices).slice(845, 1398));
const digest = crypto.createHash('sha256').update(source).digest('hex');
assert.equal(source.length, 553);
assert.equal(digest, 'f432558b32ef4120d80f330d068d4f211005f4a6dac7780e3eec2d1e7a0f191a');
assert.equal(source[378], 0);

/** @param {string} runeString @returns {number} */
function primeSum(runeString) {
  return [...runeString].reduce((sum, rune) => {
    const index = gp.runes.indexOf(rune);
    assert.ok(index >= 0);
    return sum + gp.prime[index];
  }, 0);
}
const first = ink.pages.find((p) => p.page === 33).red_spans[0].runes;
const last = ink.pages.find((p) => p.page === 39).red_spans[0].runes;
assert.deepEqual([primeSum(first), primeSum(last)], [379, 173]);
const N = 379 * 173;
const LAMBDA = 32508;
const E = 65537;
const D = 29825;
assert.equal(N, 65567);
assert.equal(N - 65536, 31);
assert.equal(379 + 173 + 1, source.length);
assert.equal(Math.ceil(source.length * 5 / 16), 173);
assert.equal(source.length * 5 + 3, 173 * 16);
assert.equal(E * D % LAMBDA, 1);

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
/**
 * Uses only exact integer intermediates: (N-1)^2 < Number.MAX_SAFE_INTEGER.
 * @param {number} value @param {number} exponent @returns {number}
 */
function modPow(value, exponent) {
  let result = 1;
  for (let e = exponent, v = value; e > 0; e = Math.floor(e / 2), v = v * v % N) {
    if (e % 2) result = result * v % N;
  }
  return result;
}
/** @param {ArrayLike<number>} runes @param {boolean} lsb @returns {number[]} */
function runeBits(runes, lsb) {
  const bits = [];
  for (const x of runes) {
    assert.ok(Number.isInteger(x) && x >= 0 && x < 29);
    for (let bit = 0; bit < 5; bit++) bits.push((x >> (lsb ? bit : 4 - bit)) & 1);
  }
  bits.push(0, 0, 0);
  return bits;
}
/** @param {number} x @returns {number} */
function swapBytes(x) { return ((x & 255) << 8) | (x >>> 8); }
/** @param {number[]} bits @param {boolean} le @returns {number[]} */
function pack16(bits, le) {
  assert.equal(bits.length, 2768);
  const blocks = [];
  for (let i = 0; i < bits.length; i += 16) {
    let value = 0;
    for (let j = 0; j < 16; j++) value = 2 * value + bits[i + j];
    blocks.push(le ? swapBytes(value) : value);
  }
  assert.equal(blocks.length, 173);
  return blocks;
}
/** @param {number[]} blocks @param {boolean} le @returns {number[]} */
function unpack16(blocks, le) {
  const bits = [];
  for (const value of blocks) {
    let x = le ? swapBytes(value) : value;
    for (let i = 15; i >= 0; i--) bits.push((x >> i) & 1);
  }
  return bits;
}
/**
 * @param {number[]} bits @param {boolean} lsb
 * @returns {{invalid:number,firstInvalid:number,padding:string,runes:number[]}}
 */
function readRunes(bits, lsb) {
  const runes = [];
  let invalid = 0;
  let firstInvalid = -1;
  for (let i = 0; i < 553; i++) {
    let value = 0;
    for (let bit = 0; bit < 5; bit++) value |= bits[5 * i + bit] << (lsb ? bit : 4 - bit);
    runes.push(value);
    if (value > 28) { invalid++; if (firstInvalid < 0) firstInvalid = i; }
  }
  return {invalid, firstInvalid, padding: bits.slice(2765).join(''), runes};
}
/**
 * @param {number[]} original @param {boolean} le @param {boolean} lsb
 * @param {number} exponent
 * @returns {{overflow:number,invalid:number,firstInvalid:number,padding:string}}
 */
function testExponent(original, le, lsb, exponent) {
  const result = original.map((value) => modPow(value, exponent));
  const overflow = result.filter((x) => x >= 65536).length;
  const decoded = readRunes(unpack16(result.map((x) => x & 65535), le), lsb);
  return {overflow, invalid: decoded.invalid, firstInvalid: decoded.firstInvalid, padding: decoded.padding};
}
const expectedNoOverflow = [8472, 8428, 8295, 8317];
const expectedInvalid65537 = [53, 42, 42, 57];
const outputs = [];
let conventionIndex = 0;
for (const lsb of [false, true]) {
  for (const le of [false, true]) {
    const blocks = pack16(runeBits(source, lsb), le);
    const control = readRunes(unpack16(blocks, le), lsb);
    assert.equal(control.invalid, 0);
    assert.equal(control.padding, '000');
    assert.deepEqual(control.runes, [...source]);
    let all = 0, noOverflow = 0, native = 0;
    const accepted = [];
    for (let exponent = 1; exponent < LAMBDA; exponent++) {
      if (gcd(exponent, LAMBDA) !== 1) continue;
      all++;
      const result = testExponent(blocks, le, lsb, exponent);
      if (!result.overflow) noOverflow++;
      if (!result.overflow && !result.invalid && result.padding === '000') {
        native++;
        accepted.push(exponent);
      }
    }
    assert.equal(all, 9072);
    assert.equal(noOverflow, expectedNoOverflow[conventionIndex]);
    assert.equal(native, 1);
    assert.deepEqual(accepted, [1]);
    const publicExponent = testExponent(blocks, le, lsb, E);
    assert.equal(publicExponent.invalid, expectedInvalid65537[conventionIndex]);
    outputs.push({
      runeBitOrder: lsb ? 'LSB-first' : 'MSB-first',
      sixteenBitByteOrder: le ? 'little-endian' : 'big-endian',
      firstPackedWords: blocks.slice(0, 3),
      candidateExponents: all, noOverflow, fullyNative: native,
      acceptedExponents: accepted,
      standardE65537: publicExponent
    });
    conventionIndex++;
  }
}
assert.equal(conventionIndex, 4);

// Nontrivial 553-rune native-positive plant. Only block20 contains RSA
// plaintext 2; standard e=65537 encrypts it to 38092. Both 5-bit GP29
// serializations are fully legal; decrypt with d=29825 and forward-replay.
const plantedBlocks = Array(173).fill(0);
plantedBlocks[20] = 2;
const cipherBlocks = plantedBlocks.map((x) => modPow(x, E));
assert.equal(cipherBlocks[20], 38092);
assert.ok(cipherBlocks.every((x) => x < 65536));
const plantPlain = readRunes(unpack16(plantedBlocks, false), false);
const plantCipher = readRunes(unpack16(cipherBlocks, false), false);
assert.equal(plantPlain.invalid, 0);
assert.equal(plantCipher.invalid, 0);
assert.equal(plantPlain.padding, '000');
assert.equal(plantCipher.padding, '000');
assert.ok(plantPlain.runes.some((x) => x !== 0));
assert.notDeepEqual(plantPlain.runes, plantCipher.runes);
const recoveredBlocks = cipherBlocks.map((x) => modPow(x, D));
assert.deepEqual(recoveredBlocks, plantedBlocks);
assert.deepEqual(readRunes(unpack16(recoveredBlocks, false), false).runes, plantPlain.runes);
assert.deepEqual(recoveredBlocks.map((x) => modPow(x, E)), cipherBlocks);

console.log(JSON.stringify({
  scope: 'All coprime 16-bit RSA exponents over four fixed binary serializations',
  source: 'Original p33–p39 five numbered passages, 553 GP29 runes',
  originalSha256: digest,
  sourceSelectedOperands: [379, 173],
  modulus: N, lambda: LAMBDA, sourceRuneCount: source.length,
  packed16BitWords: 173, zeroPadBits: 3, outputs,
  nativePositive: {
    publicExponent: E, privateExponent: D, blockIndex: 20,
    plaintextBlock: 2, ciphertextBlock: 38092,
    full553RuneRoundtrip: true
  },
  authenticPlaintextRecovered: false
}, null, 2));
console.log('PASS: sole fully GP29-native RSA exponent is identity e=1 under all four byte/bit orders');
