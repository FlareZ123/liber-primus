"use strict";
/**
 * LP2 original T7 serial repeat-gap autocorrelation under two page-conditioned
 * exact-count nulls. Node.js 22 CommonJS SFT, no writes and no dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
const pages=corpus.pages.slice(0,56);
const sites=[],pools=[];let total=0;
for(const page of pages){
  let k=0;
  for(let i=1;i<page.indices.length;i++)if(page.indices[i]===page.indices[i-1]){
    sites.push(total+i);k++;
  }
  pools.push({start:total,eligible:page.indices.length-1,k});
  total+=page.indices.length;
}
assert.equal(total,12956);
assert.equal(sites.length,86);
assert.ok(sites.every((v,i)=>i===0||v-sites[i-1]>1),
  'Original 86 equalities contain no overlapping triple-run events');
assert.equal(pools.filter(p=>p.eligible>=0).length,55);
function corr(s){
  const d=[];
  for(let i=1;i<s.length;i++)d.push(s[i]-s[i-1]);
  const n=d.length-1;let x=0,y=0,xx=0,yy=0,xy=0;
  for(let i=0;i<n;i++){
    const a=d[i],b=d[i+1];
    x+=a;y+=b;xx+=a*a;yy+=b*b;xy+=a*b;
  }
  return (n*xy-x*y)/Math.sqrt((n*xx-x*x)*(n*yy-y*y));
}
const observed=corr(sites);
assert.ok(Math.abs(observed-0.38001968924100954)<1e-12);
assert.ok(Math.abs(corr([0,5,12,21,32,45])-1)<1e-12);
function nullModel(disallowAdjacent){
  let state=0x3301;
  const rng=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const vals=[];
  for(let draw=0;draw<20000;draw++){
    const s=[];
    for(const p of pools){
      if(!p.k)continue;
      const cap=p.eligible-(disallowAdjacent?p.k-1:0);
      assert.ok(cap>=p.k);
      const chosen=new Set();
      while(chosen.size<p.k)chosen.add(1+Math.floor(rng()*cap));
      const sorted=[...chosen].sort((a,b)=>a-b);
      for(let i=0;i<sorted.length;i++)s.push(p.start+sorted[i]+(disallowAdjacent?i:0));
    }
    s.sort((a,b)=>a-b);assert.equal(s.length,86);
    vals.push(corr(s));
  }
  const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
  const ge=vals.filter(v=>v>=observed).length;
  const centered=vals.filter(v=>Math.abs(v-mean)>=Math.abs(observed-mean)).length;
  vals.sort((a,b)=>a-b);
  return {draws:20000,seed:"0x3301",disallowAdjacent,mean,median:vals[9999],
    p025:vals[499],p975:vals[19499],ge,upperP:(ge+1)/20001,
    centeredCount:centered,centeredTwoSidedP:(centered+1)/20001};
}
const unrestricted=nullModel(false),nonadjacent=nullModel(true);
assert.equal(unrestricted.ge,99);
assert.ok(Math.abs(unrestricted.mean-0.22958450203788103)<1e-12);
assert.equal(nonadjacent.ge,124);
assert.equal(nonadjacent.centeredCount,291);
assert.ok(Math.abs(nonadjacent.mean-0.2324634560434564)<1e-12);
console.log(JSON.stringify({source:"original p0-55, excluding empty p50",runeCount:total,
  doublets:sites.length,observedPearsonGapAC1:observed,
  pageCountConditioned:unrestricted,
  pageCountAndNoTripleConditioned:nonadjacent,
  note:"Post-hoc sensitivity. Nonadjacent page-conditioned centered p0.0146 is above 0.01/7 Bonferroni; flat-rate T7 result is not invalidated."},null,2));
