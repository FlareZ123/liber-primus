'use strict';

/**
 * Issue #1255: original p54 three historical red-title cribs, held-out
 * fourth digraph under one reversible GF(29) affine Hill2 family.
 * Run from repository root: node sims/lp2_p54_three_crib_hill2_title_holdout_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const page54 = corpus.pages.find(p => p.page === 54);
const page55 = corpus.pages.find(p => p.page === 55);
const page57 = corpus.pages.find(p => p.page === 57);
assert(page54 && page55 && page57);
assert.equal(page54.indices.length, 232);
assert.equal(page55.indices.length, 76);
const source = page54.indices.slice(0, 9);
assert.deepEqual(source, [24, 19, 21, 23, 27, 2, 14, 10, 19]);

/** Native GP29 readings; IO is the period-original IA/IO alias. */
const cribs = {
  DIRECTION: [23,10,4,18,5,16,27,9],
  DECEPTION: [23,18,5,18,13,16,27,9],
  BEGINNING: [17,18,6,10,9,9,10,21]
};
const modes = ['direct', 'cbc-plaintext', 'cbc-ciphertext'];
/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
/** @param {number} n @returns {number} */
function inverse(n) {
  const v = mod(n);
  assert.notEqual(v, 0);
  for (let i = 1; i < 29; i++) if (mod(i * v) === 1) return i;
  throw new Error('unreachable inverse');
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
const plus = (a,b) => [mod(a[0]+b[0]),mod(a[1]+b[1])];
/** @param {number[]} a @param {number[]} b @returns {number[]} */
const minus = (a,b) => [mod(a[0]-b[0]),mod(a[1]-b[1])];
/** @param {number[]} xs @returns {number[][]} */
const pairs = xs => Array.from({length: xs.length/2},(_,i)=>xs.slice(2*i,2*i+2));
/**
 * Infer the UNIQUE affine GF29 map Y=M X + b using the first three
 * known digraphs, never the fourth held-out digraph.
 * @param {number[][]} xs @param {number[][]} ys
 * @returns {{matrix:number[][],offset:number[],inputDet:number,matrixDet:number}}
 */
function fit(xs,ys) {
  assert(xs.length>=3 && ys.length>=3);
  const d1=minus(xs[1],xs[0]),d2=minus(xs[2],xs[0]);
  const inputDet=mod(d1[0]*d2[1]-d1[1]*d2[0]);
  assert.notEqual(inputDet,0,'title sample must identify one map');
  const inv=inverse(inputDet),matrix=[],offset=[];
  for(let j=0;j<2;j++){
    const dy1=mod(ys[1][j]-ys[0][j]),dy2=mod(ys[2][j]-ys[0][j]);
    const a=mod(inv*(dy1*d2[1]-dy2*d1[1]));
    const b=mod(inv*(d1[0]*dy2-d2[0]*dy1));
    matrix.push([a,b]);
    offset.push(mod(ys[0][j]-a*xs[0][0]-b*xs[0][1]));
  }
  const matrixDet=mod(matrix[0][0]*matrix[1][1]-matrix[0][1]*matrix[1][0]);
  assert.notEqual(matrixDet,0,'the fitted Hill map must be reversible');
  return {matrix,offset,inputDet,matrixDet};
}
/** @param {{matrix:number[][],offset:number[]}} key @param {number[]} x @returns {number[]} */
function forward(key,x) {
  return key.matrix.map((row,j)=>mod(row[0]*x[0]+row[1]*x[1]+key.offset[j]));
}
/** @param {{matrix:number[][],offset:number[],matrixDet:number}} key @param {number[]} y @returns {number[]} */
function backward(key,y) {
  const u=minus(y,key.offset),m=key.matrix,detinv=inverse(key.matrixDet);
  return [
    mod(detinv*(m[1][1]*u[0]-m[0][1]*u[1])),
    mod(detinv*(m[0][0]*u[1]-m[1][0]*u[0]))
  ];
}
/** @param {string} mode @param {number[][]} p @param {number[][]} c */
function registers(mode,p,c) {
  if(mode==='direct') return {xs:p,ys:c};
  const iv=[24,24]; // Red illustrated A, declared IV hypothesis
  if(mode==='cbc-plaintext') return {
    xs:p.map((x,i)=>plus(x,i===0?iv:c[i-1])),ys:c
  };
  return {xs:p,ys:c.map((x,i)=>minus(x,i===0?iv:c[i-1]))};
}
/** @param {string} mode @param {{matrix:number[][],offset:number[],matrixDet:number}} k @param {number[]} p @param {number[]} prev */
function encode(mode,k,p,prev) {
  return mode==='direct'?forward(k,p):
    mode==='cbc-plaintext'?forward(k,plus(p,prev)):plus(forward(k,p),prev);
}
/** @param {string} mode @param {{matrix:number[][],offset:number[],matrixDet:number}} k @param {number[]} c @param {number[]} prev */
function decode(mode,k,c,prev) {
  return mode==='direct'?backward(k,c):
    mode==='cbc-plaintext'?minus(backward(k,c),prev):backward(k,minus(c,prev));
}
const results=[];
for(const [name,p] of Object.entries(cribs)){
  const plaintext=pairs(p),ciphertext=pairs(source.slice(1,9));
  for(const mode of modes){
    const {xs,ys}=registers(mode,plaintext,ciphertext);
    const key=fit(xs.slice(0,3),ys.slice(0,3));
    for(let i=0;i<3;i++) assert.deepEqual(encode(mode,key,plaintext[i],i===0?[24,24]:ciphertext[i-1]),ciphertext[i]);
    const predicted=encode(mode,key,plaintext[3],ciphertext[2]);
    assert.notDeepEqual(predicted,ciphertext[3],'the unknown title must remain blind');
    // Native GP-positive: independently planted reversible 232-symbol message.
    const plant=Array.from({length:232},(_,i)=>page57.indices[i%page57.indices.length]);
    const blocks=pairs(plant),got=[];
    let prev=[24,24];
    for(const block of blocks){
      const c=encode(mode,key,block,prev);
      got.push(...decode(mode,key,c,prev));
      prev=c;
    }
    assert.deepEqual(got,plant);
    results.push({crib:name,mode,inputDet:key.inputDet,
      matrix:key.matrix,offset:key.offset,matrixDet:key.matrixDet,
      predictedFourth:predicted,originalFourth:ciphertext[3],
      firstSixFit:true,withheldTwoFit:false,sourceNativePlant:232});
  }
}
assert.equal(results.length,9);
console.log(JSON.stringify({status:'PASS: all nine frozen original-title Hill2 inverse branches fail the independent fourth digraph; no unknown plaintext recovered',originalPage:54,firstRunicInitial:24,originalSecondWord:source.slice(1),results},null,2));
