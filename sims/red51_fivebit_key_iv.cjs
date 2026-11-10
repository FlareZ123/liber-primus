'use strict';
/**
 * Fixed 5-bit packing of the original LP2 page-53 red 51-rune span,
 * with a source-derived 128-bit parity IV from its 128 preceding black runes.
 * All tested transformations are enumerated exactly and no target plaintext
 * rune is used to construct any key or IV.
 *
 * Node.js 22: node sims/red51_fivebit_key_iv.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const pages = new Map(corpus.pages.map((page) => [page.page, page.indices]));
const source = pages.get(53);
const black = source.slice(0, 128);
const red = source.slice(128);
const gridBytes = Buffer.from(grid.byte_rows.flat());
const target = [52, 54, 55].flatMap((page) => pages.get(page));

assert.equal(source.length, 179);
assert.equal(black.length, 128);
assert.equal(red.length, 51);
assert.equal(gridBytes.length, 256);
assert.equal(target.length, 571);
assert.ok(red.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
const mod29 = (x) => ((x % 29) + 29) % 29;

/**
 * @param {number[]} digits 51 GP index digits
 * @param {boolean} reverseBits Bit order inside each five-bit field
 * @param {boolean} prefix Whether padding bit precedes the 255 payload bits
 * @param {number} bit Single padding bit
 * @returns {Buffer} 32-byte AES-256 key
 */
function packFive(digits, reverseBits, prefix, bit) {
  const body = digits.map((digit) => {
    const bits = digit.toString(2).padStart(5, '0');
    return reverseBits ? [...bits].reverse().join('') : bits;
  }).join('');
  const all = prefix ? String(bit) + body : body + String(bit);
  assert.equal(all.length, 256);
  return Buffer.from(Array.from({length: 32}, (_, i) => parseInt(all.slice(8*i, 8*i+8), 2)));
}

/**
 * @param {number[]} digits 128 GP index digits
 * @param {boolean} reverse Reverse source reading
 * @param {boolean} flip Complement every parity bit
 * @returns {Buffer} 16-byte AES IV
 */
function parityIV(digits, reverse, flip) {
  const values = reverse ? digits.slice().reverse() : digits;
  const bits = values.map((n) => (n & 1) ^ Number(flip));
  const bytes = Buffer.from(Array.from({length: 16}, (_, i) => {
    let n = 0;
    for (let k = 0; k < 8; k++) n = 2*n + bits[8*i+k];
    return n;
  }));
  assert.equal(bytes.length, 16);
  return bytes;
}

/** @param {number[]} nums @returns {number} */
function ioc(nums) {
  const count = new Uint32Array(29);
  for (const digit of nums) count[digit]++;
  let collision = 0;
  for (const n of count) collision += n * (n - 1);
  return collision / (nums.length * (nums.length - 1));
}

/** @param {Buffer} bytes @param {string} mapping @param {number} count @returns {number[]} */
function mapStream(bytes, mapping, count) {
  const out = [];
  for (const b of bytes) {
    if (mapping === 'reject232' && b >= 232) continue;
    out.push(mapping === 'scaled' ? Math.floor(29*b/256) : b % 29);
    if (out.length === count) break;
  }
  assert.equal(out.length, count);
  return out;
}

const keys = [];
for (const reverse of [false, true])
  for (const reverseBits of [false, true])
    for (const prefix of [false, true])
      for (const bit of [0, 1])
        for (const reverseBytes of [false, true]) {
          const k = packFive(reverse ? red.slice().reverse() : red, reverseBits, prefix, bit);
          keys.push({
            name: (reverse ? 'reverse' : 'forward') + '-bitreverse' + Number(reverseBits) +
              '-' + (prefix ? 'prefix' : 'suffix') + bit + '-bytereverse' + Number(reverseBytes),
            key: reverseBytes ? Buffer.from(k).reverse() : k,
          });
        }
const ivs = [];
for (const reverse of [false, true])
  for (const flip of [false, true])
    ivs.push({name: 'reverse' + Number(reverse) + '-complement' + Number(flip),
      iv: parityIV(black, reverse, flip)});

