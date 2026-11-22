"use strict";
/**
 * Exact source factor degree-238 recurrence gate on original LP2 runes.
 * Node.js 22: node sims/grid238_p36_seed_allpage_gate.cjs
 * Direct source-generator hypothesis only, no plaintext claim.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=load("resources/liber-primus/lp2-corpus.json");
const grid=load("resources/liber-primus/lp2-grid-256.json");
const F=29,L=238;
const mod=x=>((x%F)+F)%F;
function inverse(x){for(let y=1;y<F;y++)if(x*y%F===1)return y;throw Error("zero inverse");}
function trim(a){let n=a.length;while(n>1&&a[n-1]===0)n--;return a.slice(0,n);}
function divide(p,q){
  const r=p.slice();
  const out=Array(r.length-q.length+1).fill(0);
  for(let i=out.length-1;i>=0;i--){
    const f=mod(r[i+q.length-1]*inverse(q.at(-1)));
    out[i]=f;
    for(let j=0;j<q.length;j++)r[i+j]=mod(r[i+j]-f*q[j]);
  }
  assert(r.slice(0,q.length-1).every(v=>v===0),"Expected original-source factor");
  return trim(out);
}
assert.equal(grid.bytes.length,256);
let polynomial=trim(grid.bytes.map(mod).reverse()); // source descending coefficients
assert.equal(polynomial.length-1,254);
// The four independently established irreducible factors. The root24
// factor has multiplicity two; total removed degree16.
const factors=[
  [5,1],[5,1],
  [11,18,1],
  [24,16,14,1],
  [11,15,0,9,1,5,10,20,12,1]
];
for(const factor of factors)polynomial=divide(polynomial,factor);
assert.equal(polynomial.length,L+1);
const k=inverse(polynomial.at(-1));
const generator=polynomial.map(v=>mod(v*k));
assert.equal(generator.at(-1),1);
assert.deepEqual(generator.slice(0,12),[5,9,18,5,15,8,11,3,19,21,8,13]);
const pages=corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length);
assert.equal(pages.length,55);
const all=pages.flatMap(p=>p.indices);
assert.equal(all.length,12956);
/** @param {number[]} stream */
function count(stream){
  let hits=0;
  for(let i=L;i<stream.length;i++){
    let next=0;
    for(let j=0;j<L;j++)next-=generator[j]*stream[i-L+j];
    if(mod(next)===stream[i])hits++;
  }
  return {hits,eligible:Math.max(0,stream.length-L)};
}
const sum=xs=>xs.reduce((s,x)=>({
  hits:s.hits+x.hits,eligible:s.eligible+x.eligible
}),{hits:0,eligible:0});
const full=count(all);
const backward=count(all.slice().reverse());
const perPage=sum(pages.map(p=>count(p.indices)));
const perPageReverse=sum(pages.map(p=>count(p.indices.slice().reverse())));
assert.deepEqual([full.hits,full.eligible],[436,12718]);
assert.deepEqual([backward.hits,backward.eligible],[459,12718]);
assert.deepEqual([perPage.hits,perPage.eligible],[42,1025]);
assert.deepEqual([perPageReverse.hits,perPageReverse.eligible],[39,1025]);
const p36=corpus.pages.find(p=>p.page===36);
const p37=corpus.pages.find(p=>p.page===37);
assert.deepEqual([p36.runic_count,p37.runic_count],[238,228]);
/** @param {number[]} seed @param {number} n */
function continueGenerator(seed,n){
  assert.equal(seed.length,L);
  const run=seed.slice(),out=[];
  for(let i=0;i<n;i++){
    let next=0;
    for(let j=0;j<L;j++)next-=generator[j]*run[i+j];
    next=mod(next);
    run.push(next);
    out.push(next);
  }
  return {all:run,next:out};
}
// The source-selected unique 238-rune p36 provides a literal entire seed.
const plant=continueGenerator(p36.indices,all.length-L);
assert.equal(count(plant.all).hits,all.length-L);
const p37forecast=plant.next.slice(0,p37.indices.length);
const p37Matches=p37forecast.filter((x,i)=>x===p37.indices[i]).length;
assert.equal(p37Matches,14); // 14 chance-level hits, not a decoder
const first100=p37forecast.slice(0,100)
  .filter((x,i)=>x===p37.indices[i]).length;
assert.equal(first100,10);
console.log(JSON.stringify({
  hypothesis:"p36's 238 unmodified runes seed the grid's unique degree-238 GF29 recurrence",
  generatorDegree:L,
  global:full,globalReverse:backward,
  perPage,perPageReverse,
  expectedGlobal:full.eligible/F,
  p36SeedLength:p36.indices.length,
  p37Predictions:p37forecast.length,
  p37Matches,first100Matches:first100,
  exactSourceSeededPlant:{hits:count(plant.all).hits,positions:all.length-L},
  decision:"source-locked direct ciphertext LFSR generator excluded, no plaintext"
},null,2));
