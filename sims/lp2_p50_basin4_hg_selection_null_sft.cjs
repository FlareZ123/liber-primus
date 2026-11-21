"use strict";
/**
 * Source-conditioned structural null for the already documented original
 * LP2 p50 pointer basin / H×G parity-matrix bridge.
 *
 * Null fixes EVERY original table byte residue modulo29, so polynomial
 * divisibility by the sourced H×G quartic is preserved EXACTLY. It also
 * preserves the ENTIRE original uint8 multiset, by shuffling bytes only
 * among table addresses having equal fixed residues.
 *
 * In each shuffled source-equivalent table independently discover the
 * pointer graph's connected component structure. Only if it has exactly
 * one 252-node and one four-node component, compute the rank of the four
 * source HG polynomial-remainer columns at the newly selected four-node
 * addresses. This accounts for the selection of the four addresses by
 * the candidate pointer operation rather than assuming fixed locations.
 *
 * No original plaintext, historical key, or intended cipher is claimed.
 * Run Node.js 22/CommonJS on Windows11, read-only:
 * node sims/lp2_p50_basin4_hg_selection_null_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const table=JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-grid-256.json"),"utf8"));
const bytes=table.bytes;
assert.equal(bytes.length,256);
assert.equal(table.pages.length,3);
assert.deepEqual(table.pages.map(x=>x.bytes.length),[80,104,72]);
const mod=n=>(n%29+29)%29;
const factor=[23,21,11,17,12];
const inverse=Array.from({length:29},(_,i)=>{
  if(!i)return 0;
  for(let j=1;j<29;j++)if((i*j)%29===1)return j;
  throw Error("not invertible");
});
const powers=Array.from({length:256},()=>null);
let current=[1,0,0,0];
for(let exponent=0;exponent<256;exponent++){
  powers[exponent]=current.slice();
  const high=current[3]*inverse[factor[4]];
  current=[
    mod(-high*factor[0]),
    mod(current[0]-high*factor[1]),
    mod(current[1]-high*factor[2]),
    mod(current[2]-high*factor[3])
  ];
}
/** @param {number[]} arr @returns {number[]} */
function factorRemainder(arr){
  const rem=[0,0,0,0];
  for(let i=0;i<arr.length;i++){
    const source=powers[255-i];
    for(let r=0;r<4;r++)rem[r]=mod(rem[r]+arr[i]*source[r]);
  }
  return rem;
}
assert.deepEqual(factorRemainder(bytes),[0,0,0,0]);
/** @param {number[]} selected @returns {number[][]} */
function coefficientMatrix(selected){
  return Array.from({length:4},(_,j)=>selected.map(i=>powers[255-i][j]));
}
/** @param {number[][]} original @returns {number} */
function rank(original){
  const A=original.map(row=>row.slice());
  let r=0;
  for(let col=0;col<4;col++){
    let pivot=r;
    while(pivot<4&&A[pivot][col]===0)pivot++;
    if(pivot===4)continue;
    [A[pivot],A[r]]=[A[r],A[pivot]];
    const multiplier=inverse[A[r][col]];
    for(let j=col;j<4;j++)A[r][j]=mod(A[r][j]*multiplier);
    for(let i=r+1;i<4;i++){
      const value=A[i][col];
      for(let j=col;j<4;j++)A[i][j]=mod(A[i][j]-value*A[r][j]);
    }
    r++;
  }
  return r;
}
/**
 * Undirected connected components of the 256-state functional digraph.
 * Return only the four-node component if and only if the graph has
 * EXACT component sizes 252 and 4, otherwise null.
 * @param {number[]} mapping
 * @returns {number[] | null}
 */
