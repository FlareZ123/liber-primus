#!/usr/bin/env node
"use strict";
// Frozen original p55 GF29^2 Q field clock from p54 source red9 and p3 source.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const dir=path.resolve(__dirname,".."),load=s=>JSON.parse(fs.readFileSync(path.join(dir,s),"utf8"));
const cp=load("resources/liber-primus/lp2-corpus.json"),solved=load("resources/external/relikd-solved-gp29-native-v1.json");
const page=p=>cp.pages.find(x=>x.page===p).indices;
const m=x=>((x%29)+29)%29,add=(a,b)=>[m(a[0]+b[0]),m(a[1]+b[1])];
const minus=(a,b)=>[m(a[0]-b[0]),m(a[1]-b[1])];
const mul=(a,b)=>[m(a[0]*b[0]+8*a[1]*b[1]),m(a[0]*b[1]+a[1]*b[0]+3*a[1]*b[1])];
const pow=(x,n)=>{let z=[1,0];while(n>0){if(n%2)z=mul(z,x);x=mul(x,x);n=Math.floor(n/2);}return z;};
const f=page(3).slice(119,122),p15=page(15).slice(9,20),p57=page(57).slice(0,7),p54=page(54).slice(0,9);
assert.deepEqual(f,[13,23,2]);
let remainder=p15.map((v,i)=>m(v-(p57[i]||0))),Q=Array(9).fill(0);
for(let i=10;i>=2;i--){let a=m(15*remainder[i]);Q[i-2]=a;for(let j=0;j<3;j++)remainder[i-2+j]=m(remainder[i-2+j]-a*f[j]);}
assert.deepEqual(remainder,Array(11).fill(0));assert.deepEqual(Q,[5,5,14,9,10,4,27,17,25]);
const E=p=>{let r=[0,0],u=[1,0];for(let v of p){r=add(r,[m(v*u[0]),m(v*u[1])]);u=mul(u,[0,1]);}return r;};
const q=E(Q),s0=E(p54);
assert.deepEqual(q,[17,24]);assert.deepEqual(s0,[13,28]);assert.deepEqual(mul(q,s0),[0,20]);
assert.deepEqual(pow(q,840),[1,0]);
for(const prime of[2,3,5,7])assert.notDeepEqual(pow(q,840/prime),[1,0]);
const C=page(55);assert.equal(C.length,76);
const cPairs=Array.from({length:38},(_,i)=>C.slice(2*i,2*i+2));
let states=[],st=s0;for(let i=0;i<38;i++){states.push(st);st=mul(st,q);}
assert.deepEqual(states.slice(0,3),[[13,28],[0,20],[12,11]]);
const native=solved.sections.map(s=>({name:s.name,seq:[...s.source_text].filter(ch=>cp.runes.includes(ch)).map(ch=>cp.runes.indexOf(ch))}));
const nPair=a=>{let h=Array(29).fill(0);a.forEach(x=>h[x]++);return h.reduce((s,n)=>s+n*(n-1),0);};
let win=[];for(const s of native)for(let i=0;i+76<=s.seq.length;i++)win.push({source:s.name,start:i,n:nPair(s.seq.slice(i,i+76))});
win.sort((a,b)=>a.n-b.n);
assert.equal(win.length,2304);assert.equal(win[0].n,260);
const donor=native.find(s=>s.name==="0_loss_of_divinity").seq.slice(0,76);assert.equal(donor.length,76);
const plantPairs=Array.from({length:38},(_,i)=>donor.slice(i*2,i*2+2));
const cases=[
["add-minus",minus,add],
["add-plus",add,minus],
["multiply-divide",(a,b)=>mul(a,pow(b,839)),mul],
["multiply-times",mul,(a,b)=>mul(a,pow(b,839))]
],out=[];
for(const [name,decrypt,encrypt]of cases){
 const plain=cPairs.map((v,i)=>decrypt(v,states[i])).flat();
 assert.deepEqual(Array.from({length:38},(_,i)=>encrypt(plain.slice(2*i,2*i+2),states[i])).flat(),C);
 const cPlant=plantPairs.map((v,i)=>encrypt(v,states[i]));
 assert.deepEqual(cPlant.map((v,i)=>decrypt(v,states[i])).flat(),donor);
 const n=nPair(plain);
 assert(n<260);
 out.push({mode:name,collisionNumerator:n,ioc:n/(76*75),
  canonicalNativeTranslit:plain.map(i=>cp.translit[i]).join(""),
  fullOriginal76Reencrypt:true,knownSolved76PlantRecover:true});
}
assert.deepEqual(out.map(x=>x.collisionNumerator),[214,214,206,196]);
console.log(JSON.stringify({schema:"lp2-p54-q-field-stream-p55-gate-v1",classification:"original-input negative: no native GP29 plaintext",
 source:{p3:f,p15minusP57QuotientQ:Q,q,s0,s1:mul(s0,q),
  p55CipherLength:C.length,fullStatePeriod:840,originalCollisionNumerator:nPair(C)},
 matchedSolvedControls:{windowCount:win.length,minimumNumerator:win[0].n,minimumSource:win[0].source},
 candidateModes:out},null,2));
