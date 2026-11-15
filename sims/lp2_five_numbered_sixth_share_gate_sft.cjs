"use strict";
/** Test the source-numbered five LP2 passages as F29 polynomial shares.
 * Exact original ciphertext, no plaintext fitting. SFT: node sims/lp2_five_numbered_sixth_share_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pg=source.pages.map(p=>p.indices);
const shares=[
  pg[36].slice(99,238), pg[37].slice(0,91),
  pg[37].slice(91,189),
  pg[37].slice(189).concat(pg[38].slice(0,57)),
  pg[38].slice(57,186)
];
const next=pg[38].slice(186).concat(pg[39].slice(0,119));
assert.deepEqual(shares.map(a=>a.length),[139,91,98,96,129]);
assert.equal(next.length,161);
const N=91;
const mod=x=>(x%29+29)%29;
const weights={zero:[5,19,10,24,1],six:[1,24,10,19,5]};
/** @param {number[][]} five @param {number[]} coeff @returns {number[]} */
function predict(five,coeff){
  assert.equal(five.length,5);
  assert.ok(five.every(a=>a.length>=N));
  assert.equal(coeff.reduce((a,b)=>a+b,0)%29,1);
  return Array.from({length:N},(_,i)=>mod(five.reduce((sum,a,j)=>sum+coeff[j]*a[i],0)));
}
/** @param {number[]} a */
function ioc(a){
  const counts=new Array(29).fill(0);
  for(const x of a)counts[x]++;
  return counts.reduce((n,x)=>n+x*(x-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a @param {number[]} b */
function matches(a,b){return a.reduce((n,x,i)=>n+Number(x===b[i]),0);}
const results={};
for(const [label,coeff] of Object.entries(weights)){
  const key=predict(shares,coeff);
  const minus=key.map((x,i)=>mod(next[i]-x)),plus=key.map((x,i)=>mod(next[i]+x));
  const shifts=Array.from({length:next.length-N+1},(_,start)=>matches(key,next.slice(start,start+N)));
  results[label]={
    matchesAtOriginalUnnumberedStart:matches(key,next),
    primeResidueMatches:key.reduce((n,x,i)=>n+Number(source.prime[x]%29===source.prime[next[i]]%29),0),
    maximumAcross71UnnumberedOffsets:Math.max(...shifts),
    minus:{ioc:ioc(minus),readout:minus.map(x=>source.translit[x]).join(" ")},
    plus:{ioc:ioc(plus),readout:plus.map(x=>source.translit[x]).join(" ")}
  };
}
assert.equal(results.zero.matchesAtOriginalUnnumberedStart,2);
assert.equal(results.six.matchesAtOriginalUnnumberedStart,2);
assert.equal(results.zero.primeResidueMatches,3);
assert.equal(results.six.primeResidueMatches,2);
assert.equal(results.zero.maximumAcross71UnnumberedOffsets,7);
assert.equal(results.six.maximumAcross71UnnumberedOffsets,8);
/* Independently generated degree-four polynomials and genuine solved-p57 rune controls. */
let state=0x33012014;
function random(){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%29;}
const polynomial=(a,x)=>mod(a.reduce((n,c,i)=>n+c*x**i,0));
const planted=Array.from({length:5},()=>[]),expected0=[],expected6=[];
for(let i=0;i<N;i++){
  const a=Array.from({length:5},random);
  for(let j=0;j<5;j++)planted[j].push(polynomial(a,j+1));
  expected0.push(polynomial(a,0));expected6.push(polynomial(a,6));
}
assert.deepEqual(predict(planted,weights.zero),expected0);
assert.deepEqual(predict(planted,weights.six),expected6);
const known=pg[57].slice(0,N);
const hidden=known.map((x,i)=>mod(x+expected6[i]));
assert.deepEqual(hidden.map((x,i)=>mod(x-predict(planted,weights.six)[i])),known);
console.log(JSON.stringify({
  original:{sourceSizes:[139,91,98,96,129],nextUnnumbered:161,compared:91,results},
  planted:{knownGP57Runes:91,matchedZero:91,matchedSix:91,decodedSixPad:91},
  conclusion:"No exact sixth original share and no original GP plaintext under direct additive continuation"
},null,2));
