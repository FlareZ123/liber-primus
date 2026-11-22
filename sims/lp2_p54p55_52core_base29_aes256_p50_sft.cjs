'use strict';

/**
 * Source-derived, fixed 52-rune terminal core as literal GP29 integer AES-256
 * key for the original 256-byte p49–51 table.
 *
 * Windows 11 / Node.js 22:
 * node sims/lp2_p54p55_52core_base29_aes256_p50_sft.cjs
 *
 * One key serialization and one IV-free AES-256 ECB consumer. No fitting.
 */
const assert = require('node:assert/strict');
const { createCipheriv, createDecipheriv, createHash } = require('node:crypto');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const numeric = require('../resources/liber-primus/lp2-grid-256.json');
const p54 = corpus.pages.find((page) => page.page === 54).indices;
const p55 = corpus.pages.find((page) => page.page === 55).indices;
assert.equal(p55.length, 76);
const original = [...p54.slice(-10), ...p55];
const lengths = [11, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(lengths.reduce((sum, n) => sum + n, 0), original.length);
assert.equal(original.length, 86);
const shell = [];
const interior = [];
let start = 0;
for (const n of lengths) {
  assert.ok(n >= 2);
  const word = original.slice(start, start + n);
  shell.push(word[0], word[n - 1]);
  interior.push(...word.slice(1, -1));
  start += n;
}
assert.equal(start, 86);
assert.equal(shell.length, 34);
assert.equal(interior.length, 52);
const restored = [];
let outerAt = 0;
let innerAt = 0;
for (const n of lengths) {
  restored.push(shell[outerAt++]);
  restored.push(...interior.slice(innerAt, innerAt + n - 2));
  restored.push(shell[outerAt++]);
  innerAt += n - 2;
}
assert.deepEqual(restored, original, 'every 86 source rune must be preserved');

// The published Gematria BASE29 convention: earliest rune is most significant.
/** @param {number[]} digits @returns {bigint} */
function base29Integer(digits) {
  return digits.reduce((value, digit) => {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);
    return value * 29n + BigInt(digit);
  }, 0n);
}
const value = base29Integer(interior);
assert.ok(value < (1n << 256n));
const key = Buffer.from(value.toString(16).padStart(64, '0'), 'hex');
assert.equal(key.length, 32);
const ciphertext = Buffer.from(numeric.bytes);
assert.equal(ciphertext.length, 256);
assert.equal(createHash('sha256').update(ciphertext).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {Buffer} bytes @returns {Buffer} */
function decrypt(bytes) {
  const decoder = createDecipheriv('aes-256-ecb', key, null);
  decoder.setAutoPadding(false);
  return Buffer.concat([decoder.update(bytes), decoder.final()]);
}
/** @param {Buffer} bytes @returns {Buffer} */
function encrypt(bytes) {
  const encoder = createCipheriv('aes-256-ecb', key, null);
  encoder.setAutoPadding(false);
  return Buffer.concat([encoder.update(bytes), encoder.final()]);
}
const plaintext = decrypt(ciphertext);
assert.deepEqual(encrypt(plaintext), ciphertext);
const donor = Buffer.alloc(256);
const sourcePlant = 'THE PARABLE SAYS TO SHED OUR OWN CIRCUMFERENCES. ';
for (let i = 0; i < 256; i += 1) donor[i] = sourcePlant.charCodeAt(i % sourcePlant.length);
assert.deepEqual(decrypt(encrypt(donor)), donor, 'native source-word plant');
const histogram = Array(256).fill(0);
for (const b of plaintext) histogram[b] += 1;
const entropy = histogram.reduce((sum, count) => count ? sum - (count / 256) * Math.log2(count / 256) : sum, 0);
const printable = [...plaintext].filter((b) => b >= 32 && b <= 126).length;
let longestPrintable = 0;
let run = 0;
for (const b of plaintext) {
  run = b >= 32 && b <= 126 ? run + 1 : 0;
  if (run > longestPrintable) longestPrintable = run;
}
// Independent literal source comparator: the solved p57 final 52 runes
// begin with SHED and use the authenticated solved-p56 phi(prime) cipher.
const knownFinal52 = corpus.pages.find((page) => page.page === 57).indices.slice(-52);
assert.equal(knownFinal52.length, 52);
assert.ok(knownFinal52.map((v) => corpus.translit[v]).join('').startsWith('SHED'));
const primes = [];
for (let candidate = 2; primes.length < 52; candidate += 1) {
  let isPrime = true;
  for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
    if (candidate % divisor === 0) { isPrime = false; break; }
  }
  if (isPrime) primes.push(candidate);
}
/** @param {number} p @returns {number} */
function totientOfPrime(p) { return p - 1; }
const F = corpus.translit.indexOf('F');
assert.equal(F, 0);
let primeClock = 0;
const predictedCore = knownFinal52.map((v) => v === F
  ? F : (v + totientOfPrime(primes[primeClock++])) % 29);
const known52Matches = predictedCore.filter((v, i) => v === interior[i]).length;
assert.equal(known52Matches, 1, 'the claimed native refrain is not present under solved phi');
assert.equal(primeClock, 50);
console.log(JSON.stringify({
  original: 'p54 last10 + all 76 p55 runes, 17 complete words, unchanged',
  register: { shellCount: shell.length, coreCount: interior.length,
    shellOriginalGpIndices: shell, coreOriginalGpIndices: interior },
  base29SourceKey: { hex: key.toString('hex'),
    bitsRequired: value.toString(2).length, firstRuneMostSignificant: true },
  consumer: 'Original numeric panel, literal 256 base60 bytes, AES256 ECB, no IV, no padding',
  output: { sha256: createHash('sha256').update(plaintext).digest('hex'),
    first64hex: plaintext.subarray(0, 64).toString('hex'),
    last32hex: plaintext.subarray(-32).toString('hex'),
    printable, longestPrintable, entropyBitsPerByte: entropy,
    zeroByteCount: histogram[0] },
  literalSolvedP57Known52PhiCompare: { observedMatches: known52Matches, length: 52, sourceSelectedCipher: 'p56 consecutive prime totient, literal F bypass', expectedFullRefrain: false },
  controls: { originalReencryptBytes: 256,
    sourceNativeAsciiPlantRecoveredBytes: 256, source86RunesRoundTrip: true },
  conclusion: 'A hypothesized terminal-core key, not a source-selected 86-rune inverse.'
}, null, 2));
