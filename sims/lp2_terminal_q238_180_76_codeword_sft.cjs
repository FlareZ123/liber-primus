'use strict';
/**
 * Original LP2 Q238 systematic 180-to-76 codeword gate, Node.js 22.
 * Run at repository root: node sims/lp2_terminal_q238_180_76_codeword_sft.cjs
 * Source-only single runnable test file; zero external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
/** @param {number} v @returns {number} */
function inv(v) {
  assert.notEqual(mod(v), 0);
  for (let i=1;i<29;i++) if (mod(i*v)===1) return i;
  throw Error('no GF29 inverse');
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a,b) {
  const out=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)
    for(let j=0;j<b.length;j++) out[i+j]=mod(out[i+j]+a[i]*b[j]);
  return out;
}
/** @param {number[]} a @param {number[]} d @returns {number[]} */
function divideExact(a,d) {
  const q=Array(a.length-d.length+1).fill(0),r=a.slice();
  for(let i=0;i<q.length;i++) {
    q[i]=mod(r[i]*inv(d[0]));
    for(let j=0;j<d.length;j++) r[i+j]=mod(r[i+j]-q[i]*d[j]);
  }
  assert(r.every(x=>x===0), 'source polynomial factorization must be exact');
  return q;
}
/** @param {number} count @returns {number[]} */
function primes(count) {
  const p=[];
  for(let n=2;p.length<count;n++) {
    let ok=true;
    for(let j=2;j*j<=n;j++) if(n%j===0) {ok=false;break;}
    if(ok) p.push(n);
  }
  return p;
}
/** @param {number[]} cipher @returns {number[]} */
function solvedP56(cipher) {
  const prime=primes(85); let clock=0;
  const clear=cipher.map((v,i)=>{
    if(i===56) {assert.equal(v,0);return v;}
    return mod(v-(prime[clock++]-1));
  });
  assert.equal(clock,84);
  return clear;
}
/**
 * Full GF29 Gaussian elimination on arbitrary source-known positions.
 * @param {number[][]} m
 * @param {number[]} target
 * @returns {{rank:number,coefficients:number[],matched:number,failed:number,firstFailure:number}}
 */
function solve(m,target) {
  const width=m[0].length,rows=m.map((v,i)=>[...v,target[i]]);
  const pivots=[];let rank=0;
  for(let col=0;col<width;col++) {
    let pivot=rank;
    while(pivot<rows.length && rows[pivot][col]===0) pivot++;
    if(pivot===rows.length) continue;
    [rows[rank],rows[pivot]]=[rows[pivot],rows[rank]];
    const s=inv(rows[rank][col]);
    rows[rank]=rows[rank].map(v=>mod(v*s));
    for(let i=0;i<rows.length;i++) if(i!==rank && rows[i][col]) {
      const f=rows[i][col];
      for(let j=col;j<=width;j++) rows[i][j]=mod(rows[i][j]-f*rows[rank][j]);
    }
    pivots.push(col);rank++;
  }
  const coefficients=Array(width).fill(0);
  for(let i=0;i<rank;i++) coefficients[pivots[i]]=rows[i][width];
  const wrong=m.map((line,i)=>mod(line.reduce((sum,v,j)=>sum+v*coefficients[j],0))!==target[i]?i:-1).filter(i=>i>=0);
  return {rank,coefficients,matched:target.length-wrong.length,failed:wrong.length,firstFailure:wrong[0]??-1};
}
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const rows=JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json','utf8')).byte_rows;
assert.equal(rows.length,32);
assert(rows.every(r=>r.length===8));
const bytes=rows.flat();
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
 '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual([55,56,57].map(i=>corpus.pages[i].indices.length),[76,85,95]);
const decoded=solvedP56(corpus.pages[56].indices);
assert.equal(decoded.map(i=>corpus.translit[i]).join(''),
 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
const known=decoded.concat(corpus.pages[57].indices);
assert.equal(known.length,180);
// Verified factorization: P=28 (X+5)^2 Q2 Q3 Q9 Q238.
const d16=[[1,5],[1,5],[1,18,11],[1,14,16,24],
 [1,12,20,10,5,1,9,0,15,11]].reduce(multiply,[1]);
assert.equal(d16.length,17);
const div=divideExact(bytes.map(v=>v%29),d16);
assert.equal(div[0],0);
const q238=div.slice(1).map(v=>mod(28*v));
assert.equal(q238.length,239);
assert.equal(q238[0],1);
assert.deepEqual(multiply(d16,[0,...q238.map(v=>mod(28*v))]),bytes.map(v=>v%29));
// Unknown original p55 occupies the 76-cell 32x8 perimeter. Neither its
// ciphertext nor a guessed plaintext contributes to the 180 equations.
const inner=[],outer=[];
for(let r=0;r<32;r++) for(let c=0;c<8;c++)
 (r>0&&r<31&&c>0&&c<7?inner:outer).push(8*r+c);
assert.deepEqual([inner.length,outer.length],[180,76]);
/** @param {number} position @returns {number[]} */
const row=position=>Array.from({length:18},(_,j)=>position>=j&&position-j<239?q238[position-j]:0);
const matrix=inner.map(row);
const actual=solve(matrix,known);
assert.equal(actual.rank,18);
assert.deepEqual([actual.matched,actual.failed,actual.firstFailure],[21,159,18]);
console.log('Original: 18 unknown coefficients fixed by 18 real known interior runes.');
console.log('Original: rank='+actual.rank+' matches='+actual.matched+'/180, withheld contradictions='+actual.failed+'/162, first failed interior index='+actual.firstFailure);
const a=Array.from({length:18},(_,i)=>mod(i*i+7*i+3));
const plant=multiply(q238,a);
assert.equal(plant.length,256);
const control=solve(matrix,inner.map(i=>plant[i]));
assert.equal(control.rank,18);
assert.equal(control.failed,0);
assert.deepEqual(control.coefficients,a);
assert.deepEqual(outer.map(i=>multiply(q238,control.coefficients)[i]),outer.map(i=>plant[i]));
console.log('Positive: all 180/180 known positions and 76/76 withheld original-shaped perimeter positions recovered.');
console.log('Decision: no secret polynomial A of degree <=17 over GF29 can make the actual solved terminal 180-rune interior a Q238 codeword.');
