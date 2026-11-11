#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const json = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const grid = json("resources/liber-primus/lp2-grid-256.json");
const corpus = json("resources/liber-primus/lp2-corpus.json");
const raw = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8");
const mod = (x, m = 29) => ((x % m) + m) % m;
const inv29 = (x) => { for (let i = 1; i < 29; i++) if (mod(i * x) === 1) return i; throw Error("inverse"); };
const ioc = (a) => { const f = Array(29).fill(0); for (const x of a) f[x]++; return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1)); };
const runeMap = new Map(corpus.runes.map((r,i)=>[r,i]));
const pages = corpus.pages.filter((p)=>p.page<=55);
const C = pages.flatMap((p)=>p.indices);
assert.equal(C.length,12956);
const segments = raw.split("%").slice(0,55);
const runePages = segments.map(s=>Array.from(s).filter(ch=>runeMap.has(ch)).map(ch=>runeMap.get(ch)));
assert.deepEqual(runePages.flat(),C);
const pageStarts=[];let pos=0;for(const p of pages){pageStarts.push(pos);pos+=p.indices.length;}
const bounds0=[0];pos=0;
for(let p=0;p<segments.length;p++){
 let local=0;
 for(const ch of segments[p]){
  if(ch==="$"&&p!==54)bounds0.push(pos+local);
  if(runeMap.has(ch))local++;
 }
 pos+=runePages[p].length;
}
bounds0.push(runePages.slice(0,33).reduce((s,p)=>s+p.length,0)+91);
bounds0.sort((a,b)=>a-b);
const bounds=[...new Set(bounds0),C.length];
const sectionLengths=bounds.slice(1).map((x,i)=>x-bounds[i]);
assert.deepEqual(sectionLengths,[729,1145,1738,1894,1021,1433,91,1589,3316]);

function divHi(a,f){
 const r=a.slice(),q=Array(a.length-f.length+1).fill(0);
 for(let i=0;i<q.length;i++){const c=r[i];q[i]=c;for(let j=0;j<f.length;j++)r[i+j]=mod(r[i+j]-c*f[j]);}
 return {q,rem:r.slice(q.length)};
}
function mulLo(a,b){const o=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)o[i+j]=mod(o[i+j]+a[i]*b[j]);return o;}
function divLo(a,f){
 const r=a.slice(),q=Array(a.length-f.length+1).fill(0),li=inv29(f[f.length-1]);
 for(let i=q.length-1;i>=0;i--){const c=mod(r[i+f.length-1]*li);q[i]=c;for(let j=0;j<f.length;j++)r[i+j]=mod(r[i+j]-c*f[j]);}
 return {q,rem:r.slice(0,f.length-1)};
}
const bytes=grid.pages.flatMap(p=>p.bytes);
const hDiv=divHi(bytes.map(x=>mod(x)),[1,18,11]);
const gDiv=divHi(hDiv.q,[1,10,25]);
assert(hDiv.rem.every(x=>x===0)&&gDiv.rem.every(x=>x===0));
const quotient252=gDiv.q;
assert.equal(quotient252.length,252);

function sectionKey(input,m,rowRev,keyRev,sign){
 const out=[];
 for(let s=0;s<9;s++){
  const row=quotient252.slice((rowRev?8-s:s)*28,(rowRev?8-s:s)*28+28);
  const key=keyRev?row.slice().reverse():row;let kp=0;
  for(let i=bounds[s];i<bounds[s+1];i++){
   const c=input[i];if(c===0){out.push(0);continue;}
   out.push(m===29?mod(c+sign*key[kp%28]):1+mod(c-1+sign*(key[kp%28]%28),28));kp++;
  }
 }
 return out;
}
const sectionResults=[];
for(const m of [29,28])for(const rr of [false,true])for(const kr of [false,true])for(const sign of [-1,1]){
 sectionResults.push({modulus:m,rowOrder:rr?"reverse":"forward",keyOrder:kr?"reverse":"forward",sign,ioc:ioc(sectionKey(C,m,rr,kr,sign))});
}
const planted=C.map((_,i)=>i%17===0?0:mod(i*7+3));
assert.deepEqual(sectionKey(sectionKey(planted,29,false,false,1),29,false,false,-1),planted);

const factors=[[5,1],[5,1],[11,18,1],[24,16,14,1],[11,15,0,9,1,5,10,20,12,1]];
const divisor=factors.reduce(mulLo,[1]);
const qd=divLo(bytes.slice().reverse().map(x=>mod(x)).slice(0,255),divisor);
assert(qd.rem.every(x=>x===0));
const Q=qd.q.map(x=>mod(28*x));
assert.equal(Q.length,239);assert.equal(Q[238],1);
const qKeys=[Q.slice(0,238),Q.slice(0,238).reverse()];
function qKey(input,key,clock,sign){
 const out=[],sectionStarts=new Set(bounds.slice(0,-1));let kp=0;
 for(let i=0;i<input.length;i++){
  if(clock==="page"&&pageStarts.includes(i))kp=0;
  if(clock==="section"&&sectionStarts.has(i))kp=0;
  const c=input[i];if(c===0){out.push(0);continue;}
  out.push(mod(c+sign*key[kp%238]));kp++;
 }
 return out;
}
const qKeyResults=[];
for(let k=0;k<2;k++)for(const clock of ["continuous","page","section"])for(const sign of [-1,1]){
 qKeyResults.push({orientation:k?"high-to-low":"low-to-high",clock,sign,ioc:ioc(qKey(C,qKeys[k],clock,sign))});
}
assert.deepEqual(qKey(qKey(planted,qKeys[0],"section",1),qKeys[0],"section",-1),planted);

