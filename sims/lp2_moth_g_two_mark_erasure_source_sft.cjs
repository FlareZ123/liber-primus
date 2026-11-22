"use strict";
/**
 * Source-locked two-mark GF(29) completion on the original LP2 moth pair.
 * The p39-derived G quadratic tests p53/p55 runes and their actual terminal
 * 13-dot marks. Does not infer original plaintext from parity completion.
 * Node 22 / CommonJS / read-only SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (file) => JSON.parse(fs.readFileSync(path.join(__dirname,"..",file),"utf8"));
const gp = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const MOD = 29;
const G = [15, 5, 27]; // p39 red [27,5,15] low-first; 15(X-24)^2
const H = [24, 26, 3]; // signed 2013 3QO low-first [3,26,24]
const mod = (x) => (x % MOD + MOD) % MOD;
/** @param {number} x @returns {number} */
function inv(x) {
  for (let y=1;y<MOD;y++) if (mod(x*y)===1) return y;
  throw new Error("GF29 noninvertible coefficient");
}
/** @param {number[]} coefficients @param {number[]} divisor */
function divide(coefficients,divisor) {
  const work=coefficients.slice(),q=[],leadingInverse=inv(divisor[0]);
  for(let i=0;i<=coefficients.length-divisor.length;i++){
    const k=mod(work[i]*leadingInverse);
    q.push(k);
    for(let j=0;j<divisor.length;j++)work[i+j]=mod(work[i+j]-k*divisor[j]);
  }
  return {quotient:q,remainder:work.slice(1-divisor.length)};
}
/** @param {number[]} left @param {number[]} right @param {number} u @param {number} v */
function fill(left,right,u,v) { return [...left,u,...right,v]; }
/**
 * Exhaustive GP29 two-erasure decoder with no fitted key or plaintext.
 * @param {number[]} left @param {number[]} right @param {number[]} divisor
 * @returns {number[][]}
 */
function complete(left,right,divisor) {
  const recovered=[];
  for(let u=0;u<MOD;u++)for(let v=0;v<MOD;v++){
    if(divide(fill(left,right,u,v),divisor).remainder.every(x=>x===0)) recovered.push([u,v]);
  }
  return recovered;
}
/** @param {number[]} coefficients @param {number[]} factor */
function multiply(coefficients,factor) {
  const out=new Array(coefficients.length+factor.length-1).fill(0);
  for(let i=0;i<coefficients.length;i++)for(let j=0;j<factor.length;j++)
    out[i+j]=mod(out[i+j]+coefficients[i]*factor[j]);
  return out;
}
/** @param {number[]} values */
function ioc(values) {
  const counts=new Array(MOD).fill(0);
  values.forEach(v=>counts[v]++);
  return counts.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}

assert.deepEqual(gp.pages[39].indices.slice(119,122),[27,5,15]);
assert.equal(gp.pages[54].indices[0],24);
assert.equal(gp.pages[53].indices.length,179);
assert.equal(gp.pages[55].indices.length,76);
assert.equal(gp.pages[55].indices[0],21); // carried NG from p54
for(const [page,ending] of [[53,179],[55,76]]) {
  const marks=ink.pages.find(p=>p.page===page).large_punctuation.filter(e=>e[0]===ending && e[1]===13);
  assert.equal(marks.length,1);
}
assert.equal(grid.bytes.length,256);
assert.deepEqual(divide(grid.bytes.map(v=>v%MOD),G).remainder,[0,0]);
assert.deepEqual(divide(grid.bytes.map(v=>v%MOD),H).remainder,[0,0]);

const left=gp.pages[53].indices;
const right=gp.pages[55].indices.slice(1);
assert.equal(left.length+right.length,254);
const gPairs=complete(left,right,G),hPairs=complete(left,right,H);
assert.deepEqual(gPairs,[[7,7]]);
assert.deepEqual(hPairs,[[23,26]]);
const completed=fill(left,right,7,7);
const code=divide(completed,G);
assert.deepEqual(code.remainder,[0,0]);
assert.equal(code.quotient.length,254);
assert.deepEqual(multiply(code.quotient,G),completed);
assert.deepEqual(divide(completed,H).remainder,[21,26]);
assert.equal(ioc(code.quotient),0.033114437770377515);

// An actual known GP-native p57 plaintext source is encoded into G;
// both original-source marker positions are erased and recovered exactly.
const clear=gp.pages[57].indices;
assert.equal(clear.length,95);
const planted=Array.from({length:254},(_,i)=>clear[i%clear.length]);
const plantCode=multiply(planted,G);
assert.equal(plantCode.length,256);
const plantFound=complete(plantCode.slice(0,179),plantCode.slice(180,255),G);
assert.deepEqual(plantFound,[[plantCode[179],plantCode[255]]]);
assert.deepEqual(divide(fill(plantCode.slice(0,179),plantCode.slice(180,255),...plantFound[0]),G).quotient,planted);

// Freeze exact reading-order and carry controls, no key or language fit.
const alternative={
  reversePages:complete(right,left,G),
  reverseEach:complete(left.slice().reverse(),right.slice().reverse(),G),
  keepCarryDropP53End:complete(left.slice(0,-1),gp.pages[55].indices,G),
  keepCarryDropP55End:complete(left,gp.pages[55].indices.slice(0,-1),G),
  reverseG:complete(left,right,G.slice().reverse())
};
assert.deepEqual(alternative,{
  reversePages:[[10,9]],reverseEach:[[9,6]],
  keepCarryDropP53End:[[26,16]],keepCarryDropP55End:[[2,12]],
  reverseG:[[27,10]]
});

console.log(JSON.stringify({
  source:"p53 179 + terminal mark + p55 body 75 + terminal mark = 256 positions",
  polynomialG:G,polynomialH:H,erasures:[179,255],
  recoveredG:gPairs,
  recoveredRunes:gPairs[0].map(x=>gp.translit[x]).join(""),
  recoveredH:hPairs,HremainderAfterG:divide(completed,H).remainder,
  quotientRunes:code.quotient.length,
  quotientIoC:ioc(code.quotient),
  quotientPrefix:code.quotient.slice(0,65).map(x=>gp.translit[x]).join(""),
  nativePlainPositive:"254/254 exact G-codeword plant",
  orientationControls:alternative,
  verdict:"W/W is conditional GP29 erasure completion; quotient is nonprose; independent H parity fails."
},null,2));
