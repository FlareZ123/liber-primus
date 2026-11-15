'use strict';
/**
 * Exact byte-domain three-share check for the original LP2 pp0-2.
 *
 * The verified 2016 message has GP prime sums HELLO=LIBER=243, and the
 * first original encrypted visual chapter has 729=3*243 runes. Cicada
 * previously used numeric BASE29 conversion and cryptographic sharing.
 * These independent clues motivate, but do not authenticate, this lane.
 *
 * Freeze two natural 3*243 splits (consecutive or interleaved), convert
 * each 243-digit BASE29 integer to a fixed-width 148-byte big-endian
 * register and recover the GF(256) quadratic Shamir constant term for
 * shares at x=1,2,3. In characteristic two this is precisely XOR.
 *
 * Windows Node 22, CommonJS, no file writes or external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
assert.ok(signed.includes('Hello.') && signed.includes('Liber Primus'));
/** @param {string} word @returns {number} */
function gpPrimeSum(word) {
  return [...word].reduce((sum, letter) => {
    const index = corpus.translit.indexOf(letter);
    assert.ok(index >= 0, 'unknown GP symbol');
    return sum + corpus.prime[index];
  }, 0);
}
assert.deepEqual([gpPrimeSum('HELLO'), gpPrimeSum('LIBER')], [243, 243]);
const lengths = corpus.pages.slice(0, 3).map(p => p.indices.length);
assert.deepEqual(lengths, [262, 266, 201]);
const source = corpus.pages.slice(0, 3).flatMap(p => p.indices);
assert.equal(source.length, 729);
const DIGITS = 243, BYTES = 148;

/** Serialize a fixed 243-digit BASE29 source in canonical big-endian order.
 * @param {number[]} digits @returns {Buffer} */
function toBytes(digits) {
  assert.equal(digits.length, DIGITS);
  let value = 0n;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);
    value = value * 29n + BigInt(digit);
  }
  const original = value;
  const out = Buffer.alloc(BYTES);
  for (let j = BYTES - 1; j >= 0; j--) {
    out[j] = Number(value & 255n);
    value >>= 8n;
  }
  assert.equal(value, 0n, 'BASE29 integer overflowed fixed byte width');
  let replay = 0n;
  for (const byte of out) replay = replay * 256n + BigInt(byte);
  assert.equal(replay, original);
  return out;
}

/** Multiply GF(2^8) under AES irreducible polynomial x^8+x^4+x^3+x+1.
 * @param {number} a @param {number} b @returns {number} */
function mul(a, b) {
  let product = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) product ^= a;
    const hi = a & 128;
    a = ((a << 1) & 255) ^ (hi ? 0x1b : 0);
    b >>>= 1;
  }
  return product;
}
/** Evaluate the control polynomial p + a*x + b*x^2 in GF(256).
 * @param {number} p @param {number} a @param {number} b
 * @param {number} x @returns {number} */
function polynomial(p, a, b, x) {
  return p ^ mul(a, x) ^ mul(b, mul(x, x));
}
/** The exact quadratic Shamir constant term for share x=1,2,3.
 * @param {Buffer[]} shares @returns {Buffer} */
function combine(shares) {
  assert.equal(shares.length, 3);
  assert.ok(shares.every(b => b.length === BYTES));
  return Buffer.from(shares[0].map((v, i) => v ^ shares[1][i] ^ shares[2][i]));
}

const plant = Buffer.from(Array.from({length:BYTES}, (_, i) => 32 + i % 95));
const artificial = [1, 2, 3].map(x => Buffer.from(plant.map((v, i) =>
  polynomial(v, (7*i+13)&255, (11*i+17)&255, x))));
assert.deepEqual(combine(artificial), plant);
assert.equal(mul(0x57, 0x83), 0xc1);

const records = [];
for (const layout of ['consecutive', 'interleaved']) {
  const lanes = layout === 'consecutive'
    ? [source.slice(0,243), source.slice(243,486), source.slice(486)]
    : [0,1,2].map(k => source.filter((_, i) => i % 3 === k));
  const shares = lanes.map(toBytes);
  const decoded = combine(shares);
  const printable = [...decoded].filter(v =>
    v >= 32 && v <= 126 || v === 9 || v === 10 || v === 13).length;
  const hex = decoded.toString('hex');
  const headers = ['1f8b08', '425a68', '89504e47', '504b0304', '25504446'];
  const recognized = headers.filter(h => hex.startsWith(h));
  assert.deepEqual(recognized, []);
  assert.equal((decoded[0] & 128), 0, 'direct OpenPGP packet header');
  records.push({
    layout, plaintextBytes:decoded.length, printableBytes:printable,
    first32Hex:hex.slice(0,64),
    recognizedFileMagicAtOffsetZero:recognized,
    directOpenPgpPacketHeader:false
  });
}
assert.deepEqual(records.map(r => [r.printableBytes,r.first32Hex]), [
  [56, '08db7ed2fd4dedbc5a38fe50ad34e53f4eb0475457604f4bda7bafa0d0e58f95'],
  [54, '03948b8bb1e3c1fc008b3f98e3229cc7d4b54d6292f29fd2f5c5e4386f6d350e']
]);
console.log(JSON.stringify({
  originalChapterRunes:source.length, sourcePageLengths:lengths,
  authorialStatus:'2016 243 equivalence is signed; 3-share split is speculative',
  fixedSourceShares:3, digitsPerShare:DIGITS, bytesPerShare:BYTES,
  gf256QuadraticAt123:'P = share1 XOR share2 XOR share3',
  positiveControl:'148 / 148 synthetic quadratic shares recovered exactly',
  original:records,
  conclusion:'Neither direct 243-digit BASE29 / GF256 three-share interpretation yields recognizable clear text or an offset-zero file header. No unknown LP2 plaintext or key.'
}, null, 2));