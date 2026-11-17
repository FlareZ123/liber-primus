'use strict';
/**
 * SFT: node sims/lp2_p29_p30_complementary_polynomial_hill4_sft.cjs
 *
 * Original-source test: adjacent p29 and p30 have complementary factors
 * of the signed Fibonacci p15 matrix characteristic polynomial.
 * A direct, source-derived Hill4 matrix consumer is tested on the original
 * table and independent intact ciphertext chapters. Writes no files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} p */
const read = p => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/base60-grid.json');
/** @param {number} x */
const mod = x => (x % 29 + 29) % 29;
/** @param {number[][]} a @param {number[][]} b */
const multiply = (a,b) => a.map(row => row.map((unused,j) =>
  mod(row.reduce((s,v,k) => s + v*b[k][j], 0))));
/** @param {number[][]} a @param {number[][]} b */
const add = (a,b) => a.map((row,i) => row.map((v,j) => mod(v+b[i][j])));
const identity = Array.from({length:4}, (_,i) =>
  Array.from({length:4}, (_,j) => Number(i===j)));
/** @param {number[]} coeffs */
function evalMatrix(coeffs) {
  const M = [[10,3,20,22],[1,22,21,25],[11,17,19,7],[8,12,12,22]];
  let out = identity.map(row => row.map(() => 0));
  for (const c of coeffs) {
    out = multiply(out, M);
    for (let i=0;i<4;i++) out[i][i] = mod(out[i][i] + c);
  }
  return out;
}
/** @param {number[][]} input */
function invert(input) {
  const a = input.map((row,i) => row.concat(identity[i]));
  let rank = 0;
  for (let j=0;j<4;j++) {
    const pivot = a.findIndex((row,i) => i>=rank && row[j]!==0);
    if (pivot<0) continue;
    [a[pivot],a[rank]] = [a[rank],a[pivot]];
    let unit = 1;
    while (mod(unit*a[rank][j])!==1) unit++;
    a[rank] = a[rank].map(x => mod(x*unit));
    for (let i=0;i<4;i++) if (i!==rank) {
      const factor = a[i][j];
      a[i] = a[i].map((v,k) => mod(v-factor*a[rank][k]));
    }
    rank++;
  }
  return {rank, inverse:rank===4 ? a.map(row => row.slice(4)) : null};
}
/** @param {number[]} seq @param {number} x */
function polynomialAt(seq,x) {
  let y=0, dy=0;
  for (const c of seq) {
    dy = mod(dy*x+y);
    y = mod(y*x+c);
  }
  return [y,dy];
}
/** @param {number[]} seq */
function coincidence(seq) {
  const hist = Array(29).fill(0);
  for (const x of seq) hist[x]++;
  return hist.reduce((s,n) => s+n*(n-1),0)/(seq.length*(seq.length-1));
}
/** @param {number[]} seq @param {number[][]} matrix */
function hill4(seq,matrix) {
  assert.equal(seq.length%4,0);
  const out=[];
  for(let offset=0;offset<seq.length;offset+=4) {
    const block = seq.slice(offset,offset+4);
    for(const row of matrix) out.push(mod(row.reduce((s,v,j)=>s+v*block[j],0)));
  }
  return out;
}
/** @param {string} name @param {number[]} seq @param {number[][]} K @param {number[][]} invK */
function reportReceiver(name,seq,K,invK) {
  for(const [direction,operator,opposite] of [
    ['matrix',K,invK], ['inverse',invK,K]]) {
    const output=hill4(seq,operator);
    assert.deepEqual(hill4(output,opposite),seq);
    console.log(JSON.stringify({receiver:name,direction,runes:seq.length,
      originalIoC:coincidence(seq),candidateIoC:coincidence(output),
      opening:output.slice(0,30).map(x=>corpus.translit[x]).join(' ')}));
  }
}
function main() {
  const unknown=corpus.pages.filter(p=>p.page<=55 && p.indices.length);
  assert.equal(unknown.length,55);
  assert.equal(unknown.reduce((s,p)=>s+p.indices.length,0),12956);
  const p29=corpus.pages[29].indices, p30=corpus.pages[30].indices;
  assert.deepEqual([p29.length,p30.length],[277,263]);
  assert.deepEqual(polynomialAt(p29,24),[0,0]);
  assert.deepEqual(polynomialAt(p30,8)[0],0);
  assert.deepEqual(polynomialAt(p30,17)[0],0);
  assert.deepEqual(p30.slice(-2),[12,12]);
  assert.deepEqual(unknown.filter(p=>p.indices.at(-1)===p.indices.at(-2))
    .map(p=>p.page),[30]);
  assert.deepEqual(unknown.filter(p=>polynomialAt(p.indices,24)
    .every(x=>x===0)).map(p=>p.page),[29]);
  assert.deepEqual(unknown.filter(p=>[8,17].every(x=>
    polynomialAt(p.indices,x)[0]===0)).map(p=>p.page),[30]);

  const A=evalMatrix(p29), B=evalMatrix(p30), K=add(A,B);
  const rankA=invert(A).rank, rankB=invert(B).rank;
  const {rank:rankK,inverse:invK}=invert(K);
  assert.deepEqual([rankA,rankB,rankK],[2,2,4]);
  assert.deepEqual(K,[[5,0,23,18],[18,16,3,25],
    [24,18,9,13],[3,15,2,28]]);
  assert.deepEqual(invK,[[25,13,26,11],[20,3,4,23],
    [28,18,25,3],[25,4,14,6]]);
  assert.deepEqual(multiply(K,invK),identity);
  assert.deepEqual(multiply(A,B),identity.map(row=>row.map(()=>0)));
  console.log(JSON.stringify({p29:{roots:[24,24],ending:p29.slice(-2)},
    p30:{roots:[8,17],ending:p30.slice(-2)},
    ranks:[rankA,rankB,rankK],A,B,K,invK}));

  const known=corpus.pages[57].indices.slice(0,92);
  assert.equal(known.length,92);
  assert.deepEqual(hill4(hill4(known,K),invK),known);
  console.log('POSITIVE: 92/92 authentic source-clear p57 runes roundtrip under Hill4');

  const table=grid.byte_rows.flat().map(mod);
  assert.equal(table.length,256);
  const tableColumn=Array.from({length:8},(_,col)=>
    Array.from({length:32},(_,row)=>table[8*row+col])).flat();
  const ch33to39=corpus.pages.slice(33,40).flatMap(p=>p.indices);
  const terminal=corpus.pages.slice(54,56).flatMap(p=>p.indices);
  for(const [name,seq] of [
    ['p50 table row-major',table],
    ['p50 table col-major',tableColumn],
    ['p33-p39 complete chapter',ch33to39],
    ['p54-p55 complete chapter',terminal]
  ]) reportReceiver(name,seq,K,invK);
}
main();