assert.equal(keys.length, 32);
assert.equal(ivs.length, 4);

// Exact AES-CTR / GP inverse with a one-to-one known-material key and IV.
// These are a fixed family of three documented byte reductions and both signs.
const runeResults = [];
for (const {name: keyName, key} of keys) {
  for (const {name: ivName, iv} of ivs) {
    const k = crypto.createCipheriv('aes-256-ctr', key, iv)
      .update(Buffer.alloc(target.length * 3 + 128));
    for (const mapping of ['mod29', 'scaled', 'reject232']) {
      const stream = mapStream(k, mapping, target.length);
      for (const sign of [-1, 1]) {
        const plaintext = target.map((c, index) => mod29(c + sign * stream[index]));
        runeResults.push({ioc: ioc(plaintext), keyName, ivName, mapping, sign,
          prefix: plaintext.slice(0, 75).map((x) => '0123456789ABCDEFGHIJKLMNOPQRS'[x]).join('')});
      }
    }
  }
}
runeResults.sort((a, b) => b.ioc - a.ioc);

// The 256-byte grid is separately tested as an AES ciphertext. No guessed
// block order or nonce is introduced here: row-major bytes and parity IV only.
const gridResults = [];
for (const {name: keyName, key} of keys)
  for (const {name: ivName, iv} of ivs)
    for (const mode of ['ctr', 'cbc', 'cfb', 'ofb']) {
      const decryptor = crypto.createDecipheriv('aes-256-' + mode, key, iv);
      decryptor.setAutoPadding(false);
      const out = Buffer.concat([decryptor.update(gridBytes), decryptor.final()]);
      gridResults.push({keyName, ivName, mode,
        printable: [...out].filter((x) => x >= 32 && x <= 126).length,
        gpByteRange: [...out].filter((x) => x < 29).length,
        prefixHex: out.subarray(0, 16).toString('hex')});
    }
gridResults.sort((a, b) => b.printable - a.printable);

// Positive control: the same concrete derived AES stream is invertible, with
// no fitted positions or relaxed byte matching in the decryption function.
const sampleKey = keys[0].key;
const sampleIV = ivs[0].iv;
const sample = Buffer.from('LIBER PRIMUS FIVE BIT PACKING POSITIVE CONTROL. '.repeat(6).slice(0, 256));
const encrypted = crypto.createCipheriv('aes-256-ctr', sampleKey, sampleIV).update(sample);
const decrypted = crypto.createDecipheriv('aes-256-ctr', sampleKey, sampleIV).update(encrypted);
assert.ok(decrypted.equals(sample));
const knownGP = Array.from({length: target.length}, (_, i) => (7*i + (i % 11)) % 29);
const stream = mapStream(crypto.createCipheriv('aes-256-ctr', sampleKey, sampleIV)
  .update(Buffer.alloc(3*target.length+128)), 'reject232', target.length);
const plant = knownGP.map((p, i) => mod29(p + stream[i]));
assert.deepEqual(plant.map((c,i) => mod29(c - stream[i])), knownGP);

console.log(JSON.stringify({
  hypothesis:'51 red GP digits as 255 packed bits plus one pad bit, 128 black GP rune parities as 128-bit IV',
  inputs:{redDigits:red.length, blackDigits:black.length, gridBytes:gridBytes.length, targetPages:[52,54,55],
    targetRuneCount:target.length},
  models:{keys:keys.length, parityIVs:ivs.length, aesRune:runeResults.length, aesGrid:gridResults.length},
  targetBaselineIoc:ioc(target),
  bestRuneModels:runeResults.slice(0, 8),
  bestGridPrintable:gridResults.slice(0, 5),
  bestGridGP:gridResults.slice().sort((a,b) => b.gpByteRange - a.gpByteRange).slice(0, 5),
  positiveControl:{bytes:sample.length, gpRunes:knownGP.length, exactRecovery:true},
  interpretation:'No unknown LP2 plaintext or key recovered; count coincidences and model search are not evidence of intent.'
},null,2));
