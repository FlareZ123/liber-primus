'use strict';
/**
 * SFT: original LP2 P50 GF29 polynomial H*G quotient -> circumference peel
 * -> original 2014 A(3301) 5x5 inverse Hill -> original LP1 DIVINITY inverse.
 *
 * All parameters are frozen by actual first-party objects before decoding.
 * There are no key searches, candidate shifts, source page choices or
 * learned plaintext scores. Read-only. Windows 11 Node.js 22, CommonJS.
 * Operates on unchanged original table and historical signed-source square.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
/** @param {string} p @returns {any} */
function json(p) { return JSON.parse(read(p)); }
/** @param {number} x @returns {number} */
function mod(x) { return (x % 29 + 29) % 29; }
/** @param {number} x @returns {number} */
function inverse(x) {
  for (let i = 1; i < 29; i++) if (mod(x*i) === 1) return i;
  throw new Error('GF29 inverse absent');
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function polynomialProduct(a,b) {
  const out = Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    out[i+j]=mod(out[i+j]+a[i]*b[j]);
  return out;
}
/**
 * @param {number[]} coeffs Ascending coefficients
 * @param {number[]} factor Ascending coefficients
 * @returns {{quotient:number[], remainder:number[]}}
 */
function divide(coeffs,factor) {
  const work=coeffs.slice().map(mod),degree=factor.length-1;
  const q=Array(coeffs.length-degree).fill(0);
  for(let i=q.length-1;i>=0;i--) {
    const term=mod(work[i+degree]*inverse(factor[degree]));
    q[i]=term;
    for(let j=0;j<=degree;j++)work[i+j]=mod(work[i+j]-term*factor[j]);
  }
  return {quotient:q,remainder:work.slice(0,degree)};
}
/** @param {number[][]} input @returns {number[][]} */
function invertMatrix(input) {
  const n=input.length;
  const A=input.map((row,i)=>[...row.map(mod),...Array.from({length:n},(_,j)=>+(i===j))]);
  for(let col=0;col<n;col++) {
    let pivot=col;
    while(pivot<n&&A[pivot][col]===0)pivot++;
    assert(pivot<n,'historical matrix singular');
    [A[col],A[pivot]]=[A[pivot],A[col]];
    const k=inverse(A[col][col]);
    A[col]=A[col].map(x=>mod(x*k));
    for(let row=0;row<n;row++) if(row!==col) {
      const t=A[row][col];
      A[row]=A[row].map((x,j)=>mod(x-t*A[col][j]));
    }
  }
  return A.map(x=>x.slice(n));
}
/** @param {number[][]} M @param {number[]} data @returns {number[]} */
function hill(M,data) {
  const size=M.length;
  assert.equal(data.length%size,0,'exact source Hill packet boundary');
  const out=[];
  for(let start=0;start<data.length;start+=size) {
    const v=data.slice(start,start+size);
    for(const row of M)out.push(mod(row.reduce((a,x,j)=>a+x*v[j],0)));
  }
  return out;
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count=Array(29).fill(0);
  for(const x of values)count[x]++;
  return count.reduce((sum,n)=>sum+n*(n-1),0)/(values.length*(values.length-1));
}
/**
 * Exact original DIVINITY with literal plaintext F(0) passing transparently.
 * A ciphertext F(0) may also arise through normal additive encipherment;
 * enumerate both possibilities without a plaintext guess.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @returns {{survivors:number, firstImpossible:number, maxima:number}}
 */
function decodeDivinity(ciphertext,key) {
  /** @type {Array<number>} */
  let states=[0], maxima=1;
  for(let i=0;i<ciphertext.length;i++) {
    const c=ciphertext[i],next=[];
    for(const phase of states) {
      if(c===0)next.push(phase);
      const p=mod(c-key[phase%key.length]);
      if(p!==0)next.push(phase+1);
    }
    states=next;
    maxima=Math.max(maxima,states.length);
    if(!states.length) return {survivors:0,firstImpossible:i,maxima};
  }
  return {survivors:states.length,firstImpossible:-1,maxima};
}
/** @param {number[]} plain @param {number[]} key @returns {number[]} */
function encryptDivinity(plain,key) {
  let clock=0;
  return plain.map(x=>x===0?0:mod(x+key[(clock++)%key.length]));
}
function main() {
  const grid=json('resources/liber-primus/lp2-grid-256.json').bytes;
  const corpus=json('resources/liber-primus/lp2-corpus.json');
  assert.equal(grid.length,256);
  const H=[3,26,24]; // historical signed 2013 BASE29(3301): 3QO
  const G=corpus.pages.find(p=>p.page===39).indices.slice(119,122);
  assert.deepEqual(G,[27,5,15]); // original p39 red triad
  const F=polynomialProduct(H,G);
  assert.deepEqual(F,[23,21,11,17,12]);
  const {quotient,remainder}=divide(grid.slice().reverse(),F);
  assert.deepEqual(remainder,[0,0,0,0]);
  const q=quotient.slice().reverse();
  assert.equal(q.length,252);
  assert.equal(q[0],0);
  const inside=q.slice(1,-1);
  assert.equal(inside.length,250);
  // First original 2014 OpenPuff 3301-sum 5x5 magic square A.
  const matrices=read('resources/cicada2014-openpuff-magic-squares.txt')
    .trim().split(/\r?\n\s*\r?\n/)
    .map(part=>part.trim().split(/\r?\n/).map(line=>line.trim().split(/\s+/).map(Number)));
  assert.deepEqual(matrices.map(A=>A.length),[5,7,5]);
  const A=matrices[0].map(row=>row.map(mod));
  assert.equal(matrices[0][0].reduce((s,n)=>s+n,0),3301);
  const Ai=invertMatrix(A);
  const hillPlain=hill(Ai,inside);
  assert.deepEqual(hill(A,hillPlain),inside);
  const solved=corpus.pages.find(p=>p.page===57).indices;
  assert.equal(solved.length,95);
  assert.deepEqual(hill(Ai,hill(A,solved)),solved);
  const reference=require('./authentic_lp1_p03_p04_vigenere_recovery.cjs');
  const key=reference.key;
  assert.deepEqual(key,[23,10,1,10,9,10,16,26]);
  assert.deepEqual(encryptDivinity(reference.plaintext,key),reference.cipher);
  assert.ok(decodeDivinity(reference.cipher,key).survivors>=1);
  const plant=encryptDivinity(hill(A,solved),key);
  assert.ok(decodeDivinity(plant,key).survivors>=1);
  const result=decodeDivinity(hillPlain,key);
  // This is the actual original receiver; exact F-zero branch reaches an
  // impossible state even before any English language inference.
  assert.equal(result.survivors,0);
  console.log(JSON.stringify({
    sourceLength:grid.length,polynomialFactor:F,
    quotientLength:q.length,peeledLength:inside.length,
    original3301SquareDimension:5,
    extractedHillCipherIoc:ioc(inside),
    originalHillOutputIoc:ioc(hillPlain),
    originalHillOutputPrefix:hillPlain.slice(0,85).map(x=>corpus.translit[x]).join(''),
    originalDivinityLegalPaths:result.survivors,
    earliestImpossibleRuneIndex:result.firstImpossible,
    maximalFStateCount:result.maxima,
    positiveOriginalLP1Reproduced:515,
    positiveNativeP57MatrixAndDivinity:95,
    sourceResult:'No original plaintext; this one fully specified source-derived multi-stage receiver is impossible under authentic transparent-F DIVINITY semantics.'
  },null,2));
}
if (require.main===module) main();
module.exports={main};
