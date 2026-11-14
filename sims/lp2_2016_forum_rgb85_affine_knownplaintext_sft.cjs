"use strict";

/**
 * Source-dated 2016 17x5 RGB interpretation of LP2's 256 table bytes.
 *
 * A Jan 19 2016 forum post read first 255 bytes as 85 RGB pixels (17x5).
 * Exactly 85 GP29 runes are in the actual p56 solved and printed text.
 * Exhaust every stationary GF29 affine RGB->rune map, using four original
 * control positions to solve its four unknown coefficients, and verify the
 * remaining 81 independently rather than maximizing English word hits.
 *
 * Also check the original independent p54 red-nine + p55 cipher (9+76=85).
 * The single leftover byte may be first or last, testing two boundaries.
 *
 * Run read-only: Node.js 22, CommonJS, no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "base60-grid.json"), "utf8"));
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
const original = grid.byte_rows.flat();
assert.equal(original.length, 256);
assert.ok(original.every(v => Number.isInteger(v) && v >= 0 && v < 256));

/** @param {number} n @returns {number} */
function mod(n) { return (n % 29 + 29) % 29; }

/**
 * @param {number[]} input RGB table bytes, length 256
 * @param {number} start Skip first (1) or last (0) unused byte
 * @returns {number[][]} 85 rows [1,R,G,B] modulo 29
 */
function rgb85(input, start) {
  assert.equal(input.length, 256);
  assert.ok(start === 0 || start === 1);
  return Array.from({length: 85}, (_, i) =>
    [1,mod(input[start+3*i]),mod(input[start+3*i+1]),mod(input[start+3*i+2])]);
}

/**
 * @param {number[][]} rows source feature vectors
 * @returns {number} GF29 rank
 */
function rank(rows) {
  const matrix=rows.map(row=>row.slice().map(mod));
  if (!matrix.length) return 0;
  let k=0;
  for(let col=0;col<matrix[0].length && k<matrix.length;col++) {
    let pivot=k;
    while(pivot<matrix.length && matrix[pivot][col]===0) pivot++;
    if(pivot===matrix.length) continue;
    [matrix[k],matrix[pivot]]=[matrix[pivot],matrix[k]];
    let inv=1;
    while(inv*matrix[k][col]%29!==1)inv++;
    matrix[k]=matrix[k].map(x=>mod(x*inv));
    for(let i=k+1;i<matrix.length;i++) {
      const factor=matrix[i][col];
      matrix[i]=matrix[i].map((x,j)=>mod(x-factor*matrix[k][j]));
    }
    k++;
  }
  return k;
}

/**
 * @param {number[][]} features 85 x 4
 * @param {number[]} target 85 GP29 rune indices
 * @returns {{training:number[],coefficients:number[],matches:number,holdout:number,errors:number,predicted:number[]}}
 */
function solveRGB(features,target) {
  assert.equal(features.length,85);
  assert.equal(target.length,85);
  assert.ok(target.every(v=>Number.isInteger(v)&&v>=0&&v<29));
  const training=[];
  for(let i=0;i<85 && training.length<4;i++) {
    if(rank(training.concat(i).map(j=>features[j]))>training.length)training.push(i);
  }
  assert.equal(training.length,4);
  const mat=training.map(i=>features[i].concat(target[i]));
  for(let col=0;col<4;col++) {
    let pivot=col;
    while(pivot<4 && mat[pivot][col]===0)pivot++;
    assert.ok(pivot<4);
    [mat[col],mat[pivot]]=[mat[pivot],mat[col]];
    let inverse=1;
    while(inverse*mat[col][col]%29!==1)inverse++;
    mat[col]=mat[col].map(x=>mod(x*inverse));
    for(let j=0;j<4;j++)if(j!==col) {
      const factor=mat[j][col];
      mat[j]=mat[j].map((x,k)=>mod(x-factor*mat[col][k]));
    }
  }
  const coefficients=mat.map(row=>row[4]);
  const predicted=features.map(row=>mod(row.reduce((s,x,i)=>s+x*coefficients[i],0)));
  const matches=predicted.filter((v,i)=>v===target[i]).length;
  return {training,coefficients,matches,holdout:matches-4,errors:85-matches,predicted};
}

/** @returns {number[]} first 85 original p56 plaintext symbols */
function solved56() {
  const src=corpus.pages[56].indices;
  assert.equal(src.length,85);
  assert.equal(src[56],0);
  const primes=[];
  for(let n=2;primes.length<85;n++) {
    let isPrime=true;
    for(let j=2;j*j<=n;j++)if(n%j===0){isPrime=false;break;}
    if(isPrime)primes.push(n);
  }
  let clock=0;
  const ans=src.map((v,i)=>i===56?v:mod(v-primes[clock++]+1));
  assert.ok(ans.map(i=>corpus.translit[i]).join("").startsWith("ANENDWITHINTHEDEEPWEB"));
  return ans;
}
const targets=[
  {name:"p56-solved-plaintext",text:solved56(),expected:[[18,17,15,26,5],[17,15,27,20,9]]},
  {name:"p56-original-ciphertext",text:corpus.pages[56].indices,
    expected:[[8,8,2,18,4],[28,2,27,6,5]]},
  {name:"p54-red9-p55-original-ciphertext",
    text:corpus.pages[54].indices.slice(0,9).concat(corpus.pages[55].indices),
    expected:[[11,4,19,12,8],[21,19,2,3,5]]}
];
assert.equal(corpus.pages[55].indices.length,76);
for(const sample of targets)for(const start of [0,1]) {
  const ans=solveRGB(rgb85(original,start),sample.text);
  const [a,b,c,d,matches]=sample.expected[start];
  assert.deepEqual(ans.training,[0,1,2,3]);
  assert.deepEqual(ans.coefficients,[a,b,c,d]);
  assert.equal(ans.matches,matches);
  assert.ok(ans.errors>70);
  console.log(JSON.stringify({target:sample.name,skip:start===0?"trailing-byte":"leading-byte",
    fit:ans.coefficients,training:ans.training,
    matching:ans.matches,heldout:ans.holdout,wrong:ans.errors}));
}

/* Native-language positive: construct an independent 256-byte RGB board
 * where every pixel is made to emit one genuine solved p56 plaintext rune
 * through the single map P = 2+R+3G+4B modulo 29. */
const plaintext=solved56();
const planted=new Array(256).fill(0);
for(let i=0;i<85;i++) {
  const green=(7*i+5)%29;
  const blue=(11*i*i+3)%29;
  const red=mod(plaintext[i]-2-3*green-4*blue);
  planted[3*i]=red;
  planted[3*i+1]=green;
  planted[3*i+2]=blue;
}
planted[255]=137; // legitimate unconsumed byte
const positive=solveRGB(rgb85(planted,0),plaintext);
assert.deepEqual(positive.coefficients,[2,1,3,4]);
assert.equal(positive.matches,85);
assert.equal(positive.holdout,81);
assert.equal(positive.errors,0);
console.log("native-p56-plaintext-positive: 85/85 exact, 81/81 heldout, 0 errors");
