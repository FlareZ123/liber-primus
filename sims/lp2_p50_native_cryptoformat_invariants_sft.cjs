'use strict';
/**
 * Original p49–51 256-token table: native cryptographic-object invariant gates.
 * Windows 11 / Node.js 22: node sims/lp2_p50_native_cryptoformat_invariants_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const source = JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-grid-256.json'),'utf8'));
const tokens = source.pages.flatMap(p => p.tokens);
assert.deepEqual(source.pages.map(p => p.tokens.length),[80,104,72]);
assert.equal(tokens.length,256);

/** @param {number} radix @returns {Buffer} */
function decode(radix) {
  const alphabet = radix===60 ? source.alphabet : source.alphabet.replace('f','');
  assert.equal(alphabet.length,radix);
  return Buffer.from(tokens.map(token => {
    assert.equal(token.length,2);
    const hi=alphabet.indexOf(token[0]),lo=alphabet.indexOf(token[1]);
    assert(hi>=0 && lo>=0);
    const n=radix*hi+lo;
    assert(n>=0 && n<256);
    return n;
  }));
}
/** @param {Buffer} bytes @returns {number} */
function distinct(bytes) { return new Set(bytes).size; }
/** @param {Buffer} bytes @returns {number[]} */
function histogram(bytes) {
  const h=Array(256).fill(0);
  for(const b of bytes)h[b]++;
  return h;
}
/** @param {Buffer} a @param {Buffer} b @returns {number} */
function multisetIntersection(a,b) {
  const x=histogram(a),y=histogram(b);
  return x.reduce((sum,count,i)=>sum+Math.min(count,y[i]),0);
}
/** @param {Buffer} x @returns {{tag:number,partialBytes:number,firstBody:number,validKind:boolean,validPartial:boolean}} */
function packetStart(x) {
  assert.equal(x[0]&0xc0,0xc0);
  assert(x[1]>=224 && x[1]<255);
  const tag=x[0]&63;
  const allowed=tag===11?[0x62,0x74,0x75,0x6c]:tag===8?[0,1,2,3]:[];
  const partialBytes=2**(x[1]&31);
  return {tag,partialBytes,firstBody:x[2],validKind:allowed.includes(x[2]),validPartial:partialBytes>=512};
}
/** @param {Buffer} key @returns {Buffer} */
function rc4Ksa(key) {
  assert(key.length>0);
  const s=Buffer.from(Array.from({length:256},(_,i)=>i));
  let j=0;
  for(let i=0;i<256;i++){
    j=(j+s[i]+key[i%key.length])&255;
    [s[i],s[j]]=[s[j],s[i]];
  }
  return s;
}
const K=[
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
];
const kbytes=Buffer.alloc(256);
assert.equal(K.length,64);
K.forEach((v,i)=>kbytes.writeUInt32BE(v,i*4));
assert.equal(kbytes.readUInt32BE(0),0x428a2f98);
assert.equal(kbytes.readUInt32BE(252),0xc67178f2);
assert.equal(multisetIntersection(kbytes,kbytes),256);
assert.equal(distinct(rc4Ksa(Buffer.from('3301'))),256);
const positive=zlib.deflateRawSync(Buffer.from('LP2 SOURCE-LOCKED CONTROL'));
assert.equal(zlib.inflateRawSync(positive).toString(),'LP2 SOURCE-LOCKED CONTROL');
/** @param {Buffer} b @returns {boolean} */
function validDeflate(b){
  try { zlib.inflateRawSync(b); return true; }
  catch(e) { assert(e instanceof Error); return false; }
}
const rows=[];
for(const radix of [60,59]){
  const b=decode(radix);
  const hash=crypto.createHash('sha256').update(b).digest('hex');
  if(radix===60){
    assert.deepEqual([...b],source.pages.flatMap(p=>p.bytes));
    assert.equal(hash,'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
    assert.deepEqual([...b.subarray(0,3)],[0xcb,0xe7,0xa7]);
  } else {
    assert.equal(hash,'511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79');
    assert.deepEqual([...b.subarray(0,3)],[0xc8,0xe3,0xa4]);
  }
  const pgp=packetStart(b),overlap=multisetIntersection(b,kbytes),rawDeflate=validDeflate(b);
  assert.equal(pgp.tag,radix===60?11:8);
  assert.equal(pgp.validKind,false);
  assert.equal(pgp.validPartial,false);
  assert.equal(distinct(b),161);
  assert(overlap<256);
  assert.equal(rawDeflate,false);
  rows.push({radix,hash,first3:b.subarray(0,3).toString('hex'),distinctBytes:distinct(b),
    sha256KByteMultisetIntersection:overlap,sha256KRequired:256,
    openPgp:pgp,rawDeflate,rc4Permutation:false});
}
console.log(JSON.stringify({source:'p49–51 printed 32x8 tokens',rows,
  positiveControls:'RC4 KSA permutation, SHA256 K constants and raw DEFLATE all pass',
  decision:'No original plaintext, key or valid raw cryptographic object recovered'},null,2));
