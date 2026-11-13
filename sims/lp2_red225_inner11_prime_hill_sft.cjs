"use strict";
/**
 * Source-led 225-red-core 11×11 Hill full-rank alternative:
 * canonical GP prime weights modulo29 instead of ordinal indices.
 *
 * Windows 11 Node.js22: node sims/lp2_red225_inner11_prime_hill_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const ink=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-ink-annotations.json"),"utf8"));
const red=ink.pages.flatMap(p=>(p.red_spans||[]).flatMap(s=>
  corpus.pages.find(q=>q.page===p.page).indices.slice(s.start,s.start+s.length)));
const p32=corpus.pages.find(p=>p.page===32).indices;
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(red.length,225);
assert.equal(p32.length,121);
assert.equal(p57.length,95);
const mod=n=>(n%29+29)%29;
const A=Array.from({length:11},(_,r)=>Array.from({length:11},(_,c)=>corpus.prime[red[(r+2)*15+c+2]]%29));
/** @param {number[][]} m @returns {number[][]} */
function trans(m){return m[0].map((_,j)=>m.map(x=>x[j]));}
/** @param {number[][]} a @returns {{rank:number,inverse:number[][]|null}} */
function invert(a){
  const n=a.length;
  const rows=a.map((r,i)=>r.concat(Array.from({length:n},(_,j)=>Number(i===j))));
  let rank=0;
  for(let col=0;col<n;col++){
    let candidate=rank;
    while(candidate<n&&rows[candidate][col]===0)candidate++;
    if(candidate===n)continue;
    [rows[rank],rows[candidate]]=[rows[candidate],rows[rank]];
    let inv=1;
    while(mod(inv*rows[rank][col])!==1)inv++;
    rows[rank]=rows[rank].map(x=>mod(x*inv));
    for(let j=0;j<n;j++){
      if(j===rank)continue;
      let factor=rows[j][col];
      rows[j]=rows[j].map((x,k)=>mod(x-factor*rows[rank][k]));
    }
    rank++;
  }
  return {rank,inverse:rank===n?rows.map(x=>x.slice(n)):null};
}
/** @param {number[][]} m @param {number[]} v @returns {number[]} */
function mul(m,v){return m.map(row=>mod(row.reduce((s,x,i)=>s+x*v[i],0)));}
/** @param {number[]} values @returns {number} */
function ioc(values){
  let c=Array(29).fill(0);
  for(const v of values)c[v]++;
  return c.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
const layouts={
  rows:Array.from({length:11},(_,i)=>p32.slice(i*11,i*11+11)),
  columns:Array.from({length:11},(_,i)=>Array.from({length:11},(_,j)=>p32[j*11+i]))
};
const planted=Array.from({length:11},(_,i)=>
  Array.from({length:11},(_,j)=>p57[(i*11+j)%p57.length]));
const variants=[];
for(const [orientation,key] of [["printed",A],["transposed",trans(A)]]){
  const {rank,inverse}=invert(key);
  assert.equal(rank,11);
  assert.ok(inverse);
  for(const original of planted){
    assert.deepEqual(mul(inverse,mul(key,original)),original);
    assert.deepEqual(mul(key,mul(inverse,original)),original);
  }
  for(const [layout,blocks] of Object.entries(layouts)){
    for(const [direction,operation] of [["inverse",inverse],["forward",key]]){
      const decoded=blocks.map(v=>mul(operation,v)).flat();
      assert.deepEqual(
        blocks.map(v=>mul(direction==="inverse"?key:inverse,mul(operation,v))),
        blocks);
      variants.push({
        orientation,layout,direction,
        ioc:ioc(decoded),
        first40Runes:decoded.slice(0,40).map(x=>corpus.translit[x]).join(" "),
        syntheticNativeRecovered:121,originalRoundtrip:true
      });
    }
  }
}
console.log(JSON.stringify({
  status:"PASS",source:"Original 225 red rune central 11x11 GP prime weights reduced modulo29",
  keyFirstRow:A[0],keyRank:invert(A).rank,
  p32OriginalIoC:ioc(p32),p57KnownPlainIoC:ioc(p57),
  tested:variants.length,variants,
  decision:"All eight direct prime-weight Hill operations are exact bijections but must recover authentic plaintext before their source key can be selected"
},null,2));