'use strict';
/**
 * First-party p32 prime-axis 4x4 register and LP2 p15 Fibonacci-prime Hill inverse.
 * Source: canonical LP2 GP29 corpus; p15's verified physical 4x4 numeral spiral.
 * Read-only Windows Node.js 22 single runnable test file.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const gp = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const p32 = gp.pages.find(p => p.page === 32).indices;
const p57 = gp.pages.find(p => p.page === 57).indices;
const MOD = 29;
/** @param {number} x @returns {number} */
const m = x => ((x % MOD) + MOD) % MOD;
/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
/** @param {number} nth @returns {number} */
function nthPrime(nth) {
  let count = 0;
  for (let p = 2; ; p++) {
    if (isPrime(p) && ++count === nth) return p;
  }
}
/** @param {number[][]} A @param {number[][]} B @returns {number[][]} */
function multiply(A, B) {
  assert.equal(A[0].length, B.length);
  return A.map(row => B[0].map((_, j) => m(
    row.reduce((sum, x, i) => sum + x * B[i][j], 0))));
}
/**
 * Invert a nonsingular GF29 matrix. Compute its exact modular determinant.
 * @param {number[][]} matrix
 * @returns {{inverse:number[][], determinant:number}}
 */
function inverseAndDet(matrix) {
  const n = matrix.length;
  const A = matrix.map((row, i) => [
    ...row.map(m), ...Array.from({length:n}, (_,j) => +(i===j))]);
  let determinant = 1;
  for (let k=0;k<n;k++) {
    let pivot=k;
    while (pivot<n && A[pivot][k]===0) pivot++;
    assert.ok(pivot<n, 'source matrix singular modulo 29');
    if (pivot!==k) {
      [A[k],A[pivot]]=[A[pivot],A[k]];
      determinant=m(-determinant);
    }
    const x=A[k][k];
    determinant=m(determinant*x);
    const reciprocal=Array.from({length:28},(_,i)=>i+1)
      .find(v=>m(v*x)===1);
    assert.ok(reciprocal);
    A[k]=A[k].map(v=>m(v*reciprocal));
    for (let r=0;r<n;r++) if (r!==k) {
      const scale=A[r][k];
      A[r]=A[r].map((v,j)=>m(v-scale*A[k][j]));
    }
  }
  return {inverse:A.map(row=>row.slice(n)),determinant};
}
/** @param {number[][]} matrix @returns {string} */
const roman = matrix => matrix.flat().map(x=>gp.translit[x]).join('');
assert.equal(p32.length, 121);
assert.equal(p57.length, 95);
assert.deepEqual(p32.slice(0,11),[20,2,25,7,25,1,13,27,5,7,21]);
const weights=gp.prime;
const rowSums=Array.from({length:11},(_,r)=>p32.slice(11*r,11*r+11)
  .reduce((s,x)=>s+weights[x],0));
const colSums=Array.from({length:11},(_,c)=>p32
  .filter((_,i)=>i%11===c).reduce((s,x)=>s+weights[x],0));
assert.deepEqual(rowSums,[563,617,287,540,743,513,577,579,603,537,486]);
assert.deepEqual(colSums,[569,429,641,669,518,611,463,690,378,578,499]);
const selectedRows=rowSums.flatMap((v,i)=>isPrime(v)?[i]:[]);
const selectedCols=colSums.flatMap((v,i)=>isPrime(v)?[i]:[]);
assert.deepEqual(selectedRows,[0,1,4,6]);
assert.deepEqual(selectedCols,[0,2,6,10]);
const C=selectedRows.map(r=>selectedCols.map(c=>p32[11*r+c]));
assert.deepEqual(C,[[20,25,13,21],[8,17,18,7],[21,12,7,14],[15,14,1,7]]);
// Every source p15 decimal cell equals |3301 - prime(F_n+1)|.
// Cell order is the printed original square, retaining its red 3299 anchor.
const magnitudes=[[3258,3222,3152,3038],[3278,3299,3298,2838],
  [3288,3294,3296,2472],[4516,1206,708,1820]];
const primeIndices=[[14,22,35,56],[9,1,2,90],
  [6,4,3,145],[988,611,378,234]];
const decodedPrimes=primeIndices.map((row,i)=>row.map((index,j)=>{
  const value=nthPrime(index);
  assert.equal(Math.abs(3301-value), magnitudes[i][j]);
  return value;
}));
const sources={magnitudes,primeIndices,decodedPrimes};
const plant=Array.from({length:4},(_,i)=>p57.slice(i*4,i*4+4));
const outputs={};
for (const [label,values] of Object.entries(sources)) {
  const M=values.map(row=>row.map(m));
  const {inverse,determinant}=inverseAndDet(M);
  // Two actual source matrices and both cryptographic orientations,
  // with exact inverse keys that require no text-derived parameters.
  assert.deepEqual(multiply(inverse,multiply(M,plant)),plant);
  assert.deepEqual(multiply(multiply(plant,M),inverse),plant);
  const attempts={
    forwardRows:roman(multiply(M,C)),
    forwardCols:roman(multiply(C,M)),
    inverseRows:roman(multiply(inverse,C)),
    inverseCols:roman(multiply(C,inverse))
  };
  outputs[label]={determinant,attempts};
}
assert.deepEqual(Object.values(outputs).map(x=>x.determinant),[17,21,10]);
assert.equal(outputs.magnitudes.attempts.inverseRows,
  'HYLELSEAAXNLAEATPC');
assert.equal(outputs.decodedPrimes.attempts.inverseCols,
  'IMOEAWOXAIAJAECMIAO');
console.log(JSON.stringify({
  p32RowsPrime: selectedRows,
  p32ColsPrime: selectedCols,
  rowSums: selectedRows.map(i=>rowSums[i]),
  colSums: selectedCols.map(i=>colSums[i]),
  selectedIndices: C,
  selectedTransliteration:roman(C),
  outputs,
  knownSolvedP57Plant:'16/16 under all six real-key inverses',
  decision:'No full original plaintext under the twelve source-fixed Hill orientations'
},null,2));
