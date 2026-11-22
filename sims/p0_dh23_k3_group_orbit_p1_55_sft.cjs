#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json")).physical_zero_based;
const mod=(x,n)=>((x%n)+n)%n;
function powMod(b,e,m){let x=1;for(let i=0;i<e;i++)x=x*b%m;return x;}
function dlog(g,t,p){let x=1;for(let i=0;i<p-1;i++){if(x===t)return i;x=x*g%p;}return null;}
const sums=ink.red_words.map(w=>w.gp_indices.reduce((s,i)=>s+corpus.prime[i],0));
assert.deepEqual(sums,[347,315]);
const p=23,g=5,A=sums[0]%p,B=sums[1]%p,a=dlog(g,A,p),b=dlog(g,B,p),K=powMod(B,a,p);
assert.deepEqual([A,B,a,b,K],[2,16,2,8,3]);
const forward=[],reverse=[];let f=K,r=K;
for(let i=0;i<22;i++){forward.push(f);reverse.push(r);f=f*g%p;r=r*14%p;}
assert.equal(f,K);assert.equal(r,K);
const pages=corpus.pages.filter(x=>x.page>=1&&x.page<=55).sort((a,b)=>a.page-b.page);
assert.equal(pages.length,55);
const payload=pages.flatMap(x=>x.indices);
assert.equal(payload.length,12694);
assert.equal(payload.length,22*577);
const tokenIndex=new Map(corpus.translit.map((x,i)=>[x,i]));
function encode(text){
 const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
 const out=[];
 for(const w of s.match(/[A-Z]+/g)||[])for(let i=0;i<w.length;){
  let ok=false;
  for(const n of [3,2,1]){const t=w.slice(i,i+n);if(tokenIndex.has(t)){out.push(tokenIndex.get(t));i+=n;ok=true;break;}}
  assert(ok,"unmapped token "+w.slice(i));
 }
 return out;
}
const train=encode(read("resources/control/emerson_essays_2944.txt")).slice(0,50000);
const hold=encode(read("resources/control/gibran_prophet_58585.txt"));
assert.equal(train.length,50000);
const tri=new Uint32Array(29**3);
for(let i=2;i<train.length;i++)tri[train[i-2]*841+train[i-1]*29+train[i]]++;
const den=train.length-2+tri.length*0.2;
function score(v){let s=0;for(let i=2;i<v.length;i++)s+=Math.log((tri[v[i-2]*841+v[i-1]*29+v[i]]+0.2)/den);return s/(v.length-2);}
const apply=(v,k,sign)=>v.map((x,i)=>mod(x+sign*k[i%22],29));
const variants=[];
for(const [direction,key] of [["forward",forward],["inverse",reverse]])for(const sign of [-1,1]){
 const decoded=apply(payload,key,sign),plant=hold.slice(500,500+payload.length);
 assert.equal(plant.length,payload.length);
 assert.deepEqual(apply(apply(plant,key,-sign),key,sign),plant);
 variants.push({direction,operation:sign<0?"C-K":"C+K",score:score(decoded),score_delta:score(decoded)-score(payload),positive_control:"exact round-trip"});
}
variants.sort((a,b)=>b.score-a.score);
const controls=[];
for(let i=0;i+payload.length<=hold.length;i+=7)controls.push(score(hold.slice(i,i+payload.length)));
controls.sort((a,b)=>a-b);
process.stdout.write(JSON.stringify({
 dh:{p,g,red_word_prime_sums:sums,residues:[A,B],logs:[a,b],shared_secret:K},
 key_order:22,forward_key:forward,inverse_key:reverse,
 payload:{pages:"1-55",runes:payload.length,periods:577},
 raw_score:score(payload),
 gibran_windows:{count:controls.length,stride:7,min:controls[0],q10:controls[Math.floor((controls.length-1)*0.1)],median:controls[Math.floor((controls.length-1)*0.5)]},
 variants
},null,2)+"\n");
