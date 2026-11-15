'use strict';

/**
 * Original p0..2 729 GP29 runes as 27x27 Hill source key for unseen p3+.
 * Source suggests exactly 27^2 runes and modulus29. Neither the manuscript
 * nor historical sources authenticate a Hill27 instruction; this is one
 * fixed, entirely reversible, unfitted candidate decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const first = data.pages.slice(0, 3).flatMap(p => p.indices);
assert.equal(first.length, 27 * 27);
const mod = a => ((a % 29) + 29) % 29;

/** @param {number[][]} matrix @returns {number[][]} */
function invert(matrix) {
  const size = matrix.length;
  const aug = matrix.map((row, i) => row.map(mod).concat(
    Array.from({length:size}, (_, j) => +(i === j))));
  for (let col=0;col<size;col++) {
    let pivot=col;
    while(pivot<size && aug[pivot][col]===0) pivot++;
    assert.ok(pivot<size, 'Source matrix not invertible');
    [aug[pivot],aug[col]]=[aug[col],aug[pivot]];
    let inverse=1;
    while(mod(aug[col][col]*inverse)!==1) inverse++;
    for(let j=col;j<size*2;j++)aug[col][j]=mod(aug[col][j]*inverse);
    for(let i=0;i<size;i++){
      if(i===col)continue;
      const factor=aug[i][col];
      for(let j=col;j<size*2;j++)aug[i][j]=mod(aug[i][j]-factor*aug[col][j]);
    }
  }
  return aug.map(row=>row.slice(size));
}
/** @param {number[][]} matrix @returns {number[][]} */
function transpose(matrix){return matrix[0].map((_,i)=>matrix.map(row=>row[i]));}
/** @param {number[][]} matrix @param {number[]} vector @returns {number[]} */
function multiply(matrix,vector) {
  assert.equal(vector.length,27);
  return matrix.map(row=>mod(row.reduce((sum,x,i)=>sum+x*vector[i],0)));
}
/** @param {number[]} symbols @param {number[][]} matrix @returns {number[]} */
function transform(symbols,matrix) {
  const out=[];
  for(let i=0;i+27<=symbols.length;i+=27)out.push(...multiply(matrix,symbols.slice(i,i+27)));
  return out;
}
/** @param {number[]} symbols @returns {number} */
function coincidence(symbols) {
  const freq=Array(29).fill(0);
  for (const symbol of symbols) freq[symbol]++;
  return freq.reduce((sum,n)=>sum+n*(n-1),0)/(symbols.length*(symbols.length-1));
}
/** @param {number[]} symbols @returns {string} */
function spell(symbols){return symbols.map(x=>data.translit[x]).join('');}

const M=Array.from({length:27},(_,row)=>first.slice(row*27,(row+1)*27));
const I=invert(M);
for(let i=0;i<27;i++){
  const unit=Array.from({length:27},(_,j)=>+(j===i));
  assert.deepEqual(multiply(I,multiply(M,unit)),unit);
  assert.deepEqual(multiply(M,multiply(I,unit)),unit);
}
const realClear=data.pages[57].indices;
const control=realClear.slice(0,81);
assert.deepEqual(transform(transform(control,M),I),control);
assert.deepEqual(transform(transform(control,transpose(M)),transpose(I)),control);

const sourceSegments=[
  {name:'original p3..7, visual chapter 2',runes:data.pages.slice(3,8).flatMap(p=>p.indices)},
  {name:'original p8..14, visual chapter 3',runes:data.pages.slice(8,15).flatMap(p=>p.indices)}
];
const variants=[
 {name:'Hill27 original M decryption inverse',matrix:I},
 {name:'Hill27 transposed M decryption inverse',matrix:transpose(I)},
 {name:'Hill27 original M direction forward',matrix:M},
 {name:'Hill27 transposed M direction forward',matrix:transpose(M)}
];
const results=sourceSegments.map(segment=>({
 name:segment.name,runes:segment.runes.length,cipher_ioc29:coincidence(segment.runes),
 decodings:variants.map(v=>{
   const out=transform(segment.runes,v.matrix);
   return {operation:v.name,full_blocks:out.length/27,leftover:segment.runes.length-out.length,
     ioc29:coincidence(out),first_135_runes:spell(out.slice(0,135))};
 })
}));
console.log(JSON.stringify({
 premise:'first 729 original GP29 runes as a 27x27 invertible Hill key',
 rank_over_GF29:27,
 control:{source:'original p57 clear runes',known_full_blocks:3,
    real_clear_ioc29:coincidence(realClear),plant_recovered:81},
 tests:results,
 limit:'Original p0 27x27 dimensions select a possible algebraic operand but do not authenticate a Hill operation; original coherent plaintext required'
},null,2));
