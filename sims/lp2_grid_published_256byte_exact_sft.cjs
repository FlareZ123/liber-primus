'use strict';
/**
 * Exact original 256-cell grid fingerprint, no parameter search.
 * Run: node sims/lp2_grid_published_256byte_exact_sft.cjs
 * Constants: RFC 6234 §5.1 (SHA-256), RFC 1321 §3.4 (MD5),
 * FIPS 197 §5.1.1 (AES), original archived Cicada 2014 onion byte sources.
 */
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const g=require('../resources/liber-primus/base60-grid.json');
const historical=require('../resources/cicada-hiddenservice-256-candidates.json');
const alphabet='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(g.alphabet,alphabet);
assert.equal(g.rows.length,32);
assert(g.rows.every(row=>row.length===8));
const words=g.rows.flat();
assert.equal(words.length,256);
const b=Buffer.from(words.map(s=>{
  assert.equal(s.length,2);
  assert(alphabet.includes(s[0])&&alphabet.includes(s[1]));
  return 60*alphabet.indexOf(s[0])+alphabet.indexOf(s[1]);
}));
assert.deepEqual([...b],g.byte_rows.flat());
/** @param {Buffer} source @returns {string} */
const hash=source=>createHash('sha256').update(source).digest('hex');
assert.equal(hash(b),'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const counts=Array.from({length:256},(_,i)=>b.filter(x=>x===i).length);
const distinct=counts.filter(x=>x>0).length;
const duplicates=counts.reduce((n,x)=>n+Math.max(0,x-1),0);
assert.equal(distinct,161);
assert.equal(duplicates,95);
assert.equal(Math.max(...counts),4);
assert.equal(b[7],b[14]); // 183 at both source positions: not a permutation.

// All 64 source-ordered 32-bit SHA-256 constants in RFC 6234 §5.1.
const K=Buffer.from([
'428a2f98 71374491 b5c0fbcf e9b5dba5',
'3956c25b 59f111f1 923f82a4 ab1c5ed5',
'd807aa98 12835b01 243185be 550c7dc3',
'72be5d74 80deb1fe 9bdc06a7 c19bf174',
'e49b69c1 efbe4786 0fc19dc6 240ca1cc',
'2de92c6f 4a7484aa 5cb0a9dc 76f988da',
'983e5152 a831c66d b00327c8 bf597fc7',
'c6e00bf3 d5a79147 06ca6351 14292967',
'27b70a85 2e1b2138 4d2c6dfc 53380d13',
'650a7354 766a0abb 81c2c92e 92722c85',
'a2bfe8a1 a81a664b c24b8b70 c76c51a3',
'd192e819 d6990624 f40e3585 106aa070',
'19a4c116 1e376c08 2748774c 34b0bcb5',
'391c0cb3 4ed8aa4a 5b9cca4f 682e6ff3',
'748f82ee 78a5636f 84c87814 8cc70208',
'90befffa a4506ceb bef9a3f7 c67178f2',
].join('').replace(/\s+/g,''),'hex');
assert.equal(K.length,256);
/** @param {Buffer} x @returns {Buffer} */
function reverse32(x) {const y=Buffer.alloc(x.length);for(let i=0;i<x.length;i+=4)for(let j=0;j<4;j++)y[i+j]=x[i+3-j];return y;}
// RFC 1321 §3.4, MD5 T_i=floor(2^32 abs(sin(i))).
const md5=Buffer.alloc(256);
for(let i=0;i<64;i++)md5.writeUInt32LE(Math.floor(2**32*Math.abs(Math.sin(i+1))),i*4);
assert.equal(md5.subarray(0,8).toString('hex'),'78a46ad756b7c7e8');
// AES S-box implementation from FIPS 197, a bijective 256-byte table.
/** @param {number} a @param {number} x @returns {number} */
function mul(a,x){let v=0;for(let i=0;i<8;i++){if(x&1)v^=a;a=((a<<1)^((a&128)?0x11b:0))&255;x>>>=1;}return v;}
/** @param {number} x @returns {number} */
function inv(x){if(!x)return 0;let z=1;for(let i=0;i<254;i++)z=mul(z,x);return z;}
/** @param {number} x @param {number} n @returns {number} */
function rot(x,n){return ((x<<n)|(x>>>(8-n)))&255;}
const sbox=Buffer.from(Array.from({length:256},(_,i)=>{
 const v=inv(i);return (v^rot(v,1)^rot(v,2)^rot(v,3)^rot(v,4)^0x63)&255;
}));
assert.equal(sbox.subarray(0,8).toString('hex'),'637c777bf26b6fc5');
const inverse=Buffer.alloc(256);
for(let i=0;i<256;i++)inverse[sbox[i]]=i;
assert.equal(new Set(sbox).size,256);
const refs=new Map([
 ['RFC6234 SHA-256 constants BE',K],
 ['RFC6234 SHA-256 constants LE',reverse32(K)],
 ['RFC1321 MD5 sine constants LE',md5],
 ['RFC1321 MD5 sine constants BE',reverse32(md5)],
 ['FIPS197 AES S-box',sbox],
 ['FIPS197 AES inverse S-box',inverse],
 ['RC4 initial permutation',Buffer.from(Array.from({length:256},(_,i)=>i))],
]);
for(const h of historical.sourceServices){
 const v=Buffer.from(h.hex,'hex');assert.equal(v.length,256);
 refs.set('Cicada 2014 '+h.id,v);
}
/** @param {Buffer} x @param {Buffer} y @returns {number} */
function differences(x,y){assert.equal(x.length,y.length);let n=0;for(let i=0;i<x.length;i++)n+=Number(x[i]!==y[i]);return n;}
assert.equal(differences(b,Buffer.from(b)),0); // source-native positive control
const wrong=Buffer.from(b);wrong[42]^=1;
assert.equal(differences(b,wrong),1); // source-native wrong-byte control
console.log('original SHA256='+hash(b)+' distinct='+distinct+' duplicates='+duplicates);
for(const [label,v] of refs){
 const misses=differences(b,v);
 assert(misses>0,'Unexpected exact match: '+label);
 console.log(label+': mismatches='+misses+'/256 reference_SHA256='+hash(v));
}
console.log('controls PASS; no exact matches in frozen reference set');
