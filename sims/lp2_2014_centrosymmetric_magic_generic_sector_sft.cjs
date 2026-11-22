"use strict";
/**
 * Determine which spectacular-looking 2014/LP1 magic-square identities are
 * generic mathematical consequences of centrosymmetric magic geometry.
 *
 * Original input: all THREE first-party 2014 squares, in their printed order.
 * Original GP29 trace facts and a positive, genuinely different integer
 * centrosymmetric magic-square perturbation are asserted.
 *
 * Windows 11, Node 22, CommonJS, standard library only, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const P = 29;
const mod = x => (x % P + P) % P;
const source = fs.readFileSync(path.join(__dirname,"..",
  "resources/cicada2014-openpuff-magic-squares.txt"),"utf8");
const squares = source.trim().split(/\r?\n\s*\r?\n/).map(group =>
  group.trim().split(/\r?\n/).map(line =>
    line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(x=>x.length),[5,7,5]);
const [A,M,B] = squares;
/** @param {number} n @returns {number[][]} */
const zero = n => Array.from({length:n},()=>Array(n).fill(0));
/** @param {number} n @returns {number[][]} */
const eye = n => Array.from({length:n},(_,i)=>
  Array.from({length:n},(_,j)=>Number(i===j)));
/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function mul(a,b) {
  assert.equal(a[0].length,b.length);
  return a.map(row=>Array.from({length:b[0].length},(_,j)=>
    mod(row.reduce((s,v,k)=>s+v*b[k][j],0))));
}
/** @param {number[][]} a @returns {number[][]} */
const norm = a => a.map(row=>row.map(mod));
/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
const add = (a,b) => a.map((row,i)=>row.map((v,j)=>mod(v+b[i][j])));
/** @param {number[][]} a @param {number} k @returns {number[][]} */
const scale = (a,k) => a.map(row=>row.map(v=>mod(v*k)));
/** @param {number[][]} a @param {number} e @returns {number[][]} */
function power(a,e) {
  let r=eye(a.length), v=norm(a);
  while(e>0) { if(e%2) r=mul(r,v);v=mul(v,v);e=Math.floor(e/2); }
  return r;
}
/** @param {number} n @returns {number[][]} */
function flip(n) {
  const out=zero(n);
  for(let i=0;i<n;i++)out[i][n-1-i]=1;
  return out;
}
const ones = n=>Array.from({length:n},()=>Array(n).fill(1));
/** @param {number[][]} mat @returns {number} */
const trace = mat=>mat.reduce((s,row,i)=>s+row[i],0);
/** @param {number} value @returns {number} */
function inv(value) {
  for(let k=1;k<P;k++)if(mod(k*value)===1)return k;
  throw new Error("noninvertible: "+value);
}
/** @param {number[][]} mat @returns {number[]} */
function charpoly(mat) {
  const n=mat.length, I=eye(n);
  let accumulator=I, out=[1];
  for(let k=1;k<=n;k++) {
    const next=mul(mat,accumulator);
    const coeff=mod(-trace(next)*inv(k));
    out.push(coeff);
    accumulator=add(next,scale(I,coeff));
  }
  return out; // descending coefficients: x^n, x^(n-1), ..., constant
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function polytimes(a,b) {
  let r=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    r[i+j]=mod(r[i+j]+a[i]*b[j]);
  return r;
}
/** @param {number[][]} mat @param {number} sum @returns {void} */
function verifyMagic(mat,sum) {
  const n=mat.length;
  assert.ok(mat.every(row=>row.length===n));
  for(const row of mat)assert.equal(row.reduce((s,v)=>s+v,0),sum);
  for(let j=0;j<n;j++)
    assert.equal(mat.reduce((s,row)=>s+row[j],0),sum);
  assert.equal(trace(mat),sum);
  assert.equal(mat.reduce((s,row,i)=>s+row[n-i-1],0),sum);
  const J=flip(n);
  assert.deepEqual(mul(mul(J,mat),J),norm(mat));
}
/** @param {number[][]} mat @returns {{I:number,J:number,U:number,odd:number,even:number,uniform:number}} */
function squareDecomposition(mat) {
  const n=5, I=eye(n), J=flip(n), U=ones(n), C2=mul(mat,mat);
  const gamma=C2[0][1],alpha=mod(C2[0][0]-gamma),
    beta=mod(C2[0][4]-gamma);
  const predicted=add(add(scale(I,alpha),scale(J,beta)),scale(U,gamma));
  assert.deepEqual(C2,predicted);
  return {I:alpha,J:beta,U:gamma,
    odd:mod(alpha-beta),even:mod(alpha+beta),
    uniform:mod(alpha+beta+5*gamma)};
}
verifyMagic(A,3301);
verifyMagic(B,1033);
verifyMagic(M,1033);
assert.deepEqual(squareDecomposition(A),{
  I:6,J:26,U:16,odd:9,even:3,uniform:25});
assert.deepEqual(squareDecomposition(B),{
  I:1,J:5,U:23,odd:25,even:6,uniform:5});
assert.deepEqual(power(A,56),eye(5));
assert.deepEqual(power(B,56),eye(5));
assert.deepEqual(power(A,28),add(scale(ones(5),12),scale(flip(5),28)));
assert.deepEqual(power(B,14),scale(flip(5),28));
assert.notDeepEqual(mul(A,B),mul(B,A));
assert.deepEqual(charpoly(B),polytimes(
  polytimes(polytimes(polytimes([1,mod(-5)],[1,mod(-8)]),
  [1,mod(-24)]),[1,mod(-21)]),[1,mod(-18)]));
assert.equal(mod(trace(B)),mod(1033));
assert.deepEqual(charpoly(A).length,6);

// Construct a DIFFERENT positive integer centrosymmetric 1033 magic square,
// with untouched row/column/main- and anti-diagonal sums.
const perturbation=[
  [0,0,0,0,0],
  [1,0,0,0,-1],
  [0,0,0,0,0],
  [-1,0,0,0,1],
  [0,0,0,0,0]
];
const Bprime=B.map((row,i)=>row.map((x,j)=>x+perturbation[i][j]));
verifyMagic(Bprime,1033);
assert.ok(Bprime.flat().every(x=>x>0));
assert.notDeepEqual(norm(Bprime),norm(B));
assert.deepEqual(squareDecomposition(Bprime),{
  I:8,J:27,U:23,odd:10,even:6,uniform:5});
assert.deepEqual(power(Bprime,56),eye(5));
assert.notDeepEqual(charpoly(Bprime),charpoly(B));
// The same 56th-power law survives multiple truly different valid squares.
for(let t=0;t<29;t++){
  const C=B.map((row,i)=>row.map((v,j)=>v+t*perturbation[i][j]));
  verifyMagic(C,1033);
  const d=squareDecomposition(C);
  if(d.odd && d.even && d.uniform)
    assert.deepEqual(power(C,56),eye(5));
}

// Derive the actual 7x7 reflection-sector matrices in image order.
// Odd coordinates: e_j - e_(6-j), j=0,1,2.
// Even coordinates: e_j + e_(6-j), j=0,1,2, plus center e3.
const O=Array.from({length:3},(_,i)=>
  Array.from({length:3},(_,j)=>mod(M[i][j]-M[i][6-j])));
const E=Array.from({length:4},(_,i)=>
  Array.from({length:4},(_,j)=>
    mod(i===3 ? (j===3?M[3][3]:2*M[3][j])
       : (j===3?M[i][3]:M[i][j]+M[i][6-j]))));
// Every odd-sector and EVEN-NONUNIFORM sector has zero trace:
// traced even4 includes the row-sum eigenvalue 1033.
assert.equal(mod(trace(O)),0);
assert.equal(mod(trace(E)),mod(1033));
const oddPolynomial=polytimes([1,mod(-8)],[1,mod(-21),8]);
const evenPolynomial=polytimes(polytimes(
  [1,mod(-18)],[1,mod(-24)]),[1,mod(-5),16]);
assert.deepEqual(charpoly(O),oddPolynomial);
assert.deepEqual(charpoly(E),evenPolynomial);
// Linear roots 8,24 force quadratic traces -8=21 and -24=5.
// Uniform root18 is forced in both historical 1033-sum squares.
assert.equal(mod(8+21),0);
assert.equal(mod(24+5),0);
assert.equal(mod(1033),18);
assert.deepEqual(charpoly(M),polytimes(oddPolynomial,evenPolynomial));
assert.equal(charpoly(O)[1],0);
assert.equal(mod(charpoly(E)[1]+18),0);

console.log(JSON.stringify({
  originalMagicSums:[3301,1033,1033],
  originalA2:squareDecomposition(A),
  originalB2:squareDecomposition(B),
  changedB2:squareDecomposition(Bprime),
  a56IsIdentity:true,b56IsIdentity:true,changedB56IsIdentity:true,
  odd7Polynomial:oddPolynomial,even7Polynomial:evenPolynomial,
  genericForcedRelations:"tr(odd)=tr(even-nonuniform)=0",
  changedSquareExample:Bprime,
  changedBCharacteristicPolynomial:charpoly(Bprime)
},null,2));
console.log("PASS: original 2014 source and generic centrosymmetric-magic sector theorem");
