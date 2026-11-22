"use strict";
/**
 * LP2 five numbered pp36-38 units under the two physically named LP1
 * 5x5 magic squares (1033 and 3301), preserving full source coordinate
 * coverage and the 98 unmatched original runes.
 *
 * Run: node sims/lp2_five_numbered_two_source_squares_91column_sft.cjs
 * Windows-compatible read-only CommonJS SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = name => fs.readFileSync(path.join(__dirname, "..", name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parts = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/\r\n/g, "\n").split("\n%\n");
const full = parts.slice(36, 39).join("\n");
const headings = [...full.matchAll(/(?:^|\n)([1-5])-/gu)];
assert.deepEqual(headings.map(x => Number(x[1])), [1,2,3,4,5]);
const index = new Map(gp.runes.map((x,i) => [x,i]));
/** @param {string} s @returns {number[]} */
const runes = s => [...s].flatMap(x => index.has(x) ? [index.get(x)] : []);
const units = headings.map((m,i) => runes(full.slice(
  m.index + m[0].length, i === 4
    ? full.indexOf("\n&\n", m.index) : headings[i+1].index
)));
assert.deepEqual(units.map(x => x.length), [139,91,98,96,129]);
const N = 91;
const original = Array.from({length:N}, (_,j) => units.map(x => x[j]));
const originalTails = units.map(x => x.slice(N));
assert.equal(original.flat().length, 455);
assert.equal(originalTails.flat().length, 98);
const Q = 29;
const mod = x => (x % Q + Q) % Q;
/** @param {number[][]} A @returns {number[][]|null} */
function inverse(A) {
  const x = A.map((row,i) => row.map(mod).concat(
    Array.from({length:5}, (_,j) => Number(i === j))
  ));
  for (let col=0; col<5; col++) {
    const pivot = x.findIndex((row,i) => i>=col && row[col] !== 0);
    if (pivot<0) return null;
    [x[col],x[pivot]] = [x[pivot],x[col]];
    const multiplier = Array.from({length:28},(_,i)=>i+1)
      .find(i=>mod(i*x[col][col])===1);
    assert(multiplier !== undefined);
    x[col] = x[col].map(v=>mod(v*multiplier));
    for (let row=0;row<5;row++) {
      if (row === col) continue;
      const k=x[row][col];
      x[row]=x[row].map((v,i)=>mod(v-k*x[col][i]));
    }
  }
  return x.map(row=>row.slice(5));
}
/** @param {number[][]} A @returns {number[][]} */
const transpose = A => A[0].map((_,j) => A.map(row=>row[j]));
/** @param {number[][]} A @param {number[]} x @returns {number[]} */
const apply = (A,x) => A.map(row=>mod(row.reduce((s,k,i)=>s+k*x[i],0)));
/** @param {number[][]} A @param {number[][]} B @returns {number[][]} */
const multiply = (A,B) => A.map(row => B[0].map((_,j) =>
  mod(row.reduce((s,k,i)=>s+k*B[i][j],0))));
