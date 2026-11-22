#!/usr/bin/env node
"use strict";

// Reproduce the p32 prime-sampled field bridge and bounded direct-use gates.
// Run from the repository root:
//   node sims/lp2_tree_prime_sample_field_bridge_sft.cjs
//
// The 193 endpoint is the provisional p50 "lies" -> token 3D byte mapping
// documented in the Agent 46 p32 route handoff. This script does not assume
// that the separately archived 2013 remote telnet omission is authenticated.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const mod = n => ((n % 29) + 29) % 29;
const isPrime = n => {
  if (n < 2) return false;
  for (let d=2; d*d<=n; d++) if (n%d===0) return false;
  return true;
};

// GF(29^2) = GF(29)[u]/(u^2 - 3u - 8), from p3 red coefficients
// [13,23,2] in ascending degree order.
const fadd=(a,b)=>[mod(a[0]+b[0]),mod(a[1]+b[1])];
const fsub=(a,b)=>[mod(a[0]-b[0]),mod(a[1]-b[1])];
const fmul=(a,b)=>[
  mod(a[0]*b[0]+8*a[1]*b[1]),
  mod(a[0]*b[1]+a[1]*b[0]+3*a[1]*b[1])
];
const fpow=(a,n)=>{
  let z=[1,0];
  while(n){if(n&1)z=fmul(z,a);a=fmul(a,a);n=Math.floor(n/2);}
  return z;
};
const forder=a=>{
  let z=[1,0];
  for(let n=1;n<=840;n++){z=fmul(z,a);if(z[0]===1&&z[1]===0)return n;}
  return null;
};
const dlog=(base,target,limit)=>{
  let z=[1,0];
  for(let n=0;n<limit;n++){
    if(z[0]===target[0]&&z[1]===target[1])return n;
    z=fmul(z,base);
  }
  return null;
};
const polyEval=(coefficients,x)=>{
  let z=[0,0];
  for(let i=coefficients.length-1;i>=0;i--){
    z=fmul(z,x);z=[mod(z[0]+coefficients[i]),z[1]];
  }
  return z;
};
const baseDigitsHighToLow=(n,radix)=>{
  const d=[];while(n>0){d.push(n%radix);n=Math.floor(n/radix);}return d.reverse();
};

const p32=corpus.pages.find(p=>p.page===32);
assert(p32,"physical p32 must exist");
assert.equal(p32.runic_count,121);
const startPrime=corpus.prime[p32.indices[0]];
assert.equal(startPrime,73,"p32 first rune must have GP prime weight 73");
const endPrime=193; // provisional p50 token 3D endpoint from the 2016 word map
const primeWindow=Array.from({length:endPrime-startPrime+1},(_,i)=>i+startPrime).filter(isPrime);
assert.equal(primeWindow.length,24);
const offsets=primeWindow.map(p=>p-startPrime);
const coefficients=offsets.map(i=>p32.indices[i]);
assert(offsets.every(i=>i>=0&&i<p32.indices.length));
const transliteration=coefficients.map(i=>corpus.translit[i]).join(" ");
const u=[0,1];
assert.deepEqual(polyEval([13,23,2],u),[0,0]);

// Prime-sampled p32 rune indices, in ascending prime order, are polynomial
// coefficients in the same low-to-high convention as the p3 red triad.
const S=polyEval(coefficients,u);
assert.deepEqual(S,[7,13]);
assert.equal(forder(S),280);
const logUS=dlog(u,S,840);
assert.equal(logUS,429);
assert.equal(logUS,3*11*13);

// Historical 2013 ID3 product. Displayed high-to-low BASE29 digits are
// deliberately read as low-to-high polynomial coefficients, matching p3.
const id3Product=1595277641;
const id3Digits=baseDigitsHighToLow(id3Product,29);
assert.deepEqual(id3Digits,[2,19,22,14,20,24,24]);
const P=polyEval(id3Digits,u);
assert.deepEqual(P,[4,13]);
assert.equal(forder(P),140);
assert.deepEqual(fsub(S,P),[3,0]);
assert.deepEqual(fpow(S,242),P); // 242 = 2 * 11^2
const mu=fpow(P,6);
assert.deepEqual(mu,[14,2]);
assert.equal(forder(mu),70);
assert.deepEqual(fpow(S,52),mu);

// p39 red triad [27,5,15] is exactly 15*(X-24)^2 over GF(29).
const root24=[24,0];
assert.deepEqual(polyEval([27,5,15],root24),[0,0]);
assert.equal(mod(5+30*24),0);
assert.deepEqual(fpow(u,120),[7,0]);
assert.deepEqual(fpow(u,360),root24); // 360 = 3*(11^2 - 1)
assert.deepEqual(fpow(S,40),root24);
const nu=[4,14];
assert.deepEqual(fpow(S,179),nu);

// Historical 2014 Interconnectedness 7x7 / 1033 matrix, reduced mod 29.
const A=[
  [7,375,236,190,27,17,181],
  [351,223,14,47,293,98,7],
  [456,232,121,114,72,23,15],
  [16,65,270,331,270,65,16],
  [15,23,72,114,121,232,456],
  [7,98,293,47,14,223,351],
  [181,17,27,190,236,375,7]
].map(row=>row.map(mod));
const v24=[1,10,20,25,20,10,1].map(x=>[x,0]);
const vMu=[[1,0],[27,2],[2,22],[27,10],[2,22],[27,2],[1,0]];
const vNu=[[28,0],[20,24],[24,6],[0,0],[5,23],[9,5],[1,0]];
const matVecField=(M,v)=>M.map(row=>row.reduce(
  (sum,a,j)=>fadd(sum,fmul([a,0],v[j])),[0,0]));