const p36=pages.find(p=>p.page===36).indices,p36Start=pageStarts[36],p36End=p36Start+238;
const Qrecip=Q.slice().reverse().map(x=>mod(x*inv29(Q[0])));
function lfsrKey(coeff,seed,seedRev,both){
 const init=seedRev?seed.slice().reverse():seed.slice(),K=Array(C.length).fill(null);
 for(let i=0;i<238;i++)K[p36Start+i]=init[i];
 if(both){
  let st=init.slice();
  for(let p=p36Start-1;p>=0;p--){
   let v=st[237];for(let j=1;j<238;j++)v+=coeff[j]*st[j-1];
   const prev=mod(-v*inv29(coeff[0]));K[p]=prev;st=[prev,...st.slice(0,237)];
  }
 }
 let st=init.slice();
 for(let p=p36End;p<C.length;p++){
  let v=0;for(let j=0;j<238;j++)v+=coeff[j]*st[j];
  const next=mod(-v);K[p]=next;st=[...st.slice(1),next];
 }
 return K;
}
const lfsrResults=[];
for(const [name,coeff] of [["Q238",Q],["reciprocal",Qrecip]])for(const seedRev of [false,true])for(const scope of ["forward","both"])for(const sign of [-1,1]){
 const K=lfsrKey(coeff,p36,seedRev,scope==="both"),out=[];
 for(let i=0;i<C.length;i++){
  if(i>=p36Start&&i<p36End)continue;
  if(scope==="forward"&&i<p36End)continue;
  out.push(mod(C[i]+sign*K[i]));
 }
 lfsrResults.push({polynomial:name,seed:seedRev?"reverse":"forward",scope,sign,ioc:ioc(out)});
}
const seed=Array.from({length:238},(_,i)=>mod(i*9+4)),st=seed.slice(),ks=[];
for(let i=0;i<300;i++){let v=0;for(let j=0;j<238;j++)v+=Q[j]*st[j];const n=mod(-v);ks.push(n);st.shift();st.push(n);}
const plantStream=Array.from({length:300},(_,i)=>mod(i*13+8));
assert.deepEqual(plantStream.map((x,i)=>mod(mod(x+ks[i])-ks[i])),plantStream);

const p55=pages.find(p=>p.page===55).indices;
const p55Words=segments[54].trim().split(/\s+/).map(w=>Array.from(w).filter(ch=>runeMap.has(ch)).map(ch=>runeMap.get(ch))).filter(w=>w.length);
assert.equal(p55.length,76);assert.deepEqual(p55Words.flat(),p55);assert.deepEqual(p55Words.map(w=>w.length),[24,22,22,8]);
const border=[3,3,0,1];
function wordShift(words,reverse,sign,skipF){
 const key=reverse?border.slice().reverse():border;
 return words.map((w,j)=>w.map(c=>skipF&&c===0?0:mod(c+sign*key[j])));
}
const borderResults=[];
for(const reverse of [false,true])for(const sign of [-1,1])for(const skipF of [false,true]){
 const out=wordShift(p55Words,reverse,sign,skipF).flat();
 borderResults.push({keyOrder:reverse?"reverse":"forward",sign,skipF,ioc:ioc(out)});
}
const wordPlant=p55Words.map((w,j)=>w.map((_,i)=>i%7===0?0:mod(i*11+j*3)));
assert.deepEqual(wordShift(wordShift(wordPlant,false,1,true),false,-1,true),wordPlant);

console.log(JSON.stringify({
 source:{unknownPages:"p0-p55; numeric p50 has no runes",runes:C.length,sections:sectionLengths,p36Runes:p36.length,p55Words:p55Words.map(w=>w.length)},
 quotient252:{best:sectionResults.slice().sort((a,b)=>b.ioc-a.ioc)[0],originalIoC:ioc(C)},
 Q238:{degree:Q.length-1,keyBest:qKeyResults.slice().sort((a,b)=>b.ioc-a.ioc)[0],p36SeedLfsrBest:lfsrResults.slice().sort((a,b)=>b.ioc-a.ioc)[0],originalIoC:ioc(C)},
 lp1_2014BorderOnP55:{key:border,p55IoC:ioc(p55),best:borderResults.slice().sort((a,b)=>b.ioc-a.ioc)[0]},
 positiveControls:"all exact round trips passed",
},null,2));
