'use strict';
/**
 * LP2 p15-next-Fibonacci -> p42 PNW/91 -> historical Stage10 square91
 * complete original five-rune Hill-consumer decision.
 *
 * Read-only Windows 11 / Node.js 22 CommonJS single-file test.
 * All ciphertext and 2014 square values are loaded from preserved sources.
 * No key, receiver, alignment or decoded word is selected by scoring English.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const squares = fs.readFileSync(path.join(
  root, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8')
  .trim().split(/\r?\n\s*\r?\n/)
  .map(block => block.trim().split(/\r?\n/)
    .map(row => row.trim().split(/\s+/).map(Number)));
const sq = squares[2];
const pages = gp.pages.filter(p => p.page <= 55);
const tape = pages.flatMap(p => p.indices || []);
assert.equal(tape.length, 12956);
assert.deepEqual(squares.map(s => [s.length, s[0].length]), [[5,5],[7,7],[5,5]]);
assert.equal(sq[2][2], 91);
assert.equal(sq.flat().length, 25);
const p42 = pages.find(p => p.page === 42);
assert.equal(p42.indices.length, 272);
assert.deepEqual(p42.indices.slice(31, 34), [13, 9, 7]);
assert.equal(p42.indices.slice(31,34).reduce((sum,x)=>sum+gp.prime[x],0),91);

/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @param {number} x @returns {number} */
function inverseScalar(x) {
  for (let i = 1; i < 29; i++) if (mod(i*x) === 1) return i;
  throw Error('Noninvertible field scalar');
}
/** @param {number[][]} matrix @returns {{matrix:number[][],det:number}} */
function invert(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => [
    ...row.map(mod), ...Array.from({length:n}, (_,j)=>+(i===j))]);
  let determinant = 1;
  for (let i = 0; i < n; i++) {
    const pivot = a.findIndex((row,j) => j >= i && row[i] !== 0);
    assert.notEqual(pivot,-1, 'Historical square must be invertible modulo29');
    if (pivot !== i) {
      [a[i],a[pivot]] = [a[pivot],a[i]];
      determinant = mod(-determinant);
    }
    determinant = mod(determinant * a[i][i]);
    const unit = inverseScalar(a[i][i]);
    a[i] = a[i].map(v=>mod(v*unit));
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const factor = a[j][i];
      a[j] = a[j].map((v,k)=>mod(v-factor*a[i][k]));
    }
  }
  return {matrix:a.map(row=>row.slice(n)),det:determinant};
}
/** @param {number[][]} a @returns {number[][]} */
const transpose = a => a[0].map((_,j)=>a.map(row=>row[j]));
/** @param {number[][]} matrix @param {number[]} data @returns {number[]} */
function transform(matrix, data) {
  assert.equal(data.length % 5, 0);
  const out = Array(data.length);
  for (let start = 0; start < data.length; start += 5) {
    for (let j = 0; j < 5; j++) {
      let sum=0;
      for (let k=0; k<5; k++) sum += matrix[j][k]*data[start+k];
      out[start+j]=mod(sum);
    }
  }
  return out;
}
/** @param {number[]} data @returns {number} */
function ioc(data) {
  const bins=Array(29).fill(0);
  for (const v of data) bins[v]++;
  return bins.reduce((sum,n)=>sum+n*(n-1),0)/(data.length*(data.length-1));
}
/** @param {number} n @returns {boolean} */
function isPrime(n) {
  for (let k=2; k*k<=n; k++) if(n%k===0) return false;
  return n>=2;
}
/** @param {number} ordinal @returns {number} */
function nthPrime(ordinal) {
  let count=0;
  for(let p=2;;p++) if(isPrime(p) && ++count===ordinal) return p;
}
const afterSpiralFibonacci=1597;
const firstUnprintedValue=Math.abs(3301-nthPrime(afterSpiralFibonacci+1));
assert.equal(firstUnprintedValue,10176);
let p42Start=0;
for(const p of pages) {
  if(p.page===42) break;
  p42Start+=(p.indices||[]).length;
}
assert.equal(p42Start+31,firstUnprintedValue-1);
const tail=tape.slice(firstUnprintedValue-1);
assert.equal(tail.length,2781);
const complete=tail.slice(0,Math.floor(tail.length/5)*5);
const residual=tail.slice(complete.length);
assert.equal(complete.length,2780);
assert.deepEqual(residual,[10]);
const M=sq.map(row=>row.map(mod));
const inverseM=invert(M);
assert.equal(inverseM.det,3);
const models={
  M, Minv:inverseM.matrix, MT:transpose(M), MinvT:transpose(inverseM.matrix)
};
const solvedP57=gp.pages.find(p=>p.page===57).indices;
assert.equal(solvedP57.length,95);
const native=Array.from({length:complete.length},(_,i)=>solvedP57[i%solvedP57.length]);
const expectIoC={
  M:0.034489400203478814,
  Minv:0.0344834459888009,
  MT:0.03447386746953643,
  MinvT:0.03447775065302202
};
const results={};
for(const [name,matrix] of Object.entries(models)){
  const inverseMatrix=invert(matrix).matrix;
  const actual=transform(matrix,complete);
  assert.deepEqual(transform(inverseMatrix,actual),complete);
  assert.ok(Math.abs(ioc(actual)-expectIoC[name])<1e-14);
  // Real 95-rune solved-source plaintext, repeated as necessary to fill
  // the identical 2,780-rune original packet, encrypted with a genuine key.
  const plantedCipher=transform(matrix,native);
  assert.deepEqual(transform(inverseMatrix,plantedCipher),native);
  assert.ok(ioc(native) > 0.06, 'Genuine GP prose positive stays language-like');
  results[name]={
    originalDecodedIoC:ioc(actual),
    first60:actual.slice(0,60).map(x=>gp.translit[x]).join(''),
    verifiedOriginalRoundtrip:complete.length,
    verifiedAuthenticSourcePlant:native.length
  };
}
console.log(JSON.stringify({
  test:'LP2 p15 next-Fibonacci pointer / p42 91-center authentic Stage10 Hill',
  originalGpTapeSha256:createHash('sha256').update(Buffer.from(tape)).digest('hex'),
  firstUnprintedValue, originalStartGlobalOneBased:firstUnprintedValue,
  p42PageOffsetZeroBased:31, p42Word:'PNW', gpPrimeSum:91,
  historicalMagicSquareCenter:91, historicalSquareDetMod29:inverseM.det,
  blockSize:5, completeOriginalRunes:complete.length,
  unchangedTrailingOriginalRune:residual,
  originalCipherIoC:ioc(complete), solvedP57IoC:ioc(solvedP57),
  results, recoveredUnknownPlaintext:false
},null,2));
