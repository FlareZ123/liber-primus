'use strict';

/**
 * Exact source-bound original ChaCha20(256-key, 64-bit nonce) test.
 * Source selectors: p0 two red words (13 GP29 runes -> 8 bytes) and the
 * p0 331 / 32 -> unique fifth cross-page word -> fifth p50 column.
 * Windows Node.js 22 CommonJS; original physical p0..55 pages untouched.
 *
 * The cipher model is conditional and is not a Cicada-authenticated opcode.
 * No key/nonce phase, guessed plaintext, extra symbols or fallback hashes.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const ink = require('../resources/liber-primus/lp2-ink-annotations.json');
const table = require('../resources/liber-primus/base60-grid.json');

assert(crypto.getCiphers().includes('chacha20'));
const sourcePages = corpus.pages.filter(p => p.page <= 55);
const sourceRunes = sourcePages.flatMap(p => p.indices);
assert.equal(sourceRunes.length, 12956);
const heading = ink.pages.find(p => p.page === 0).red_spans[0];
assert.equal(heading.start, 0);
assert.equal(heading.length, 13);
assert.deepEqual(
  sourceRunes.slice(0, 13),
  [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]
);
const nonceRunes = sourceRunes.slice(0, heading.length);
const base = 29n;

/** @param {number[]} digits @returns {bigint} */
function gpInteger(digits) {
  let value = 0n;
  for (const x of digits) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    value = value * base + BigInt(x);
  }
  return value;
}

/** @param {bigint} value @param {number} digits @returns {number[]} */
function base29Digits(value, digits) {
  const out = Array(digits).fill(0);
  let n = value;
  for (let i = digits - 1; i >= 0; i--) {
    out[i] = Number(n % base);
    n /= base;
  }
  assert.equal(n, 0n);
  return out;
}

const nonceInt = gpInteger(nonceRunes);
assert.equal(nonceInt.toString(16), '4b1cde6f9c9af1e1');
const nonce = Buffer.from(nonceInt.toString(16).padStart(16, '0'), 'hex');
assert.equal(nonce.length, 8);

assert.equal(table.rows.length, 32);
assert.equal(table.alphabet.length, 60);
const keyBytes = table.rows.map(row => {
  assert.equal(row.length, 8);
  const cell = row[4];
  return table.alphabet.indexOf(cell[0]) * 60 + table.alphabet.indexOf(cell[1]);
});
assert(keyBytes.every(x => x >= 0 && x <= 255));
const key = Buffer.from(keyBytes);
assert.equal(key.toString('hex'), '61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
assert.equal(key.length, 32);

// Original OpenSSL ChaCha20, not IETF 96-bit-nonce ChaCha20-Poly1305.
// The IV is 8-byte little-endian initial counter ZERO + 8-byte nonce,
// as described in openssl.org EVP_chacha20 (64+64-bit variant).
const iv = Buffer.concat([Buffer.alloc(8), nonce]);
assert.equal(iv.length, 16);

/** @param {Buffer} input @returns {Buffer} */
function chacha(input) {
  const engine = crypto.createDecipheriv('chacha20', key, iv);
  return Buffer.concat([engine.update(input), engine.final()]);
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = new Uint32Array(29);
  for (const c of symbols) counts[c]++;
  return [...counts].reduce((sum, n) => sum + n * (n - 1), 0) / (symbols.length * (symbols.length - 1));
}

/** @param {Buffer} bytes @returns {{printable:number,letters:number,longestPrintable:number,firstHex:string,firstAscii:string}} */
function byteSummary(bytes) {
  let printed = 0;
  let letters = 0;
  let longest = 0;
  let run = 0;
  for (const b of bytes) {
    const print = (b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13;
    printed += Number(print);
    letters += Number((b >= 65 && b <= 90) || (b >= 97 && b <= 122) || b === 32);
    run = print ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return {
    printable: printed / bytes.length,
    letters: letters / bytes.length,
    longestPrintable: longest,
    firstHex: bytes.subarray(0, 32).toString('hex'),
    firstAscii: [...bytes.subarray(0, 110)].map(x => (x >= 32 && x <= 126) ? String.fromCharCode(x) : '.').join('')
  };
}

const originalBody = sourceRunes.slice(13);
assert.equal(originalBody.length, 12943);
const streamBytes = chacha(Buffer.alloc(originalBody.length * 2));
const rawKeys = [...streamBytes.subarray(0, originalBody.length)].map(x => x % 29);
const unbiasedKeys = [...streamBytes].filter(x => x < 232).slice(0, originalBody.length).map(x => x % 29);
assert.equal(rawKeys.length, originalBody.length);
assert.equal(unbiasedKeys.length, originalBody.length);

const originalP0BodyCount = corpus.pages[0].indices.length - 13;
const originalOpeningCount = corpus.pages.slice(0, 3).reduce((s, p) => s + p.indices.length, 0) - 13;
const knownNative = corpus.pages[57].indices;
assert.equal(knownNative.length, 95);
const sourceGP = [];
for (const [name, keyRunes] of [['byteModulo29', rawKeys], ['byteRejection29', unbiasedKeys]]) {
  // The authenticated 2014 LP1 cipher was subtractive in GP29.
  const originalOut = originalBody.map((c, i) => (c - keyRunes[i] + 29) % 29);
  assert.deepEqual(originalOut.map((p, i) => (p + keyRunes[i]) % 29), originalBody);
  const nativePlant = knownNative.map((p, i) => (p + keyRunes[i]) % 29);
  assert.deepEqual(nativePlant.map((c, i) => (c - keyRunes[i] + 29) % 29), knownNative);
  sourceGP.push({
    method: name,
    p0BodyIoC: ioc(originalOut.slice(0, originalP0BodyCount)),
    heldoutP1P2IoC: ioc(originalOut.slice(originalP0BodyCount, originalOpeningCount)),
    fullIoC: ioc(originalOut),
    opening100GP: originalOut.slice(0, 100).map(x => corpus.translit[x]).join(''),
    plantedNativeRunesRecovered: knownNative.length
  });
}

// Canonical base29 whole-integer binary representation (no guessed framing).
const bodyInteger = gpInteger(originalBody);
const hexBody = bodyInteger.toString(16);
const encodedBytes = Buffer.from(hexBody.length % 2 ? '0' + hexBody : hexBody, 'hex');
assert.deepEqual(base29Digits(BigInt('0x' + encodedBytes.toString('hex')), originalBody.length), originalBody);
const decodedBytes = chacha(encodedBytes);
assert.deepEqual(chacha(decodedBytes), encodedBytes);
const plantedMessage = Buffer.from('LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES', 'ascii');
assert.deepEqual(chacha(chacha(plantedMessage)), plantedMessage);

console.log(JSON.stringify({
  source: 'LP2 p0 original red13 nonce, p50 fifth-column 256-bit scalar',
  keyHex: key.toString('hex'),
  nonceHex: nonce.toString('hex'),
  cipher: 'Original ChaCha20 counter64LE=0 nonce64',
  originalRunes: originalBody.length,
  sourceGP,
  sourceWholeInteger: {
    originalBinaryBytes: encodedBytes.length,
    decoded: byteSummary(decodedBytes),
    decodedSHA256: crypto.createHash('sha256').update(decodedBytes).digest('hex')
  },
  status: 'No authenticated ChaCha20 opcode or original unknown-page prose'
}, null, 2));
console.log('PASS source exact p0-red13/p50-column5 ChaCha20 original and positive controls.');
