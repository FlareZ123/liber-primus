'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const nativeSource=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
const Q=29,mod=n=>(n%Q+Q)%Q;
const alpha59=grid.alphabet.replace('f','');
const values=grid.pages.flatMap(p=>p.tokens).map(t=>alpha59.indexOf(t[0])*59+alpha59.indexOf(t[1]));
const route=[186],seen=new Set();
while(route.at(-1)!==189){const at=route.at(-1);assert(!seen.has(at));seen.add(at);route.push(values[at]);}
assert.deepEqual(route,[186,19,33,112,72,161,214,247,189]);
const successors=route.slice(0,-1).map(at=>values[at]);
function base29(n){if(n===0)return[0];const out=[];while(n>0){out.unshift(n%29);n=Math.floor(n/29);}return out;}
const key=successors.flatMap(base29);
assert.deepEqual(key,[19,1,4,3,25,2,14,5,16,7,11,8,15,6,15]);
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
let seed=0x27112026;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const wrong=[];
for(let t=0;t<1000;t++){const k=Array.from({length:key.length},()=>rnd()%29);wrong.push(score(C.map((x,i)=>mod(x-k[i%k.length]))));}
wrong.sort((a,b)=>a-b);
const decodedScore=score(P),candidateRank=wrong.filter(x=>x<=decodedScore).length+1;
assert.equal(candidateRank,424);
assert(Math.abs(decodedScore+1.563763220296204)<1e-12);
assert(Math.abs(ioc(P)-0.03449685662532106)<1e-12);
console.log(JSON.stringify({
 classification:'source-constrained negative: p50 pointer successors -> signed 2013 BASE29 -> route-selected p40-53 -> fixed repeated-additive inverse',
 source:{route,successors,base29:successors.map(v=>[v,base29(v)]),key},
 recipient:{pages:'40-53',runes:C.length,originalIOC:ioc(C),decodedIOC:ioc(P),originalBigramLLRPerRune:score(C),decodedBigramLLRPerRune:decodedScore,preview:P.slice(0,120).map(i=>corpus.translit[i]).join('')},
 clearP57:{runes:clear.length,ioc:ioc(clear),bigramLLRPerRune:score(clear),roundtrip:true},
 randomKey15:{n:wrong.length,min:wrong[0],p05:wrong[50],median:wrong[500],p95:wrong[950],max:wrong.at(-1),candidateRank},
 decision:'retire this exact BASE29-serialized repeated-additive receiver; do not tune phase, sign, reset, or recipient after the frozen negative'
},null,2));
