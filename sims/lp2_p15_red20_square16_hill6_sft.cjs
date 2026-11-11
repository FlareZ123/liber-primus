"use strict";
/**
 * SFT: A source-constrained 6x6 Hill key assembled from p15's two red
 * inscriptions (9+11 GP runes) and its printed 4x4 integer square (16 cells).
 *
 * The 20 heading runes occupy the outer 6x6 ring. The printed 4x4 square
 * remains unrotated in the center. Original ciphertext after the third red
 * 13-dot punctuation contains 139 black runes, so transport the first I as
 * an initial symbol and decode the remaining 23 x 6 = 138 runes.
 *
 * Test clockwise and printed row-major border fills, with both direct
 * and inverse matrices, row/column action, exact forward reencryption.
 * No secret key, fitted phase or language model. Node 22 CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const indices = corpus.pages.find(p => p.page === 15).indices;
const annotations = ink.pages.find(p => p.page === 15);
assert.deepEqual(annotations.red_spans.map(x => [x.start,x.length]), [[0,9],[9,11]]);
assert.deepEqual(annotations.large_punctuation, [[0,13,"red"],[9,13,"red"],[20,13,"red"]]);
assert.equal(indices.length, 159);
const red = indices.slice(0,20);
const black = indices.slice(20);
assert.equal(black.length,139);
assert.equal(corpus.translit[black[0]],"I");
const iv = black[0];
const ciphertext = black.slice(1);
assert.equal(ciphertext.length,138);
assert.equal(ciphertext.length/6,23);
const printed = [
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
];
const mod = x => ((x % 29) + 29) % 29;
/** @param {"clockwise"|"row-major"} layout @returns {number[][]} */
function construct(layout) {
  const M = Array.from({length:6},()=>Array(6).fill(-1));
  for(let r=0;r<4;r++) for(let c=0;c<4;c++) M[r+1][c+1]=mod(printed[r][c]);
  const perimeter = [];
  if(layout === "clockwise"){
    for(let c=0;c<6;c++) perimeter.push([0,c]);
    for(let r=1;r<6;r++) perimeter.push([r,5]);
    for(let c=4;c>=0;c--) perimeter.push([5,c]);
    for(let r=4;r>=1;r--) perimeter.push([r,0]);
  } else {
    for(let r=0;r<6;r++) for(let c=0;c<6;c++)
      if(r===0||r===5||c===0||c===5) perimeter.push([r,c]);
  }
  assert.equal(perimeter.length,20);
  perimeter.forEach(([r,c],i)=>M[r][c]=red[i]);
  assert.ok(M.every(row=>row.every(x=>x>=0&&x<29)));
  return M;
}
/** @param {number[][]} M @returns {{det:number,inverse:number[][]}} */
function invert(M) {
  const A=M.map((row,i)=>[...row,...Array.from({length:6},(_,j)=>Number(i===j))]);
  let det=1;
  for(let k=0;k<6;k++){
    const pivotRow=A.findIndex((row,i)=>i>=k&&row[k]!==0);
    assert.notEqual(pivotRow,-1,"original composite matrix is singular");
    if(pivotRow!==k){[A[k],A[pivotRow]]=[A[pivotRow],A[k]];det=mod(-det);}
    const pivot=A[k][k]; det=mod(det*pivot);
    let pInv=1; while(mod(pInv*pivot)!==1)pInv++;
    for(let j=0;j<12;j++) A[k][j]=mod(A[k][j]*pInv);
    for(let i=0;i<6;i++)if(i!==k){
      const factor=A[i][k];
      for(let j=0;j<12;j++)A[i][j]=mod(A[i][j]-factor*A[k][j]);
    }
  }
  return {det,inverse:A.map(row=>row.slice(6))};
}
/**
 * @param {number[]} source
 * @param {number[][]} M
 * @param {boolean} asRow
 * @returns {number[]}
 */
function apply(source,M,asRow) {
  assert.equal(source.length%6,0);
  const out=[];
  for(let at=0;at<source.length;at+=6)for(let i=0;i<6;i++) {
    let total=0;
    for(let j=0;j<6;j++)total+=source[at+j]*(asRow?M[j][i]:M[i][j]);
    out.push(mod(total));
  }
  return out;
}
/** @param {number[]} source */
function ioc(source) {
  const bins=Array(29).fill(0);
  for(const x of source)bins[x]++;
  return bins.reduce((s,v)=>s+v*(v-1),0)/(source.length*(source.length-1));
}
const expected = {
  clockwise:[0.034803766000211574,0.034803766000211574,
    0.0340632603406326,0.03364011424944462],
  "row-major":[0.032476462498677666,0.0340632603406326,
    0.032053316407489686,0.0342748333862266]
};
const known57=corpus.pages.find(p=>p.page===57).indices;
const known=[...known57,...known57.slice(0,43)];
assert.equal(known.length,138);
const results = [];
for(const layout of ["clockwise","row-major"]) {
  const M=construct(layout),{det,inverse}=invert(M);
  assert.equal(det,24);
  const outputs=[];
  for(const [name,mat,other] of [["M",M,inverse],["M-inverse",inverse,M]]) {
    for(const asRow of [false,true]) {
      const P=apply(ciphertext,mat,asRow);
      assert.deepEqual(apply(P,other,asRow),ciphertext);
      const sample=apply(known,other,asRow);
      assert.deepEqual(apply(sample,mat,asRow),known);
      assert.ok(Math.abs(ioc(P)-expected[layout][outputs.length])<1e-14);
      outputs.push({
        inverse:name,vector:asRow?"row":"column",
        decodedIoc:ioc(P),
        first70GP: P.slice(0,70).map(x=>corpus.translit[x]).join("")
      });
    }
  }
  results.push({layout,matrix:M,determinant:det,inverse,outputs});
}
console.log(JSON.stringify({
  status:"source-composite 6x6 p15 original-cipher negative; no decrypted plaintext or authentic key",
  original:"p15 red9 + red11 + printed16 = 36; black139 = 1 I + 23x6",
  preservedFirstBlackIV:iv,
  originalCiphertextIoC:ioc(ciphertext),
  samplePositive:"138 known GP runes from authentic p57 repeated prefix, 8 exact planted recoveries",
  results
},null,2));
