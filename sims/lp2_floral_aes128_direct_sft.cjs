'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** @param {Buffer} key @param {Buffer} ciphertext @param {'ecb'|'cbc'} mode @returns {Buffer} */
function decrypt(key, ciphertext, mode) {
  const decipher = crypto.createDecipheriv('aes-128-' + mode, key, mode === 'cbc' ? Buffer.alloc(16) : null);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/** @param {Buffer} data @returns {{printable:number, small:number, longestAsciiWordRun:number, strictUtf8:boolean}} */
function classify(data) {
  let printable = 0;
  let small = 0;
  let current = 0;
  let longestAsciiWordRun = 0;
  for (const b of data) {
    if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) printable++;
    if (b < 29) small++;
    current = ((b >= 65 && b <= 90) || (b >= 97 && b <= 122) || b === 32) ? current + 1 : 0;
    longestAsciiWordRun = Math.max(longestAsciiWordRun, current);
  }
  let strictUtf8 = true;
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(data);
  } catch (err) {
    if (!(err instanceof TypeError)) throw err;
    strictUtf8 = false;
  }
  return { printable, small, longestAsciiWordRun, strictUtf8 };
}

const nistKey = Buffer.from('2b7e151628aed2a6abf7158809cf4f3c', 'hex');
const nistCiphertext = Buffer.from('3ad77bb40d7a3660a89ecaf32466ef97', 'hex');
assert.equal(decrypt(nistKey, nistCiphertext, 'ecb').toString('hex'), '6bc1bee22e409f96e93d7e117393172a');
console.log('NIST SP 800-38A AES-128-ECB positive control: PASS');

const inputPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json');
const table = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const rows = table.byte_rows.map(row => Buffer.from(row));
const original = Buffer.concat(rows);
assert.equal(rows.length, 32);
assert.ok(rows.every(row => row.length === 8));
assert.equal(original.length, 256);
assert.equal(crypto.createHash('sha256').update(original).digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(Buffer.concat([rows[13], rows[31]]).toString('hex'), '7a3f1fda0eb82073719eace6b424bd50');
console.log('Original 256-byte p49–51 table: exact pinned SHA-256 PASS');

let discoveries = 0;
for (const origin of ['zero', 'one']) {
  const selected = origin === 'zero' ? [13, 31] : [12, 30];
  for (const order of ['printed', 'reversed']) {
    const addresses = order === 'printed' ? selected : [...selected].reverse();
    const key = Buffer.concat(addresses.map(i => rows[i]));
    for (const bodyType of ['all256', 'omitKeyRows240']) {
      const body = Buffer.concat(rows.filter((_, i) => bodyType === 'all256' || !selected.includes(i)));
      for (const mode of ['ecb', 'cbc']) {
        const plaintext = decrypt(key, body, mode);
        const metrics = classify(plaintext);
        console.log(JSON.stringify({ origin, order, bodyType, mode, key: key.toString('hex'), n: plaintext.length, ...metrics, prefix: plaintext.subarray(0, 16).toString('hex') }));
        if (metrics.strictUtf8 && metrics.printable > plaintext.length * 0.8) discoveries++;
        if (metrics.small === plaintext.length) discoveries++;
      }
    }
  }
}
assert.equal(discoveries, 0, 'A direct typed plaintext receiver unexpectedly passed the declared binary or printable gate');
console.log('Original-input AES row13/31 source-family: zero typed receivers in 16 fixed decodes; NIST positive passed');
