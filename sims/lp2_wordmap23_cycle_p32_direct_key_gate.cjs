#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const {parseLP2Words}=require("./lp2_word_pages.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw=read("resources/lp2-transcription.txt");
const image=fs.readFileSync(path.join(root,"resources/liber-primus/49.jpg"));
const imageSha=crypto.createHash("sha256").update(image).digest("hex");
assert.equal(imageSha,"c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72");
const parsed=parseLP2Words(raw,3),words=parsed.words,body=words.slice(2);
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const sum=w=>[...w.runes].reduce((s,r)=>s+corpus.prime[runeIndex.get(r)],0);
const headingSums=words.slice(0,2).map(sum),sums=body.map(sum),n=body.length;
const next=sums.map(s=>s%n),seeds=headingSums.map(s=>s%n);
function trace(start){const seen=new Map(),p=[];let x=start;while(!seen.has(x)){seen.set(x,p.length);p.push(x);x=next[x];}return {transient:p.slice(0,seen.get(x)),cycle:p.slice(seen.get(x))};}
function allCycles(){const done=new Set(),out=[];for(let s=0;s<n;s++){if(done.has(s))continue;const seen=new Map(),p=[];let x=s;while(!done.has(x)&&!seen.has(x)){seen.set(x,p.length);p.push(x);x=next[x];}if(seen.has(x))out.push(p.slice(seen.get(x)));for(const v of p)done.add(v);}return out;}
const first=trace(seeds[0]),second=trace(seeds[1]),cycles=allCycles(),cycle=first.cycle;
assert.equal(words.length,158);assert.equal(parsed.runeCount,729);assert.equal(body.length,156);
assert.deepEqual(headingSums,[347,315]);assert.deepEqual(seeds,[35,3]);
assert.deepEqual(cycles.map(x=>x.length).sort((a,b)=>a-b),[2,23]);
assert.deepEqual(first.transient.map(x=>x+1),[36,56,113]);assert.equal(second.transient.length,0);
assert.deepEqual(cycle.map(x=>x+1),[6,65,112,35,25,120,4,96,15,68,54,152,109,89,102,129,82,12,151,122,108,140,144]);
const k0=cycle.map(i=>sums[i]%29),rot=cycle.indexOf(seeds[1]),k1=k0.slice(rot).concat(k0.slice(0,rot));
assert.equal(rot,6);
const p32=corpus.pages.find(p=>p.page===32).indices;
assert.equal(p32.length,121);
assert.equal(p32.map(i=>corpus.translit[i]).join("").slice(33,38),"HOMEX");
const fpos=p32.map((v,i)=>v===0?i:null).filter(v=>v!==null);
assert.deepEqual(fpos,[29,30,42,114]);
const mod=x=>((x%29)+29)%29;
function decode(cs,key,sign){
 let states=[{j:0,p:[]}];
 for(let i=0;i<cs.length;i++){
  const c=cs[i],out=[];
  for(const st of states){
   if(c===0)out.push({j:st.j,p:st.p.concat(0)});
   const q=mod(c-sign*key[st.j%23]);
   if(q!==0)out.push({j:st.j+1,p:st.p.concat(q)});
  }
  if(!out.length)return {failure:{offset:i,cipher:c,prior:states.map(st=>({j:st.j,k:key[st.j%23]}))}};
  states=out;
 }
 return {states};
}
function encode(ps,key,sign){let j=0;return ps.map(p=>{if(p===0)return 0;const c=mod(p+sign*key[j%23]);j++;return c;});}
function ioc(a){const f=Array(29).fill(0);a.forEach(x=>f[x]++);return f.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));}
const variants=[{name:"first heading",key:k0},{name:"second heading",key:k1}];
const spans=[{name:"full p32",start:0,c:p32},{name:"H-start suffix",start:33,c:p32.slice(33)}];
const results=[];
for(const span of spans)for(const v of variants)for(const sign of [1,-1]){
 const d=decode(span.c,v.key,sign);
 if(d.failure){
  const kv=[...new Set(d.failure.prior.map(x=>x.k))],js=[...new Set(d.failure.prior.map(x=>x.j))];
  assert.equal(kv.length,1);assert.ok(d.failure.prior.every(x=>mod(d.failure.cipher-sign*x.k)===0));
  results.push({span:span.name,start:v.name,inverse:sign===1?"P=C-K":"P=C+K",failureOffset:d.failure.offset,globalOffset:span.start+d.failure.offset,cipherRune:corpus.translit[d.failure.cipher],keyRune:corpus.translit[kv[0]],keyPointers:js,priorPaths:d.failure.prior.length,legalPaths:0});
 }else{
  assert.equal(d.states.length,1);const state=d.states[0];
  assert.deepEqual(encode(state.p,v.key,sign),span.c);
  results.push({span:span.name,start:v.name,inverse:sign===1?"P=C-K":"P=C+K",legalPaths:1,consumed:state.j,decoded:state.p.map(x=>corpus.translit[x]).join(""),decodedIoC:ioc(state.p),rawIoC:ioc(span.c),reencrypts:true});
 }
}
assert.deepEqual(results.slice(0,4).map(x=>[x.failureOffset,x.cipherRune,x.keyRune]),[[71,"A","A"],[11,"H","NG"],[62,"IA","IA"],[93,"B","EO"]]);
assert.deepEqual(results.slice(4,7).map(x=>[x.failureOffset,x.cipherRune,x.keyRune]),[[13,"EO","EO"],[8,"L","N"],[40,"B","B"]]);
const survivor=results[7];
assert.equal(survivor.legalPaths,1);assert.equal(survivor.consumed,88);
assert.equal(survivor.decoded,"LEAEAAPEAGROCIAURAENGERAEXPBMNSSHGGILMOEMPUJHOEICORAARLHURIAOIATHXNGYUMOJEAOOEOTTWAEUCEPCOEOPSTHCAETAIOESCW");
assert.ok(Math.abs(survivor.decodedIoC-0.03500522466039707)<1e-14);
const p57=corpus.pages.find(p=>p.page===57).indices,p57IoC=ioc(p57);
assert.ok(Math.abs(p57IoC-0.06270996640537514)<1e-14);
let rng=0x330144;
const plant=Array.from({length:121},(_,i)=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return i%17===0?0:1+(rng%28);});
const plantedCipher=encode(plant,k1,-1),plantedDecode=decode(plantedCipher,k1,-1);
assert.ok(plantedDecode.states.some(s=>JSON.stringify(s.p)===JSON.stringify(plant)));
console.log(JSON.stringify({p32ImageSha256:imageSha,p32Runes:p32.length,HOMEXOffset:33,cipherFPositions:fpos,headingSums,seeds:seeds.map(x=>x+1),transient:first.transient.map(x=>x+1),cycle:cycle.map(x=>x+1),key:k0,rotation:rot,results,p57IoC,syntheticPositiveRecovered:true},null,2));
