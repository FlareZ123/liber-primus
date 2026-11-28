'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),Q=29;
const mod=n=>((n%Q)+Q)%Q;
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const nativeSource=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
function hsplit(v){
  const d=[],s=[],h=Math.floor(v.length/2);
  for(let i=0;i<h;i++){d.push(mod(v[i]-v[v.length-1-i]));s.push(mod(v[i]+v[v.length-1-i]));}
  const out=d.slice();if(v.length%2)out.push(v[h]);return out.concat(s.reverse());
}
const chain=[15,23,2,19,27,3];
const key=hsplit(chain);
assert.deepEqual(key,[12,25,12,21,21,18]);
const C=corpus.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
assert.equal(C.length,3008);
const P=C.map((x,i)=>mod(x-key[i%key.length]));
assert.deepEqual(P.map((x,i)=>mod(x+key[i%key.length])),C);

const index=new Map(corpus.runes.map((s,i)=>[s,i]));
const sources=nativeSource.sections.map(s=>[...s.source_text].filter(c=>index.has(c)).map(c=>index.get(c)));
const counts=Array(Q).fill(.5),counts2=Array.from({length:Q},()=>Array(Q).fill(0));
for(const s of sources)for(let i=0;i<s.length;i++){counts[s[i]]++;if(i)counts2[s[i-1]][s[i]]++;}
const sum=a=>a.reduce((x,y)=>x+y,0),probs=counts.map(x=>x/sum(counts));
const L=probs.map(x=>Math.log(Q*x)),L2=counts2.map(a=>a.map((x,j)=>Math.log(Q*(x+12*probs[j])/(sum(a)+12))));
function score(xs){let z=0;for(let i=0;i<xs.length;i++)z+=i?L2[xs[i-1]][xs[i]]:L[xs[i]];return z/xs.length;}
function ioc(xs){const n=Array(Q).fill(0);for(const x of xs)n[x]++;return n.reduce((s,v)=>s+v*(v-1),0)/(xs.length*(xs.length-1));}

const clear=corpus.pages[57].indices,enc=clear.map((x,i)=>mod(x+key[i%key.length]));
assert.deepEqual(enc.map((x,i)=>mod(x-key[i%key.length])),clear);
let seed=0x28112026;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const wrong=[];
for(let t=0;t<1000;t++){const k=Array.from({length:key.length},()=>rnd()%29);wrong.push(score(C.map((x,i)=>mod(x-k[i%k.length]))));}
wrong.sort((a,b)=>a-b);
const decodedScore=score(P),candidateRank=wrong.filter(x=>x<=decodedScore).length+1;
assert.equal(candidateRank,134);
assert(Math.abs(decodedScore-(-1.595100164606973))<1e-12);
assert(Math.abs(ioc(P)-0.03459282065252001)<1e-12);
console.log(JSON.stringify({
 classification:'source-constrained negative: H(route state chain) repeated-additive receiver on p40-53',
 chain,key,
 recipient:{pages:'40-53',runes:C.length,originalScore:score(C),decodedScore,originalIOC:ioc(C),decodedIOC:ioc(P),preview:P.slice(0,120).map(i=>corpus.translit[i]).join('')},
 randomPeriod6:{n:wrong.length,min:wrong[0],median:wrong[500],max:wrong.at(-1),candidateRank},
 clearP57:{score:score(clear),roundtrip:true},
 decision:'retire this exact H6 cyclic additive receiver; no phase/sign/reset/destination retuning'
},null,2));
