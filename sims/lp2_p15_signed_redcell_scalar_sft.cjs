"use strict";
/**
 * P15 signed-Fibonacci-prime 4x4 matrix, read solely at its red 3299 cell.
 * Exact original p15-after-grid GP29 decoder and authentic p57 planted control.
 * Node.js 22 CommonJS, read-only, no dependencies beyond built-ins.
 *
 * This is a falsification of one source-visible scalar consumer, NOT a
 * proposed authentic plaintext or evidence of an author-specified exponent.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const gp = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const mod = n => ((n % 29) + 29) % 29;
const magnitudes = [
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
];
const signed = magnitudes.map(row => row.slice());
signed[3][0] *= -1;
signed[3][1] *= -1;
const M = signed.map(row => row.map(mod));
assert.deepEqual(M, [
  [10,3,20,22], [1,22,21,25], [11,17,19,7], [8,12,12,22]
]);
assert.equal(magnitudes[1][1],3299);
assert.equal(M[1][1],22);
assert.deepEqual(gp.pages[39].indices.slice(119,122),[27,5,15]);

/** @returns {number[][]} Four-dimensional identity over GF(29). */
function identity() {
  return Array.from({length:4},(_,i) =>
    Array.from({length:4},(_,j) => +(i===j)));
}
/** @param {number[][]} A @param {number[][]} B @returns {number[][]} */
function mm(A,B) {
  return A.map(row => Array.from({length:4},(_,j) =>
    mod(row.reduce((s,v,k) => s+v*B[k][j],0))));
}
/**
 * Fixed initial exponent 0; only the original visually red 3299-cell
 * (row1,col1, zero-based) is read, one power per original rune.
 * No secret IV, alternate coordinate, phase, skipped symbol or fitted key.
 * @param {number} n @returns {number[]}
 */
function keyStream(n) {
  let state = identity();
  const out = [];
  for(let i=0;i<n;i++) {
    out.push(state[1][1]);
    state = mm(M,state);
  }
  return out;
}
/** @param {number[]} x @returns {number} */
function ioc(x) {
  const f = Array(29).fill(0);
  for(const v of x) { assert(v>=0&&v<29); f[v]++; }
  return f.reduce((s,v)=>s+v*(v-1),0)/(x.length*(x.length-1));
}
/** @param {number[]} x @param {number[]} k @param {number} sign */
function shift(x,k,sign) {
  assert.equal(x.length,k.length);
  return x.map((v,i)=>mod(v+sign*k[i]));
}
function main() {
  const source = gp.pages.slice(15,23).flatMap(p=>p.indices).slice(9);
  assert.equal(source.length,1894);
  assert.equal(gp.pages[15].indices.length,159);
  const all = keyStream(812);
  // The full signed matrix has order 812, but the SINGLE printed red
  // coordinate annihilates its nontrivial 29-component and repeats in 28.
  let mat = identity();
  for(let t=0;t<812;t++) mat=mm(M,mat);
  assert.deepEqual(mat,identity());
  for(let t=0;t<812;t++) assert.equal(all[t],all[t%28]);
  // Exact three-eigenvalue formula; the t*24^t Jordan term vanishes
  // at the one coordinate visibly selected by the red p15 cell.
  const closed = t => mod(
    17*Number((8n**BigInt(t))%29n) +
     7*Number((17n**BigInt(t))%29n) +
     6*Number((24n**BigInt(t))%29n)
  );
  for(let t=0;t<812;t++) assert.equal(all[t],closed(t));
  for(const d of [1,2,4,7,14]) assert(
    Array.from({length:28},(_,t)=>all[t]===all[t%d]).some(x=>!x),
    "A lower order would contradict source-red-cell period28");
  const key = keyStream(source.length);
  const decoded=shift(source,key,-1);
  assert.deepEqual(shift(decoded,key,+1),source);
  const solved = gp.pages[57].indices;
  assert.equal(solved.length,95);
  const solvedKey=keyStream(solved.length);
  const plant=shift(solved,solvedKey,+1);
  assert.deepEqual(shift(plant,solvedKey,-1),solved);
  const report = {
    matrix:M, redCell:[1,1], signedRestoredCells:[12,13],
    selectedInterval:"p15 offset9 through p22, physical printed order",
    sourceRunes:source.length, fullMatrixOrder:812,
    redCellScalarPeriod:28, redCellClosedForm:"17*8^t + 7*17^t + 6*24^t mod29", redCellCycle:all.slice(0,28),
    redCellDistinctCycleSymbols:new Set(all.slice(0,28)).size,
    originalIoC:ioc(source), decodedIoC:ioc(decoded),
    first24DecodedSymbols:decoded.slice(0,24).map(v=>gp.translit[v]),
    exactOriginalReencryption:true,
    authenticP57NativePositiveSymbols:solved.length,
    authenticP57PlainIoC:ioc(solved),
    authenticP57PlantRecovered:true
  };
  assert(Math.abs(report.originalIoC-0.034494896163322776)<1e-12);
  assert(Math.abs(report.decodedIoC-0.03441791605933269)<1e-12);
  assert.equal(report.redCellDistinctCycleSymbols,18);
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module) main();
module.exports={main,keyStream,shift,ioc};
