"use strict";
/**
 * Entire GF(29^238) Frobenius orbit on the unique 238-rune LP2 p36.
 * Original polynomial: forward printed base60 grid, GF29, exact degree238
 * irreducible factor. No fitted key, plaintext or affine rune alphabet.
 * Node.js 22: node sims/grid238_p36_frobenius_orbit_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const json=p=>JSON.parse(read(p));
const grid=json("resources/liber-primus/lp2-grid-256.json");
const corpus=json("resources/liber-primus/lp2-corpus.json");
const N=238,F=29,mod=x=>((x%F)+F)%F;
function inverse(x){for(let y=1;y<F;y++)if((x*y)%F===1)return y;throw Error("zero divisor");}
function trim(a){let n=a.length;while(n>1&&a[n-1]===0)n--;return a.slice(0,n);}
function divide(p,q){
 const r=p.slice(),out=Array(r.length-q.length+1).fill(0);
 for(let i=out.length-1;i>=0;i--){
  const coefficient=mod(r[i+q.length-1]*inverse(q.at(-1)));
  out[i]=coefficient;
  for(let j=0;j<q.length;j++)r[i+j]=mod(r[i+j]-coefficient*q[j]);
 }
 assert(r.slice(0,q.length-1).every(x=>x===0));
 return trim(out);
}
assert.equal(grid.bytes.length,256);
let factor=trim(grid.bytes.map(x=>x%F).reverse());
for(const q of [
 [5,1],[5,1],[11,18,1],[24,16,14,1],[11,15,0,9,1,5,10,20,12,1]
])factor=divide(factor,q);
assert.equal(factor.length,N+1);
factor=factor.map(x=>mod(x*inverse(factor.at(-1))));
assert.equal(factor.at(-1),1);
/** GF(29^238) multiply and reduce modulo the authentic monic factor.
 * @param {number[]} a @param {number[]} b */
function multiply(a,b){
 const out=new Float64Array(2*N-1);
 for(let i=0;i<a.length;i++)if(a[i])
  for(let j=0;j<b.length;j++)if(b[j])out[i+j]+=a[i]*b[j];
 for(let i=out.length-1;i>=N;i--){
  const t=mod(out[i]);
  if(t)for(let j=0;j<N;j++)out[i-N+j]-=t*factor[j];
 }
 return Array.from(out.slice(0,N),mod);
}
function power(a,k){
 let out=Array(N).fill(0);out[0]=1;
 while(k){if(k%2)out=multiply(out,a);a=multiply(a,a);k=Math.floor(k/2);}
 return out;
}
// A single 238x238 matrix for the Frobenius map: sum(a_i X^i)^29
// = sum(a_i X^(29i)) over GF29. No repeated 29th power of the data needed.
const X=Array(N).fill(0);X[1]=1;
const x29=power(X,29),cols=[];
let basis=Array(N).fill(0);basis[0]=1;
for(let i=0;i<N;i++){cols.push(basis);basis=multiply(basis,x29);}
function frobenius(a){
 const out=new Float64Array(N);
 for(let i=0;i<N;i++)if(a[i]){
  const col=cols[i];
  for(let j=0;j<N;j++)out[j]+=a[i]*col[j];
 }
 return Array.from(out,mod);
}
function ioc(a){
 const freq=Array(F).fill(0);for(const x of a)freq[x]++;
 return freq.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
const original=corpus.pages.find(p=>p.page===36).indices;
assert.equal(original.length,N);
const scans=[];
for(const direction of ["forward","reversed"]){
 const source=direction==="forward"?original.slice():original.slice().reverse();
 let state=source.slice();
 for(let k=0;k<N;k++){
  scans.push({direction,k,ioc:ioc(state)});
  state=frobenius(state);
 }
 assert.deepEqual(state,source); // Frobenius^238 is identity in this field
}
assert.equal(scans.length,476);
const best=scans.slice().sort((a,b)=>b.ioc-a.ioc)[0];
assert.deepEqual([best.direction,best.k],["reversed",103]);
assert(Math.abs(best.ioc-0.0379746835443038)<1e-14);
assert(scans.every(x=>x.ioc<0.038));
// Positive source-native GP-English encryption by Frobenius^37,
// with an independent secret affine permutation of all 29 runes.
const tokens=corpus.translit.slice().sort((a,b)=>b.length-a.length);
const ord=new Map(corpus.translit.map((t,i)=>[t,i]));
const gp=[];
for(let word of read("resources/control/shakespeare_first300k.txt")
 .toUpperCase().match(/[A-Z]+/g)||[]){
 word=word.replace(/QU/g,"CW").replace(/V/g,"U")
  .replace(/K/g,"C").replace(/Z/g,"S");
 for(let i=0;i<word.length;){
  const token=tokens.find(t=>word.startsWith(t,i));
  assert(token,"unmapped reference token");
  gp.push(ord.get(token));i+=token.length;
 }
 if(gp.length>=N)break;
}
const native=gp.slice(0,N);
const unknownSubstitution=native.map(x=>mod(11*x+7));
const nativeIoC=ioc(native);
assert(Math.abs(nativeIoC-0.062191965393752435)<1e-14);
let enc=unknownSubstitution.slice();
for(let k=0;k<37;k++)enc=frobenius(enc);
let decoded=enc.slice();
for(let k=0;k<N-37;k++)decoded=frobenius(decoded);
assert.deepEqual(decoded,unknownSubstitution);
assert.equal(ioc(decoded),nativeIoC);
assert(best.ioc<nativeIoC);
console.log(JSON.stringify({
 source:"authentic original p36, degree238 factor, complete Frobenius orbit",
 originalIoC:ioc(original),
 tested:{forward:N,reversed:N,affineRunePermutationFree:true},
 highestIoC:best,
 allOriginalIoCBelow0_038:true,
 independentGpEnglishPlant:{source:"Shakespeare",nativeIoC,
   secretPermutation:"11x+7 mod29",encryptedPower:37,
   inversePower:201,exactRecoveredSymbols:N},
 decision:"direct single-Frobenius cipher of GP-English excluded; no new plaintext"
},null,2));
