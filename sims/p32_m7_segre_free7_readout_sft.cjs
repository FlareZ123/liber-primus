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
function normalize(row){const pivot=row.findIndex(x=>x!==0);assert.notEqual(pivot,-1);const scale=inv(row[pivot]);return {pivot,row:row.map(x=>mod(x*scale,MOD))};}
const M7=[[14,25],[25,28]],correction=[3,0,8],maps=correction.map(n=>matMul([[1,n],[0,1]],M7));
let state=[13,23,2];const states=[];
for(let i=0;i<210;i++){states.push(state.slice());state=state.map((x,j)=>applyPGL(maps[j],x));}
assert.deepEqual(state,[13,23,2]);
const normalized=states.map(s=>normalize(tensor8(s)));
assert(normalized.every(x=>x.pivot===0));
const free=normalized.flatMap(x=>x.row.filter((_,i)=>i!==x.pivot));
assert.equal(free.length,1470);
const keyRaw=free.slice(1,-1);
assert.equal(keyRaw.length,1468);
const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const keyMaps=[
  {name:"GP-prime mod28",values:keyRaw.map(v=>primes[v]%28)},
  {name:"Euler-totient(GP-prime) mod28",values:keyRaw.map(v=>(primes[v]-1)%28)}
];
const full=corpus.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);
const start=91,end=1559,target=full.slice(start,end);
assert.equal(full.length,1680);
assert.equal(target.length,1468);
assert.equal(full[start],trans.indexOf("NG"));
assert.equal(full[start-1],trans.indexOf("L"));
assert.equal(full[end],trans.indexOf("IA"));
const pow=(a,e,p)=>{let r=1;while(e){if(e&1)r=r*a%p;a=a*a%p;e>>=1;}return r;};
const log2=Array(29).fill(-1);for(let e=0;e<28;e++)log2[pow(2,e,29)]=e;
assert(log2.every(x=>x>=0));
const sigmas=[
  {name:"identity",forward:x=>x,inverse:x=>x},
  {name:"DH2-power order",forward:x=>pow(2,x,29)-1,inverse:x=>log2[x+1]},
  {name:"DH2-log order",forward:x=>log2[x+1],inverse:x=>pow(2,x,29)-1}
];
const counts=new Uint32Array(MOD**3);
for(let i=2;i<native.length;i++)counts[(native[i-2]*MOD+native[i-1])*MOD+native[i]]++;
const alpha=.1,denominator=native.length-2+alpha*counts.length;
function score(xs){let s=0;for(let i=2;i<xs.length;i++)s+=Math.log((counts[(xs[i-2]*MOD+xs[i-1])*MOD+xs[i]]+alpha)/denominator);return s/(xs.length-2);}
function decodeChain(input,iv,key,sigma,sign){
  let previous=iv,zero=0;const plain=[];
  for(let i=0;i<input.length;i++){
    const delta=mod(input[i]-previous,MOD);previous=input[i];
    if(delta===0){plain.push(28);zero++;}
    else plain.push(sigma.inverse(mod(delta-1+sign*key[i],28)));
  }
  return {plain,zero};
}
function encodeChain(plain,iv,key,sigma,sign){
  let previous=iv;const out=[];
  for(let i=0;i<plain.length;i++){
    const delta=plain[i]===28?0:1+mod(sigma.forward(plain[i])-sign*key[i],28);
    const current=mod(previous+delta,MOD);out.push(current);previous=current;
  }
  return out;
}
const chainModels=[];
for(const km of keyMaps)for(const sigma of sigmas)for(const iv of [23,full[start-1]])for(const sign of [-1,1]){
  const d=decodeChain(target,iv,km.values,sigma,sign);
  assert.deepEqual(encodeChain(d.plain,iv,km.values,sigma,sign),target);
  const plant=native.slice(0,target.length),ct=encodeChain(plant,iv,km.values,sigma,sign);
  assert.deepEqual(decodeChain(ct,iv,km.values,sigma,sign).plain,plant);
  chainModels.push({keyMap:km.name,sigma:sigma.name,iv,ivRune:trans[iv],sign,zeroSteps:d.zero,trigram:score(d.plain),prefix:d.plain.slice(0,48).map(x=>trans[x]).join("")});
}
const directMaps=[
  {name:"GP-prime mod29",values:keyRaw.map(v=>primes[v]%29)},
  {name:"Euler-totient(GP-prime) mod29",values:keyRaw.map(v=>(primes[v]-1)%29)}
];
const directModels=[];
for(const km of directMaps)for(const sign of [-1,1]){
  const plain=target.map((x,i)=>mod(x+sign*km.values[i],29));
  assert.deepEqual(plain.map((x,i)=>mod(x-sign*km.values[i],29)),target);
  const plant=native.slice(0,target.length),ct=plant.map((x,i)=>mod(x-sign*km.values[i],29));
  assert.deepEqual(ct.map((x,i)=>mod(x+sign*km.values[i],29)),plant);
  directModels.push({keyMap:km.name,sign,trigram:score(plain),prefix:plain.slice(0,48).map(x=>trans[x]).join("")});
}
chainModels.sort((a,b)=>b.trigram-a.trigram);
directModels.sort((a,b)=>b.trigram-a.trigram);
const holdout=[];for(let i=0;i+target.length<=native.length;i++)holdout.push(score(native.slice(i,i+target.length)));
holdout.sort((a,b)=>a-b);
assert(chainModels.every(x=>x.trigram<holdout[0]));
assert(directModels.every(x=>x.trigram<holdout[0]));
console.log(JSON.stringify({
  classification:"bounded negative; no plaintext",
  structural:{
    recurrenceStates:210,tensorDimension:8,projectivePivotIndex:0,
    freeCoordinatesPerState:7,freeCoordinateCount:free.length,
    firstFree:free[0],lastFree:free[free.length-1],
    droppedBoundaryCoordinates:[free[0],free[free.length-1]],
    keyLengthAfterDroppingEndpoints:keyRaw.length,
    outerSections:91+121,outerEquals210Plus2:(91+121)===(210+2),
    bodyLengthEquals7Times210Minus2:keyRaw.length===7*210-2
  },
  target:{start:"p33 local91",end:"p39 local119",length:target.length,first:trans[target[0]],last:trans[target.at(-1)],previous:trans[full[start-1]],next:trans[full[end]]},
  chain:{models:chainModels.length,best:chainModels[0],top:chainModels.slice(0,4),rawTrigram:score(target)},
  directAdditive:{models:directModels.length,best:directModels[0],all:directModels},
  nativeHoldout:{windows:holdout.length,worst:holdout[0],q10:holdout[Math.floor(holdout.length*.1)],median:holdout[Math.floor(holdout.length/2)],q90:holdout[Math.floor(holdout.length*.9)]},
  positiveControl:"Every chain model exactly re-encrypts the original target and recovers a native-GP plant; direct additive models also round-trip exactly.",
  conclusion:"The projective 7-free-coordinate stream with endpoint trimming has the exact 1,468-rune bracket length, but neither prime/totient chain decoding nor direct additive decoding produces native-GP plaintext. Retire this exact readout family."
},null,2));
