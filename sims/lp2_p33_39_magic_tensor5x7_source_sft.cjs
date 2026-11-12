'use strict';
/**
 * Stage10 original 5x5 / 7x7 source-matrix tensor inversion on
 * LP2 physical p33–39, exactly 1680 GP29 runes in 48 blocks of 35.
 * Source-frozen register: 5 printed consecutive rows of 7 symbols each.
 * C=A*P*B^T, P=A^-1*C*(B^-1)^T mod29.
 * Run: node sims/lp2_p33_39_magic_tensor5x7_source_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const source=fs.readFileSync(path.join(root,
  'resources/cicada2014-openpuff-magic-squares.txt'),'utf8');
const squares=source.trim().split(/\r?\n\s*\r?\n/).filter(Boolean)
  .map(block=>block.trim().split(/\r?\n/)
  .map(line=>line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(a=>a.length),[5,7,5]);
for(const a of squares)assert(a.every(row=>row.length===a.length));
/** @param {number} a @returns {number} */
const mod=a=>(a%29+29)%29;
/** @param {number} x @param {number} k @returns {number} */
function pow(x,k){let v=1;for(;k>0;k>>=1){if(k&1)v=mod(v*x);x=mod(x*x);}return v;}
/**
 * @param {number[][]} m
 * @returns {{matrix:number[][], determinant:number}}
 */
function inverse(m){
 const n=m.length,a=m.map((row,i)=>[...row.map(mod),
   ...Array.from({length:n},(_,j)=>+(i===j))]);
 let det=1;
 for(let k=0;k<n;k++){
  let p=k;while(p<n&&a[p][k]===0)p++;
  assert.ok(p<n,'source matrix must be full rank');
  if(p!==k){[a[p],a[k]]=[a[k],a[p]];det=mod(-det);}
  const x=a[k][k];det=mod(det*x);const inv=pow(x,27);
  for(let j=0;j<2*n;j++)a[k][j]=mod(a[k][j]*inv);
  for(let i=0;i<n;i++)if(i!==k){
   const factor=a[i][k];
   for(let j=0;j<2*n;j++)a[i][j]=mod(a[i][j]-factor*a[k][j]);
  }
 }
 return {matrix:a.map(row=>row.slice(n)),determinant:det};
}
/**
 * Computes A(5x5) * X(5x7) * transpose(B(7x7)) modulo29.
 * @param {number[][]} a @param {number[][]} x @param {number[][]} b
 * @returns {number[][]}
 */
function sandwich(a,x,b){
 const y=Array.from({length:5},()=>Array(7).fill(0));
 for(let i=0;i<5;i++)for(let j=0;j<7;j++){
  let total=0;
  for(let k=0;k<5;k++)for(let h=0;h<7;h++)
   total+=a[i][k]*x[k][h]*b[j][h];
  y[i][j]=mod(total);
 }
 return y;
}
/**
 * @param {number[]} stream @param {number[][]} a @param {number[][]} b
 * @returns {number[]}
 */
function transform(stream,a,b){
 assert.equal(stream.length%35,0);
 const out=[];
 for(let i=0;i<stream.length;i+=35){
  const x=Array.from({length:5},(_,r)=>stream.slice(i+r*7,i+(r+1)*7));
  out.push(...sandwich(a,x,b).flat());
 }
 return out;
}
/** @param {number[]} a @returns {number} */
function ioc(a){
 const f=Array(29).fill(0);for(const k of a)f[k]++;
 return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const pages=corpus.pages.filter(p=>p.page>=33&&p.page<=39);
assert.deepEqual(pages.map(p=>p.indices.length),[214,261,271,238,228,228,240]);
const original=pages.flatMap(p=>p.indices);
assert.equal(original.length,1680);
assert.deepEqual(original.slice(0,35),corpus.pages[33].indices.slice(0,35));
const solved57=corpus.pages[57].indices;
assert.equal(solved57.length,95);
const plant=solved57.slice(0,70);
const B=squares[1],Bi=inverse(B);
assert.equal(Bi.determinant,2);
const cases=[];
for(const k of [0,2]){
 const A=squares[k],Ai=inverse(A);
 assert.equal(Ai.determinant,k===0?10:3);
 const decoded=transform(original,Ai.matrix,Bi.matrix);
 assert.deepEqual(transform(decoded,A,B),original);
 const encrypted=transform(plant,A,B);
 assert.deepEqual(transform(encrypted,Ai.matrix,Bi.matrix),plant);
 const wrong=inverse(squares[k===0?2:0]);
 const wrongDecoded=transform(encrypted,wrong.matrix,Bi.matrix);
 const wrongMatches=wrongDecoded.filter((v,i)=>v===plant[i]).length;
 assert.ok(wrongMatches<plant.length/2);
 cases.push({
  rowSquare:k===0?'5x5/3301':'5x5/1033',
  columnSquare:'7x7/1033',
  determinants:[Ai.determinant,Bi.determinant],
  originalSymbols:1680,blocks35:48,
  originalIoC:ioc(original),decodedIoC:ioc(decoded),
  first90Decoded:decoded.slice(0,90).map(x=>corpus.translit[x]).join(' '),
  plantExact:'70/70',originalReencrypted:'1680/1680',
  wrongSquarePlantMatched:wrongMatches
 });
}
assert(cases.every(c=>c.decodedIoC<0.045));
console.log(JSON.stringify({
 source:'2014 Stage10 exact magic squares and p33–39 original GP29 corpus',
 packing:'printed 5x7 blocks, 48 blocks, no offsets, no secret parameters',
 cases,
 decision:'neither literal separable 5x7 inverse recovers GP29-readable prose or source-selected key',
 caveat:'No original LP2 source explicitly requires a GF29 Hill/tensor operation'
},null,2));
