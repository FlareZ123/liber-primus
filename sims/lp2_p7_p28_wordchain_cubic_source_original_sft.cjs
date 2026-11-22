'use strict';
/**
 * One frozen stateful word-number inversion: full-BASE29 p-adic
 * unit-part cube with two previous actual ciphertext runes as the
 * next word's two-digit low-order additive feedback.
 *
 * Historical motivation: signed 2013 BASE29 whole integers + DH
 * arithmetic; original p7 red word [23,3] and the independent p28
 * local "READ OUT" cube; 2016 signed "words are the map" line.
 * Neither source explicitly authorizes this equation nor a receiver.
 * It is one genuinely changing-state source-shaped *hypothesis*.
 *
 * For each full printed word of L runes:
 * B=29^L, t=29*C_(prev-2)+C_(prev-1), X=C_as_BASE29
 * Y=(X−t) mod B.
 * P= T_3^(-1)(Y), where T_3(29^v*u)
 *  =29^v * u^3 mod29^L, and 29 does not divide u.
 * C=T_3(P)+t modB.  This is a bijection including leading 0 runes.
 *
 * Windows11 Node22:
 * node sims/lp2_p7_p28_wordchain_cubic_source_original_sft.cjs
 * Read-only, dependency-free CommonJS.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseLP2Words}=require('./lp2_word_pages.cjs');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const wordsSource=parseLP2Words(read('resources/lp2-transcription.txt'),55);
const runeToIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const words=wordsSource.words.map(x=>[...x.runes].map(r=>{
 const v=runeToIndex.get(r);assert.notEqual(v,undefined);return v;
}));
const raw=words.flat(),original=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(words.length,2896);
assert.equal(wordsSource.crossPageWords,32);
assert.equal(raw.length,12956);
assert.deepEqual(raw,original);
const p7=read('resources/lp2-transcription.txt').split('%')[7].split('&')[1];
const red=p7.match(/[\u16a0-\u16ff]+/gu);
assert.deepEqual(red.map(x=>[...x].length),[2,4,3,2,3]);
assert.deepEqual([...red[0]].map(x=>runeToIndex.get(x)),[23,3]);
const base=29n;
/** @param {bigint} a @param {bigint} m */
const mod=(a,m)=>(a%m+m)%m;
/** @param {bigint} a @param {bigint} b @param {bigint} n */
function powmod(a,b,n){
 let x=mod(a,n),out=1n;
 while(b>0n){if(b&1n)out=out*x%n;x=x*x%n;b>>=1n;}
 return out;
}
/** @param {bigint} a @param {bigint} m */
function invmod(a,m){
 let t=0n,newt=1n,r=m,newr=mod(a,m);
 while(newr!==0n){
  const q=r/newr;
  [t,newt]=[newt,t-q*newt];
  [r,newr]=[newr,r-q*newr];
 }
 assert.equal(r,1n);
 return mod(t,m);
}
/** @param {number[]} digits */
const integer=digits=>digits.reduce((x,c)=>x*29n+BigInt(c),0n);
/** @param {bigint} x @param {number} L */
function digits(x,L){
 const out=Array(L);
 for(let i=L-1;i>=0;i--){out[i]=Number(x%29n);x/=29n;}
 assert.equal(x,0n);return out;
}
/** @param {bigint} x @param {number} L @param {boolean} invert */
function cubeUnit(x,L,invert){
 if(x===0n)return 0n;
 let y=x,v=0;
 while(y%29n===0n){y/=29n;v++;}
 assert(v<L);
 const ring=29n**BigInt(L-v);
 const phi=28n*29n**BigInt(L-v-1);
 const e=invert?invmod(3n,phi):3n;
 return 29n**BigInt(v)*powmod(y,e,ring);
}
for(let L=1;L<=14;L++){
 const B=29n**BigInt(L);
 for(const x of [0n,1n,2n,28n,29n,58n,29n**BigInt(L-1),B-1n].filter(x=>x<B)){
  assert.equal(cubeUnit(cubeUnit(x,L,false),L,true),x);
 }
}
/**
 * @param {number[][]} ww Whole printed words, source-sized
 * @param {boolean} invert Invert ciphertext->plaintext when true
 * @returns {number[][]}
 */
