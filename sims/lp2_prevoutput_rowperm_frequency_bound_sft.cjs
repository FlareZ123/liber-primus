"use strict";
/**
 * All-secret predecessor-ciphertext-row permutation GP29 frequency cap.
 * Node 22 CommonJS. Each C[i] = perm[C[i-1]][P[i]] within a physical page.
 * The 29 keyed perm rows are arbitrary but fixed over the book.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const {runes,translit}=corpus;
assert.deepEqual(solved.runes,runes);
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
const sizes=pages.map(p=>p.indices.length);
assert.equal(sizes.reduce((a,b)=>a+b,0),12956);
/** @param {number[][]} tapes */
function matrix(tapes){
 const m=Array.from({length:29},()=>Array(29).fill(0));
 for(const page of tapes)for(let i=1;i<page.length;i++)m[page[i-1]][page[i]]++;
 return m;
}
/** @param {number[][]} m @param {number} firstPositions */
function bound(m,firstPositions){
 const maxima=m.map(row=>Math.max(...row));
 const total=m.flat().reduce((a,b)=>a+b,0);
 const conditionalNumerator=m.reduce((s,row)=>s+row.reduce((a,n)=>a+n*(n-1),0),0);
 const conditionalDenominator=m.reduce((s,row)=>{
  const n=row.reduce((a,b)=>a+b,0); return s+n*(n-1);
 },0);
 return {transitions:total,rowMaxima:maxima,maxEligible:maxima.reduce((a,b)=>a+b,0),
   maxComplete:maxima.reduce((a,b)=>a+b,firstPositions),
   conditionalIoC:conditionalNumerator/conditionalDenominator};
}
const original=bound(matrix(pages.map(p=>p.indices)),55);
assert.deepEqual([original.transitions,original.maxEligible,original.maxComplete],
 [12901,714,769]);
assert(Math.abs(original.conditionalIoC-0.035367874268005105)<1e-12);
const native=solved.sections.flatMap(s=>[...s.source_text]
 .filter(ch=>runes.includes(ch)).map(ch=>runes.indexOf(ch)));
const refs=[
 "resources/external/2013-book-of-law-I.txt",
 "resources/external/2013-book-of-law-II.txt",
 "resources/external/2013-book-of-law-III.txt",
 "resources/external/cicada2012-blake-marriage-gutenberg45315.txt"
];
const special=["ING","TH","EO","NG","OE","AE","IA","EA"];
/** @param {string} raw */
function gp(raw){
 const out=[];
 for(const plainWord of raw.toUpperCase().match(/[A-Z]+/g)??[]){
  const w=plainWord.replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  for(let j=0;j<w.length;){
   const token=special.find(t=>w.startsWith(t,j));
   const t=token==="ING"?"NG":token??w[j],index=translit.indexOf(t);
   assert(index>=0);out.push(index);j+=token?token.length:1;
  }
 }
 return out;
}
const english=native.concat(refs.flatMap(file=>gp(read(file))));
assert.equal(english.length,57998);
const E=translit.indexOf("E"),englishE=english.filter(x=>x===E).length;
assert(englishE/english.length>.1);
function random(seed){
 let state=seed>>>0;
 return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
  return (state>>>0)/4294967296;};
}
function permutations(seed){
 const rand=random(seed);
 return Array.from({length:29},()=>{
  const p=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){const j=Math.floor(rand()*(i+1));[p[i],p[j]]=[p[j],p[i]];}
  return p;
 });
}
function planted(n){
 const plain=english.slice(12956*n,12956*(n+1));
 assert.equal(plain.length,12956);
 let at=0;
 const paragraphs=sizes.map(L=>{const p=plain.slice(at,at+L);at+=L;return p;});
 const key=permutations(0x33013101+n);
 const inverse=key.map(row=>{
  const v=Array(29).fill(-1);
  for(let i=0;i<29;i++)v[row[i]]=i;
  assert(v.every(i=>i>=0));return v;
 });
 const ciphertext=paragraphs.map(p=>{
  const c=[p[0]];for(let i=1;i<p.length;i++)c.push(key[c[i-1]][p[i]]);
  return c;
 });
 const recovered=ciphertext.map(c=>{
  const p=[c[0]];for(let i=1;i<c.length;i++)p.push(inverse[c[i-1]][c[i]]);
  return p;
 });
 assert.deepEqual(recovered,paragraphs);
 const ECount=plain.filter(x=>x===E).length;
 const max=bound(matrix(ciphertext),55);
 assert(ECount>original.maxComplete);
 assert(ECount<=max.maxComplete);
 return {control:n,roundTrip:plain.length,actualE:ECount,
  secretIndependentEUpperBound:max.maxComplete,
  conditionalIoC:max.conditionalIoC};
}
function run(){
 const plantedControls=[0,1,2].map(planted);
 const out={
  original:{runes:12956,pages:55,...original,maxPlainFrequency:original.maxComplete/12956},
  historicalControl:{runes:english.length,solvedRunes:native.length,
   ECount:englishE,EFraction:englishE/english.length},
  plantedControls,
  scope:"For C_i=pi[C_(i-1)](P_i) with 29 fixed independent row permutations, every GP plaintext rune occurs at most 769 times in original LP2. Incompatible with ordinary GP-native English, conditional on E or another rune exceeding 5.935%. Page starts completely free; no key or plaintext recovered."
 };
 console.log(JSON.stringify(out,null,2));return out;
}
if(require.main===module)run();
module.exports={run,bound,matrix};
