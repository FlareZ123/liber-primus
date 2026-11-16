'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const DELTA = 0x9e3779b9;

/** @param {Buffer} source @param {'be'|'le'} endian @returns {number[]} */
function words(source, endian) {
  const result = [];
  for (let i = 0; i < source.length; i += 4) result.push(endian === 'be' ? source.readUInt32BE(i) : source.readUInt32LE(i));
  return result;
}

/** @param {Buffer} destination @param {number[]} values @param {'be'|'le'} endian */
function encodeWords(destination, values, endian) {
  for (let i = 0; i < values.length; i++) {
    if (endian === 'be') destination.writeUInt32BE(values[i], i * 4);
    else destination.writeUInt32LE(values[i], i * 4);
  }
}

/** @param {Buffer} input @param {number[]} key @param {'tea'|'xtea'} cipher @param {boolean} encrypt @param {'be'|'le'} endian @returns {Buffer} */
function block64(input, key, cipher, encrypt, endian) {
  let [v0, v1] = words(input, endian);
  let sum = encrypt ? 0 : (DELTA * 32) >>> 0;
  for (let i = 0; i < 32; i++) {
    if (cipher === 'xtea') {
      if (encrypt) {
        v0 = (v0 + ((((v1 << 4) ^ (v1 >>> 5)) + v1) ^ ((sum + key[sum & 3]) >>> 0))) >>> 0;
        sum = (sum + DELTA) >>> 0;
        v1 = (v1 + ((((v0 << 4) ^ (v0 >>> 5)) + v0) ^ ((sum + key[(sum >>> 11) & 3]) >>> 0))) >>> 0;
      } else {
        v1 = (v1 - ((((v0 << 4) ^ (v0 >>> 5)) + v0) ^ ((sum + key[(sum >>> 11) & 3]) >>> 0))) >>> 0;
        sum = (sum - DELTA) >>> 0;
        v0 = (v0 - ((((v1 << 4) ^ (v1 >>> 5)) + v1) ^ ((sum + key[sum & 3]) >>> 0))) >>> 0;
      }
    } else if (encrypt) {
      sum = (sum + DELTA) >>> 0;
      v0 = (v0 + (((v1 << 4) + key[0]) ^ (v1 + sum) ^ ((v1 >>> 5) + key[1]))) >>> 0;
      v1 = (v1 + (((v0 << 4) + key[2]) ^ (v0 + sum) ^ ((v0 >>> 5) + key[3]))) >>> 0;
    } else {
      v1 = (v1 - (((v0 << 4) + key[2]) ^ (v0 + sum) ^ ((v0 >>> 5) + key[3]))) >>> 0;
      v0 = (v0 - (((v1 << 4) + key[0]) ^ (v1 + sum) ^ ((v1 >>> 5) + key[1]))) >>> 0;
      sum = (sum - DELTA) >>> 0;
    }
  }
  const result = Buffer.allocUnsafe(8);
  encodeWords(result, [v0, v1], endian);
  return result;
}

/** @param {Buffer} input @param {number[]} key @param {'tea'|'xtea'} cipher @param {'ecb'|'cbc'} mode @param {'be'|'le'} endian @returns {Buffer} */
function decipher(input, key, cipher, mode, endian) {
  const output = Buffer.alloc(input.length);
  let previous = Buffer.alloc(8);
  for (let i = 0; i < input.length; i += 8) {
    const ciphertext = input.subarray(i, i + 8);
    const block = block64(ciphertext, key, cipher, false, endian);
    for (let j = 0; j < 8; j++) output[i + j] = block[j] ^ (mode === 'cbc' ? previous[j] : 0);
    previous = ciphertext;
  }
  return output;
}

/** @param {Buffer} buffer @returns {{printable:number,small:number,longestAsciiWordRun:number,utf8:boolean}} */
function classify(buffer) {
  let printable = 0, small = 0, longestAsciiWordRun = 0, current = 0;
  for (const c of buffer) {
    if ((c >= 32 && c <= 126) || c === 9 || c === 10 || c === 13) printable++;
    if (c < 29) small++;
    current = (c === 32 || c >= 65 && c <= 90 || c >= 97 && c <= 122) ? current + 1 : 0;
    longestAsciiWordRun = Math.max(longestAsciiWordRun, current);
  }
  let utf8 = true;
  try { new TextDecoder('utf-8', { fatal: true }).decode(buffer); }
  catch (err) { if (!(err instanceof TypeError)) throw err; utf8 = false; }
  return { printable, small, longestAsciiWordRun, utf8 };
}

const zeroKey = Buffer.alloc(16), zeroBlock = Buffer.alloc(8);
assert.equal(block64(zeroBlock, words(zeroKey, 'be'), 'xtea', true, 'be').toString('hex'), 'dee9d4d8f7131ed9');
assert.equal(block64(Buffer.from('dee9d4d8f7131ed9','hex'), words(zeroKey,'be'),'xtea',false,'be').toString('hex'), '0000000000000000');
assert.equal(block64(zeroBlock, words(zeroKey,'be'),'tea',true,'be').toString('hex'), '41ea3a0a94baa940');
assert.equal(block64(Buffer.from('41ea3a0a94baa940','hex'), words(zeroKey,'be'),'tea',false,'be').toString('hex'), '0000000000000000');
const patternKey = Buffer.from('000102030405060708090a0b0c0d0e0f','hex');
const patternBlock = Buffer.from('4142434445464748','hex');
assert.equal(block64(patternBlock, words(patternKey,'be'),'xtea',true,'be').toString('hex'), '497df3d072612cb5');
console.log('Published 32-cycle TEA/XTEA zero-key and nonzero-key vectors: PASS');

const source = JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','base60-grid.json'),'utf8'));
const rows = source.byte_rows.map(row=>Buffer.from(row)), all = Buffer.concat(rows);
assert.equal(all.length,256);
assert.equal(crypto.createHash('sha256').update(all).digest('hex'),'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(Buffer.concat([rows[13],rows[31]]).toString('hex'),'7a3f1fda0eb82073719eace6b424bd50');
console.log('Original source bytes pinned SHA-256: PASS');
let n = 0;
let typed = 0;
let maxRun = 0;
let maxReadable = {ratio:0};
for (const origin of ['zero','one']) {
  const selected = origin === 'zero' ? [13,31] : [12,30];
  for (const order of ['printed','reversed']) {
    const keyBytes = Buffer.concat((order === 'printed' ? selected : [...selected].reverse()).map(i=>rows[i]));
    for (const bodyKind of ['all256','omitKeyRows240']) {
      const body = Buffer.concat(rows.filter((_,i)=>bodyKind === 'all256' || !selected.includes(i)));
      for (const cipher of ['xtea','tea']) for (const endian of ['be','le']) for (const mode of ['ecb','cbc']) {
        const output = decipher(body,words(keyBytes,endian),cipher,mode,endian);
        const m = classify(output);
        n++;
        maxRun = Math.max(maxRun,m.longestAsciiWordRun);
        const ratio = m.printable / output.length;
        if (ratio > maxReadable.ratio) maxReadable = { ratio, origin,order,bodyKind,cipher,endian,mode };
        if (m.utf8 && ratio > 0.8 || m.small === output.length) typed++;
        console.log(JSON.stringify({origin,order,bodyKind,cipher,endian,mode,n:output.length,key:keyBytes.toString('hex'),...m,prefix:output.subarray(0,8).toString('hex')}));
      }
    }
  }
}
assert.equal(n,64);
assert.equal(typed,0);
console.log(JSON.stringify({cases:n,typed,maxRun,maxReadable,positiveControls:'PASS',originalSha256:'PASS'}));
