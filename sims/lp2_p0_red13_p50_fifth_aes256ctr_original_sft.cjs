'use strict';

/**
 * One frozen original-source AES-256-CTR inverse.
 * Key: 32 source bytes of LP2 p49-51 printed fifth column (base60).
 * Nonce: p0's genuine red13 heading, as one unsigned high-first BASE29 integer.
 * Counter: standard 64-bit big-endian zero, after the eight-byte nonce.
 * Cipher starts after the 13-rune heading and carries through all physical pages 0..55.
 *
 * These are 2014-available operands, NOT a first-party authored AES instruction.
 * Node.js 22, CommonJS, builtin crypto, read-only, no third-party packages.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const ink = require('../resources/liber-primus/lp2-ink-annotations.json');
const grid = require('../resources/liber-primus/base60-grid.json');

/** @param {number[]} runes @returns {bigint} */
function base29(runes) {
  return runes.reduce((number, digit) => number * 29n + BigInt(digit), 0n);
}

/** @param {number[]} data @returns {number} */
function ioc(data) {
  const freq = new Array(29).fill(0);
  for (const x of data) freq[x] += 1;
  return freq.reduce((sum, count) => sum + count * (count - 1), 0) /
    (data.length * (data.length - 1));
}

/** @param {Buffer} key @param {Buffer} iv @param {number} count @returns {Buffer} */
function aesCtrPad(key, iv, count) {
  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
  return Buffer.concat([cipher.update(Buffer.alloc(count)), cipher.final()]);
}

/**
 * Check whether ANY historical transparent-F decrypting clock can pass.
 * A literal ciphertext F may be copied without consuming a key unit.
 * Every nonliteral position consumes one unit, with plaintext F forbidden.
 * @param {number[]} ciphertext
 * @param {number[]} pad
 * @returns {{ feasible:boolean, checked:number, firstImpossibleAt:number|null, peakStates:number }}
 */
function fTransparentReach(ciphertext, pad) {
  let live = new Uint8Array(ciphertext.length + 1);
  live[0] = 1;
  let lo = 0;
  let hi = 0;
  let peakStates = 1;
  for (let i = 0; i < ciphertext.length; i += 1) {
    const next = new Uint8Array(ciphertext.length + 1);
    let nextLo = ciphertext.length + 1;
    let nextHi = -1;
    let states = 0;
    for (let j = lo; j <= hi; j += 1) {
      if (!live[j]) continue;
      const c = ciphertext[i];
      if (c === 0) next[j] = 1;
      if (j < pad.length && (c - pad[j] + 29) % 29 !== 0) next[j + 1] = 1;
    }
    for (let j = lo; j <= Math.min(hi + 1, ciphertext.length); j += 1) {
      if (!next[j]) continue;
      states += 1;
      nextLo = Math.min(nextLo, j);
      nextHi = Math.max(nextHi, j);
    }
    if (!states) {
      return {
        feasible: false, checked: i + 1, firstImpossibleAt: i,
        peakStates,
      };
    }
    peakStates = Math.max(peakStates, states);
    live = next;
    lo = nextLo;
    hi = nextHi;
  }
  return {
    feasible: true, checked: ciphertext.length, firstImpossibleAt: null,
    peakStates,
  };
}

// Authenticated cipher-primitive positive, NIST FIPS 197 AES-256 Appendix C.3 example.
const vectorKey = Buffer.from(Array.from({ length: 32 }, (_, i) => i));
const vectorPlain = Buffer.from('00112233445566778899aabbccddeeff', 'hex');
const vectorCipher = crypto.createCipheriv('aes-256-ecb', vectorKey, null);
vectorCipher.setAutoPadding(false);
const vectorResult = Buffer.concat([
  vectorCipher.update(vectorPlain), vectorCipher.final(),
]);
assert.equal(vectorResult.toString('hex'), '8ea2b7ca516745bfeafc49904b496089');

