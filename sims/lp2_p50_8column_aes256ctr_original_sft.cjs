'use strict';
/**
 * Source-selected fixed AES-256-CTR operand test (Agent26, 2026-11-23).
 * Exact register: original 8 '$'-terminated runic sections and the
 * original 32x8 p50 canonical base60 bytes, one 32-byte column per section.
 * Cipher model is conjectured: Cicada did NOT authenticate AES-CTR, zero IV,
 * byte-to-GP29 modulo reduction, or either additive sign as an LP2 cipher.
 * Read-only, no dependencies beyond Node.js 22 built-ins.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const grid=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json','utf8'));
const page=Object.fromEntries(corpus.pages.map(p=>[p.page,p.indices]));
const ranges=[[0,2],[3,7],[8,15],[16,22],[23,26],[27,32],[33,39],[40,55]];
const bytes=grid.pages.flatMap(p=>p.bytes);
assert.equal(bytes.length,256);
assert.equal(ranges.map(([a,b])=>Array.from({length:b-a+1},(_,j)=>page[a+j].length).reduce((s,n)=>s+n,0)).reduce((s,n)=>s+n,0),12956);
const keys=Array.from({length:8},(_,k)=>Buffer.from(Array.from({length:32},(_,i)=>bytes[8*i+k])));
assert(keys.every(k=>k.length===32));
const sections=ranges.map(([a,b])=>Array.from({length:b-a+1},(_,j)=>page[a+j]).flat());
function pad(key,n){
 const cipher=crypto.createCipheriv('aes-256-ctr',key,Buffer.alloc(16));
 return Buffer.concat([cipher.update(Buffer.alloc(n)),cipher.final()]).map(x=>x%29);
}
function transform(plain, key, sign){
 const stream=pad(key,plain.length);
 return plain.map((p,i)=>(p+29+sign*stream[i])%29);
}
function ioc(a){
 const hist=Array(29).fill(0);for(const x of a){assert(x>=0&&x<29);hist[x]++;}
 return hist.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
function hist(a){let h=Array(29).fill(0);for(let x of a)h[x]++;return h;}
function out(a,n){return a.slice(0,n).map(x=>corpus.translit[x]).join(' ');}
const control=page[57];
for(const sign of [+1,-1]){
 const encrypted=transform(control,keys[0],sign),decrypted=transform(encrypted,keys[0],-sign);
 assert.deepEqual(decrypted,control);
 assert.notDeepEqual(encrypted,control);
}
console.log('AUTHENTIC native solved-p57 GP29 plant 95/95 exact AES-256-CTR forward and inverse PASS; true plaintext IOC='+ioc(control).toFixed(6));
const aggregate={'+1':[],'-1':[]};
for(let j=0;j<8;j++){
 const c=sections[j];
 for(const s of [+1,-1]){
  const p=transform(c,keys[j],-s);
  assert.deepEqual(transform(p,keys[j],s),c);
  aggregate[String(s)].push(...p);
  const h=hist(p);
  console.log('section='+j+' pages='+ranges[j].join('-')+' n='+c.length+' cipherSign='+s+
    ' originalCipherIOC='+ioc(c).toFixed(6)+' GPplaintextIOC='+ioc(p).toFixed(6)+
    ' E='+h[18]+'/'+p.length+' mostFrequent='+Math.max(...h)+' startGP='+out(p,40));
 }
}
for(const s of [+1,-1]){
 const p=aggregate[String(s)];
 console.log('TOTAL cipherSign='+s+' n='+p.length+' plaintextIOC='+ioc(p).toFixed(6)+
 ' E='+hist(p)[18]+'/'+p.length+' prefixGP='+out(p,75));
}
console.log('DONE. AES-CTR and key/IV mapping are an unauthenticated candidate; roundtrip is an implementation invariant, not plaintext evidence.');
