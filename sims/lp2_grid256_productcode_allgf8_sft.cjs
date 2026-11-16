"use strict";
/**
 * Source-fixed P50 32x8 product-code gate (Node 22, CommonJS).
 * Test one shared affine GF(256) row parity over all 30 inner rows,
 * with 30 raw-byte polynomial field representations.
 * Run: node sims/lp2_grid256_productcode_allgf8_sft.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const file=path.join(__dirname,"..","resources/liber-primus/lp2-grid-256.json");
const grid=JSON.parse(fs.readFileSync(file,"utf8"));
const a=Buffer.from(grid.bytes);
const h=crypto.createHash("sha256").update(a).digest("hex");
assert.equal(a.length,256);
assert.equal(h,"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const r=Array.from({length:32},(_,i)=>Array.from(a.subarray(i*8,(i+1)*8)));
const X=r.slice(1,31).map(row=>[1,...row.slice(1,7)]);
const left=r.slice(1,31).map(row=>row[0]);
const right=r.slice(1,31).map(row=>row[7]);
assert.equal(X.length,30);
/** @param {number} x @param {number} y @param {number} poly */
function mult(x,y,poly){
  let z=0;
  while(y){if(y&1)z^=x;y>>=1;x<<=1;if(x&256)x^=poly;}
  return z;
}
/** @param {number} x @param {number} poly */
function inv(x,poly){
  assert.notEqual(x,0);
  let z=1;
  for(let i=0;i<254;i++)z=mult(z,x,poly);
  assert.equal(mult(z,x,poly),1);
  return z;
}
/** @param {number[][]} x @param {number[]} y @param {number} poly */
function solve(x,y,poly){
  const z=x.map((row,i)=>[...row,y[i]]);
  const m=x[0].length;
  let rank=0;
  const pivots=[];
  for(let c=0;c<m;c++){
    let pivot=rank;
    while(pivot<z.length && z[pivot][c]===0)pivot++;
    if(pivot===z.length)continue;
    [z[rank],z[pivot]]=[z[pivot],z[rank]];
    const factor=inv(z[rank][c],poly);
    z[rank]=z[rank].map(q=>mult(q,factor,poly));
    for(let i=0;i<z.length;i++){
      if(i===rank || z[i][c]===0)continue;
      const f=z[i][c];
      z[i]=z[i].map((v,j)=>v^mult(f,z[rank][j],poly));
    }
    pivots.push(c);rank++;
  }
  const incompatible=z.filter(row=>row.slice(0,m).every(x=>x===0) && row[m]!==0).length;
  const coefficients=Array(m).fill(0);
  for(let i=0;i<rank;i++)coefficients[pivots[i]]=z[i][m];
  return {rank,incompatible,coefficients};
}
// Exhaustive 30 monic degree-8 irreducibles over GF2; verified with
// sympy.polys.galoistools.gf_irreducible_p. Raw byte polynomial basis.
const fields=[0x11b,0x11d,0x12b,0x12d,0x139,0x13f,0x14d,0x15f,
  0x163,0x165,0x169,0x171,0x177,0x17b,0x187,0x18b,0x18d,0x19f,
  0x1a3,0x1a9,0x1b1,0x1bd,0x1c3,0x1cf,0x1d7,0x1dd,0x1e7,0x1f3,0x1f5,0x1f9];
assert.equal(fields.length,30);
const min={left:Infinity,right:Infinity};
for(const poly of fields){
  for(const [name,y] of [["left",left],["right",right]]){
    const result=solve(X,y,poly);
    assert.equal(result.rank,7);
    assert.ok(result.incompatible>=22);
    min[name]=Math.min(min[name],result.incompatible);
  }
  // Synthetic positive: arbitrary fitted secret affine check code.
  const known=[1,2,3,4,5,6,7];
  const planted=X.map(row=>row.reduce((t,v,j)=>t^mult(v,known[j],poly),0));
  const positive=solve(X,planted,poly);
  assert.equal(positive.incompatible,0);
  assert.deepEqual(positive.coefficients,known);
}
// A fixed modular-Z256 byte affine mapping has a GF2-affine least bit.
const X2=X.map(row=>row.map(v=>v&1));
const bitLeft=solve(X2,left.map(v=>v&1),0x11b);
const bitRight=solve(X2,right.map(v=>v&1),0x11b);
assert.equal(bitLeft.rank,7);
assert.equal(bitRight.rank,7);
assert.equal(bitLeft.incompatible,13);
assert.equal(bitRight.incompatible,12);
console.log(JSON.stringify({source_sha256:h,shape:"32x8",interior:"30x6",
  outer_columns:[0,7],original_interior_rows:30,fields:fields.length,
  candidate_affine_coefficients_per_column:7,
  smallest_gf256_incompatible_rows:min,
  modulo256_low_bit_incompatible_rows:{left:bitLeft.incompatible,right:bitRight.incompatible},
  positive:"30/30 rows match planted GF256 affine parity in each of 30 bases",
  verdict:"No fixed [8,6] raw-byte systematic linear row product-code parity."
},null,2));
