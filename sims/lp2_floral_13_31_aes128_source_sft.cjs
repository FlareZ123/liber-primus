"use strict";

// Direct source-chosen two-row AES-128 key test against the original p50 bytes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const gridPath = path.resolve(__dirname, '../resources/liber-primus/lp2-grid-256.json');
const bytes = Buffer.from(JSON.parse(fs.readFileSync(gridPath, 'utf8')).bytes);
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {Buffer} input @returns {boolean} */
function validPkcs7(input) {
  const n = input[input.length - 1];
  return n >= 1 && n <= 16 && input.subarray(input.length-n).every(x => x === n);
}
/** @param {Buffer} input @returns {number} */
function displayableCount(input) {
  return [...input].filter(x => x >= 32 && x <= 126 || x === 9 || x === 10 || x === 13).length;
}
for (const {label, rows} of [
  {label:'zero-based', rows:[13,31]},
  {label:'one-based', rows:[12,30]},
]) {
  const key=Buffer.from(rows.flatMap(r => [...bytes.subarray(r*8, r*8+8)]));
  const ciphertext=Buffer.from([...bytes].filter((_,i)=>!rows.includes(Math.floor(i/8))));
  assert.equal(key.length,16);
  assert.equal(ciphertext.length,240);
  for (const {mode,iv} of [
    {mode:'aes-128-ecb',iv:null},
    {mode:'aes-128-cbc',iv:Buffer.alloc(16,0)},
  ]) {
    const decipher=crypto.createDecipheriv(mode,key,iv);
    decipher.setAutoPadding(false);
    const plaintext=Buffer.concat([decipher.update(ciphertext),decipher.final()]);
    assert.equal(plaintext.length,240);
    const cipher=crypto.createCipheriv(mode,key,iv);
    cipher.setAutoPadding(false);
    assert.deepEqual(Buffer.concat([cipher.update(plaintext),cipher.final()]),ciphertext);
    const readable=displayableCount(plaintext);
    const padded=validPkcs7(plaintext);
    const validUtf8=!plaintext.toString('utf8').includes('\uFFFD');
    console.log(JSON.stringify({label,mode,key:key.toString('hex'),bodyBytes:ciphertext.length,
      prefixHex:plaintext.subarray(0,32).toString('hex'),readableBytes:readable,
      validPkcs7:padded,validUtf8}));
    assert.equal(padded,false);
    assert.equal(validUtf8,false);
  }
}
console.log('PASS direct AES-128 source-selected-row original-input negative and cryptographic roundtrips');
