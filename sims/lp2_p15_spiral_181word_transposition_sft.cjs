"use strict";

// Run from the repository root with Node 22:
// node sims/lp2_p15_spiral_181word_transposition_sft.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

/** @param {number[]} values @returns {number} */
function chiSquared(values) {
  const cells = Array.from({length:3}, () => [0,0,0]);
  const rows=[0,0,0], cols=[0,0,0];
  /** @param {number} value @returns {number} */
  const bin = value => value <= 2 ? 0 : value <= 5 ? 1 : 2;
  for (let i=1; i<values.length; i++) {
    const a=bin(values[i-1]), b=bin(values[i]);
    cells[a][b]++; rows[a]++; cols[b]++;
  }
  let statistic=0;
  for (let a=0; a<3; a++) for (let b=0; b<3; b++) {
    const expected=rows[a]*cols[b]/(values.length-1);
    statistic+=(cells[a][b]-expected)**2/expected;
  }
  return statistic;
}

/**
 * Two mutually inverse arrangements of an exact 181-row by 16-column word
 * rectangle. No symbols, keys or word boundaries are fitted to plaintext.
 * @param {number[]} values @param {number[]} order
 * @param {"rowToColumn"|"columnToRow"} mode @returns {number[]}
 */
function transpose(values,order,mode) {
  assert.equal(values.length,2896);
  const out=new Array(values.length);
  for (let row=0; row<181; row++) for (let j=0; j<16; j++) {
    const a=row*16+j, b=order[j]*181+row;
    if (mode==="rowToColumn") out[b]=values[a];
    else out[a]=values[b];
  }
  return out;
}

/** @param {number[]} v @param {number[]} order @returns {number[]} */
function local(v,order) {
  assert.equal(v.length%16,0);
  const out=[];
  for (let i=0; i<v.length; i+=16) for (const j of order) out.push(v[i+j]);
  return out;
}

const original=parseSharedCorpus();
const lengths=original.words.map(word=>word.length);
assert.equal(lengths.length,2896);
assert.equal(original.runeCount,12956);
assert.equal(original.crossPageWords,32);
assert.equal(lengths.reduce((sum,n)=>sum+n,0),12956);
assert.equal(lengths.length,181*16);

// Physical p15 original scan 32.jpg, source-red first entry 3299.
const grid=[
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820],
];
const printed=grid.flat();
const spiral=[3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516].map(v=>printed.indexOf(v));
assert.equal(new Set(printed).size,16);
assert.deepEqual(spiral,[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]);
const inverse=new Array(16);
spiral.forEach((v,i)=>{inverse[v]=i;});
const identity=Array.from({length:16},(_,i)=>i);
assert.deepEqual(local(local(identity,spiral),inverse),identity);

// Archived 2014 seventh-onion magic square: 181 occurs at two corners.
// The historical artifacts do not specify the present word transposition.
const blocks=fs.readFileSync("resources/cicada2014-openpuff-magic-squares.txt","utf8")
  .trim().split(/\r?\n\s*\r?\n+/);
const square=blocks[1].trim().split(/\r?\n/)
  .map(row=>row.trim().split(/\s+/).map(Number));
assert.equal(square.length,7);
assert(square.every(row=>row.length===7));
assert.equal(square[0][6],181);
assert.equal(square[6][0],181);
assert.equal(square.flat().filter(n=>n===181).length,2);

const latin=fs.readFileSync("resources/control/latin-vulgate-gp-wholewords.txt","utf8")
  .split(/\r?\n/).filter(line=>/^[0-9A-S]+$/.test(line))
  .slice(0,2896).map(w=>w.length);
assert.equal(latin.length,2896);
const originalChi=chiSquared(lengths);
const latinChi=chiSquared(latin);
assert(Math.abs(originalChi-3.949446088360591)<1e-7);
assert(Math.abs(latinChi-131.9039073852229)<1e-7);
const localChi=[chiSquared(local(lengths,spiral)),chiSquared(local(lengths,inverse))];
assert(Math.abs(localChi[0]-5.610638379679061)<1e-7);
assert(Math.abs(localChi[1]-4.169964359412482)<1e-7);

const results=[];
for (const [name,order] of [
  ["printed",identity],["spiral",spiral],["unspiral",inverse],
]) for (const mode of ["rowToColumn","columnToRow"]) {
  const decrypted=transpose(lengths,order,mode);
  const encryptedPlant=transpose(latin,order,
    mode==="rowToColumn"?"columnToRow":"rowToColumn");
  const recovered=transpose(encryptedPlant,order,mode);
  assert.deepEqual(recovered,latin,name+" "+mode+" exact planted inverse");
  assert(Math.abs(chiSquared(recovered)-latinChi)<1e-7);
  results.push({name,mode,chiSquared:chiSquared(decrypted)});
}
const expected=[1.99188958723195,2.062908407542428,
  1.75954392090978,2.852113183390027,
  1.9744706978565452,5.821169872771485];
results.forEach((r,i)=>assert(Math.abs(r.chiSquared-expected[i])<1e-7));
assert(results.every(r=>r.chiSquared<10));
console.log(JSON.stringify({
  originalWords:lengths.length,originalRunes:original.runeCount,
  p15SpiralColumnOrder:spiral,
  historicalSquareContains181Twice:true,
  originalChi,latinChi,localChi,results,
  finding:"These eight reversible source-spiral original-input inverses do not restore native prose word-order structure"
},null,2));