function basin4(mapping){
  const parents=Int16Array.from({length:256},(_,i)=>i);
  const sizes=new Uint16Array(256).fill(1);
  /** @param {number} v @returns {number} */
  function find(v){
    while(parents[v]!==v){
      parents[v]=parents[parents[v]];
      v=parents[v];
    }
    return v;
  }
  for(let i=0;i<256;i++){
    const a=find(i),b=find(mapping[i]);
    if(a===b)continue;
    if(sizes[a]<sizes[b]){parents[a]=b;sizes[b]+=sizes[a];}
    else{parents[b]=a;sizes[a]+=sizes[b];}
  }
  let count=0,smallRoot=-1,largeRoot=-1;
  for(let i=0;i<256;i++)if(parents[i]===i){
    count++;
    if(sizes[i]===4)smallRoot=i;
    if(sizes[i]===252)largeRoot=i;
  }
  if(count!==2||smallRoot<0||largeRoot<0)return null;
  const selected=[];
  for(let i=0;i<256;i++)if(find(i)===smallRoot)selected.push(i);
  assert.equal(selected.length,4);
  return selected;
}
const original=basin4(bytes);
assert.deepEqual(original,[9,158,227,249]);
const originalMatrix=coefficientMatrix(original);
assert.deepEqual(originalMatrix,[
  [23,15,25,23],
  [3,28,15,7],
  [25,25,2,17],
  [0,24,16,24]
]);
assert.equal(rank(originalMatrix),3);
assert.deepEqual(original.map(i=>bytes[i]),[249,249,249,158]);
assert.deepEqual(original.map(i=>table.pages.flatMap(p=>p.tokens)[i]),
  ["49","49","49","2c"]);

// Positive graph control: an arbitrary relabeling of the original
// directed map MUST keep the 252+4 component topology unchanged.
let seed=0x4f7e3301;
/** @returns {number} */
function random(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return seed>>>0;
}
const perm=Array.from({length:256},(_,i)=>i);
for(let i=255;i>0;i--){
  const j=random()%(i+1);
  [perm[i],perm[j]]=[perm[j],perm[i]];
}
const conjugate=Array(256);
for(let i=0;i<256;i++)conjugate[perm[i]]=perm[bytes[i]];
assert.deepEqual(basin4(conjugate),
  original.map(i=>perm[i]).sort((a,b)=>a-b));

// For each residue, permute original bytes only among original
// addresses carrying precisely that residue. Keep both (a) all the
// printed GP29 coefficients and (b) all 256 original byte values.
const bins=Array.from({length:29},()=>[]);
for(let i=0;i<256;i++)bins[bytes[i]%29].push(i);
const sourceResidues=bytes.map(x=>x%29);
const counts={split2524:0,rank3:0,rank2OrLess:0,rank4:0,
  rank3AndTripleFanin:0};
const trials=200000;
for(let trial=0;trial<trials;trial++){
  const mapping=bytes.slice();
  for(const bin of bins){
    for(let i=bin.length-1;i>0;i--){
      const j=random()%(i+1),a=bin[i],b=bin[j];
      [mapping[a],mapping[b]]=[mapping[b],mapping[a]];
    }
  }
  const selected=basin4(mapping);
  if(!selected)continue;
  counts.split2524++;
  const r=rank(coefficientMatrix(selected));
  if(r===4)counts.rank4++;
  else if(r===3){
    counts.rank3++;
    const histogram=new Map();
    for(const i of selected){
      const value=mapping[i];
      histogram.set(value,(histogram.get(value)||0)+1);
    }
    if(Math.max(...histogram.values())===3)counts.rank3AndTripleFanin++;
  }else counts.rank2OrLess++;
}
assert.deepEqual(counts,{
  split2524:2309,rank3:115,rank2OrLess:0,rank4:2194,
  rank3AndTripleFanin:37
});
assert.equal(counts.split2524,
  counts.rank3+counts.rank2OrLess+counts.rank4);
assert.deepEqual(sourceResidues,bytes.map(x=>x%29));
console.log(JSON.stringify({
  originalBytes:256, originalBasin4:original,
  originalHGRank:rank(originalMatrix),
  originalQuotientDegreeCount:252,
  conditioning:"fixed byte multiset plus fixed byte mod29 at EVERY printed position; fixed exact HG polynomial divisibility",
  matchedShuffles:trials,initialSeed:"0x4f7e3301",
  counts,
  joint2524AndRank3Fraction:counts.rank3/trials,
  conditionalRank3Given2524:counts.rank3/counts.split2524,
  jointAlsoTripleFaninFraction:counts.rank3AndTripleFanin/trials,
  positivelyRelabeledGraphRecovered:true,
  caveat:"Postselection over many possible graph/polynomial patterns prevents interpreting this Monte Carlo frequency as authorship probability. No original unknown plaintext, key, or cipher."
},null,2));
console.log("PASS: original HG residue invariant, selected four-node rank, graph-conjugacy plant, 200000 exact residue-preserving and multiset-preserving source-equivalent nulls.");
