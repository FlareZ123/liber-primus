'use strict';
/**
 * Source-frozen LP2 p55 15×5 quintet candidate (43-byte interior) consumed
 * by adjacent solved p56's printed 64-byte digest.
 * Windows Node22 SFT; CommonJS; no file writes and no network calls.
 * A source-selected cipher/key has NOT been established.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');

/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
/** @param {Buffer} x @returns {number} */
const printable = x => [...x].filter(v => v >= 32 && v <= 126 || v === 9 || v === 10 || v === 13).length;
/** @param {Buffer} input @param {Buffer} key @returns {Buffer} */
const xor = (input, key) => Buffer.from(input.map((v, i) => v ^ key[i]));
/** @param {Buffer} k @param {Buffer} iv @param {Buffer} x @returns {Buffer} */
function aesDecrypt(k, iv, x) {
  const d = crypto.createDecipheriv('aes-256-ctr', k, iv);
  return Buffer.concat([d.update(x), d.final()]);
}
/** @param {Buffer} k @param {Buffer} iv @param {Buffer} x @returns {Buffer} */
function aesEncrypt(k, iv, x) {
  const c = crypto.createCipheriv('aes-256-ctr', k, iv);
  return Buffer.concat([c.update(x), c.final()]);
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const p55 = corpus.pages.find(p => p.page === 55).indices;
assert.equal(p55.length, 76);
assert.equal(p55[0], 21);
let flags = '';
const bytes = [];
for (let i = 1; i < 76; i += 5) {
  let n = 0;
  for (let j = i; j < i + 5; j++) n = 29 * n + p55[j];
  const q = Math.floor(n / 16777216);
  assert.ok(q === 0 || q === 1);
  flags += String(q);
  const r = n - q * 16777216;
  bytes.push((r >>> 16) & 255, (r >>> 8) & 255, r & 255);
}
const packet = Buffer.from(bytes);
assert.equal(flags, '100100000000000');
assert.equal(packet.length, 45);
assert.equal(packet.toString('hex'),
 '15023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e8892b6460c27a66059a2e9bc73106377502d');
assert.equal(packet[0], p55[0]);
assert.equal(packet[44], 45);

const ref = read('resources/liber-primus/lp1-plaintext-reference.txt');
const src = ref.match(/^### 56\r?\n([\s\S]*?)^### 57/m);
assert.ok(src, 'p56 source text');
const sha512 = src[1].replace(/\s+/g, '').match(/[0-9a-f]{128}/);
assert.ok(sha512, 'original printed 128-char hash');
const digest = Buffer.from(sha512[0], 'hex');
assert.equal(digest.toString('hex'),
 '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4');
const middle = packet.subarray(1, 44);
assert.equal(middle.length, 43);
const keys = [
 [digest.subarray(0, 32), digest.subarray(32, 48)],
 [digest.subarray(32, 64), digest.subarray(0, 16)],
 [digest.subarray(0, 32), Buffer.alloc(16)]
];
const candidate = [
 {name:'XOR digest bytes0:42',data:xor(middle, digest),
  head:'340acb8e7a3a21bc56786a092f89dd65',n:23},
 {name:'AES key front32, IV bytes32:47',data:aesDecrypt(...keys[0],middle),
  head:'6e08be1f546c2080aaea0adb6f827834',n:19},
 {name:'AES key back32, IV front16',data:aesDecrypt(...keys[1],middle),
  head:'9c04a3eaea0fc978d060b82c07f71ac8',n:17},
 {name:'AES key front32, IV zero16',data:aesDecrypt(...keys[2],middle),
  head:'5c1ead01020486b69ef28669add9b113',n:11}
];
for (const row of candidate) {
 assert.equal(row.data.length, 43);
 assert.ok(row.data.toString('hex').startsWith(row.head));
 assert.equal(printable(row.data), row.n);
}
const planted=Buffer.from('THE PRIMES ARE SACRED WITHIN THE DEEP WEB A','ascii');
assert.equal(planted.length,43);
assert.deepEqual(xor(xor(planted,digest),digest),planted);
for(const [key,iv] of keys){
 const c=aesEncrypt(key,iv,planted);
 assert.deepEqual(aesDecrypt(key,iv,c),planted);
 const incorrect=Buffer.from(key);incorrect[0]^=1;
 assert.notDeepEqual(aesDecrypt(incorrect,iv,c),planted);
}

/** @param {Buffer} key @param {Buffer} nonce @param {Buffer} bytes @param {Buffer} tag @returns {Buffer} */
function gcmDecrypt(key,nonce,bytes,tag) {
 const d=crypto.createDecipheriv('aes-256-gcm',key,nonce,{authTagLength:16});
 d.setAuthTag(tag);
 return Buffer.concat([d.update(bytes),d.final()]);
}
/** @param {Buffer} key @param {Buffer} nonce @param {Buffer} data */
function gcmEncrypt(key,nonce,data) {
 const c=crypto.createCipheriv('aes-256-gcm',key,nonce,{authTagLength:16});
 const bytes=Buffer.concat([c.update(data),c.final()]);
 return {bytes,tag:c.getAuthTag()};
}
const gcm=[];
for(const [size,frame] of [[45,packet],[43,middle]]){
 assert.equal(size,frame.length);
 for(const [keyName,key] of [['front32',digest.subarray(0,32)],['back32',digest.subarray(32,64)]]){
  for(const order of ['nonce-first','tag-first']){
   const nf=order==='nonce-first';
   const nonce=nf?frame.subarray(0,12):frame.subarray(-12);
   const tag=nf?frame.subarray(-16):frame.subarray(0,16);
   const body=nf?frame.subarray(12,-16):frame.subarray(16,-12);
   assert.equal(body.length,size-28);
   assert.throws(()=>gcmDecrypt(key,nonce,body,tag),'original must fail GCM authentication');
   const known=planted.subarray(0,body.length);
   const plant=gcmEncrypt(key,nonce,known);
   const positive=nf?Buffer.concat([nonce,plant.bytes,plant.tag]):Buffer.concat([plant.tag,plant.bytes,nonce]);
   assert.equal(positive.length,size);
   const n2=nf?positive.subarray(0,12):positive.subarray(-12);
   const t2=nf?positive.subarray(-16):positive.subarray(0,16);
   const b2=nf?positive.subarray(12,-16):positive.subarray(16,-12);
   assert.deepEqual(gcmDecrypt(key,n2,b2,t2),known);
   const wrong=Buffer.from(key);wrong[0]^=1;
   assert.throws(()=>gcmDecrypt(wrong,n2,b2,t2));
   gcm.push({size,key:keyName,order,authenticated:false,positiveBytes:known.length});
  }
 }
}
assert.equal(gcm.length,8);

console.log(JSON.stringify({
 source:{p55:76,flags,frame:packet.toString('hex'),p56digest:sha512[0]},
 results:candidate.map(r=>({name:r.name,output:r.data.toString('hex'),
  printable:r.n,bytes:r.data.length})),
 gcm,
 positives:'XOR and three AES-256-CTR 43/43, wrong-key discrimination',
 decision:'No plaintext, directly readable file header, or authentic author key; hypothesis only'
},null,2));
