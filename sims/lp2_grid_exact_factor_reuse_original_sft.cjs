"use strict";
/**
 * Source-frozen GF(29) p50 factor reuse gate across whole LP2 physical pages
 * and 16 unsolved red spans. Node.js 22, CommonJS, no external dependencies.
 * Run: node sims/lp2_grid_exact_factor_reuse_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const root = path.resolve(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const gp = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const bytes = load("resources/liber-primus/base60-grid.json").byte_rows.flat();
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
assert.equal(bytes.length,256);
assert.equal(createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const factors = {
  H:[11,18,1], G:[25,10,1], cubic:[24,16,14,1],
  nonic:[11,15,0,9,1,5,10,20,12,1]
};
const mod = n => (n%29+29)%29;
/**
 * @param {number[]} c Low-to-high coefficients.
 * @param {number[]} f Monic low-to-high factor.
 * @returns {number[]} GF29 remainder.
 */
function remainder(c,f) {
  assert.equal(f.at(-1),1);
  const a=c.map(mod),d=f.length-1;
  for(let i=a.length-1;i>=d;i--) {
    const q=a[i];
    for(let j=0;j<=d;j++)a[i-d+j]=mod(a[i-d+j]-q*f[j]);
  }
  return Array.from({length:d},(_,i)=>a[i]||0);
}
/**
 * @param {number[]} c Original order.
 * @param {number[]} f Monic factor.
 * @param {boolean} ascending Whether original order is ascending powers.
 */
const divides=(c,f,ascending)=>remainder(ascending?c:c.toReversed(),f).every(x=>!x);
/** @param {number[]} a @param {number[]} b */
function multiply(a,b) {
  const out=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    out[i+j]=mod(out[i+j]+a[i]*b[j]);
  return out;
}
const spans=ink.pages.filter(p=>p.page<56).flatMap(p=>
  (p.red_spans||[]).map(s=>({
    page:p.page,start:s.start,length:s.length,
    indices:gp.pages[p.page].indices.slice(s.start,s.start+s.length)
  })));
assert.equal(spans.length,16);
assert(spans.every(s=>s.indices.length===s.length));
const whole={},red={};
for(const [name,f] of Object.entries(factors)){
  assert(divides(bytes,f,false));
  const plant=multiply([1,4,9,16,25,7,3],f);
  assert.deepEqual(remainder(plant,f),Array(f.length-1).fill(0));
  plant[0]=mod(plant[0]+1);
  assert.deepEqual(remainder(plant,f),[1,...Array(f.length-2).fill(0)]);
  whole[name]=pages.filter(p=>divides(p.indices,f,false)).map(p=>p.page);
  red[name]={};
  for(const ascending of [true,false])
    red[name][ascending?"ascending":"descending"]=spans.filter(s=>
      s.length>=f.length-1 && divides(s.indices,f,ascending))
      .map(({page,start,length})=>({page,start,length}));
}
assert.deepEqual(whole,{H:[],G:[29],cubic:[],nonic:[]});
assert.deepEqual(red,{
  H:{ascending:[],descending:[]},
  G:{ascending:[{page:39,start:119,length:3}],descending:[]},
  cubic:{ascending:[],descending:[]},
  nonic:{ascending:[],descending:[]}
});
console.log(JSON.stringify({
  input:{pages:55,runes:12956,redSpans:16,tableBytes:256},
  factors,wholePageMatches:whole,redSpanMatches:red,
  originalTablePositive:"4/4",plantedPositive:"4/4",plaintextRecovered:false
},null,2));
