"use strict";
/**
 * All-secret prime/ordinal weighted five-state anti-repeat clock obstruction.
 * Uses only original LP2 rune ciphertext and source punctuation. No word/line
 * resets: this model grants arbitrary page and visible punctuation resets,
 * with optional literal-F skips (none in the three decisive intervals).
 *
 * Windows Node22: node sims/lp2_antirepeat_gpprime_ordinal5_rank3_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const punctuation=JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const pages=gp.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
assert.equal(gp.prime.length,29);
const mod5=n=>((n%5)+5)%5;
const dot=(v,k)=>mod5(v.reduce((s,n,i)=>s+n*k[i],0));
/**
 * Repeat destinations are zero-based indices of the second rune of
 * an immediately equal pair. At a5-state clock gate, every two such
 * destinations in one no-reset interval must be at equal clock phases.
 *
 * Three genuine originally observed same-page transitions; the derivative
 * punctuation inventory has zero marks in all intervals. Their source
 * JPEGs are p27=44.jpg, p24=41.jpg, p35=52.jpg.
 */
const witnesses=[
 {page:27,first:84,last:90,pre:[1,4,4],post:[1,4,4]},
 {page:24,first:52,last:59,pre:[2,0,1],post:[2,1,1]},
 {page:35,first:196,last:203,pre:[2,4,4],post:[2,3,1]}
];
const original= [];
for(const x of witnesses){
 const page=gp.pages.find(p=>p.page===x.page);
 assert(page && page.indices.length);
 const r=page.indices;
 assert(x.first>0 && x.last<r.length);
 assert.equal(r[x.first],r[x.first-1],"first original doublet");
 assert.equal(r[x.last],r[x.last-1],"second original doublet");
 const before=r.slice(x.first,x.last),after=r.slice(x.first+1,x.last+1);
 assert.equal(before.length,x.last-x.first);
 assert.equal(after.length,x.last-x.first);
 assert(!before.includes(0)&&!after.includes(0),
  "no GP-F skip can change event span");
 const marks=punctuation.events.filter(p=>p.page===x.page
   && p.local_rune_offset>x.first && p.local_rune_offset<=x.last);
 assert.equal(marks.length,0,"no source punctuation reset");
 const vector=values=>[
  values.length%5,
  values.reduce((n,v)=>n+v,0)%5,
  values.reduce((n,v)=>n+gp.prime[v],0)%5
 ];
 assert.deepEqual(vector(before),x.pre);
 assert.deepEqual(vector(after),x.post);
 original.push({page:x.page,first:x.first,last:x.last,gap:x.last-x.first,
  pre:x.pre,post:x.post,firstRune:r[x.first],lastRune:r[x.last]});
}
/** @param {number[][]} a */
function determinant(a){
 const [[x,y,z],[u,v,w],[l,m,n]]=a;
 return mod5(x*(v*n-w*m)-y*(u*n-w*l)+z*(u*m-v*l));
}
assert.equal(determinant(witnesses.map(w=>w.pre)),4);
assert.equal(determinant(witnesses.map(w=>w.post)),4);
let tested=0;
const compatible={pre:[],post:[]};
for(let c=0;c<5;c++)for(let a=0;a<5;a++)for(let b=0;b<5;b++){
 tested++;
 for(const convention of ["pre","post"]){
  if(witnesses.every(w=>dot(w[convention],[c,a,b])===0))
   compatible[convention].push([c,a,b]);
 }
}
assert.equal(tested,125);
assert.deepEqual(compatible,{pre:[[0,0,0]],post:[[0,0,0]]});
/** Generated native model control to prove the five-clock gate admits a
 *  stream whose repeats are restricted to a single allowed phase.
 */
const key=[1,2,3];
const weight=rune=>mod5(key[0]+key[1]*rune+key[2]*gp.prime[rune]);
const glyphs=gp.prime.flatMap((_,i)=>weight(i)===1?[i]:[]);
assert(glyphs.length>=2);
const [left,right]=glyphs;
let stream=[],phase=0;
const repeats=[];
for(let i=0;i<125;i++){
 const value=i>0 && phase===0?stream.at(-1)
   :stream.length && stream.at(-1)===left?right:left;
 if(i>0&&value===stream.at(-1)){
  assert.equal(phase,0);
  repeats.push(i);
 }
 stream.push(value);
 phase=mod5(phase+weight(value));
}
assert(repeats.length>15);
for(let k=1;k<repeats.length;k++){
 const gap=stream.slice(repeats[k-1],repeats[k]);
 assert.equal(dot([gap.length%5,
  gap.reduce((s,r)=>s+r,0)%5,
  gap.reduce((s,r)=>s+gp.prime[r],0)%5],key),0);
}
console.log("PASS "+JSON.stringify({originalRunes:12956,originalDoublets:86,
 weightedGPClockStates:5,allSecretCoefficients:tested,
 witnesses:original,preDeterminant:4,postDeterminant:4,compatible,
 syntheticPositive:{repeats:repeats.length,weight1Glyphs:glyphs.length}}));
