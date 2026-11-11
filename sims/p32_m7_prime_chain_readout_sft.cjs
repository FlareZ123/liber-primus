"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const trans=corpus.translit,MOD=29,mod=(x,n)=>(x%n+n)%n;
const native=read("resources/control/latin-vulgate-heldout-gp.json").runes;
function inv(a){for(let x=1;x<MOD;x++)if(mod(a*x,MOD)===1)return x;throw Error("noninvertible");}
function matMul(a,b){return [[mod(a[0][0]*b[0][0]+a[0][1]*b[1][0],MOD),mod(a[0][0]*b[0][1]+a[0][1]*b[1][1],MOD)],[mod(a[1][0]*b[0][0]+a[1][1]*b[1][0],MOD),mod(a[1][0]*b[0][1]+a[1][1]*b[1][1],MOD)]];}
function applyPGL(a,x){
  if(x===null)return a[1][0]===0?null:mod(a[0][0]*inv(a[1][0]),MOD);
  const den=mod(a[1][0]*x+a[1][1],MOD);
  return den===0?null:mod((a[0][0]*x+a[0][1])*inv(den),MOD);
}
const hom=x=>x===null?[1,0]:[x,1];
function tensor8(state){
  const h=state.map(hom),out=[];
  for(let bits=0;bits<8;bits++){let v=1;for(let i=0;i<3;i++)v=mod(v*h[i][(bits>>(2-i))&1],MOD);out.push(v);}
  return out;
}
function normalize(row){const pivot=row.find(x=>x!==0);assert.notEqual(pivot,undefined);const scale=inv(pivot);return row.map(x=>mod(x*scale,MOD));}
const M7=[[14,25],[25,28]],correction=[3,0,8],maps=correction.map(n=>matMul([[1,n],[0,1]],M7));
let state=[13,23,2];const states=[];
for(let i=0;i<210;i++){states.push(state.slice());state=state.map((x,j)=>applyPGL(maps[j],x));}
assert.deepEqual(state,[13,23,2]);
const rawKey=states.flatMap(s=>normalize(tensor8(s)));
assert.equal(rawKey.length,1680);
const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const keyMaps=[
  {name:"GP-prime mod28",values:rawKey.map(v=>primes[v]%28)},
  {name:"Euler-totient(GP-prime) mod28",values:rawKey.map(v=>(primes[v]-1)%28)}
];
const full=corpus.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);
const cuneiformStart=91,cuneiform=full.slice(cuneiformStart);
assert.equal(full.length,1680);
assert.equal(cuneiform.length,1589);
assert.equal(full[0],23); // p33 D/23 matches p3 seed's middle coordinate
assert.equal(full[cuneiformStart-1],20); // preceding rune L
assert.equal(full[cuneiformStart],trans.indexOf("NG")); // cuneiform unit begins NG
const pow=(a,e,p)=>{let r=1;while(e){if(e&1)r=r*a%p;a=a*a%p;e>>=1;}return r;};
const log2=Array(29).fill(-1);for(let e=0;e<28;e++)log2[pow(2,e,29)]=e;
assert(log2.every(x=>x>=0));
const sigmas=[
  {name:"identity",forward:x=>x,inverse:x=>x},
  {name:"DH2-power order",forward:x=>pow(2,x,29)-1,inverse:x=>log2[x+1]},
  {name:"DH2-log order",forward:x=>log2[x+1],inverse:x=>pow(2,x,29)-1}
];
const trigramCounts=new Uint32Array(MOD**3);
for(let i=2;i<native.length;i++)trigramCounts[(native[i-2]*MOD+native[i-1])*MOD+native[i]]++;
const alpha=.1,denominator=native.length-2+alpha*trigramCounts.length;
function score(xs){let s=0;for(let i=2;i<xs.length;i++)s+=Math.log((trigramCounts[(xs[i-2]*MOD+xs[i-1])*MOD+xs[i]]+alpha)/denominator);return s/(xs.length-2);}
function ioc(xs){const f=Array(MOD).fill(0);for(const x of xs)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));}
function decode(input,iv,key,keyOffset,sigma,sign){
  let previous=iv,zero=0;const plain=[];
  for(let i=0;i<input.length;i++){
    const delta=mod(input[i]-previous,MOD);previous=input[i];
    if(delta===0){plain.push(28);zero++;}
    else plain.push(sigma.inverse(mod(delta-1+sign*key[keyOffset+i],28)));
  }
  return {plain,zero};
}
function encode(plain,iv,key,keyOffset,sigma,sign){
  let previous=iv;const out=[];
  for(let i=0;i<plain.length;i++){
    const delta=plain[i]===28?0:1+mod(sigma.forward(plain[i])-sign*key[keyOffset+i],28);
    const current=mod(previous+delta,MOD);out.push(current);previous=current;
  }
  return out;
}
function verifyPlant(plain,iv,key,keyOffset,sigma,sign){
  const ct=encode(plain,iv,key,keyOffset,sigma,sign);
  assert.deepEqual(decode(ct,iv,key,keyOffset,sigma,sign).plain,plain);
}
const fullModels=[];
for(const km of keyMaps)for(const sigma of sigmas)for(const sign of [-1,1]){
  const d=decode(full,23,km.values,0,sigma,sign);
  assert.deepEqual(encode(d.plain,23,km.values,0,sigma,sign),full);
  verifyPlant(native.slice(0,full.length),23,km.values,0,sigma,sign);
  fullModels.push({keyMap:km.name,sigma:sigma.name,sign,zeroSteps:d.zero,trigram:score(d.plain),ioc:ioc(d.plain),prefix:d.plain.slice(0,48).map(x=>trans[x]).join("")});
}
const alignments=[
  {name:"reset IV / reset key",iv:23,keyOffset:0},
  {name:"carry IV / carry key",iv:full[cuneiformStart-1],keyOffset:cuneiformStart},
  {name:"reset IV / carry key",iv:23,keyOffset:cuneiformStart},
  {name:"carry IV / reset key",iv:full[cuneiformStart-1],keyOffset:0}
];
const cuneiformModels=[];
for(const km of keyMaps)for(const sigma of sigmas)for(const alignment of alignments)for(const sign of [-1,1]){
  const d=decode(cuneiform,alignment.iv,km.values,alignment.keyOffset,sigma,sign);
  assert.deepEqual(encode(d.plain,alignment.iv,km.values,alignment.keyOffset,sigma,sign),cuneiform);
  verifyPlant(native.slice(0,cuneiform.length),alignment.iv,km.values,alignment.keyOffset,sigma,sign);
  cuneiformModels.push({
    keyMap:km.name,sigma:sigma.name,alignment:alignment.name,sign,
    iv:alignment.iv,ivRune:trans[alignment.iv],keyOffset:alignment.keyOffset,
    zeroSteps:d.zero,trigram:score(d.plain),ioc:ioc(d.plain),
    prefix:d.plain.slice(0,48).map(x=>trans[x]).join("")
  });
}
fullModels.sort((a,b)=>b.trigram-a.trigram);
cuneiformModels.sort((a,b)=>b.trigram-a.trigram);
function holdout(length){
  const scores=[];for(let i=0;i+length<=native.length;i++)scores.push(score(native.slice(i,i+length)));
  scores.sort((a,b)=>a-b);
  return {windows:scores.length,worst:scores[0],q10:scores[Math.floor(scores.length*.1)],median:scores[Math.floor(scores.length/2)],q90:scores[Math.floor(scores.length*.9)]};
}
const fullHoldout=holdout(full.length),cuneiformHoldout=holdout(cuneiform.length);
assert(fullModels.every(x=>x.trigram<fullHoldout.worst));
assert(cuneiformModels.every(x=>x.trigram<cuneiformHoldout.worst));
console.log(JSON.stringify({
  classification:"bounded negative; no recovered plaintext or established chain mechanism",
  source:{
    p32Seed:[13,23,2],M7,correction,cycleStates:states.length,cycleReturnsToSeed:true,
    tensorCoordinatesPerState:8,keyLength:rawKey.length,keyPeriod:210,
    rawTensorAlphabetSize:new Set(rawKey).size,ivFromSeedMiddle:23
  },
  target:{
    fullPageSpan:"p33-p39",fullLength:full.length,fullFirstRune:trans[full[0]],
    p33TitledInterludeRunes:91,p33TitledInterludeWords:23,
    cuneiformUnitStartOffset:91,cuneiformUnitLength:cuneiform.length,
    cuneiformFirstRune:trans[cuneiform[0]],precedingRune:trans[full[90]]
  },
  hypothesis:{
    chain:"delta=(C_i-C_(i-1)) mod29; delta=0 -> EA; otherwise delta=1+((sigma(P)+K) mod28)",
    IVChoices:[23,full[90]],keyOffsets:[0,91],
    keyMaps:keyMaps.map(x=>x.name),symbolOrders:sigmas.map(x=>x.name),
    zeroStepConsumesKey:true
  },
  fullSpan:{rawTrigram:score(full),rawIoC:ioc(full),models:fullModels.length,top:fullModels.slice(0,4),nativeHoldout:fullHoldout},
  cuneiformUnit:{rawTrigram:score(cuneiform),rawIoC:ioc(cuneiform),models:cuneiformModels.length,top:cuneiformModels.slice(0,6),nativeHoldout:cuneiformHoldout},
  positiveControl:"Every model re-encrypts the original target exactly and recovers a native-GP plant exactly.",
  conclusion:"Prime/totient-weighted M7-Segre key streams do not produce native-GP plaintext under the frozen chain-cipher family on either the full p33-p39 page span or the source-bounded p33 cuneiform unit. Retire this exact readout family."
},null,2));
