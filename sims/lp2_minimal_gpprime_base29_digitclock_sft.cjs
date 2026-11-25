// Exact minimal-chart-prime BASE29 digit transport, Director #2839.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.join(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const solved = load("resources/external/relikd-solved-gp29-native-v1.json");
const code = corpus.prime.map(p => p < 29 ? [p] : [Math.floor(p/29), p%29]);
const primes = [];
for (let n=2; primes.length<2500; n++)
  if (primes.every(p => p*p>n || n%p!==0)) primes.push(n);
const k = primes.map(p=>(p-1)%29);
/** @param {number[]} digits @param {number} [t] */
function enc(digits,t=0) {
  const out=[];
  for (const x of digits) out.push(x===0 ? 0 : (x+k[t++])%29);
  return {out,t};
}
/** Exact all-token-path DP. States are (ciphertext offset, consumed prime count).
 * @param {number[]} c
 */
function parse(c) {
  const dp=Array.from({length:c.length+1},()=>new Map());
  dp[0].set(0,1n);
  let longest=0,boundary=0;
  for(let i=0;i<c.length;i++){
    if(!dp[i].size) continue;
    boundary=i;
    for(const [t,count] of dp[i]) for(const d of code){
      const x=enc(d,t);
      let m=0;
      while(m<x.out.length && i+m<c.length && x.out[m]===c[i+m]) m++;
      longest=Math.max(longest,i+m);
      if(m===x.out.length){
        const a=dp[i+m];
        a.set(x.t,(a.get(x.t)||0n)+count);
      }
    }
  }
  const end=dp[c.length];
  if(end.size) boundary=c.length;
  return {longest,boundary,paths:[...end.values()].reduce((a,b)=>a+b,0n).toString(),terminal:[...end.keys()].sort((a,b)=>a-b)};
}
const native=solved.sections.map(x=>({name:x.name,p:[...x.source_text].map(c=>corpus.runes.indexOf(c)).filter(x=>x>=0)}));
const tape=(a,b)=>corpus.pages.filter(x=>x.page>=a&&x.page<=b).flatMap(x=>x.indices);
assert.equal(3*29**2+26*29+24,3301);
assert.equal(code.length,29);
const p56=native.find(x=>x.name==="p56_an_end").p;
const control=enc(p56);
assert.deepEqual(control.out,tape(56,56));
assert.equal(control.t,84);
assert.equal(p56.length,85);
const originals=[];
for(const [a,b,N,dead] of [[54,55,308,6],[0,2,729,0]]){
  const c=tape(a,b), r=parse(c);
  assert.equal(c.length,N); assert.equal(r.paths,"0"); assert.equal(r.longest,dead); assert.equal(r.boundary,dead);
  originals.push({pages:[a,b],n:N,first:c.slice(0,12),...r});
}
const controls=[];
for(const {name,p} of native){
  const plant=enc(p.flatMap(x=>code[x])), result=parse(plant.out);
  assert(result.terminal.includes(plant.t)); assert.equal(result.boundary,plant.out.length);
  controls.push({name,plain:p.length,digits:plant.out.length,trueCursor:plant.t,...result});
}
const koan=native.find(x=>x.name==="0_koan_1").p;
const matched=[];
for(const N of [308,729]){
  let m=0,end=0;
  while(m<N) m+=code[koan[end++]].length;
  assert.equal(m,N);
  const plant=enc(koan.slice(0,end).flatMap(x=>code[x]));
  const good=parse(plant.out), rival=parse(enc(koan.slice(0,N)).out);
  assert(good.terminal.includes(plant.t)); assert.equal(good.boundary,N);
  assert.equal(rival.paths,"0"); assert.equal(rival.longest,0);
  matched.push({N,plain:end,trueCursor:plant.t,good,rival});
}
console.log(JSON.stringify({chart:corpus.prime,code,p56:{n:p56.length,cursor:control.t},originals,controls,matched},null,2));
