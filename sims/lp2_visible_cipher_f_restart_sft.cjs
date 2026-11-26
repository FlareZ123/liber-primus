'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ref=read('resources/liber-primus/lp1-plaintext-reference.txt');
const mod=x=>((x%29)+29)%29;
const primes=[];
for(let n=2;primes.length<5000;n++){let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break;}if(ok)primes.push(n);}
const shifts=primes.map(p=>mod(p-1));
const alphabet=corpus.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
const page=n=>corpus.pages.find(p=>p.page===n).indices;
function plaintextPage(n){
 const sec=n===56?ref.match(/### 56([\s\S]*?)(?=### 57|$)/)[1]:ref.match(/### 57([\s\S]*)$/)[1];
 const words=sec.split(/\s+/u).filter(Boolean).filter(w=>!(w.length>8&&/^[0-9a-f]+$/iu.test(w)));
 return words.flatMap(raw=>{
  const w=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA').replace(/[^A-Z]/g,'');
  const out=[];
  for(let i=0;i<w.length;){const a=alphabet.find(x=>w.startsWith(x.token,i));assert.ok(a,'unmapped '+raw);out.push(a.index);i+=a.token.length;}
  return out;
 });
}
function encode(p){
 let t=0,literal=0,consuming=0;const c=[];
 for(const x of p){const y=x===0?0:mod(x+shifts[t]);c.push(y);if(y===0){if(x===0)literal++;else consuming++;t=0;}else t++;}
 return {cipher:c,literal,consuming};
}
function decode(c){
 let t=0,paths=1n;const trace=[];
 for(let i=0;i<c.length;i++){
  const y=c[i],shift=shifts[t],prime=primes[t];
  if(y===0){const choices=[0],q=mod(-shift);if(q!==0)choices.push(q);paths*=BigInt(choices.length);trace.push({offset:i,choices,cursor:t,prime,shift});t=0;}
  else{const p=mod(y-shift);if(p===0)return {ok:false,first:{offset:i,ciphertext:y,cursor:t,prime,shift,forcedPlaintext:0},trace};trace.push({offset:i,choices:[p],cursor:t,prime,shift});t++;}
 }
 return {ok:true,paths,trace};
}
function contains(p,c){
 if(p.length!==c.length)return false;let t=0;
 for(let i=0;i<p.length;i++){const q=shifts[t];if(c[i]===0){const choices=[0],v=mod(-q);if(v!==0)choices.push(v);if(!choices.includes(p[i]))return false;t=0;}else{const v=mod(c[i]-q);if(v===0||v!==p[i])return false;t++;}}
 return true;
}
const p56=plaintextPage(56),p57=plaintextPage(57),c56=page(56),c57=page(57);
assert.equal(p56.length,85);assert.equal(p57.length,95);assert.deepEqual(p57,c57);
let k=0;const standard=p56.map(p=>p===0?0:mod(p+shifts[k++]));
assert.equal(k,84);assert.deepEqual(standard,c56);
assert.deepEqual(p56.map((p,i)=>p===0?i:null).filter(x=>x!==null),[56]);
assert.deepEqual(c56.map((c,i)=>c===0?i:null).filter(x=>x!==null),[35,47,51,56,74]);
assert.equal(p56[35],24);assert.equal(c56[35],0);assert.equal(primes[35],151);assert.equal(shifts[35],5);
let t=0,mismatch=null;
for(let i=0;i<p56.length;i++){const expected=p56[i]===0?0:mod(p56[i]+shifts[t]);if(expected!==c56[i]){mismatch={offset:i,plaintext:p56[i],actualCiphertext:c56[i],predictedCiphertext:expected,cursor:t,prime:primes[t],shift:shifts[t],previousObservedCiphertextWasZero:c56[i-1]===0};break;}t=c56[i]===0?0:t+1;}
assert.deepEqual(mismatch,{offset:36,plaintext:16,actualCiphertext:27,predictedCiphertext:17,cursor:0,prime:2,shift:1,previousObservedCiphertextWasZero:true});
const plants=[{page:56,plain:p56},{page:57,plain:p57}].map(x=>{const e=encode(x.plain),d=decode(e.cipher);assert.ok(e.literal&&e.consuming);assert.ok(d.ok);assert.ok(contains(x.plain,e.cipher));return {page:x.page,runes:x.plain.length,literalFEvents:e.literal,consumingZeroEvents:e.consuming,ciphertextZeroEvents:e.cipher.filter(y=>y===0).length,inverseCandidatePlaintexts:d.paths.toString(),truePlaintextRetained:true};});
assert.deepEqual(plants.map(x=>[x.literalFEvents,x.consumingZeroEvents]),[[1,1],[3,3]]);
assert.deepEqual(plants.map(x=>x.inverseCandidatePlaintexts),['4','64']);
const training=corpus.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
const heldout=corpus.pages.filter(p=>p.page>=54&&p.page<=55).flatMap(p=>p.indices);
const original=decode(training),p40=page(40).slice(0,5);
assert.equal(training.length,3008);assert.equal(heldout.length,308);
assert.deepEqual(p40,[0,9,19,26,6]);assert.equal(original.ok,false);
assert.deepEqual(original.first,{offset:4,ciphertext:6,cursor:3,prime:7,shift:6,forcedPlaintext:0});
assert.deepEqual(original.trace.slice(0,4).map(x=>x.choices),[[0,28],[8],[17],[22]]);
console.log(JSON.stringify({
 hypothesis:'Observed ciphertext F resets the phi(prime) cursor to prime 2; both literal-F and consuming-zero branches reset.',
 solvedP56Control:{ordinaryPrimeMinusOneReplay:'85/85',consumingShifts:k,literalPlaintextF:[56],ciphertextZeroes:[35,47,51,56,74],firstRestartMismatch:mismatch},
 nativePlants:plants,
 original:{trainingPages:'p40-p53 continuous; p50 numeric-only',trainingRunes:training.length,heldoutPages:'p54-p55 continuous continuation',heldoutRunes:heldout.length,p40FirstFive:p40,reachablePrefix:original.trace.slice(0,4),firstImpossible:original.first,heldoutStatus:'not reached: training inverse is empty at p40 offset 4'},
 decision:'Reject this fixed visible-ciphertext-F restart law; no unknown plaintext or key recovered.'
},null,2));
