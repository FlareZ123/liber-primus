"use strict";
/**
 * Director #2137. Single source-selected algebraic original receiver
 * committed AFTER the source/holdout plan:
 * workplace/agent27-p29-p50-shared-root24-heldout-gate.md
 *
 * Original source: p39 red G=15(X-24)^2, p29 277 runes,
 * p50 256 printed base60 bytes. High-first GF29 coefficients.
 * Test common quotient affine identity Qp = Qt + 2, 21-degree padding,
 * then the only forced second-order residual M=(Qp-Qt-2)/(X-24)^2.
 * No key, offset, language tuning or alternative phase. Windows Node22 CJS.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(ROOT,f),"utf8").replace(/\r\n/g,"\n");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const P=gp.pages.find(p=>p.page===29).indices;
const T=grid.byte_rows.flat();
const M=29,R=24,G=[15,5,27],F=[1,10,25],mod=x=>((x%M)+M)%M;
assert.equal(P.length,277);assert.equal(T.length,256);
assert.deepEqual(P.slice(0,3),[2,23,6]);
assert.deepEqual(T.slice(0,3),[203,231,167]);
/** @param {number[]} vals */
function fnv(vals) {
  let h=0x811c9dc5;
  for(const n of vals){h^=n;h=Math.imul(h,0x01000193)>>>0;}
  return h.toString(16).padStart(8,"0");
}
assert.equal(fnv(P.slice(-32)),"b5b174ba");
assert.equal(fnv(T.slice(-32)),"28de31c7");
const inverse=Array(M).fill(-1);
for(let x=1;x<M;x++)for(let y=1;y<M;y++)
  if(x*y%M===1)inverse[x]=y;
assert.equal(inverse[15],2);
/** Exact high-first GF29 division; does not alter source coefficients.
 * @param {number[]} a @param {number[]} b
 */
function divide(a,b) {
  assert(a.length>=b.length);
  const q=Array(a.length-b.length+1).fill(0), rem=a.map(mod);
  for(let i=0;i<q.length;i++){
    const v=mod(rem[i]*inverse[mod(b[0])]);
    q[i]=v;
    for(let j=0;j<b.length;j++)rem[i+j]=mod(rem[i+j]-v*b[j]);
  }
  assert(rem.slice(0,q.length).every(v=>v===0));
  return {quotient:q,remainder:rem.slice(q.length)};
}
/** @param {number[]} a @param {number[]} b */
function multiply(a,b) {
  const c=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)
    for(let j=0;j<b.length;j++)c[i+j]=mod(c[i+j]+a[i]*b[j]);
  return c;
}
/** @param {number[]} a */
function derivative(a){
  return a.slice(0,-1).map((v,i)=>mod(v*(a.length-1-i)));
}
/** @param {number[]} a @param {number} at */
function evaluate(a,at) {return a.reduce((v,c)=>mod(v*at+c),0);}
/** The coefficients of A(R+z) for z powers0..4. @param {number[]} a */
function jets(a){
  let poly=a.slice(), factorial=1;
  const out=[];
  for(let n=0;n<5;n++) {
    if(n>1)factorial=mod(factorial*n);
    out.push(mod(evaluate(poly,R)*inverse[factorial]));
    poly=derivative(poly);
  }
  return out;
}
/** @param {number[]} vals */
function ioc(vals) {
  const hist=Array(M).fill(0);
  for(const v of vals)hist[v]++;
  return hist.reduce((s,n)=>s+n*(n-1),0)/(vals.length*(vals.length-1));
}
/** @param {number[]} vals */
const latin=vals=>vals.map(i=>gp.translit[i]).join("");
const pDiv=divide(P,G),tDiv=divide(T,G);
assert.deepEqual(pDiv.remainder,[0,0]);
assert.deepEqual(tDiv.remainder,[0,0]);
const qP=pDiv.quotient,qT=tDiv.quotient;
assert.equal(qP.length,275);assert.equal(qT.length,254);
assert.deepEqual(jets(P).slice(0,2),[0,0]);
assert.deepEqual(jets(T).slice(0,2),[0,0]);
const jetP=jets(qP),jetT=jets(qT);
assert.deepEqual(jetP.slice(0,2),[25,12]);
assert.deepEqual(jetT.slice(0,2),[23,12]);
// Natural high-first degree alignment; no phase or interpolation.
const tablePad=Array(21).fill(0).concat(qT),expected=tablePad.slice();
expected[274]=mod(expected[274]+2);
const matches=qP.map((v,i)=>Number(v===expected[i]));
const tested=matches.slice(21);
assert.equal(tested.length,254);
const train= tested.slice(0,222).reduce((s,v)=>s+v,0);
const withheld= tested.slice(222).reduce((s,v)=>s+v,0);
const firstMismatch=tested.indexOf(0);
const maxEqualRun=(()=>{let best=0,now=0;
  for(const v of tested){if(v){now++;best=Math.max(best,now);}else now=0;}
  return best;
})();
const difference=qP.map((v,i)=>mod(v-tablePad[i]-(i===274?2:0)));
const projected=divide(difference,F);
assert.deepEqual(projected.remainder,[0,0]);
const originalResidual=projected.quotient;
assert.equal(originalResidual.length,273);
const reconstruct=(body)=>{
  assert.equal(body.length,273);
  const factor=multiply(body,F);
  assert.equal(factor.length,275);
  const coded=factor.map((v,i)=>mod(v+tablePad[i]+(i===274?2:0)));
  return multiply(coded,G);
};
assert.deepEqual(reconstruct(originalResidual),P);
assert.deepEqual(multiply(qT,G),T.map(mod));
// Native original source solved GP plant: independently obtained LP1 runes
// then constructed *under the frozen formula* with the actual p50 donor.
const originalLP1=read("resources/transcriptions/lp1_wulfic_canonical.txt");
const start=originalLP1.indexOf("ᚦᛖ-ᛚᚩᛋᛋ");
const stop=originalLP1.indexOf("\n$\n%\n",start);
assert(start>=0&&stop>start);
const validRunes=new Map(gp.runes.map((r,i)=>[r,i]));
const sourcePlain=Array.from(originalLP1.slice(start,stop))
  .filter(c=>validRunes.has(c)).map(c=>validRunes.get(c));