assert.deepEqual(matVecField(A,v24),v24.map(x=>fmul(root24,x)));
assert.deepEqual(matVecField(A,vMu),vMu.map(x=>fmul(mu,x)));
assert.deepEqual(matVecField(A,vNu),vNu.map(x=>fmul(nu,x)));

const identity=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));
const matMul=(X,Y)=>X.map(row=>Y[0].map((_,j)=>mod(row.reduce((s,x,k)=>s+x*Y[k][j],0))));
const matPow=(M,n)=>{
  let z=identity(M.length);
  while(n){if(n&1)z=matMul(z,M);M=matMul(M,M);n=Math.floor(n/2);}
  return z;
};
const I=identity(7);
const properDivisors=[1,2,4,5,7,8,10,14,20,28,35,40,56,70,140];
assert.deepEqual(matPow(A,280),I);
for(const d of properDivisors)assert.notDeepEqual(matPow(A,d),I);

const eigenvalues=[
  ["8",[8,0]],["24",[24,0]],["18",[18,0]],
  ["mu",[14,2]],["mu-conjugate",[20,27]],
  ["nu",[4,14]],["nu-conjugate",[17,15]]
];
const eigenLogs=eigenvalues.map(([name,value])=>({name,value,log:dlog(S,value,280)}));
assert.deepEqual(eigenLogs.map(x=>x.log),[50,40,90,52,108,179,151]);
const spectralLogKey=eigenLogs.map(x=>mod(x.log));
assert.deepEqual(spectralLogKey,[21,11,3,23,21,5,6]);

// Source-fixed p33-39 interval: p33 begins at the later red heading,
// local rune offset 91; append physical pp34-39 unchanged.
const pages=corpus.pages.filter(p=>p.page>=33&&p.page<=39);
const section=pages.flatMap(p=>p.page===33?p.indices.slice(91):p.indices);
assert.equal(section.length,1589);
assert.equal(section.length%7,0);
assert.equal(section.length/7,227);

const score=xs=>{
  const f=Array(29).fill(0);for(const x of xs)f[x]++;
  return {
    ioc:f.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1)),
    top12:f.slice().sort((a,b)=>b-a).slice(0,12).reduce((s,n)=>s+n,0)/xs.length
  };
};
const rawScore=score(section);
const spectralLogTests=[];
for(const [orientation,key] of [["forward",spectralLogKey],["reverse",spectralLogKey.slice().reverse()]])
  for(const sign of [-1,1]){
    const out=section.map((x,i)=>mod(x+sign*key[i%7]));
    spectralLogTests.push({
      orientation,operation:sign===-1?"ciphertext-minus-key":"ciphertext-plus-key",...score(out)
    });
  }

const modInverse=n=>{for(let x=1;x<29;x++)if(mod(n*x)===1)return x;throw new Error("no inverse");};
const inverseMatrix=M=>{
  const n=M.length,x=M.map((row,i)=>row.map(mod).concat(
    Array.from({length:n},(_,j)=>i===j?1:0)));
  for(let c=0;c<n;c++){
    let p=c;while(p<n&&x[p][c]===0)p++;if(p===n)return null;
    [x[c],x[p]]=[x[p],x[c]];
    const iv=modInverse(x[c][c]);
    for(let j=0;j<2*n;j++)x[c][j]=mod(x[c][j]*iv);
    for(let i=0;i<n;i++)if(i!==c){
      const f=x[i][c];for(let j=0;j<2*n;j++)x[i][j]=mod(x[i][j]-f*x[c][j]);
    }
  }
  return x.map(row=>row.slice(n));
};
const mv=(M,v)=>M.map(row=>mod(row.reduce((s,a,i)=>s+a*v[i],0)));
const vm=(v,M)=>M[0].map((_,j)=>mod(v.reduce((s,a,i)=>s+a*M[i][j],0)));
const invA=inverseMatrix(A);
assert(invA,"2014 matrix must be invertible");
const progressiveTests=[];
for(const start of [0,1]){
  let phase=start===0?identity(7):invA;
  const col=[],row=[];
  for(let b=0;b<section.length/7;b++){
    const block=section.slice(7*b,7*b+7);
    col.push(...mv(phase,block));row.push(...vm(block,phase));
    phase=matMul(phase,invA);
  }
  progressiveTests.push({startExponent:start,orientation:"column",...score(col)});
  progressiveTests.push({startExponent:start,orientation:"row",...score(row)});
}

const reversedS=polyEval(coefficients.slice().reverse(),u);
assert.deepEqual(reversedS,[4,1]);
assert.deepEqual(fpow(reversedS,242),[16,17]);

console.log(JSON.stringify({
  p32:{
    runeCount:p32.runic_count,firstRunePrime:startPrime,endPrime,primeWindow,offsets,
    coefficients,transliteration,fieldValue:S,order:forder(S),discreteLogBaseU:logUS
  },
  id3:{product:id3Product,base29DigitsHighToLow:id3Digits,fieldValue:P,order:forder(P)},
  exactRelations:{
    SminusP:fsub(S,P),S242EqualsP:true,P6EqualsMu:mu,
    S52:fpow(S,52),S40:fpow(S,40),S179:fpow(S,179),
    u120:fpow(u,120),u360:fpow(u,360)
  },
  matrix:{order:280,eigenvalueLogs:eigenLogs,eigenvectorsVerified:{root24:true,mu:true,nu:true}},
  reversedCoefficientControl:{fieldValue:reversedS,power242:fpow(reversedS,242)},
  p33to39:{
    runes:section.length,sevenRuneBlocks:section.length/7,rawScore,
    spectralLogKey,spectralLogTests,progressiveTests
  }
},null,2));
