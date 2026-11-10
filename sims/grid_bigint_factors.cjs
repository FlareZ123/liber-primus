"use strict";
/**
 * Source-bound arithmetic on the printed LP2 pp49-51 32x8 base-60 grid.
 * An exact scan-order factorization, explicit alternative traversals, and
 * selection-aware matched histogram shuffles. No plaintext is asserted.
 *
 * Single-file reproducible experiment: node sims/grid_bigint_factors.cjs
 * Requires Node 22 builtins and the committed original-reference resources.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/base60-grid.json"),"utf8"));
const alternative=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
assert.equal(grid.rows.length,32);
assert(grid.rows.every(row=>row.length===8));
const bytes=grid.byte_rows.flat();
assert.equal(bytes.length,256);
assert(bytes.every(b=>Number.isInteger(b)&&b>=0&&b<256));
const symbols="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
assert.equal(symbols.length,60);
assert.deepEqual(grid.rows.flat().map(tok=>symbols.indexOf(tok[0])*60+symbols.indexOf(tok[1])),bytes);
assert.deepEqual(alternative.bytes,bytes);
const sha256=crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
assert.equal(sha256,"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {number[]} a @returns {bigint} */
const integer=a=>BigInt("0x"+a.map(v=>v.toString(16).padStart(2,"0")).join(""));
const N=integer(bytes),primes=[];
for(let p=2;p<=179;p++)if(!primes.some(q=>p%q===0))primes.push(p);
/** Return complete prime-power factors with prime <=179, plus their product. */
function smoothFactor(n){
 let smooth=1n;const factors=[];
 for(const p of primes){
  const q=BigInt(p);let exponent=0;
  while(n%q===0n){n/=q;smooth*=q;exponent++;}
  if(exponent)factors.push([p,exponent]);
 }
 return {smooth,factors};
}
const F=smoothFactor(N),fixedFactor=36528277968n;
assert.equal(N.toString(2).length,2048);
assert.equal(F.smooth,fixedFactor);
assert.deepEqual(F.factors,[[2,4],[3,3],[7,1],[13,1],[29,1],[179,2]]);
assert.equal(N%fixedFactor,0n);
const unsolvedPages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(unsolvedPages.length,55);
assert.equal(unsolvedPages.find(p=>p.page===53).indices.length,179);
const squareLengths=Array.from(new Set(unsolvedPages.map(p=>p.indices.length))).map(l=>BigInt(l*l));
const squareHits=unsolvedPages.filter(p=>N%BigInt(p.indices.length*p.indices.length)===0n).map(p=>({page:p.page,length:p.indices.length}));
assert.deepEqual(squareHits,[{page:53,length:179}]);
const columns=Array.from({length:8},(_,j)=>grid.byte_rows.map(r=>r[j])).flat();
const readings=[
 ["printed-row-major",bytes],
 ["reverse-whole-stream",bytes.slice().reverse()],
 ["column-major",columns],
 ["reverse-column-major",columns.slice().reverse()],
 ["reverse-each-row",grid.byte_rows.flatMap(row=>row.slice().reverse())],
 ["reverse-row-order",grid.byte_rows.slice().reverse().flat()]
];
const variants=readings.map(([name,order])=>({
 name,smooth179:smoothFactor(integer(order)).smooth.toString(),
 divisible29:integer(order)%29n===0n,divisible179Squared:integer(order)%32041n===0n
}));
assert(variants.slice(1).every(x=>x.divisible179Squared===false&&x.divisible29===false));

/** Fisher-Yates control with exact unbiased bounded 32-bit sampling. */
let seed=0x20261110;
/** @returns {number} uint32 */
function random32(){
 seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
 return seed>>>0;
}
/** @param {number} n @returns {number} Uniform integer in 0..n-1. */
function below(n){
 const limit=4294967296-(4294967296%n);
 let k;
 do{k=random32();}while(k>=limit);
 return k%n;
}
// Conditional test: hold the seven block-38 source/cipher cells? No. This
// is a different experiment. Hold only first and last table bytes, so 2048-bit
// width and the 0x50 (divisible-by-16) tail remain controlled, and permute
// the other 254 observed source bytes to preserve their exact multiset.
const sampleCount=250000,permuted=bytes.slice();
const counts={
 squareAny:0,
 squareAnd29:0,
 fixed179square:0,
 fixed179squareAnd29:0,
 smoothAtLeast:0
};
for(let i=0;i<sampleCount;i++){
 for(let k=254;k>1;k--){
  const j=1+below(k);
  [permuted[k],permuted[j]]=[permuted[j],permuted[k]];
 }
 const n=integer(permuted);
 const hasSquare=squareLengths.some(s=>n%s===0n);
 const has29=n%29n===0n;
 const has179square=n%32041n===0n;
 counts.squareAny+=Number(hasSquare);
 counts.squareAnd29+=Number(hasSquare&&has29);
 counts.fixed179square+=Number(has179square);
 counts.fixed179squareAnd29+=Number(has179square&&has29);
 counts.smoothAtLeast+=Number(smoothFactor(n).smooth>=fixedFactor);
}
assert.deepEqual(counts,{
 squareAny:2198,
 squareAnd29:68,
 fixed179square:10,
 fixed179squareAnd29:1,
 smoothAtLeast:89
});
console.log(JSON.stringify({
 classification:"original numeric structure, not an authenticated plaintext or key",
 source:"resources/liber-primus/base60-grid.json",
 sourceBytes:256,
 sha256,
 bits:N.toString(2).length,
 factorizationUnder180:F.factors,
 smoothFactor:F.smooth.toString(),
 remainingCofactorBits:(N/F.smooth).toString(2).length,
 pageLengthSquareHits:squareHits,
 orientationChecks:variants,
 permutationNull:{
  firstAndLastBytesLocked:[bytes[0],bytes[255]],
  interiorBytesShuffled:254,
  seed:"0x20261110",
  draws:sampleCount,
  counts,
  addOneUpperTail:Object.fromEntries(Object.entries(counts).map(([k,v])=>[k,(v+1)/(sampleCount+1)]))
 },
 conclusion:"Exceptional numerical divisibility in printed row-major order; factors discovered exploratorily. No direct cipher inversion."
},null,2));
