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
const M7=[[14,25],[25,28]],correction=[3,0,8],maps=correction.map(n=>matMul([[1,n],[0,1]],M7));
let state=[13,23,2];const states=[];
for(let i=0;i<210;i++){states.push(state.slice());state=state.map((x,j)=>applyPGL(maps[j],x));}
assert.deepEqual(state,[13,23,2]);
const full=corpus.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);
const outer=full.slice(0,91).concat(full.slice(1559));
assert.equal(full.length,1680);
assert.equal(outer.length,212);
// The outer 91+121-rune units provide 210 chart selectors after dropping their two boundary runes.
const selectors=outer.slice(1,-1);
assert.equal(selectors.length,210);
const chartRows=states.map((s,i)=>{
  const row=tensor8(s),start=selectors[i]%8;
  let pivot=-1,advance=-1;
  for(let d=0;d<8;d++){const j=(start+d)%8;if(row[j]!==0){pivot=j;advance=d;break;}}
  assert.notEqual(pivot,-1);
  const scale=inv(row[pivot]),normalized=row.map(v=>mod(v*scale,MOD));
  return {start,pivot,advance,free:normalized.filter((_,j)=>j!==pivot)};
});
const free=chartRows.flatMap(x=>x.free);
assert.equal(free.length,1470);
assert(chartRows.filter(x=>x.advance>0).every(x=>x.advance===1));
const keyRaw=free.slice(1,-1);
assert.equal(keyRaw.length,1468);
const target=full.slice(91,1559);
assert.equal(target.length,1468);
const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const keyMaps=[
  {name:"raw field",chain:keyRaw.map(v=>v%28),direct:keyRaw},
  {name:"GP prime",chain:keyRaw.map(v=>primes[v]%28),direct:keyRaw.map(v=>primes[v]%29)},
  {name:"phi(GP prime)",chain:keyRaw.map(v=>(primes[v]-1)%28),direct:keyRaw.map(v=>(primes[v]-1)%29)}
];
const pow=(a,e,p)=>{let r=1;while(e){if(e&1)r=r*a%p;a=a*a%p;e>>=1;}return r;};
const log2=Array(29).fill(-1);for(let e=0;e<28;e++)log2[pow(2,e,29)]=e;
const sigmas=[
  {name:"identity",forward:x=>x,inverse:x=>x},
  {name:"DH2-power",forward:x=>pow(2,x,29)-1,inverse:x=>log2[x+1]},
  {name:"DH2-log",forward:x=>log2[x+1],inverse:x=>pow(2,x,29)-1}
];
const directOrders=[
  {name:"identity",apply:x=>x},
  {name:"DH2-power (EA fixed)",apply:x=>x===28?28:pow(2,x,29)-1},
  {name:"DH2-log (EA fixed)",apply:x=>x===28?28:log2[x+1]}
];
const counts=new Uint32Array(MOD**3);
for(let i=2;i<native.length;i++)counts[(native[i-2]*MOD+native[i-1])*MOD+native[i]]++;
const alpha=.1,denominator=native.length-2+alpha*counts.length;
function score(xs){let s=0;for(let i=2;i<xs.length;i++)s+=Math.log((counts[(xs[i-2]*MOD+xs[i-1])*MOD+xs[i]]+alpha)/denominator);return s/(xs.length-2);}
function chainDecode(input,iv,key,sigma,sign){
  let previous=iv,zero=0;const plain=[];
  for(let i=0;i<input.length;i++){const delta=mod(input[i]-previous,MOD);previous=input[i];if(delta===0){plain.push(28);zero++;}else plain.push(sigma.inverse(mod(delta-1+sign*key[i],28)));}
  return {plain,zero};
}
function chainEncode(plain,iv,key,sigma,sign){
  let previous=iv;const out=[];
  for(let i=0;i<plain.length;i++){const delta=plain[i]===28?0:1+mod(sigma.forward(plain[i])-sign*key[i],28);const current=mod(previous+delta,MOD);out.push(current);previous=current;}
  return out;
}
const chainModels=[];
for(const km of keyMaps)for(const sigma of sigmas)for(const iv of [23,20])for(const sign of [-1,1]){
  const d=chainDecode(target,iv,km.chain,sigma,sign);
  assert.deepEqual(chainEncode(d.plain,iv,km.chain,sigma,sign),target);
  const plant=native.slice(0,target.length),ct=chainEncode(plant,iv,km.chain,sigma,sign);
  assert.deepEqual(chainDecode(ct,iv,km.chain,sigma,sign).plain,plant);
  chainModels.push({keyMap:km.name,sigma:sigma.name,iv,sign,zeroSteps:d.zero,trigram:score(d.plain),prefix:d.plain.slice(0,40).map(x=>trans[x]).join("")});
}
const directModels=[];
for(const km of keyMaps)for(const sign of [-1,1]){
  const plain=target.map((x,i)=>mod(x+sign*km.direct[i],MOD));
  assert.deepEqual(plain.map((x,i)=>mod(x-sign*km.direct[i],MOD)),target);
  const plant=native.slice(0,target.length),ct=plant.map((x,i)=>mod(x-sign*km.direct[i],MOD));
  assert.deepEqual(ct.map((x,i)=>mod(x+sign*km.direct[i],MOD)),plant);
  directModels.push({keyMap:km.name,sign,trigram:score(plain),prefix:plain.slice(0,40).map(x=>trans[x]).join("")});
}
const directReadouts=[];
for(const km of keyMaps)for(const order of directOrders){
  const plain=km.direct.map(order.apply);
  directReadouts.push({keyMap:km.name,order:order.name,trigram:score(plain),prefix:plain.slice(0,40).map(x=>trans[x]).join("")});
}
chainModels.sort((a,b)=>b.trigram-a.trigram);
directModels.sort((a,b)=>b.trigram-a.trigram);
directReadouts.sort((a,b)=>b.trigram-a.trigram);
const holdout=[];for(let i=0;i+target.length<=native.length;i++)holdout.push(score(native.slice(i,i+target.length)));
holdout.sort((a,b)=>a-b);
assert(chainModels.every(x=>x.trigram<holdout[0]));
assert(directModels.every(x=>x.trigram<holdout[0]));
assert(directReadouts.every(x=>x.trigram<holdout[0]));
const invalid=chartRows.map((x,i)=>({i,advance:x.advance,selector:selectors[i],chart:x.start,pivot:x.pivot})).filter(x=>x.advance>0);
console.log(JSON.stringify({
  classification:"bounded negative; no plaintext",
  outerFrame:{prelude:91,tail:121,total:outer.length,selectors:selectors.length,selectorRule:"outer GP rune value mod8 selects preferred Segre chart; if zero, advance cyclically to next nonzero chart",invalidCharts:invalid,allFallbacksOneStep:invalid.every(x=>x.advance===1),invalidIndicesCongruent3mod15:invalid.every(x=>x.i%15===3)},
  chartDistribution:chartRows.reduce((o,x)=>(o[x.pivot]=(o[x.pivot]||0)+1,o),{}),
  freeCoordinates:{perState:7,total:free.length,droppedEndpoints:[free[0],free.at(-1)],keyLength:keyRaw.length},
  target:{sourceBracket:"p33 local91 -> p39 local119",length:target.length,first:trans[target[0]],last:trans[target.at(-1)]},
  chain:{models:chainModels.length,best:chainModels[0],top:chainModels.slice(0,4)},
  directAdditive:{models:directModels.length,best:directModels[0]},
  directReadout:{models:directReadouts.length,best:directReadouts[0],top:directReadouts.slice(0,4)},
  nativeHoldout:{windows:holdout.length,worst:holdout[0],median:holdout[Math.floor(holdout.length/2)]},
  positiveControl:"All chain and direct-additive models round-trip original ciphertext and native-GP plants exactly.",
  conclusion:"The outer-frame chart selector yields the exact 1,468-rune key length, but all 36 chain, 6 direct-additive and 9 direct-readout models remain below native-language controls. Retire this exact chart-selector readout."
},null,2));