/** @param {number[][]} A @param {number[][]} x @returns {number[][]} */
const run = (A,x) => x.map(v=>apply(A,v));
const M1033 = [
 [272,138,341,131,151],[366,199,130,320,18],[226,245,91,245,226],
 [18,320,130,199,366],[151,131,341,138,272]
].map(r=>r.map(mod));
const M3301 = [
 [434,1311,312,278,966],[204,812,934,280,1071],[626,620,809,620,626],
 [1071,280,934,812,204],[966,278,312,1311,434]
].map(r=>r.map(mod));
const tables = {"1033":M1033, "3301":M3301};
for (const [name,A] of Object.entries(tables)) {
  const I=inverse(A);
  assert(I, name+" invertible");
  for(let j=0;j<5;j++) {
    const v=Array.from({length:5},(_,i)=>Number(i===j));
    assert.deepEqual(apply(I, apply(A,v)),v);
  }
}
const presets=[];
for(const [name,A] of Object.entries(tables)) {
  const mt=transpose(A);
  presets.push([name+"/direct",A],[name+"/inverse",inverse(A)],
    [name+"/transpose",mt],[name+"/transpose-inverse",inverse(mt)]);
}
for(const [a,A] of Object.entries(tables)) for(const [b,B] of Object.entries(tables)){
  if(a===b)continue;
  const Ai=inverse(A),Bi=inverse(B);
  presets.push([a+">"+b,multiply(B,A)],
    [a+"^-1>"+b+"^-1",multiply(Bi,Ai)],
    [a+"^-1>"+b,multiply(B,Ai)],
    [a+">"+b+"^-1",multiply(Bi,A)]);
}
const reference=read("resources/liber-primus/lp1-plaintext-reference.txt");
const h=[...reference.matchAll(/^###\s+(\d+)\s*$/gmu)];
const solved=h.map((x,i)=>({
  page:Number(x[1]), text:reference.slice(x.index+x[0].length,
    h[i+1]?.index??reference.length).replace(/^#.*$/gmu,"")
    .replace(/^\s*\[.*\]\s*$/gmu,"")
})).filter(x=>x.page>=1&&x.page<=16&&![4,7,8].includes(x.page));
const token=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} s @returns {number[]} */
function native(s){
  const clean=s.toUpperCase().replace(/QU/gu,"CW").replace(/V/gu,"U")
    .replace(/[KQ]/gu,"C").replace(/Z/gu,"S");
  const out=[];
  for(const word of clean.match(/[A-Z]+/gu)||[])for(let i=0;i<word.length;){
    if(word.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(word.startsWith("IO",i)){out.push(27);i+=2;continue;}
    const m=token.find(t=>word.startsWith(t.s,i));
    assert(m,"GP token");
    out.push(m.i);i+=m.s.length;
  }
  return out;
}
const clear=solved.flatMap(x=>native(x.text));
assert.equal(clear.length,2797);
const plant=clear.slice(0,455);
const train=clear.slice(553);
const counts=Array(29).fill(0);
const pairs=Array.from({length:29},()=>Array(29).fill(0));
for(let i=1;i<train.length;i++){
  counts[train[i-1]]++;
  pairs[train[i-1]][train[i]]++;
}
/** @param {number[]} s @returns {number} */
function bigram(s){
  let z=0;
  for(let i=1;i<s.length;i++)z+=Math.log(
    29*(pairs[s[i-1]][s[i]]+0.5)/(counts[s[i-1]]+14.5));
  return z/(s.length-1);
}
/** @param {number[]} s @returns {number} */
function ioc(s){
  const c=Array(29).fill(0);
  s.forEach(v=>c[v]++);
  return c.reduce((z,n)=>z+n*(n-1),0)/(s.length*(s.length-1));
}
const solvedPlant=Array.from({length:91},(_,i)=>plant.slice(i*5,i*5+5));
const results=presets.map(([name,A])=>{
  assert(A);
  const I=inverse(A);
  assert(I);
  const output=run(A,original);
  assert.deepEqual(run(I,output),original);
  const lanes=Array.from({length:5},(_,j)=>output.map(v=>v[j]));
  const plantCipher=run(I,solvedPlant);
  assert.deepEqual(run(A,plantCipher),solvedPlant);
  return {name,originalCore:455,unmatchedRuneTail:98,
    ioc:ioc(output.flat()),score:bigram(output.flat()),
    perLaneScore:lanes.map(bigram),
    strongestLaneScore:Math.max(...lanes.map(bigram))};
});
results.sort((a,b)=>b.strongestLaneScore-a.strongestLaneScore);
console.log(JSON.stringify({
  source:{headerNumbers:[1033,3301],labelOrder:[1,2,3,4,5],
    unitLengths:units.map(x=>x.length),alignedColumns:91,
    coreRuneCount:455,retainedUnchangedTails:98},
  positive:{plantedNative455:455,exactForwardAndInverse:true,
    nativeGPScore:bigram(plant),solvedP57Score:bigram(gp.pages[57].indices)},
  results
},null,2));
assert(results.every(x=>x.strongestLaneScore<0));
assert(results.every(x=>x.score<0));
assert(bigram(plant)>0);
console.log("PASS: fixed two-source-square numbered-lane 91-column test; no original plaintext.");
