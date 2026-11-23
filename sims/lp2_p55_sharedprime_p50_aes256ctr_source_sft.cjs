'use strict';

/**
 * Original-source finite receiver: p55 SHED conditional DH shared secret
 * -> SHA-256 of minimal big-endian bytes -> AES-256-CTR(IV=0)
 * -> original p50 printed 256-byte table. This is a test of one unsupported
 * but complete cipher hypothesis, not an identified author instruction.
 *
 * Run with Node.js 22 from the repository root:
 * node sims/lp2_p55_sharedprime_p50_aes256ctr_source_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const gp = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const lookup = new Map([...gp].map((v, i) => [v, i]));
const project = path.join(__dirname, '..', 'resources', 'liber-primus');
const transcription = fs.readFileSync(path.join(project, 'lp2-transcription.txt'), 'utf8').split('%');
assert.equal(transcription.length, 57, 'Original rune-bearing LP2 page count');

/** @param {string} page */
function fragments(page) {
  return page.replace(/[\r\/\n&$§123457]/g, '').split(/[-.]/g).filter(Boolean);
}
/** @param {string} rune */
function digit(rune) {
  const d = lookup.get(rune);
  assert.notEqual(d, undefined, 'Unexpected GP rune');
  return d;
}
/** @param {number[]} digits */
function number29(digits) {
  return digits.reduce((n, d) => n * 29n + BigInt(d), 0n);
}
/** @param {bigint} base @param {bigint} exponent @param {bigint} modulus */
function powmod(base, exponent, modulus) {
  let result = 1n;
  while (exponent) {
    if (exponent & 1n) result = result * base % modulus;
    base = base * base % modulus;
    exponent >>= 1n;
  }
  return result;
}
const p55 = fragments(transcription[54]);
assert.deepEqual(p55.map(word => [...word].length), [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const complete = p55.slice(1);
const core = complete.flatMap(word => [...word].slice(1, -1).map(digit));
const circumference = complete.flatMap(word => [digit([...word][0]), digit([...word].at(-1))]);
assert.equal(core.length, 43);
assert.equal(circumference.length, 32);
const n = number29(core);
const e = number29(circumference);
assert.equal(n, 510043531279477768552291351270111060625364732293226050492113768n);
assert.equal(e, 54546906948733185277568038540584540814742666891n);
assert.equal(n % 8n, 0n);
assert.equal(e % 43n, 0n);
const p = n / 8n;
const g = e / 43n;
assert.equal(p, 63755441409934721069036418908763882578170591536653256311514221n);
const shared = powmod(g, 344n, p);
assert.equal(shared, 40058585108914257367732574161222353642573409865793191134873737n);

/** @param {bigint} value */
function minimalBigEndian(value) {
  let hex = value.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return Buffer.from(hex, 'hex');
}
const key = crypto.createHash('sha256').update(minimalBigEndian(shared)).digest();
assert.equal(key.toString('hex'), '40c0a1166d98e3cd7bfed42ed8540b8d67edc6ffbbf1636a7b95c5d8cec0e284');
const zeroIV = Buffer.alloc(16);

/** @param {Buffer} bytes */
function enc(bytes) {
  const cipher = crypto.createCipheriv('aes-256-ctr', key, zeroIV);
  return Buffer.concat([cipher.update(bytes), cipher.final()]);
}
/** @param {Buffer} bytes */
function dec(bytes) {
  const cipher = crypto.createDecipheriv('aes-256-ctr', key, zeroIV);
  return Buffer.concat([cipher.update(bytes), cipher.final()]);
}
/** @param {Buffer} bytes */
function countPrintable(bytes) {
  return [...bytes].filter(x => (x >= 32 && x <= 126) || x === 9 || x === 10 || x === 13).length;
}
const grid = JSON.parse(fs.readFileSync(path.join(project, 'lp2-grid-256.json'), 'utf8'));
const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.bytes.length, 256);
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
const tape60 = Buffer.from(tokens.map((word, i) => {
  assert.equal(word.length, 2);
  const d0 = alphabet60.indexOf(word[0]);
  const d1 = alphabet60.indexOf(word[1]);
  assert.ok(d0 >= 0 && d1 >= 0);
  const b = 60 * d0 + d1;
  assert.ok(b <= 255);
  assert.equal(b, grid.bytes[i]);
  return b;
}));
const tape59 = Buffer.from(tokens.map(word => {
  const d0 = alphabet59.indexOf(word[0]);
  const d1 = alphabet59.indexOf(word[1]);
  assert.ok(d0 >= 0 && d1 >= 0, 'Source glyph outside competing base59 codebook');
  const b = 59 * d0 + d1;
  assert.ok(b <= 255);
  return b;
}));
const expected = {
  base60: ['998c7e893cdba52bc0028363f1d9e18645d2bad7dbe8155a81c0cd13c648c483', 105],
  base59: ['9a887d843ddfa728c70e8567f5d9e2834bdfbad7d9e6145b87c5ca13c44bc285', 105],
};
for (const [name, ciphertext] of [['base60', tape60], ['base59', tape59]]) {
  const recovered = dec(ciphertext);
  const [hex, printable] = expected[name];
  assert.equal(recovered.subarray(0, 32).toString('hex'), hex);
  assert.equal(countPrintable(recovered), printable);
  assert.ok(enc(recovered).equals(ciphertext), 'Exact unchanged-original receiver replay');
  const positive = Buffer.from(('PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE. ').repeat(6).slice(0, 256), 'ascii');
  assert.equal(positive.length, 256);
  assert.ok(dec(enc(positive)).equals(positive), 'Complete source-length native ASCII plant recovery');
  console.log(name + ': original 256-byte AES256CTR output has ' + printable + '/256 ASCII-printable bytes, beginning ' + hex);
}
console.log('Original-sourced P,Q, conditional DH shared integer, SHA256 KDF, exact table and native plants PASS.');
console.log('No authentic unknown-page plaintext or Cicada-issued AES/KDF instruction recovered.');
