"use strict";
/**
 * Original LP2 physical page 15 (archive scan 32.jpg): decipher all 16
 * printed 4x4 number cells with the unique Fibonacci prime-index spiral.
 * Reproduce: node sims/lp2_p15_fibonacci_prime_spiral_sft.cjs
 *
 * Input transcription is original-scan visual inspection, explicitly
 * distinguishable from the source JPEG; all 16 cells match exactly.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const image=fs.readFileSync(path.join(root,"resources/liber-primus/32.jpg"));
const sourceSHA256=crypto.createHash("sha256").update(image).digest("hex");
const actual=[
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
];
const spiral=[
  [1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]
];
/** @param {number} x @returns {boolean} */
function primeQ(x) {
  if(x<2)return false;
  for(let d=2;d*d<=x;d++)if(x%d===0)return false;
  return true;
}
/** @param {number} n @returns {number} */
function primeAt(n) {
  assert(n>=1&&Number.isInteger(n));
  let i=0,v=1;
  while(i<n){v++;if(primeQ(v))i++;}
  return v;
}
const fib=[0,1];
while(fib.length<16)fib.push(fib.at(-1)+fib.at(-2));
assert.deepEqual(fib.slice(0,9),[0,1,1,2,3,5,8,13,21]);
const distinctFib=[0,...fib.slice(2)]; // 0, 1, 2, 3, 5, ...
// Need 16 distinct values, extend Fibonacci once.
if(distinctFib.length<16) {
  fib.push(fib.at(-1)+fib.at(-2));
  distinctFib.push(fib.at(-1));
}
assert.deepEqual(distinctFib,
  [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]);
const generated=distinctFib.map((f,n)=>{
  const primeIndex=f+1;
  const p=primeAt(primeIndex);
  const cell=Math.abs(3301-p);
  const [row,col]=spiral[n];
  assert.equal(actual[row][col],cell,
    "original source mismatch at row "+row+" col "+col);
  return {step:n,coordinate:{row:row+1,column:col+1},fibonacci:f,
    primeIndex,prime:p,number:cell,over3301:p>3301};
});
assert.equal(generated.length,16);
assert.deepEqual(generated.map(x=>x.number),
  [3299,3298,3296,3294,3288,3278,3258,3222,
   3152,3038,2838,2472,1820,708,1206,4516]);
assert.deepEqual(generated.map(x=>x.primeIndex),
  [1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]);
// Generate 4x4 cells from the exact reverse mapping.
const rebuilt=Array.from({length:4},()=>Array(4).fill(null));
for(const row of generated)rebuilt[row.coordinate.row-1][row.coordinate.column-1]=row.number;
assert.deepEqual(rebuilt,actual);
console.log(JSON.stringify({
  classification:"SOURCE-EXACT COMPLETE 16-CELL NUMERIC DECODING",
  image:"resources/liber-primus/32.jpg",imageSHA256:sourceSHA256,
  physicalPage:15,
  formula:"abs(3301 - prime(distinctFibonacci[n]+1))",
  startingRedCell:3299,
  all16CellsMatch:true,printedGrid:actual,spiral:generated,
  limits:"This identifies the p15 numerical encoding and spiral direction; no encrypted LP2 rune plaintext has yet been recovered."
},null,2));
