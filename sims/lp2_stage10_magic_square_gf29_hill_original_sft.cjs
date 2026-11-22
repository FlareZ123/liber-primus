"use strict";
/**
 * Exact 2014 Stage10 5x5/3301, 7x7/1033, 5x5/1033 magic-square Hill
 * inverses of the original source-visible p33–39 (1680 GP29 runes) chapter.
 * No matrix fitting, offsets, secret basis, or punctuation elision.
 * NIST-style linear algebra positive: inverse(A)*A*P=P on solved p57.
 * CommonJS Node.js 22; no dependencies or file writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const source=fs.readFileSync(path.join(root,"resources/cicada2014-openpuff-magic-squares.txt"),"utf8");
const blocks=source.trim().split(/\r?\n\s*\r?\n/).filter(Boolean)
 .map(b=>b.trim().split(/\r?\n/).map(line=>line.trim().split(/\s+/).map(Number)));
assert.deepEqual(blocks.map(x=>x.length),[5,7,5]);
for(const A of blocks)assert(A.every(x=>x.length===A.length));
const mod=n=>(n%29+29)%29;
/** @param {number} base @param {number} exponent */
function pow(base,exponent){let r=1;for(;exponent>0;exponent=Math.floor(exponent/2)){if(exponent&1)r=mod(r*base);base=mod(base*base);}return r;}
/** @param {number[][]} A */
function inverse(A){
  const n=A.length,a=A.map((r,i)=>[...r.map(mod),...Array.from({length:n},(_,j)=>Number(i===j))]);
  let det=1;
  for(let j=0;j<n;j++){
    let pivot=j;while(pivot<n&&!a[pivot][j])pivot++;
    if(pivot===n)return {det:0,rank:j,inverse:null};
    if(pivot!==j){[a[pivot],a[j]]=[a[j],a[pivot]];det=mod(-det);}
    const value=a[j][j];det=mod(det*value);const inv=pow(value,27);
    for(let k=0;k<2*n;k++)a[j][k]=mod(a[j][k]*inv);
    for(let i=0;i<n;i++)if(i!==j){let factor=a[i][j];for(let k=0;k<2*n;k++)a[i][k]=mod(a[i][k]-factor*a[j][k]);}
  }
  return {det,rank:n,inverse:a.map(row=>row.slice(n))};
}
/** @param {number[][]} A @param {number[]} text */
function hill(A,text){
  const k=A.length;assert.equal(text.length%k,0);
  const out=[];
  for(let start=0;start<text.length;start+=k){
    for(let i=0;i<k;i++)out.push(mod(A[i].reduce((s,n,j)=>s+n*text[start+j],0)));
  }
  return out;
}
/** @param {number[]} items */
function ioc(items){const f=Array(29).fill(0);for(const n of items)f[n]++;return f.reduce((s,n)=>s+n*(n-1),0)/(items.length*(items.length-1));}
const all=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(all.length,12956);
const original=all.slice(7960,9640);
assert.equal(original.length,1680);
assert.equal(original[0],corpus.pages[33].indices[0]);
const reference=corpus.pages[57].indices;
assert.equal(reference.length,95);
const results=blocks.map((A,i)=>{
 const parsed=inverse(A);assert.equal(parsed.rank,A.length);
 const n=A.length, planted=reference.slice(0,Math.floor(95/n)*n);
 const encrypted=hill(A,planted);
 assert.deepEqual(hill(parsed.inverse,encrypted),planted);
 const plaintext=hill(parsed.inverse,original);
 assert.deepEqual(hill(A,plaintext),original);
 return {square:i,dimensions:n,sourceLineSum:A[0].reduce((s,v)=>s+v,0),
   rank:parsed.rank,determinantMod29:parsed.det,
   originalChapterSymbols:original.length,blocks:original.length/n,
   directOriginalIoC:ioc(original),inverseOriginalIoC:ioc(plaintext),
   first35DecodedGP:plaintext.slice(0,35).map(x=>corpus.translit[x]).join(" "),
   originalRoundtrip:true,solvedP57PlantRecovered:true};
});
assert.deepEqual(results.map(x=>x.determinantMod29),[10,2,3]);
assert(results.every(x=>x.inverseOriginalIoC<0.045));
console.log(JSON.stringify({source:"original Stage10 exact three squares; p33–39 original visual 1680-rune GP29 chapter",
   keyOrParameterSearch:"none",cases:results,
   excluded:"literal matrix Hill decryption on this original full-chapter register gives no recognized GP prose",
   reserved:"The p33 post-91-rune 1589-symbol inner body is not divisible by 5 or 7, so direct full-body Hill needs an unprovided padding/rune inclusion rule",
   caveat:"Mod29 linear invertibility and roundtrip are mathematical facts, not evidence the original creator intended Hill encryption or that the operation recovered plaintext."},null,2));
