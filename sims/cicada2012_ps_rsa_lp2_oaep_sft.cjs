'use strict';

/** Source-constrained 2012 Valete PS RSA private key -> original LP2 GP29 page-start OAEP gate. Node 22 / CommonJS. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const corpus = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));

const p = 99554414790940424414351515490472769096534141749790794321708050837n;
const q = 104593961812606247801193807142122161186583731774511103180935025763n;
const n = p * q;
const phi = (p - 1n) * (q - 1n);
const e = 65537n;
assert.equal(n.toString(), '10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631');
assert.equal(n.toString(2).length, 432);

/** @param {bigint} base @param {bigint} exponent @param {bigint} modulus @returns {bigint} */
function modPow(base, exponent, modulus) {
  let result = 1n;
  for (base %= modulus; exponent > 0n; exponent >>= 1n, base = base * base % modulus) {
    if ((exponent & 1n) === 1n) result = result * base % modulus;
  }
  return result;
}

/** @param {bigint} number @param {bigint} modulus @returns {bigint} */
function inverse(number, modulus) {
  let a = number, b = modulus, x0 = 1n, x1 = 0n;
  while (b !== 0n) {
    const quotient = a / b;
    [a, b, x0, x1] = [b, a % b, x1, x0 - quotient * x1];
  }
  assert.equal(a, 1n);
  return (x0 % modulus + modulus) % modulus;
}

/** @param {Buffer} data @returns {Buffer} */
function sha1(data) { return createHash('sha1').update(data).digest(); }

/** @param {Buffer} seed @param {number} length @returns {Buffer} */
function mgf1(seed, length) {
  const out = Buffer.alloc(length);
  for (let counter = 0, offset = 0; offset < length; counter++) {
    const index = Buffer.alloc(4);
    index.writeUInt32BE(counter);
    const digest = sha1(Buffer.concat([seed, index]));
    digest.copy(out, offset, 0, Math.min(digest.length, length - offset));
    offset += Math.min(digest.length, length - offset);
  }
  return out;
}

/** @param {Buffer} a @param {Buffer} b @returns {Buffer} */
function xor(a, b) {
  assert.equal(a.length, b.length);
  const out = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] ^ b[i];
  return out;
}

/** @param {Buffer} data @returns {bigint} */
function bufferInt(data) { return BigInt('0x' + data.toString('hex')); }

/** @param {bigint} number @returns {Buffer} */
function encodedMessage(number) {
  return Buffer.from(number.toString(16).padStart(108, '0'), 'hex');
}

/** SHA1 OAEP with empty label, as in the identified 2014 Crypt::RSA::ES::OAEP stage.
 * @param {Buffer} encoded @returns {{ leadingZero:boolean, labelHash:boolean, delimiter:boolean, text:string|null }}
 */
function decodeOaep(encoded) {
  assert.equal(encoded.length, 54);
  if (encoded[0] !== 0) return { leadingZero: false, labelHash: false, delimiter: false, text: null };
  const maskedSeed = encoded.subarray(1, 21);
  const maskedDb = encoded.subarray(21);
  const seed = xor(maskedSeed, mgf1(maskedDb, 20));
  const db = xor(maskedDb, mgf1(seed, maskedDb.length));
  const labelHash = db.subarray(0, 20).equals(sha1(Buffer.alloc(0)));
  const separator = db.indexOf(1, 20);
  const delimiter = separator !== -1 && db.subarray(20, separator).every(v => v === 0);
  return { leadingZero: true, labelHash, delimiter, text: labelHash && delimiter ? db.subarray(separator + 1).toString('utf8') : null };
}

/** @param {Buffer} plaintext @param {Buffer} seed @returns {Buffer} */
function encodeOaep(plaintext, seed) {
  assert.equal(seed.length, 20);
  assert(plaintext.length <= 12);
  const db = Buffer.concat([sha1(Buffer.alloc(0)), Buffer.alloc(12 - plaintext.length), Buffer.from([1]), plaintext]);
  const maskedDb = xor(db, mgf1(seed, db.length));
  const maskedSeed = xor(seed, mgf1(maskedDb, 20));
  return Buffer.concat([Buffer.from([0]), maskedSeed, maskedDb]);
}

/** @param {number[]} symbols @returns {bigint} */
function fromGp29(symbols) {
  let value = 0n;
  for (const symbol of symbols) {
    assert(Number.isInteger(symbol) && symbol >= 0 && symbol < 29);
    value = value * 29n + BigInt(symbol);
  }
  return value;
}

const d = inverse(e, phi);
assert.equal(modPow(modPow(3301n, e, n), d, n), 3301n);
const controlText = Buffer.from('PILGRIM');
const controlOaep = encodeOaep(controlText, sha1(Buffer.from('2012-PS deterministic OAEP control')));
const controlCipher = modPow(bufferInt(controlOaep), e, n);
const controlDecoded = decodeOaep(encodedMessage(modPow(controlCipher, d, n)));
assert.equal(controlDecoded.text, 'PILGRIM');

const pages = corpus.pages.filter(page => page.page <= 55 && page.indices.length > 0);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, page) => sum + page.indices.length, 0), 12956);
const results = [];
for (const width of [88, 89]) {
  const rows = [];
  for (const page of pages.filter(page => page.indices.length >= width)) {
    const cipher = fromGp29(page.indices.slice(0, width));
    if (cipher >= n) { rows.push({ page: page.page, cipherTooLarge: true }); continue; }
    const decoded = decodeOaep(encodedMessage(modPow(cipher, d, n)));
    rows.push({ page: page.page, cipherTooLarge: false, ...decoded });
  }
  const verdict = { width, eligiblePages: rows.length, cipherTooLarge: rows.filter(row => row.cipherTooLarge).length,
    leadingZero: rows.filter(row => row.leadingZero).map(row => row.page),
    validOaep: rows.filter(row => row.labelHash && row.delimiter).map(row => ({ page: row.page, text: row.text })) };
  results.push(verdict);
}
assert.deepEqual(results, [
  { width: 88, eligiblePages: 53, cipherTooLarge: 0, leadingZero: [], validOaep: [] },
  { width: 89, eligiblePages: 53, cipherTooLarge: 17, leadingZero: [51], validOaep: [] }
]);
// Physical p55 has exactly 76 runes followed by a 13-dot red mark.
// Even *zero-valued* 13-rune suffix padding makes the direct GP29 integer exceed N.
const terminal = pages.find(page => page.page === 55);
assert.equal(terminal.indices.length, 76);
const terminalInt = fromGp29(terminal.indices);
assert(terminalInt < n);
assert(terminalInt * (29n ** 13n) >= n);
const terminalDecoded = decodeOaep(encodedMessage(modPow(terminalInt, d, n)));
assert.equal(terminalDecoded.leadingZero, false);
console.log(JSON.stringify({ source: '2012 Valete RSA 432-bit factored modulus; 2014 RSA-OAEP/SHA1',
  positiveControl: controlDecoded, decodedPages: results,
  terminal76Plus13: { sourceRuneCount: 76, sourceDots: 13, dotSuffixTooLarge: true, 76RuneDirectOaep: terminalDecoded },
  conclusion: 'No original GP29 physical-page prefix of width 88 or 89 is valid direct RSA-OAEP ciphertext under the factored historical 2012 PS private key. Other framings/registers remain untested.' }, null, 2));
