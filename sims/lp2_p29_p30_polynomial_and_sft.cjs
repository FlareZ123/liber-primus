"use strict";

/**
 * SFT for frozen literal p29+p30 original-polynomial AND receiver.
 * Precommit: workplace/agent5-p29-p30-polynomial-and-precommit.md.
 * Node.js 22 / CommonJS; read-only; no external dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const corpus=JSON.parse(fs.readFileSync(
  path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),
  "utf8"
));
/** @param {number} n */
const mod=(n)=>(n%29+29)%29;
/** @param {number[]} a */
function ioc(a) {
  const counts=Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum,n)=>sum+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a */
const show=(a)=>a.map(x=>corpus.translit[x]).join("");
const a=corpus.pages.find(x=>x.page===29).indices;
const b=corpus.pages.find(x=>x.page===30).indices;
const solved=corpus.pages.find(x=>x.page===57).indices;
assert.equal(a.length,277);
assert.equal(b.length,263);

// High-first GF29 polynomial addition aligns constant terms, which puts the
// 263 p30 coefficients against the LAST 263 original p29 coefficients.
const overlapA=a.slice(14);
const sum=b.map((value,i)=>mod(value+overlapA[i]));
assert.deepEqual(sum.map((value,i)=>mod(value-b[i])),overlapA);

// Plant native-solved GP prose under precisely this same original A stream.
const plant=Array.from({length:b.length},(_,i)=>solved[i%solved.length]);
const plantedB=plant.map((value,i)=>mod(value-overlapA[i]));
assert.deepEqual(plantedB.map((value,i)=>mod(value+overlapA[i])),plant);

assert.ok(ioc(sum)>0.0351 && ioc(sum)<0.0354);
console.log(JSON.stringify({
  classification:"NEGATIVE original polynomial AND plaintext gate",
  p29Runes:a.length,
  p30Runes:b.length,
  overlap:sum.length,
  head130:show(sum.slice(0,130)),
  end75:show(sum.slice(-75)),
  originalP29Ioc:ioc(a),
  originalP30Ioc:ioc(b),
  combinedIoc:ioc(sum),
  restoredP29OverlapExact:true,
  nativeGPPlantExact:true
},null,2));
