'use strict';
/** Source-locked 2014 17 magic rows to original 17 p55 words, all legal F-bypass histories. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const source = fs.readFileSync('resources/cicada2014-openpuff-magic-squares.txt');
assert.equal(source.length,745);
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),
  '9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f');
const rows = source.toString('ascii').split('\r\n').filter(l => /\d/.test(l))
  .map(l => [...l.matchAll(/\d+/g)].map(m => Number(m[0])));
assert.deepEqual(rows.map(r => r.length),
  [...Array(5).fill(5), ...Array(7).fill(7), ...Array(5).fill(5)]);
/** @param {number} n positive integer @returns {number} Euler totient */
function phi(n) {
  let v=n,q=n;
  for(let p=2;p*p<=q;p++){if(q%p!==0)continue;while(q%p===0)q/=p;v-=v/p;}
  if(q>1)v-=v/q;
  return v;
}
const original = corpus.pages.find(p => p.page===55).indices;
const lens=[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
let start=0;
const words=lens.map(n=>{const w=original.slice(start,start+n);start+=n;return w;});
assert.equal(start,76);
assert.deepEqual(words.map(w=>w.length),lens);
/** @param {number[]} cipher original GP ciphertext
 * @param {number[]} key numeric historical source shifts
 * @param {1|-1} sign C=P+sign*key
 * @returns {number|null} first impossible rune, or null if feasible. */
function impossible(cipher,key,sign) {
 let states=new Set([0]);
 for(let pos=0;pos<cipher.length;pos++) {
   const next=new Set();
   for(const phase of states) {
     if(cipher[pos]===0)next.add(phase);
     const p=((cipher[pos]-sign*key[phase])%29+29)%29;
     if(p!==0)next.add((phase+1)%key.length);
   }
   if(!next.size)return pos;
   states=next;
 }
 return null;
}
/** @param {number[]} plain GP plaintext
 * @param {number[]} key source shifts @param {1|-1} sign
 * @returns {number[]} encrypted GP ciphertext */
function encrypt(plain,key,sign) {
 let phase=0;
 return plain.map(p=>{
   if(p===0)return 0;
   const c=((p+sign*key[phase])%29+29)%29;
   phase=(phase+1)%key.length;return c;
 });
}
const expected={
 'raw,1':[[4,1]],'raw,-1':[[5,1],[11,1],[13,0]],
 'phi,1':[[13,1],[17,2]],'phi,-1':[[16,0]]
};
assert.equal(corpus.pages.find(p=>p.page===57).indices.length,95);
for(const type of ['raw','phi']) for(const sign of [1,-1]) {
 const failing=[];
 for(let i=0;i<17;i++) {
   const key=rows[i].map(n=>((type==='raw'?n:phi(n))%29));
   const observed=impossible(words[i],key,sign);
   if(observed!==null)failing.push([i+1,observed]);
   const native=Array.from({length:words[i].length},
     (_,j)=>corpus.pages.find(p=>p.page===57).indices[(i*7+j)%95]);
   const plant=encrypt(native,key,sign);
   assert.equal(impossible(plant,key,sign),null,'positive native GP source plant');
 }
 assert.deepEqual(failing,expected[`${type},${sign}`]);
 console.log(JSON.stringify({keyModel:type,sign,originalFailingWordOffsets:failing,
   originalFull76DecoderPossible:failing.length===0,nativeControlWordsPassing:17}));
}
console.log('PASS: all four source-key p55 models contradicted by unchanged original words, 68 native plants valid');
