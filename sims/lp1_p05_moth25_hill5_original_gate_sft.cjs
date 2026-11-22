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
/** First-difference and reintegration are exact mutual inverses.
 * The LP2 ciphertext's independent five-lag excess motivates one frozen
 * differential-Hill model using the historically witnessed 5x5 key.
 * Block clock starts separately at each moth-matched complete passage.
 */
function difference(xs) {
  return xs.map((x, i) => mod(x - (i ? xs[i - 1] : 0)));
}
function integrate(xs) {
  let state = 0;
  return xs.map(x => (state = mod(state + x)));
}
const inverseKey = new Map([
  ["K", Ki], ["K^T", Kit], ["K^-1", K],
  ["(K^-1)^T", Kt]
]);
const differentialCases = [];
for (const [operator, key] of keys) {
  const reverse = inverseKey.get(operator);
  for (const [target, original] of [
    ["p53_red51_F38", redSource], ["p55_all76_F25", p55Source]
  ]) {
    const transformed = integrate(apply(difference(original), key));
    assert.deepEqual(
      integrate(apply(difference(transformed), reverse)), original);
    differentialCases.push({
      target, operator, ioc: indexOfCoincidence(transformed),
      readout: transformed.map(i => corpus.translit[i]).join("")
    });
  }
  const planted = corpus.pages.find(p => p.page === 57).indices;
  assert.equal(planted.length, 95);
  const ciphertext = integrate(apply(difference(planted), reverse));
  assert.deepEqual(integrate(apply(difference(ciphertext), key)), planted);
}
assert.equal(differentialCases.length, 8);
assert(Math.abs(differentialCases[0].ioc - 0.03918367346938775) < 1e-13);
assert(Math.abs(differentialCases[5].ioc - 0.03099099099099099) < 1e-13);


// Alternative clue-shaped 125-symbol register with no conjectural F skips.
// The first p53 red T is the visibly isolated upward-arrow-shaped glyph.
// P55's first NG is the incoming last rune of its p54-to-p55 carried word.
// Neither omission is established as a cryptographic author instruction.
assert.equal(red53[0],16); // GP T
assert.equal(p55[0],21); // GP NG
const newRed50=red53.slice(1);
const newP55_75=p55.slice(1);
assert.deepEqual([newRed50.length,newP55_75.length],[50,75]);
const newMoth125=newRed50.concat(newP55_75);
const phiKey=[12,15,10,14,5,4,24,19,12,6,25,23,14,23,25,6,12,19,24,4,5,14,10,15,12];
// All twenty-five values above are the already source-verified row-major
// Euler-totient residues of the third 2014 5x5 square.
const planted125=Array.from({length:125},(_,i)=>p57[i%95]);
const arrowCarry125=[];
for(const sign of [-1,1]){
  const dec=xs=>xs.map((x,i)=>mod(x+sign*phiKey[i%25]));
  const enc=xs=>xs.map((x,i)=>mod(x-sign*phiKey[i%25]));
  const result=dec(newMoth125);
  assert.deepEqual(enc(result),newMoth125);
  assert.deepEqual(dec(enc(planted125)),planted125);
  arrowCarry125.push({operator:"Euler totient periodic25",sign,
    fullIoC:indexOfCoincidence(result),
    red50IoC:indexOfCoincidence(result.slice(0,50)),
    p55new75IoC:indexOfCoincidence(result.slice(50)),
    readout:result.map(i=>corpus.translit[i]).join("")});
}
for(const [operator,m] of keys){
  const result=apply(newMoth125,m);
  const reverse=inverseKey.get(operator);
  assert.deepEqual(apply(result,reverse),newMoth125);
  assert.deepEqual(apply(apply(planted125,reverse),m),planted125);
  arrowCarry125.push({operator:"Hill5 "+operator,
    fullIoC:indexOfCoincidence(result),
    red50IoC:indexOfCoincidence(result.slice(0,50)),
    p55new75IoC:indexOfCoincidence(result.slice(50)),
    readout:result.map(i=>corpus.translit[i]).join("")});
}
assert(Math.abs(arrowCarry125[0].fullIoC-0.03496774193548387)<1e-13);
assert(Math.abs(arrowCarry125[1].fullIoC-0.034451612903225806)<1e-13);
assert(Math.abs(arrowCarry125[4].fullIoC-0.036)<1e-13);


/**
 * Arrow-up variant: the selected two-plus-three rows make a 5x25 grid.
 * Transform each upward-read five-rune column, unlike blockwise Hill5.
 */
function verticalUpHill(source, matrix) {
  assert.equal(source.length,125);
  const result=Array(125);
  for(let col=0; col<25; col++) {
    const up=Array.from({length:5},(_,r)=>source[(4-r)*25+col]);
    for(let row=0;row<5;row++)
      result[(4-row)*25+col]=mod(
        matrix[row].reduce((sum,k,j)=>sum+k*up[j],0));
  }
  return result;
}
const verticalArrowHill=[];
for(const [operator,matrix] of keys){
  const reverse=inverseKey.get(operator);
  const output=verticalUpHill(newMoth125,matrix);
  assert.deepEqual(verticalUpHill(output,reverse),newMoth125);
  assert.deepEqual(verticalUpHill(verticalUpHill(planted125,reverse),matrix),planted125);
  verticalArrowHill.push({operator,fullIoC:indexOfCoincidence(output),
    red50:output.slice(0,50).map(i=>corpus.translit[i]).join(""),
    p55new75:output.slice(50).map(i=>corpus.translit[i]).join("")});
}
assert(Math.abs(verticalArrowHill[0].fullIoC-0.03367741935483871)<1e-13);

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
  differentialOriginalCases:differentialCases.length,
  differentialCases,
  arrowCarry125,
  verticalArrowHill,
  conclusion:"Neither historic third-square Hill5 orientation nor any of three source F skip positions yields recognizable source-native plaintext."
},null,2));
