"use strict";
/**
 * Source-motivated raw BASE29 row -> consecutive prime values -> p-1 GP29.
 * Fixed physical-page row assignment after first-black TH sentinel.
 * No offset, sign, seed or key search. Run Node.js 22.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const load = p => JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
/** @param {bigint} a @param {bigint} e @param {bigint} m */
function pow(a,e,m) {
  let r=1n;
  for(a%=m;e;e>>=1n,a=a*a%m) if(e&1n) r=r*a%m;
  return r;
}
/** Exact deterministic Miller-Rabin for n < 2^64. @param {bigint} n */
function prime(n) {
  if(n<2n)return false;
  assert(n<1n<<64n);
  for(const p of [2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n]){
    if(n===p)return true;
    if(n%p===0n)return false;
  }
  let d=n-1n,s=0;
  while(!(d&1n)){d>>=1n;s++}
  for(const a of [2n,325n,9375n,28178n,450775n,9780504n,1795265022n]){
    if(a%n===0n)continue;
    let x=pow(a,d,n);
    if(x===1n||x===n-1n)continue;
    let pass=false;
    for(let j=1;j<s;j++){x=x*x%n;if(x===n-1n){pass=true;break}}
    if(!pass)return false;
  }
  return true;
}
/** @param {bigint} start @param {number} size */
function clock(start,size){
  const k=[];
  for(let x=start<=2n?2n:start|1n;k.length<size;x=x===2n?3n:x+2n)
    if(prime(x))k.push(Number((x-1n)%29n));
  return k;
}
function run(c,n){
  const pages=Object.fromEntries(c.pages.map(p=>[p.page,p.indices]));
  const opening=[...pages[0],...pages[1],...pages[2]];
  assert.equal(opening.length,729);assert.equal(opening[13],2);
  const seeds=Array.from({length:56},(_,i)=>i?opening.slice(14+(i-1)*13,14+i*13).reduce((a,b)=>29n*a+BigInt(b),0n):0n);
  const alphabet=new Map(c.runes.map((r,i)=>[r,i]));
  const texts=n.sections.map(s=>[...s.source_text].filter(r=>alphabet.has(r)).map(r=>alphabet.get(r)));
  const counts=Array.from({length:30},()=>Array(29).fill(.5));
  for(const t of texts.slice(0,-2)){let a=29;for(const b of t){counts[a][b]++;a=b}}
  const logs=counts.map(row=>{const s=row.reduce((a,b)=>a+b);return row.map(x=>Math.log(29*x/s))});
  function score(t){let v=0,a=29;for(const b of t){v+=logs[a][b];a=b}return v/t.length}
  function enc(t,k,hold){let j=0;return t.map(p=>hold&&p===0?0:(p+k[j++])%29)}
  function inv(c,k,hold){
    if(!hold)return [c.map((x,j)=>(x-k[j]+29)%29),1n];
    let states=new Map([[29,{s:0,t:[],n:1n}]]);
    for(const x of c){
      const ns=new Map();
      for(const [id,v] of states){
        const j=Math.floor(id/30),prev=id%30,p=(x-k[j]+29)%29;
        const opts=[];if(x===0)opts.push([j,0]);if(p)opts.push([j+1,p]);
        for(const [jj,b] of opts){const a=jj*30+b,ss=v.s+logs[prev][b],old=ns.get(a);
          if(!old||ss>old.s)ns.set(a,{s:ss,t:[...v.t,b],n:(old?.n??0n)+v.n});else old.n+=v.n}
      }
      states=ns;if(!states.size)return [null,0n];
    }
    const a=[...states.values()];return [a.reduce((b,v)=>v.s>b.s?v:b).t,a.reduce((s,v)=>s+v.n,0n)];
  }
  function ioc(t){let a=Array(29).fill(0);t.forEach(x=>a[x]++);return a.reduce((s,x)=>s+x*(x-1),0)/(t.length*(t.length-1))}
  function summary(records){const good=records.filter(x=>x.paths!=="0"),n=good.reduce((s,x)=>s+x.n,0);
    return {pages:records.length,legal_pages:good.length,legal_runes:n,weighted_score:n?good.reduce((s,x)=>s+x.score*x.n,0)/n:null,top:good.sort((a,b)=>b.score-a.score).slice(0,2)}}
  const p56=texts[texts.length-2],k56=clock(2n,p56.length);
  assert.deepEqual(enc(p56,k56,true),pages[56]);
  assert.equal(prime(18446744073709551557n),true);
  assert.equal(prime(341550071728321n),false);
  const keys=Object.fromEntries(Object.keys(pages).filter(p=>+p>=3&&+p<=55&&+p!==50).map(p=>[p,clock(seeds[p],pages[p].length)]));
  const out={authentic_p56:p56.length};
  for(const hold of [false,true]){
    const records=[];
    for(let p=3;p<=55;p++){if(p===50)continue;
      const x=pages[p],k=keys[p],[t,n]=inv(x,k,hold);let o={p,n:x.length,paths:String(n)};
      if(n){assert.deepEqual(enc(t,k,hold),x);Object.assign(o,{score:score(t),ioc:ioc(t),preview:t.slice(0,60).map(a=>c.translit[a]).join("")})}records.push(o)}
    const plants=[3,54].map((p,i)=>{const t=texts[texts.length-2+i],k=keys[p],x=enc(t,k,hold),[v,n]=inv(x,k,hold);assert.deepEqual(enc(v,k,hold),x);return {p,n:t.length,paths:String(n),true_score:score(t),best_score:score(v),exact:String(v)===String(t)}});
    out[hold?"Fhold":"ordinary"]={development:summary(records.filter(x=>x.p<=39)),continuation:summary(records.filter(x=>x.p>=40)),plants};
  }
  return out;
}
if(require.main===module) console.log(JSON.stringify(run(load("resources/liber-primus/lp2-corpus.json"),load("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
module.exports={run};
