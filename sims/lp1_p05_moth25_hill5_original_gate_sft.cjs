"use strict";
/**
 * One frozen original-input GP29 Hill5 trial: the historically witnessed
 * third 2014 5x5 magic square against the moth-linked p53 red51 and p55.
 * Each passage has one provisionally transparent source F yielding 50/75
 * symbols respectively. No key or crib is fitted to unknown plaintext.
 * Executable with Node.js 22: node sims/lp1_p05_moth25_hill5_original_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const mod = x => (x % 29 + 29) % 29;
const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");
const squares = squareText.trim().split(/\r?\n\s*\r?\n/);
assert.equal(squares.length, 3);
const sourceSquare = squares[2].trim().split(/\r?\n/)
  .map(line => line.trim().split(/\s+/).map(Number));
assert.equal(sourceSquare.length, 5);
assert(sourceSquare.every(r => r.length === 5 &&
  r.every(x => Number.isInteger(x)) &&
  r.reduce((s,x) => s+x,0) === 1033));
const transpose = a => a[0].map((_, j) => a.map(r => r[j]));
/** @param {number[][]} m @returns {number[][]} */
function inverse(m) {
  const n = m.length;
  const a = m.map((r,i) => r.map(mod).concat(
    Array.from({length:n},(_,j) => +(i===j))));
  for (let c=0;c<n;c++) {
    let p=c;
    while (p<n && a[p][c]===0) p++;
    assert(p<n, "source magic square singular");
    [a[p],a[c]]=[a[c],a[p]];
    let scale=1;
    while (mod(scale*a[c][c])!==1) scale++;
    a[c]=a[c].map(x=>mod(scale*x));
    for (let r=0;r<n;r++) if (r!==c) {
      const factor=a[r][c];
      a[r]=a[r].map((x,j)=>mod(x-factor*a[c][j]));
    }
  }
  return a.map(r=>r.slice(n));
}
/** @param {number[]} source @param {number[][]} key */
function apply(source,key) {
  assert.equal(source.length%5,0);
  const result=[];
  for (let i=0;i<source.length;i+=5) {
    for (const row of key) {
      result.push(mod(row.reduce((s,k,j)=>s+k*source[i+j],0)));
    }
  }
  return result;
}
/** @param {number[]} xs */
function indexOfCoincidence(xs) {
  const counts=Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
}
const K=sourceSquare.map(r=>r.map(mod));
const Ki=inverse(K), Kt=transpose(K), Kit=transpose(Ki);
const keys=[["K",K],["K^T",Kt],["K^-1",Ki],["(K^-1)^T",Kit]];
const p53=corpus.pages.find(p=>p.page===53).indices;
const p55=corpus.pages.find(p=>p.page===55).indices;
const span=ink.pages.find(p=>p.page===53).red_spans[0];
assert.equal(span.start,128);assert.equal(span.length,51);
const red53=p53.slice(span.start,span.start+span.length);
assert.equal(red53.length,51);assert.equal(p55.length,76);
const fPositions=xs=>xs.flatMap((x,i)=>x===0?[i]:[]);
assert.deepEqual(fPositions(red53),[38]);
assert.deepEqual(fPositions(p55),[15,25,41]);
const remove=(xs,i)=>xs.filter((_,j)=>j!==i);
const redSource=remove(red53,38);
const p55Source=remove(p55,25);
assert.equal(redSource.length,50);
assert.equal(p55Source.length,75);
assert.equal(redSource.length+p55Source.length,125);
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
for (const [forward,backward] of [[K,Ki],[Ki,K],[Kt,Kit],[Kit,Kt]]) {
  assert.deepEqual(apply(apply(p57,forward),backward),p57);
}
const cases=[];
for (const [name,m] of keys) {
  for (const [target,source] of [["p53_red51_F38",redSource],
     ["p55_all76_F25",p55Source],
     ["moth_combined_125",redSource.concat(p55Source)]]) {
    const out=apply(source,m);
    const reverse = name==="K" ? Ki : name==="K^T" ? Kit :
      name==="K^-1" ? K : Kt;
    assert.deepEqual(apply(out,reverse),source);
    cases.push({target,operator:name,runicCount:out.length,
      ioc:indexOfCoincidence(out),
      readout:out.map(i=>corpus.translit[i]).join("")});
  }
}
for (const skip of [15,41]) {
  for (const [name,m] of keys) {
    const out=apply(remove(p55,skip),m);
    cases.push({target:"p55_all76_F"+skip,operator:name,
      runicCount:out.length,ioc:indexOfCoincidence(out),
      readout:out.map(i=>corpus.translit[i]).join("")});
  }
}
const keyCase=cases.find(x=>x.target==="p53_red51_F38"&&x.operator==="K");
const inverseCase=cases.find(x=>x.target==="p55_all76_F25"&&x.operator==="K^-1");
assert(Math.abs(keyCase.ioc-0.037551020408163265)<1e-13);
assert(Math.abs(inverseCase.ioc-0.03855855855855856)<1e-13);
console.log(JSON.stringify({
  status:"Bounded source-matrix gate, no recovered plaintext",
  historicalSquare:sourceSquare,
  sourceLayout:"p53 red 51, only F at offset38; p55 76, F at15/25/41",
  exactPositiveControl:"95/95 original solved p57 runes recover under all 4 orientation pairs",
  numberOfOriginalCases:cases.length,
  cases,
  conclusion:"Neither historic third-square Hill5 orientation nor any of three source F skip positions yields recognizable source-native plaintext."
},null,2));
