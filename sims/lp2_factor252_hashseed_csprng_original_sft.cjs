'use strict';
/**
 * Factor-selected 252-slot GF29 quotient as an AES-256 / ChaCha20 seed:
 * one frozen SHA256-of-raw-GP-coefficients candidate on original p55 and p0.
 * Windows 11 / Node.js 22, no packages. No source authenticates this KDF.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
/** @param {string} name */
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a,b) {
 const v=Array(a.length+b.length-1).fill(0);
 for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)v[i+j]=(v[i+j]+a[i]*b[j])%29;
 return v;
}
/**
 * Exact 252-coefficient quotient, retaining leading zero if present.
 * Coefficients are high degree to low degree, as printed.
 * @param {number[]} bytes
 * @param {number[]} factorAscending
 */
function quotient(bytes,factorAscending) {
 const divisor=[...factorAscending].reverse();
 const remainder=bytes.map(v=>v%29),q=[];
 const inverse=Array.from({length:29},(_,i)=>i).find(v=>v*divisor[0]%29===1);
 assert.notEqual(inverse,undefined);
 for(let i=0;i<=bytes.length-divisor.length;i++){
  const v=remainder[i]*inverse%29;q.push(v);
  for(let j=0;j<divisor.length;j++)remainder[i+j]=(remainder[i+j]-v*divisor[j]%29+29)%29;
 }
 assert(remainder.every(v=>v===0),'Original table must divide exactly by authentic H/G');
 const reconstructed=multiply([...q].reverse(),factorAscending).reverse();
 assert.deepEqual(reconstructed,bytes.map(v=>v%29));
 return q;
}
/** @param {number[]} symbols */
function coincidence(symbols){
 const h=Array(29).fill(0);
 for(const s of symbols)h[s]++;
 return h.reduce((s,v)=>s+v*(v-1),0)/(symbols.length*(symbols.length-1));
}
/** @param {number} number @returns {number} */
const mod29=number=>(number%29+29)%29;
/** @param {number[]} symbols @param {number[]} ks @param {number} sign */
const decode=(symbols,ks,sign)=>symbols.map((c,i)=>mod29(c+sign*(ks[i]%29)));
/** @param {number[]} symbols @param {number[]} ks @param {number} sign */
const encode=(symbols,ks,sign)=>symbols.map((p,i)=>mod29(p-sign*(ks[i]%29)));
const grid=read('resources/liber-primus/lp2-grid-256.json');
const bytes=grid.pages.flatMap(page=>page.bytes);
assert.equal(bytes.length,256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
 '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const factor=multiply([3,26,24],[27,5,15]);
assert.deepEqual(factor,[23,21,11,17,12]);
const q=quotient(bytes,factor);
assert.equal(q.length,252);
assert.deepEqual(q.slice(0,8),[0,12,9,28,2,25,23,21]);
const key=crypto.createHash('sha256').update(Buffer.from(q)).digest();
assert.equal(key.toString('hex'),'dd70d1b1a82c9c52ed32d727ef986548e7cad808844452bc8c18648bec0e4535');
const corpus=read('resources/liber-primus/lp2-corpus.json');
/** @param {number} page */
const original=page=>corpus.pages.find(p=>p.page===page).indices;
const targets=[55,0].map(page=>({page,cipher:original(page)}));
assert.deepEqual(targets.map(t=>t.cipher.length),[76,262]);
const p57=original(57);assert.equal(p57.length,95);
const runs=[];
for(const algorithm of ['aes-256-ctr','chacha20']){
 const iv=Buffer.alloc(16);
 const ks=[...crypto.createCipheriv(algorithm,key,iv).update(Buffer.alloc(262))];
 for(const sign of [-1,1]){
  const planted=encode(p57,ks,sign);
  assert.deepEqual(decode(planted,ks,sign),p57);
  for(const {page,cipher} of targets){
   const output=decode(cipher,ks,sign);
   assert.deepEqual(encode(output,ks,sign),cipher);
   runs.push({algorithm,sign,page,ioc:coincidence(output),
     preview:output.slice(0,90).map(i=>corpus.translit[i]).join('')});
  }
 }
}
const ref=(algorithm,page,sign,value)=>{
 const hit=runs.find(v=>v.algorithm===algorithm&&v.page===page&&v.sign===sign);
 assert(Math.abs(hit.ioc-value)<1e-7,JSON.stringify(hit));
};
ref('aes-256-ctr',55,-1,0.03543859649);
ref('aes-256-ctr',0,-1,0.03538943);
ref('chacha20',55,1,0.041754386);
ref('chacha20',0,-1,0.03348834);
assert(runs.every(r=>r.ioc<0.05));
console.log(JSON.stringify({source:'p49–51 256 bytes, H/G quotient, SHA256 key',
  quotientSHA256:key.toString('hex'),models:8,runs,
  conclusion:'No independently readable native-GP prose or authentic unknown-page key recovered'},null,2));
