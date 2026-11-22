"use strict";
/**
 * SFT: source-original adjacency anisotropy in the proposed 27x27 LP2 pp0-2 map.
 * Distinguishes author-printed row-major anti-doublet behavior from putative
 * column-major / mixed-axis 2D ciphertext production, without fitting any key,
 * plaintext, traversal permutation or visual geometry.
 * No verified unknown LP2 plaintext follows from the result.
 * Node 22+ CommonJS; reads canonical corpus only; no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const data = JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources",
  "liber-primus","lp2-corpus.json"),"utf8"));
const grid = data.pages.filter((p)=>p.page<=2).flatMap((p)=>p.indices);
assert.equal(grid.length,729);
const n=27;
/**
 * @param {number[]} xs length 729 (source row-major)
 * @param {number} dr signed row displacement
 * @param {number} dc signed column displacement
 * @returns {{matches:number,edges:number}}
 */
function count(xs,dr,dc) {
  let matches=0,edges=0;
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    const nr=r+dr,nc=c+dc;
    if(nr<0||nr>=n||nc<0||nc>=n)continue;
    edges++;
    if(xs[r*n+c]===xs[nr*n+nc])matches++;
  }
  return {matches,edges};
}
/** @param {number[]} xs @returns {number} */
function adjacent(xs) {
  let hits=0;
  for(let i=1;i<xs.length;i++)hits+=Number(xs[i]===xs[i-1]);
  return hits;
}
const rowMajor=adjacent(grid);
const columnMajor=adjacent(Array.from({length:729},(_,i)=>
  grid[(i%27)*27+Math.floor(i/27)]));
const H=count(grid,0,1),V=count(grid,1,0);
const D1=count(grid,1,1),D2=count(grid,1,-1);
assert.deepEqual({rowMajor,columnMajor,H,V,D1,D2},{
  rowMajor:4,columnMajor:30,
  H:{matches:4,edges:702},
  V:{matches:27,edges:702},
  D1:{matches:26,edges:676},
  D2:{matches:15,edges:676}
});
// A synthetically planted directional invariant checks count orientation.
const rowOnly=Array.from({length:729},(_,i)=>Math.floor(i/27));
const columnOnly=Array.from({length:729},(_,i)=>i%27);
assert.deepEqual(count(rowOnly,0,1),{matches:702,edges:702});
assert.deepEqual(count(rowOnly,1,0),{matches:0,edges:702});
assert.deepEqual(count(columnOnly,0,1),{matches:0,edges:702});
assert.deepEqual(count(columnOnly,1,0),{matches:702,edges:702});

// Inventory-preserving, completely frozen 20k permutation null. Fisher-Yates,
// seeded xorshift32 and identical original rune marginals for each draw.
let state=0x20163301;
/** @returns {number} */
function random32(){
  state^=(state<<13); state^=(state>>>17);state^=(state<<5);
  return state>>>0;
}
let weakHorizontal=0,greaterContrast=0;
const shuffle=grid.slice();
for(let trial=0;trial<20000;trial++){
  for(let i=shuffle.length-1;i>0;i--){
    const j=random32()%(i+1);
    const t=shuffle[i];shuffle[i]=shuffle[j];shuffle[j]=t;
  }
  const h=count(shuffle,0,1).matches,v=count(shuffle,1,0).matches;
  if(h<=H.matches)weakHorizontal++;
  if(v-h>=V.matches-H.matches)greaterContrast++;
}
console.log("p0-2 original 27x27 original row-major repeats",rowMajor,"of 728");
console.log("Same cells column-major repeats",columnMajor,"of 728");
console.log("Horizontal",H,"Vertical",V,"NW-SE",D1,"NE-SW",D2);
console.log("20,000 fixed-inventory null tests: H<=4",weakHorizontal,
 " V-H>=23",greaterContrast);
console.log("Synthetic positional positive controls exact.");
console.log("Interpretation: printed-order anti-repeat dominates. This rules out");
console.log("a hidden 2D order as the sole location of the anti-repeat constraint,");
console.log("but it cannot rule out separate geometric key/route layers.");