const original = corpus.pages.slice(0, 56).flatMap((page) => page.indices);
assert.equal(original.length, 12956);
const red = ink.pages.find((page) => page.page === 0).red_spans[0];
assert.deepEqual([red.start, red.length], [0, 13]);
assert.deepEqual(original.slice(0, 13),
  [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);

const nonce = Buffer.alloc(8);
nonce.writeBigUInt64BE(base29(original.slice(0, 13)));
assert.equal(nonce.toString('hex'), '4b1cde6f9c9af1e1');
const key = Buffer.from(grid.rows.map((row) =>
  grid.alphabet.indexOf(row[4][0]) * 60 + grid.alphabet.indexOf(row[4][1])));
assert.equal(key.toString('hex'),
  '61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
assert.equal(key.length, 32);
const iv = Buffer.concat([nonce, Buffer.alloc(8)]);
assert.equal(iv.length, 16);

const body = original.slice(13);
assert.equal(body.length, 12943);
const padBytes = aesCtrPad(key, iv, Math.ceil(body.length * 256 / 232) + 128);
const mod29 = [...padBytes.subarray(0, body.length)].map((x) => x % 29);
const reject232 = [...padBytes].filter((x) => x < 232)
  .slice(0, body.length).map((x) => x % 29);
assert.equal(reject232.length, body.length);

const positive = corpus.pages[57].indices;
assert.equal(positive.length, 95);
const p16Start = corpus.pages.slice(0, 16)
  .reduce((sum, page) => sum + page.indices.length, 0) - 13;
const p22Start = corpus.pages.slice(0, 22)
  .reduce((sum, page) => sum + page.indices.length, 0) - 13;
const records = [];
for (const [encoding, pad] of [
  ['byte_mod29', mod29],
  ['reject_byte_ge232', reject232],
]) {
  const strictF = fTransparentReach(body, pad);
  // A genuine solved-source positive undergoes exactly the same F-transparent test.
  let consumed = 0;
  const plantedF = positive.map((rune) =>
    rune === 0 ? 0 : (rune + pad[consumed++]) % 29);
  const fPositive = fTransparentReach(plantedF, pad);
  assert.equal(fPositive.feasible, true);
  for (const sign of [-1, 1]) {
    const decoded = body.map((rune, i) =>
      (rune + sign * pad[i] + 29) % 29);
    assert.deepEqual(decoded.map((rune, i) =>
      (rune - sign * pad[i] + 29) % 29), body);
    const synthetic = positive.map((rune, i) =>
      (rune - sign * pad[i] + 29) % 29);
    assert.deepEqual(synthetic.map((rune, i) =>
      (rune + sign * pad[i] + 29) % 29), positive);
    records.push({
      encoding, sign,
      iocFull: ioc(decoded),
      iocP0Body: ioc(decoded.slice(0, 249)),
      iocP16to21Holdout: ioc(decoded.slice(p16Start, p22Start)),
      first50: decoded.slice(0, 50)
        .map((rune) => corpus.translit[rune]).join('-'),
      exactReencryption: body.length,
      nativeSolvedPlant: positive.length,
      strictFOriginal: strictF,
      strictFNativePlant: fPositive,
    });
  }
}

// One fixed binary reader: whole original post-header GP29 integer, 7860 bytes.
// This avoids fitting a second byte/rune mapping to the output.
let rawHex = base29(body).toString(16);
if (rawHex.length % 2) rawHex = '0' + rawHex;
const binary = Buffer.from(rawHex, 'hex');
assert.equal(binary.length, 7860);
assert.equal(base29(body),
  BigInt('0x' + binary.toString('hex')));
const binaryPad = aesCtrPad(key, iv, binary.length);
const output = Buffer.from(binary.map((x, i) => x ^ binaryPad[i]));
const printable = [...output]
  .filter((x) => x >= 32 && x <= 126 || x === 9 || x === 10 || x === 13)
  .length;
assert.equal(output.subarray(0, 32).toString('hex'),
  '731a56e81e517a81c0c8c6446530fa9ca77086297bd5ce1384ac82e0e8271c3a');
assert.equal(printable, 3013);

console.log(JSON.stringify({
  originalRunes: original.length,
  source: 'LP2 p0 genuine red13 + p49-51 fifth of eight 32-byte table columns',
  hypothesis: 'AES-256-CTR with nonce8||zero8, 2014-compatible but no authored opcode',
  nonce: nonce.toString('hex'),
  key: key.toString('hex'),
  iv: iv.toString('hex'),
  bodyRunes: body.length,
  fixedAdditiveReceivers: records,
  wholeBase29IntegerXor: {
    bytes: binary.length,
    printable, printableRate: printable / binary.length,
    hexPrefix: output.subarray(0, 64).toString('hex'),
    pngHeader: output.subarray(0, 8).toString('hex') === '89504e470d0a1a0a',
  },
}, null, 2));
console.log('PASS original-input AES-256-CTR frozen test; no unknown plaintext claimed.');
