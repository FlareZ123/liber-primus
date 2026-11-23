'use strict';

/**
 * 2014-physical original-cipher test: p49's first original table token 3N
 * decodes to 203 in conventional base60, matching the column count of the
 * floral 3248 black-runic register (16 pages x 203).
 *
 * Freeze one complete reversible candidate: regroup the 256 original
 * p49-51 table bytes into an invertible 16x16 GF29 matrix and inverse-Hill
 * each of 203 source columns. Record the direct/transpose inverse controls.
 * Source selection is a hypothesis, not an author-authenticated instruction.
 *
 * Node22 CommonJS, one read-only standalone file, exact original sources.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} name */
function read(name) {
  return JSON.parse(fs.readFileSync(path.join(root,name), 'utf8'));
}
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const grid = read('resources/liber-primus/lp2-grid-256.json');
const pageLengths = [231,273,272,274,273,270,270,274,271,66,0,92,263,179,232,76];

/** @param {number} n */
function mod(n) { return (n % 29 + 29) % 29; }
/** @param {number} n */
function invert(n) {
  assert.notEqual(mod(n),0);
  for (let j = 1; j < 29; j++) if (mod(n * j) === 1) return j;
  throw new Error('not invertible');
}

const black = [];
for (let p = 40; p <= 55; p++) {
  const page = corpus.pages.find(x => x.page === p);
  assert.ok(page);
  assert.equal(page.indices.length, pageLengths[p - 40]);
  const a = ink.pages.find(x => x.page === p);
  const mask = new Set((a ? a.red_spans : []).flatMap(s =>
    Array.from({length:s.length}, (_,j) => s.start+j)));
  page.indices.forEach((x,i) => {if (!mask.has(i)) black.push(x);});
}
assert.equal(black.length,3248);
assert.equal(grid.pages.length,3);
assert.equal(grid.pages[0].tokens[0],'3N');
assert.equal(grid.bytes.length,256);
assert.equal(grid.bytes[0],203);
assert.equal(grid.bytes[1],231);
assert.equal(pageLengths[0],231);
assert.equal(16 * grid.bytes[0],black.length);
assert.deepEqual(ink.pages.filter(p=>[40,53,54].includes(p.page))
  .map(p=>p.red_spans.reduce((s,x)=>s+x.length,0)),[8,51,9]);

const N=16;
const sourceMatrix = Array.from({length:N}, (_,i) =>
  grid.bytes.slice(i*N, i*N+N).map(mod));

/**
 * Complete Gauss-Jordan inverse GF29, with exact identity controls.
 * @param {number[][]} data
 * @returns {number[][]}
 */
function inverse(data) {
  const work = data.map((row,i) =>
    row.concat(Array.from({length:N},(_,j)=>Number(i===j))));
  for (let i=0;i<N;i++) {
    const pivot=work.findIndex((r,j)=>j>=i && r[i]!==0);
    assert.ok(pivot>=0,'matrix rank less than 16');
    [work[i],work[pivot]]=[work[pivot],work[i]];
    const factor=invert(work[i][i]);
    for(let j=0;j<2*N;j++)work[i][j]=mod(work[i][j]*factor);
    for(let k=0;k<N;k++)if(k!==i){
      const f=work[k][i];
      for(let j=0;j<2*N;j++)work[k][j]=mod(work[k][j]-f*work[i][j]);
    }
  }
  return work.map(row=>row.slice(N));
}
/** @param {number[][]} A */
function transpose(A) {return A[0].map((_,j)=>A.map(row=>row[j]));}
/** @param {number[][]} A @param {number[]} x */
function multiply(A,x) {
  assert.equal(x.length,N);
  return A.map(row=>mod(row.reduce((s,v,j)=>s+v*x[j],0)));
}
/** @param {number[]} src @param {number[][]} M */
function transform(src,M) {
  assert.equal(src.length,16*203);
  const output = Array(src.length);
  for(let j=0;j<203;j++){
    const v=Array.from({length:16},(_,i)=>src[i*203+j]);
    const y=multiply(M,v);
    for(let i=0;i<16;i++)output[i*203+j]=y[i];
  }
  return output;
}
/** @param {number[]} values */
function ioc(values) {
  const hist=Array(29).fill(0);
  values.forEach(x=>hist[x]++);
  return hist.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}

const M=sourceMatrix;
const Minv=inverse(M);
for(let i=0;i<N;i++){
  const unit=Array.from({length:N},(_,j)=>Number(i===j));
  assert.deepEqual(multiply(M,multiply(Minv,unit)),unit);
  assert.deepEqual(multiply(Minv,multiply(M,unit)),unit);
}
const models=[
  ['inverse',Minv,M],
  ['direct',M,Minv],
  ['inverse-transpose',transpose(Minv),transpose(M)],
  ['direct-transpose',transpose(M),transpose(Minv)],
];
const scores={};
for(const [name,decoder,encoder] of models) {
  const decoded=transform(black,decoder);
  assert.deepEqual(transform(decoded,encoder),black);
  scores[name]=ioc(decoded);
  assert.ok(scores[name]>.03 && scores[name]<.045);
}
assert.equal(ioc(black),0.03449186137715603);
assert.equal(scores.inverse,0.034427004237333136);
assert.equal(scores.direct,0.03456373522508841);
assert.equal(scores['inverse-transpose'],0.03445601927356969);
assert.equal(scores['direct-transpose'],0.03450305018197927);

// Independent genuinely solved LP2 source-native rune plant.
const native=corpus.pages.find(p=>p.page===57).indices;
assert.equal(native.length,95);
const plant=Array.from({length:3248},(_,i)=>native[(7*i+13)%95]);
const ciphertext=transform(plant,M);
assert.deepEqual(transform(ciphertext,Minv),plant);

console.log(JSON.stringify({
  sourceFirstToken:grid.pages[0].tokens[0],
  conventionalBase60FirstByte:grid.bytes[0],
  originalP40RuneCount:pageLengths[0],
  floralBlackRegister: {runes:black.length,rows:16,columns:203},
  sourcePanel:{bytes:256,rows:32,columns:8},
  matrixGF29Rank:16,
  originalBlackIoC:ioc(black),
  inverseScores:scores,
  exactOriginalForwardReplay:models.map(x=>x[0]),
  solvedNativePlantRecovered:plant.length,
  caveat:'Source-first number matches a retrospective dimension only under base60; no author-typed Hill command, and no original plaintext was recovered.',
},null,2));
