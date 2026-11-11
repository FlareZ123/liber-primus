'use strict';

/**
 * Literal three-fold key from the source 32x8 number grid.
 * The 2016 signed sentence contains three THE words, and the source
 * 58-page GP-prime word map addresses literal FOLD at p14 word 1.
 * Three successive physical folds superpose the eight numeric columns.
 * Cicada's 2014 hidden-service stage used bitwise XOR of overlaid shares,
 * so the strict zero-free-parameter layer combination is bytewise XOR.
 * No source establishes AES, envelope serialization, IV or F-clock.
 *
 * Node 22, repository root: node sims/lp2_trifold_rowxor32_source_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const unknown = pages.flatMap(p => p.indices);
const p32 = corpus.pages.find(p => p.page === 32).indices;
const p55 = corpus.pages.find(p => p.page === 55).indices;
const rows = grid.byte_rows;
assert.equal(rows.length, 32);
assert.ok(rows.every(row => row.length === 8));
assert.equal(unknown.length, 12956);
assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
assert.equal(corpus.pages.find(p => p.page === 53).indices.length, 179);
assert.equal(crypto.createHash('sha256').update(Buffer.from(rows.flat())).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const middle = signed.slice(signed.indexOf('Its words are'), signed.indexOf('Seek and you'));
assert.equal((middle.match(/\bthe\b/gi) || []).length, 3);
const source = read('resources/liber-primus/lp2-transcription.txt');
const physical = source.split('%')[14].replace(/\//g, '').replace(/[\r\n]/g,'')
  .split(/[-.&$§,:!?]/u).map(x => (x.match(/[ᚠ-᛿]+/gu) || []).join(''))
  .filter(Boolean);
assert.equal(physical[1], 'ᚠᚩᛚᛞ');

/** @param {number[]} a */
const xor = a => a.reduce((v, b) => v ^ b, 0);
const key = Buffer.from(rows.map(xor));
assert.equal(key.toString('hex'),
  '74771ec30557c8be1709235b7a65f2dc938c2276dbfe2f33d855d2508adfc9d8');
assert.equal(key.length, 32);
const mirrored = rows.map(row => xor([...row].reverse()));
assert.deepEqual(mirrored, [...key]); // superposition ignores layer order

/** @param {number[]} digits */
function packGP29(digits) {
  let value = 0n;
  for (const d of digits) {
    assert.ok(Number.isInteger(d) && d >= 0 && d < 29);
    value = value * 29n + BigInt(d);
  }
  const b = Buffer.alloc(Math.ceil(digits.length * Math.log2(29) / 8));
  for (let i = b.length - 1; i >= 0; i--) {
    b[i] = Number(value & 255n);
    value >>= 8n;
  }
  assert.equal(value, 0n);
  return b;
}

/** @param {Buffer} cipher @param {'aes-256-gcm'|'chacha20-poly1305'} algorithm */
function aeadInverse(cipher, algorithm) {
  const iv = cipher.subarray(0, 12), tag = cipher.subarray(-16);
  const enc = cipher.subarray(12, -16);
  const d = crypto.createDecipheriv(algorithm, key, iv, {authTagLength: 16});
  d.setAuthTag(tag);
  try { return Buffer.concat([d.update(enc), d.final()]); }
  catch (error) {
    if (error instanceof Error && /authenticat|bad decrypt/i.test(error.message)) return null;
    throw error;
  }
}

/** @param {'aes-256-gcm'|'chacha20-poly1305'} algorithm */
function plantedControl(algorithm) {
  const plain = Buffer.from('CICADA SOURCE-LOCKED 32-BYTE XOR FOLD', 'ascii');
  const iv = Buffer.alloc(12);
  const c = crypto.createCipheriv(algorithm, key, iv, {authTagLength: 16});
  const packet = Buffer.concat([iv,c.update(plain),c.final(),c.getAuthTag()]);
  assert.deepEqual(aeadInverse(packet,algorithm),plain);
  const tampered=Buffer.from(packet);tampered[tampered.length-1]^=1;
  assert.equal(aeadInverse(tampered,algorithm),null);
}

/** @param {number[]} nums */
function ioc(nums) {
  const counts=Array(29).fill(0);
  for(const n of nums)counts[n]++;
  return counts.reduce((a,n)=>a+n*(n-1),0)/(nums.length*(nums.length-1));
}

/** @param {number[]} nums @param {number} sign */
function directCtr(nums,sign) {
  const cipher=crypto.createCipheriv('aes-256-ctr',key,Buffer.alloc(16));
  const bytes=Buffer.concat([cipher.update(Buffer.alloc(nums.length)),cipher.final()]);
  return nums.map((v,i)=>(v+sign*(bytes[i]%29)+29)%29);
}
const direct = [];
for (const [name, digits] of [['book',unknown],['p32',p32],['p55',p55]]) {
  for (const sign of [-1,1]) {
    const plain = directCtr(digits,sign);
    const cipher = crypto.createCipheriv('aes-256-ctr',key,Buffer.alloc(16));
    const bytes=Buffer.concat([cipher.update(Buffer.alloc(digits.length)),cipher.final()]);
    const reconstructed=plain.map((v,i)=>(v-sign*(bytes[i]%29)+29)%29);
    assert.deepEqual(reconstructed,digits);
    direct.push({target:name,sign,IoC:ioc(plain),first64GP:plain.slice(0,64).map(i=>corpus.translit[i]).join('')});
  }
}
const packets = Object.fromEntries([
  ['completeUnsolvedBook',unknown], ['p32',p32], ['p55',p55]
].map(([name,digits])=>[name,packGP29(digits)]));
const tested=[];
for(const algorithm of ['aes-256-gcm','chacha20-poly1305']) {
  plantedControl(algorithm);
  for(const [name,packet] of Object.entries(packets)) {
    tested.push({algorithm,target:name,packetLength:packet.length,
      authenticated:aeadInverse(packet,algorithm)!==null});
  }
}
assert.equal(tested.filter(x=>x.authenticated).length,0);
console.log(JSON.stringify({
  classification:'source-derived 32-byte fold-XOR key with bounded original-cipher negative',
  source:{originalTable:[32,8], signed2016THEs:3, sourceFOLD:'p14 word1'},
  derivedKeyHex:key.toString('hex'),
  authenticNativeGP29CipherIoC:ioc(unknown),
  directAesCtrZeroIV:direct,
  standardTagEnvelopeAssumptions:{format:'12-byte nonce || ciphertext || 16-byte tag',transport:'GP29 big-endian'},
  envelopeTests:tested,
  positiveControlAuthentications:2,
  tamperControlRejections:2,
  status:'NO_ORIGINAL_PLAINTEXT_OR_AUTHENTICATED_ENVELOPE'
},null,2));
