/**
 * Systematic 250+6 GF29 framing gate on the original 256 p49–51 table cells.
 * Windows: node sims/lp2_p50_systematic_sixcheck_original_sft.cjs
 * @typedef {{syndromes:number[], coefficientRows:number[][]}} CheckResult
 */
'use strict';
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const table = require('../resources/liber-primus/base60-grid.json');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const MOD = 29;
const TARGET = [0,0,0,0,27,15];
const GP = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
/** @param {number} n @returns {number} */
const mod = n => ((n % MOD) + MOD) % MOD;
/** @param {number} a @param {number} n @returns {number} */
function power(a,n) { let t=1;for(let i=0;i<n;i++)t=mod(t*a);return t; }
/** @param {number} n @returns {number} */
function inv(n) { assert.notEqual(mod(n),0);return power(mod(n),27); }
/**
 * P(X)=Σ a[i]X^(length-1-i); alpha^2=18+11alpha in GF29[X]/H,
 * H=X^2+18X+11. Rows: P(24), P'(24), H-remainder coefficients,
 * P(8), P(17).
 * @param {number} length @returns {number[][]}
 */
function matrix(length) {
  const coefficients=[];
  let h0=1,h1=0;
  for(let e=0;e<length;e++) {
    coefficients.push([power(24,e),e===0?0:mod(e*power(24,e-1)),h0,h1,power(8,e),power(17,e)]);
    [h0,h1]=[mod(18*h1),mod(h0+11*h1)];
  }
  return Array.from({length:6},(_,r)=>Array.from({length},(_,i)=>coefficients[length-1-i][r]));
}
/** @param {number[][]} A @param {number[]} x @returns {number[]} */
const multiply=(A,x)=>A.map(row=>mod(row.reduce((sum,k,i)=>sum+k*x[i],0)));
/**
 * Exact GF29 Gaussian elimination, null only on singular matrix.
 * @param {number[][]} matrix @param {number[]} rhs @returns {number[]|null}
 */
function solve(matrix,rhs) {
  const n=rhs.length;
  const a=matrix.map((row,i)=>row.map(mod).concat(mod(rhs[i])));
  for(let c=0;c<n;c++) {
    const p=a.findIndex((row,i)=>i>=c&&row[c]!==0);
    if(p<0)return null;
    [a[p],a[c]]=[a[c],a[p]];
    const factor=inv(a[c][c]);
    for(let k=c;k<=n;k++)a[c][k]=mod(a[c][k]*factor);
    for(let r=0;r<n;r++)if(r!==c) {
      const f=a[r][c];
      for(let k=c;k<=n;k++)a[r][k]=mod(a[r][k]-f*a[c][k]);
    }
  }
  return a.map(row=>row[n]);
}
/** @param {number[]} data @param {number[]} parity @returns {number[]|null} */
function fill(data,parity) {
  assert.equal(parity.length,6);
  const excluded=new Set(parity);
  assert.equal(excluded.size,6);
  const A=matrix(data.length);
  const rhs=TARGET.map((t,r)=>mod(t-A[r].reduce((sum,v,i)=>sum+(excluded.has(i)?0:v*data[i]),0)));
  const solution=solve(A.map(row=>parity.map(i=>row[i])),rhs);
  if(solution===null)return null;
  const encoded=data.map(mod);
  parity.forEach((index,j)=>{encoded[index]=solution[j];});
  assert.deepEqual(multiply(A,encoded),TARGET);
  return encoded;
}
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const frequencies=Array(MOD).fill(0);
  for(const x of xs)frequencies[x]++;
  return frequencies.reduce((sum,n)=>sum+n*(n-1),0)/(xs.length*(xs.length-1));
}
/** @param {number[]} xs @returns {string} */
const roman=xs=>xs.map(x=>GP[x]).join('');
function main() {
  const tokens=table.rows.flat(),bytes=table.byte_rows.flat();
  assert.equal(tokens.length,256);assert.equal(bytes.length,256);
  const sha=createHash('sha256').update(Buffer.from(bytes)).digest('hex');
  assert.equal(sha,'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  assert.equal(table.alphabet,'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
  assert.deepEqual(tokens.map(t=>60*table.alphabet.indexOf(t[0])+table.alphabet.indexOf(t[1])),bytes);
  const original=bytes.map(mod),A=matrix(256);
  assert.deepEqual(multiply(A,original),TARGET);
  for(let start=0;start<=250;start++) {
    const parity=Array.from({length:6},(_,i)=>start+i);
    assert.deepEqual(fill(original,parity),original);
  }
  const native=corpus.pages[57].indices;
  assert.equal(native.length,95);
  const planted=Array.from({length:256},(_,i)=>native[i%native.length]);
  for(const start of [0,17,125,250]) {
    const parity=Array.from({length:6},(_,i)=>start+i);
    const encoded=fill(planted,parity);
    assert.notEqual(encoded,null);
    assert.deepEqual(encoded.filter((_,i)=>!parity.includes(i)),planted.filter((_,i)=>!parity.includes(i)));
    assert.deepEqual(fill(encoded,parity),encoded);
  }
  const alt='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx';
  assert.equal(alt.length,59);
  const alternate=tokens.map(t=>59*alt.indexOf(t[0])+alt.indexOf(t[1]));
  assert(alternate.every(x=>x>=0&&x<256));
  const alternateSyndromes=multiply(A,alternate.map(mod)).map((x,r)=>mod(x-TARGET[r]));
  const rowA=matrix(8);
  const rowChecks=Array.from({length:32},(_,r)=>multiply(rowA,original.slice(8*r,8*r+8)));
  const matchesFour=rowChecks.filter(x=>x.slice(0,4).every(y=>y===0)).length;
  const matchesSix=rowChecks.filter(x=>x.every((y,j)=>y===TARGET[j])).length;
  const report={
    sourceByteSHA256:sha,
    originalSixSyndromes:multiply(A,original),
    alternateBase59ResidualSyndromes:alternateSyndromes,
    firstSixCandidateParity:original.slice(0,6),
    lastSixCandidateParity:original.slice(-6),
    consecutiveSixParityPlacementCount:251,
    individualRowFourCheckMatches:matchesFour,
    individualRowSixCheckMatches:matchesSix,
    first250DataIoC:ioc(original.slice(0,250)),
    last250DataIoC:ioc(original.slice(6)),
    first250DataRomanPrefix:roman(original.slice(0,60)),
    last250DataRomanPrefix:roman(original.slice(6,66))
  };
  console.log(JSON.stringify(report,null,2));
  console.log('PASS: original bytes, all 251 parity placements, four solved-p57 synthetic positives, base59 and row checks');
}
if(require.main===module)main();
module.exports={matrix,multiply,fill,solve};
