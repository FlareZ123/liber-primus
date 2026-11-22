"use strict";

/**
 * Exhaustive GF29 rank calculation for every monic divisor of the printed
 * p50 grid's established degree-16 factor. The 24 divisors are the complete
 * branch that omits the separately established irreducible Q238 factor.
 *
 * The complementary 24 Q238-containing divisors are invalid for the known
 * 180-rune tail under the exact inverse in
 * sims/p50_terminal_q238_known_interior_sft.cjs.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/base60-grid.json"),"utf8")).byte_rows.flat();
assert.equal(grid.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(grid)).digest("hex"),
 "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {number} value @returns {number} */
const mod = value => ((value % 29) + 29) % 29;
/** @param {number} value @returns {number} */
function inverse(value) {
 for(let k=1;k<29;k++)if(mod(value*k)===1)return k;
 throw new Error("Cannot invert zero");
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a,b) {
 const out=Array(a.length+b.length-1).fill(0);
 for(let i=0;i<a.length;i++)
  for(let j=0;j<b.length;j++)out[i+j]=mod(out[i+j]+a[i]*b[j]);
 return out;
}
/**
 * Polynomial remainder of an ascending source vector by a monic polynomial.
 * @param {number[]} ascending
 * @param {number[]} divisor
 * @returns {number[]}
 */
function remainder(ascending,divisor) {
 if(divisor.length===1)return [];
 const a=ascending.map(mod),degree=divisor.length-1;
 for(let i=a.length-1;i>=degree;i--) {
  const q=a[i];
  for(let j=0;j<=degree;j++)a[i-degree+j]=mod(a[i-degree+j]-q*divisor[j]);
 }
 return Array.from({length:degree},(_,i)=>a[i]??0);
}
/** @param {number[][]} array  Rows by GF29 coordinates, columns by border symbols. */
function rank(array) {
 if(!array.length)return 0;
 const m=array.map(row=>row.slice()),height=m.length,width=m[0].length;
 let r=0;
 for(let j=0;j<width&&r<height;j++) {
  let pivot=r;
  while(pivot<height&&m[pivot][j]===0)pivot++;
  if(pivot===height)continue;
  [m[r],m[pivot]]=[m[pivot],m[r]];
  const inv=inverse(m[r][j]);
  for(let col=j;col<width;col++)m[r][col]=mod(m[r][col]*inv);
  for(let row=0;row<height;row++)if(row!==r&&m[row][j]) {
   const q=m[row][j];
   for(let col=j;col<width;col++)m[row][col]=mod(m[row][col]-q*m[r][col]);
  }
  r++;
 }
 return r;
}

// Original row-major 32x8 perimeter has exactly 76 positions.
const border=[];
for(let pos=0;pos<256;pos++){
 const row=Math.floor(pos/8),column=pos%8;
 if(row===0||row===31||column===0||column===7)border.push(pos);
}
assert.equal(border.length,76);
const source=grid.slice().reverse().map(value=>value%29);
const factors=[
 [5,1],                 // linear (original multiplicity 2)
 [11,18,1],             // degree 2
 [24,16,14,1],          // degree 3
 [11,15,0,9,1,5,10,20,12,1], // degree 9
];
const all=[];
for(let e0=0;e0<=2;e0++)
 for(let e1=0;e1<=1;e1++)
  for(let e2=0;e2<=1;e2++)
   for(let e3=0;e3<=1;e3++) {
    const exponents=[e0,e1,e2,e3];
    let d=[1];
    for(let k=0;k<4;k++)
     for(let copy=0;copy<exponents[k];copy++)d=multiply(d,factors[k]);
    const degree=d.length-1;
    assert.deepEqual(remainder(source,d),Array(degree).fill(0),
     "Each small factor product divides the actual source table");
    const matrix=Array.from({length:degree},()=>Array(76).fill(0));
    for(let j=0;j<border.length;j++){
     const unit=Array(256).fill(0);
     unit[255-border[j]]=1;
     const column=remainder(unit,d);
     for(let i=0;i<degree;i++)matrix[i][j]=column[i];
    }
    const actualRank=rank(matrix);
    assert.equal(actualRank,degree,"Original border has full syndrome rank");
    all.push({exponents,degree,rank:actualRank,unknownBorderSymbols:76-degree});
   }
assert.equal(all.length,24);
assert.equal(all.filter(x=>x.degree===16).length,1);
assert.equal(all.find(x=>x.degree===16).unknownBorderSymbols,60);
assert.equal(Math.min(...all.map(x=>x.unknownBorderSymbols)),60);
assert.equal(Math.max(...all.map(x=>x.unknownBorderSymbols)),76);
const counts=Object.fromEntries([...new Set(all.map(x=>x.degree))]
 .sort((a,b)=>a-b).map(degree=>[degree,all.filter(x=>x.degree===degree).length]));
console.log(JSON.stringify({
  sourceByteCount:256,sourceBorderCells:76,sourceInteriorCells:180,
  distinctSmallDivisors:all.length,
  smallDivisorDegreeCounts:counts,
  smallDivisorSyndromeRankAlwaysFull:true,
  rangeOfUnconstrainedPerimeterSymbols:[60,76],
  numberOfLargeFactorDivisors:24,
  complementaryLargeFactorDecision:"All contain Q238; independently disproved on 159/180 known original plaintext positions",
  totalMonicDivisors:48,
  unknownOriginalPagePlaintextRecovered:false,
},null,2));
