'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const load = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const nat = load('resources/external/relikd-solved-gp29-native-v1.json');
const N = 1000000;
const sieve = new Uint8Array(N);
sieve.fill(1,2);
for(let i=2;i*i<N;i++) if(sieve[i]) for(let j=i*i;j<N;j+=i) sieve[j]=0;
const primes=[];
for(let i=2;i<N;i++) if(sieve[i]) primes.push(i);
const rev=x=>Number(String(x).split('').reverse().join(''));
const countStar=primes.filter(x=>sieve[rev(x)]);
const strict=countStar.filter(x=>rev(x)!==x);
const mod=x=>((x%29)+29)%29;
const words=s=>[...s.source_text].map(x=>nat.runes.indexOf(x)).filter(x=>x>=0);
const p56=words(nat.sections.find(s=>s.name==='p56_an_end'));
const p57=words(nat.sections.find(s=>s.name==='p57_parable'));

/** @param {number[]} p @param {number[]} key @param {number} start */
function enc(p,key,start) {
  let j=start;
  return p.map(x=>x===0 ? 0 : mod(x+key[j++]-1));
}

/**
 * Exact reachable consuming cursors, retaining counts of all latent F histories.
 * A consuming edge yielding P=F is forbidden; C=F also has a hold edge.
 * @param {number[]} c @param {number[]} key @param {number} start
 */
function exact(c,key,start) {
  assert(start+c.length<key.length);
  let states=new Map([[start,1n]]);
  for(let i=0;i<c.length;i++){
    const next=new Map();
    const add=(j,n)=>next.set(j,(next.get(j)||0n)+n);
    for(const [j,n] of states){
      if(c[i]===0)add(j,n);
      if(mod(c[i]-key[j]+1)!==0)add(j+1,n);
    }
    if(!next.size)return {prefix:i,ends:0,paths:'0'};
    states=next;
  }
  return {prefix:c.length,ends:states.size,paths:[...states.values()].reduce((x,y)=>x+y,0n).toString()};
}

assert.equal(primes[173],1033);
assert.equal(primes[463],3301);
assert.deepEqual(enc(p56,primes,0),corpus.pages[56].indices);
const target=corpus.pages.slice(33,40).flatMap((p,i)=>i?p.indices:p.indices.slice(91));
assert.equal(target.length,1589);
const controls=[],out=[];
for(const [name,key] of [['COUNT-star',countStar],['strict-emirp',strict]]){
  const originIndices=key.map((p,j)=>[p,j]).filter(([p])=>p<=3301);
  const p1033=key.indexOf(1033),p3301=key.indexOf(3301);
  const res=originIndices.map(([p,j])=>({prime:p,index:j,...exact(target,key,j)}));
  out.push({name,prefixCount:res.length,direct:res.filter(r=>r.index===0||r.prime===1033||r.prime===3301),complete:res.filter(r=>r.prefix===target.length),top:res.slice().sort((x,y)=>y.prefix-x.prefix).slice(0,8),maxPrefix:Math.max(...res.map(x=>x.prefix)),all:res});
  for(const [label,p] of [['p56',p56],['p57',p57],['LP1-welcome',words(nat.sections.find(s=>s.name==='0_welcome'))]])for(const start of [0,p1033,p3301]){
    const cipher=enc(p,key,start);
    const r=exact(cipher,key,start);
    assert.equal(r.prefix,p.length);
    controls.push({name,label,startPrime:key[start],...r});
  }
}
assert.deepEqual(out.map(x=>x.prefixCount),[135,115]);
assert.deepEqual(out.map(x=>x.maxPrefix),[229,164]);
assert.deepEqual(out.map(x=>x.direct.map(r=>r.prefix)),[[1,143,31],[51,143,31]]);
assert(out.every(x=>x.complete.length===0));
console.log(JSON.stringify({knownP56:'85/85',targetLength:target.length,controls,out},null,2));
