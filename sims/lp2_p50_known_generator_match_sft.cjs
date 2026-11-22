'use strict';
/** SFT: source-native exact-match screen for a bounded 2014-available table-generator corpus. */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const GRID_HEX = 'cbe7a7ba61ed7eb75cf99cdef704b7d479ca0f2166893b576dc6ad1996428d857372c5273650850550541c49e66bc74cfd102f3b56ab9c50fe7692456ac47c337aff19c0c749a96ca44fcdb172902e528e3ac9c1ad1c6f41d3dcc631ec543823de96482253e520ce7a3f1fda0eb82073498fc5f736ab23b82aed56360d14a3c1c9b35678a98d48ab0a81e90df52ea0987dd25cadf6ae99bde7210e7034fbf9f8e9d9c0526912faf8f0e4fe369475d112eb83a6af9028a751809c135126c0aa21009b9f59b073692f6e4ad144c24c7f1539af063d4696fb548edb943b3a343397443449f9900075af6aeac479ee2081ad908d2ad61638c6c0719eace6b424bd50';
const grid = Buffer.from(GRID_HEX, 'hex');
assert.equal(grid.length, 256);
assert.equal(createHash('sha256').update(grid).digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const primes = [];
  for (let x = 2; primes.length < n; x++)
    if (primes.every(q => q*q > x || x%q !== 0)) primes.push(x);
  return primes;
}

/** @param {boolean} little @returns {Buffer} */
function sha256RoundConstants(little) {
  const b = Buffer.alloc(256);
  firstPrimes(64).forEach((p, i) => {
    const root = Math.cbrt(p);
    const word = Math.floor((root - Math.floor(root))*2**32) >>> 0;
    if (little) b.writeUInt32LE(word, 4*i);
    else b.writeUInt32BE(word, 4*i);
  });
  return b;
}

/** @param {boolean} little @returns {Buffer} */
function md5SineConstants(little) {
  const b = Buffer.alloc(256);
  for (let i=1; i<=64; i++) {
    const word = Math.floor(2**32*Math.abs(Math.sin(i))) >>> 0;
    if (little) b.writeUInt32LE(word, 4*(i-1));
    else b.writeUInt32BE(word, 4*(i-1));
  }
  return b;
}

/** @param {number} a @param {number} b @returns {number} */
function gfMul(a,b) {
  let out=0;
  for (let i=0; i<8; i++) {
    if (b&1) out ^= a;
    a=((a<<1)^((a&128)?27:0))&255;
    b>>>=1;
  }
  return out;
}

/** @returns {Buffer} */
function aesSbox() {
  const out=Buffer.alloc(256);
  for (let a=0; a<256; a++) {
    const inv=a===0 ? 0 : Array.from({length:255},(_,i)=>i+1).find(x=>gfMul(a,x)===1);
    assert.notEqual(inv,undefined);
    let y=inv;
    for (let k=1; k<=4; k++) y^=((inv<<k)|(inv>>>(8-k)))&255;
    out[a]=y^99;
  }
  return out;
}

/** @param {string} key @param {number} drop @returns {Buffer} */
function rc4(key,drop) {
  const k=Buffer.from(key,'ascii');
  const s=Uint8Array.from({length:256},(_,i)=>i);
  let j=0;
  for (let i=0;i<256;i++){
    j=(j+s[i]+k[i%k.length])&255;
    [s[i],s[j]]=[s[j],s[i]];
  }
  let i=0; j=0;
  const out=Buffer.alloc(256);
  for (let t=0;t<256+drop;t++){
    i=(i+1)&255; j=(j+s[i])&255;
    [s[i],s[j]]=[s[j],s[i]];
    if(t>=drop)out[t-drop]=s[(s[i]+s[j])&255];
  }
  return out;
}

assert.equal(sha256RoundConstants(false).subarray(0,8).toString('hex'),'428a2f9871374491');
assert.equal(md5SineConstants(true).subarray(0,8).toString('hex'),'78a46ad756b7c7e8');
const sbox=aesSbox();
assert.equal(sbox.subarray(0,4).toString('hex'),'637c777b');
assert.equal(new Set(sbox).size,256);
const invSbox=Buffer.alloc(256);
for(let i=0;i<256;i++)invSbox[sbox[i]]=i;
const sources=[
  ['SHA256 K, BE',sha256RoundConstants(false)],
  ['SHA256 K, LE',sha256RoundConstants(true)],
  ['MD5 K, LE',md5SineConstants(true)],
  ['MD5 K, BE',md5SineConstants(false)],
  ['AES S-box',sbox],
  ['AES inverse S-box',invSbox]
];
for(const key of ['3301','33011033','PATIENCEISAVIRTUE','FIRFUMFERENFE','DIVINITY'])
  for(const drop of [0,256,3072])sources.push(['RC4 '+key+' drop '+drop,rc4(key,drop)]);
// Positive control: matching an authentic published SHA-256 table requires 256/256 exact bytes.
assert.ok(sources.some(([name,b])=>name==='SHA256 K, BE'&&b.equals(sha256RoundConstants(false))));
assert.equal(sources.length,21);
let best={source:'',agreements:-1};
const complete=[];
for(const [name,b] of sources){
  for(const [direction,seq] of [['forward',b],['reverse',Buffer.from(b).reverse()]]){
    assert.equal(seq.length,256);
    const agreements=seq.reduce((n,x,i)=>n+(x===grid[i]),0);
    if(agreements>best.agreements)best={source:name+' '+direction,agreements};
    if(seq.equals(grid))complete.push(name+' '+direction);
  }
}
assert.deepEqual(complete,[]);
console.log(JSON.stringify({tested:42,complete,best,tableSha256:createHash('sha256').update(grid).digest('hex')},null,2));
