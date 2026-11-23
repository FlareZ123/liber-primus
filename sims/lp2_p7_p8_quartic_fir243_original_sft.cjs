#!/usr/bin/env node
"use strict";
/**
 * Original p7 ascending GP29 five-red-word quartic as a five-tap GF29 FIR
 * operator on the immediately adjacent p8 243 black runes.
 * Node22: node sims/lp2_p7_p8_quartic_fir243_original_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const gp=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
const ink=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-ink-annotations.json"),"utf8"));
const p7=gp.pages[7].indices,p8=gp.pages[8].indices,p57=gp.pages[57].indices;
const five=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
assert.deepEqual(p7.slice(194),five.flat());
assert.equal(p8.length,255);
const red=ink.pages.find(p=>p.page===8).red_spans;
assert.deepEqual(red.map(x=>[x.start,x.length]),[[0,12]]);
assert.equal(p8.slice(0,12).map(v=>gp.runes[v]).join(""),red[0].runes);
const Q=five.map(w=>w.reduce((a,b)=>a*b%29,1));
assert.deepEqual(Q,[11,26,8,15,2]);
const black=p8.slice(12);assert.equal(black.length,243);
const mod=x=>((x%29)+29)%29;
const inv=x=>{for(let k=1;k<29;k++)if(k*x%29===1)return k;throw Error("singular GP29 element")};
const IoC=x=>{const counts=Array(29).fill(0);for(let k of x)counts[k]++;return counts.reduce((n,k)=>n+k*(k-1),0)/(x.length*(x.length-1))};
const trial=x=>x.map(v=>gp.translit[v]).join("");
const presets=[["zero",[]],["first-four-red",p8.slice(0,4)],["last-four-red",p8.slice(8,12)]];
/** The four preceding symbols before the first source rune are always in chronological order. */
function causal(input,kind,seed=[]){
  let out=[],prefix=[0,0,0,0];if(seed.length===4)prefix=seed.slice();
  const array=(kind==="forward"?input:out);
  for(let i=0;i<input.length;i++){
    let acc=0;
    for(let j=1;j<5;j++) {
      const prev=i-j>=0?array[i-j]:prefix[4+i-j];
      acc+=Q[j]*prev;
    }
    out.push(kind==="forward"?mod(Q[0]*input[i]+acc):mod((input[i]-acc)*inv(Q[0])));
  }
  return out;
}
/** Causal inverse is exactly the opposite of forward filter under identical seed. */
function cyclic(input,kind){
  const n=input.length;
  if(kind==="forward")return input.map((_,i)=>mod(Q.reduce((a,co,j)=>a+co*input[(i-j+n)%n],0)));
  const A=Array.from({length:n},(_,i)=>{
    const row=new Int16Array(n+1);
    for(let j=0;j<5;j++)row[(i-j+n)%n]=Q[j];
    row[n]=input[i];return row;
  });
  for(let j=0;j<n;j++){
    let pivot=j;while(pivot<n&&A[pivot][j]===0)pivot++;
    assert(pivot<n,"cyclic Q polynomial is not invertible modulo X^243-1");
    if(pivot!==j)[A[j],A[pivot]]=[A[pivot],A[j]];
    const scale=inv(A[j][j]);
    for(let k=j;k<=n;k++)A[j][k]=mod(A[j][k]*scale);
    for(let i=0;i<n;i++)if(i!==j&&A[i][j]){
      const a=A[i][j];
      for(let k=j;k<=n;k++)A[i][k]=mod(A[i][k]-a*A[j][k]);
    }
  }
  return A.map(row=>row[n]);
}
let observed=[],positive=0;
for(let direction of ["forward","reverse"]){
  const orig=direction==="forward"?black:[...black].reverse();
  const plant=direction==="forward"?Array.from({length:243},(_,i)=>p57[i%p57.length])
    :Array.from({length:243},(_,i)=>p57[i%p57.length]).reverse();
  for(let [seedName,seed] of presets)for(let kind of ["forward","inverse"]){
    let result=causal(orig,kind,seed);
    const inverseKind=kind==="forward"?"inverse":"forward";
    assert.deepEqual(causal(result,inverseKind,seed),orig);
    const encrypted=causal(plant,"forward",seed);
    assert.deepEqual(causal(encrypted,"inverse",seed),plant);positive++;
    if(direction==="reverse")result.reverse();
    observed.push({direction,framing:seedName,kind,ioc:IoC(result),first70:trial(result.slice(0,70))});
  }
  for(let kind of ["forward","inverse"]){
    let result=cyclic(orig,kind),inverseKind=kind==="forward"?"inverse":"forward";
    assert.deepEqual(cyclic(result,inverseKind),orig);
    const encrypted=cyclic(plant,"forward");
    assert.deepEqual(cyclic(encrypted,"inverse"),plant);positive++;
    if(direction==="reverse")result.reverse();
    observed.push({direction,framing:"cyclic",kind,ioc:IoC(result),first70:trial(result.slice(0,70))});
  }
}
assert.equal(observed.length,16);assert.equal(positive,16);
const sorted=observed.slice().sort((a,b)=>b.ioc-a.ioc);
const nativeIoC=IoC(p57);assert(nativeIoC>0.06);
assert(Math.max(...observed.map(x=>x.ioc))<0.04);
console.log(JSON.stringify({original:{p7FiveProducts:Q,redTitle:12,p8Black:243,p8OriginalIoC:IoC(black),solvedP57IoC:nativeIoC},
 scope:"Q(X)=11+26X+8X^2+15X^3+2X^4 over GP29, 3 causal starts and cyclic, forward/reversed tape, direct/inverse 16 original models",
 candidateCount:observed.length,positiveExactRecovered:positive,best:sorted.slice(0,5),iocRange:[sorted.at(-1).ioc,sorted[0].ioc],
 result:"NO FULL 243-RUNE NATIVE GP29 PLAINTEXT IN THIS UNFITTED SOURCE QUARTIC FIR FAMILY"},null,2));