assert(sourcePlain.length>=273);
const planted=sourcePlain.slice(0,273),syntheticCipher=reconstruct(planted);
assert.equal(syntheticCipher.length,277);
const syntheticQ=divide(syntheticCipher,G).quotient;
const recovered=divide(syntheticQ.map((v,i)=>
  mod(v-tablePad[i]-(i===274?2:0))),F);
assert.deepEqual(recovered.remainder,[0,0]);
assert.deepEqual(recovered.quotient,planted);
assert.deepEqual(reconstruct(recovered.quotient),syntheticCipher);
const output={
 source:{p29RuneCount:P.length,tableByteCount:T.length,root:R,
    G,tablePadding21:true,p29Last32FNV:fnv(P.slice(-32)),
    p50Last32FNV:fnv(T.slice(-32))},
 originalIdentity:{quotientLengths:[qP.length,qT.length],
    exactQuotientRelation:matches.every(Boolean),firstComparedMismatch:firstMismatch,
    matchesFirst222:train,matchesWithheldLast32:withheld,
    totalMatches:tested.reduce((s,v)=>s+v,0),
    maximumConsecutiveIdenticalCoefficients:maxEqualRun},
 originalJets:{p29:jetP,p50:jetT,
    higherJetMatches:jetP.slice(2).map((v,i)=>v===jetT[i+2])},
 originalResidual:{runes:originalResidual.length,
    indexOfCoincidence:ioc(originalResidual),
    openingNativeGp:latin(originalResidual.slice(0,140)),
    endingNativeGp:latin(originalResidual.slice(-80)),
    exactForwardReplay:true},
 planted:{source:"first 273 original solved-LP1 GP symbols",
    recoveredRUnes:recovered.quotient.length,exact273:true,
    plantedIoc:ioc(planted),sourcePlainPrefix:latin(planted.slice(0,55)),
    exactForwardReplay:true},
 decision:"Printed-order shared root24 supports only two normalized Taylor jets. " +
   "The complete common affine quotient is absent; the fully derived source-only " +
   "273-rune residual is not readable GP English. No plaintext or key recovered."
};
console.log("summary",JSON.stringify(output));