function transform(ww,invert){
 const out=[];
 let prev=[0,0];
 for(const word of ww){
  const L=word.length,B=29n**BigInt(L),t=BigInt(prev[0]*29+prev[1])%B;
  const X=integer(word);
  const value=invert?
   cubeUnit(mod(X-t,B),L,true):
   mod(cubeUnit(X,L,false)+t,B);
  const got=digits(value,L);
  out.push(got);
  // State ALWAYS advances on the actual known/generated ciphertext.
  const cipher=invert?word:got;
  prev=prev.concat(cipher).slice(-2);
 }
 return out;
}
/** @param {number[]} a */
function stats(a){
 const hist=Array(29).fill(0);
 a.forEach(v=>hist[v]++);
 const n=a.length;
 return {n,ioc:Number((hist.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1))).toFixed(11)),
  top5:hist.slice().sort((a,b)=>b-a).slice(0,5).reduce((s,v)=>s+v,0)};
}
const decoded=transform(words,true),reencoded=transform(decoded,false);
assert.deepEqual(reencoded,words);
const plain=decoded.flat();
let starts=new Map(),n=0;
for(const p of gp.pages.filter(p=>p.page<=55)){starts.set(p.page,n);n+=p.indices.length;}
/** @param {number} first @param {number} afterLast */
function segment(first,afterLast){
 const start=starts.get(first),end=starts.get(afterLast);
 const x=plain.slice(start,end);
 return {pages:first+'-'+(afterLast-1),...stats(x),
  first100:x.slice(0,100).map(v=>gp.translit[v]).join(' ')};
}
const origSegments=[segment(3,8),segment(16,22),segment(40,54)];
const inputs=(read('resources/control/shakespeare_first300k.txt')
 .toUpperCase().match(/[A-Z]+/g)||[]);
const tokens=gp.translit.map((s,i)=>({s,i}))
 .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} w @returns {number[]} */
function native(w){
 const x=w.replace(/QU/g,'CW').replace(/V/g,'U')
  .replace(/[KQ]/g,'C').replace(/Z/g,'S')
  .replace(/ING/g,'NG').replace(/IO/g,'IA');
 const result=[];
 for(let i=0;i<x.length;){
  const match=tokens.find(t=>x.startsWith(t.s,i));
  assert(match,'Missing GP token in '+x.slice(i));
  result.push(match.i);i+=match.s.length;
 }
 return result;
}
const byLength=new Map();
for(const w of inputs){
 const arr=native(w),key=arr.length;
 if(!byLength.has(key))byLength.set(key,[]);
 byLength.get(key).push(arr);
}
const chosen=Array.from({length:15},()=>0);
const reference=words.map(w=>{
 const pool=byLength.get(w.length);
 assert(pool?.length, 'Native source missing GP word length '+w.length);
 return pool[(chosen[w.length]++)%pool.length].slice();
});
assert.deepEqual(reference.map(w=>w.length),words.map(w=>w.length));
const ciphertext=transform(reference,false);
const reread=transform(ciphertext,true);
assert.deepEqual(reread,reference);
const rp=reference.flat(),rc=ciphertext.flat();
const solved=gp.pages.find(p=>p.page===57).indices;
assert.equal(solved.length,95);
const solvedCipher=transform([solved],false);
assert.deepEqual(transform(solvedCipher,true),[solved]);
console.log(JSON.stringify({
 source:{nWords:words.length,nRunes:raw.length,acrossPageWords:wordsSource.crossPageWords,
   p7RedFirst:[23,3],wordExponent:3,
   chaining:'last TWO actual ciphertext runes as low-order additive two-digit state'},
 original:{ciphertext:stats(raw),decoded:stats(plain),
   sections:origSegments,decodedFirst150:plain.slice(0,150).map(v=>gp.translit[v]).join(' ')},
 native:{sourceGpPlain:stats(rp),encrypted:stats(rc),
   allMatchedWords:reference.length,wholeRecovered:rp.length,
   p57Recovered:solved.length,exactOriginalForwardReplay:true},
 decision:'A complete reversible stateful original-word transform; decode not GP prose on p3–7, p16–21 or p40–53. Reject this exact spec, not arbitrary word-state ciphers.'
},null,2));
console.log('PASS: authentic corpus, physical word carries, p7 source operand, genuine full native word-positive, p57 solved and original inverse replay');
