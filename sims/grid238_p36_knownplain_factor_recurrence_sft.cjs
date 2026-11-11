"use strict";
/**
 * Exact source-frozen p36 238-rune factor-as-known-plaintext candidate gate.
 * Original printed 256-cell GF29 polynomial contains two marked quadratics,
 * a cubic, a nonary and a 238-degree irreducible factor. Physical p36 alone
 * has 238 runes. If the 238 lower coefficients are plaintext (or an
 * intermediate GP29 register), the original ciphertext difference uniquely
 * fixes the additive key; each source-factor LFSR then predicts all later key
 * digits from its initial d symbols. Test necessary equality, no LM or search.
 *
 * Node 22: node sims/grid238_p36_knownplain_factor_recurrence_sft.cjs
 * Classification: conditional exact original-input exclusion; no decryption.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
/** @param {number} n */
const mod = n => (n % 29 + 29) % 29;
/** @param {number} x */
function inverse(x) {
  for(let i=1;i<29;i++) if(mod(x*i)===1) return i;
  throw Error("Noninvertible source factor");
}
/** Descending array not needed; polynomial arithmetic uses ascending. 
 * @param {number[]} source @param {number[]} divisor
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(source,divisor) {
  const r=source.slice(),d=divisor.length-1,lead=inverse(divisor[d]);
  const q=Array(source.length-d).fill(0);
  for(let i=source.length-1;i>=d;i--) {
    const k=mod(r[i]*lead);
    q[i-d]=k;
    for(let j=0;j<=d;j++)r[i-d+j]=mod(r[i-d+j]-k*divisor[j]);
  }
  return {quotient:q,remainder:r.slice(0,d)};
}
/** @param {number[]} a @param {number[]} poly */
function tally(a,poly) {
  const d=poly.length-1,miss=[];
  for(let i=d;i<a.length;i++){
    let expected=0;
    for(let j=0;j<d;j++)expected-=poly[j]*a[i-d+j];
    expected=mod(expected);
    if(expected!==a[i])miss.push({i,expected,actual:a[i]});
  }
  return {degree:d,matches:a.length-d-miss.length,total:a.length-d,
    firstMismatch:miss[0]||null};
}
/** @param {number[]} initial @param {number[]} poly @param {number} count */
function generate(initial,poly,count) {
  const d=poly.length-1,k=initial.slice();
  assert.equal(k.length,d);
  while(k.length<count){
    let next=0;
    for(let j=0;j<d;j++)next-=poly[j]*k[k.length-d+j];
    k.push(mod(next));
  }
  return k;
}
const grid=read("resources/liber-primus/base60-grid.json");
const corpus=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const bytes=grid.byte_rows.flat();
assert.equal(bytes.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes))
  .digest("hex"),"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const marked=ink.pages.filter(p=>p.page===3||p.page===39).map(p=>
  ({page:p.page,red:(p.red_spans||[]).filter(s=>s.length===3)
    .map(s=>[...s.runes].map(r=>corpus.runes.indexOf(r)))}));
assert.deepEqual(marked,[
  {page:3,red:[[13,23,2]]},{page:39,red:[[27,5,15]]}
]);
assert.deepEqual(corpus.pages.filter(p=>p.page<=55&&p.indices.length===238).map(p=>p.page),[36]);
const target=corpus.pages.find(p=>p.page===36).indices;
const p3Quadratic=[21,26,1]; // monic 13+23x+2x² => x²+26x+21
const factors=[
  [5,1],[5,1],[11,18,1],[24,16,14,1],
  [11,15,0,9,1,5,10,20,12,1]
];
let source=bytes.slice().reverse().map(mod);
assert.equal(source.at(-1),0);
source.pop(); // actual degree 254, printed extra leading zero
assert.equal(source.length,255);
for(const factor of factors){
  const {quotient,remainder}=divide(source,factor);
  assert(remainder.every(x=>x===0));
  source=quotient;
}
assert.equal(source.length,239);
assert.equal(source.at(-1),28);
const canon=source.map(x=>mod(28*x)); // 28 is inverse of 28 in F29
assert.equal(canon.at(-1),1);
const recurrences=[
  ["marked-p3-quadratic",p3Quadratic],
  ["grid-irreducible-cubic",[24,16,14,1]],
  ["grid-irreducible-nonary",[11,15,0,9,1,5,10,20,12,1]]
];
const results=[];
for(const [normalization,R] of [["monic",canon],["raw-leading28",source]]) {
  for(const orientation of ["ascending","descending"]) {
    const hypothetical=R.slice(0,238);
    if(orientation==="descending")hypothetical.reverse();
    assert.equal(hypothetical.length,238);
    const requiredKey=target.map((c,i)=>mod(c-hypothetical[i]));
    for(const [name,poly] of recurrences){
      const necessary=tally(requiredKey,poly);
      assert(necessary.firstMismatch);
      const plantedKey=generate(
        Array.from({length:poly.length-1},(_,i)=>[13,23,2,24,19,21,23,27,2][i]),
        poly,238);
      const plantedCipher=hypothetical.map((r,i)=>mod(r+plantedKey[i]));
      const recovered=plantedCipher.map((r,i)=>mod(r-hypothetical[i]));
      assert.deepEqual(recovered,plantedKey);
      const positive=tally(recovered,poly);
      assert.equal(positive.matches,positive.total);
      assert.deepEqual(plantedCipher.map((v,i)=>mod(v-recovered[i])),hypothetical);
      results.push({normalization,orientation,recurrence:name,...necessary,
        positivePlantFull238:true});
    }
  }
}
assert.equal(results.length,12);
assert.deepEqual(results.map(r=>r.matches),
  [12,4,10,9,8,9,9,5,8,7,8,2]);
assert(results.every(r=>r.matches<=12));

/** Direct factor-as-pad test, independent of the above factor-as-plaintext crib.
 * Both source scaling choices and +/- GP29 addition are equivalent up to
 * choosing the additive sign. Original source also fixes two coefficient
 * directions. These four unique decoded original sequences are audited.
 * @param {number[]} values
 */
function ioc(values){
  const hist=Array(29).fill(0);
  for(const x of values)hist[x]++;
  return hist.reduce((n,c)=>n+c*(c-1),0)/(values.length*(values.length-1));
}
const directPads=[];
for(const orientation of ["ascending","descending"]){
  const key=canon.slice(0,238);
  if(orientation==="descending")key.reverse();
  for(const sign of [-1,1]){
    const restored=target.map((c,i)=>mod(c+sign*key[i]));
    assert.deepEqual(restored.map((x,i)=>mod(x-sign*key[i])),target);
    const knownPlain=Array.from({length:238},(_,i)=>[24,3,1,4,19,20,2,26,10,8,16,18,19,7,3,11,14][i%17]);
    const plantCipher=knownPlain.map((x,i)=>mod(x-sign*key[i]));
    assert.deepEqual(plantCipher.map((x,i)=>mod(x+sign*key[i])),knownPlain);
    directPads.push({orientation,sign,decodedIoC:ioc(restored),
      first30RuneIndices:restored.slice(0,30),
      allOriginalReencrypted:true,positive238Recovered:true});
  }
}
assert.deepEqual(directPads.map(x=>Number(x.decodedIoC.toFixed(10))),
  [0.0362727369,0.0348544481,0.0343580470,0.0348189909]);

console.log(JSON.stringify({
  source:'original table factorization and 238-rune physical p36',
  independentlyMarkedPolynomials:{p3:[13,23,2],p39:[27,5,15]},
  p36Length:target.length,largeFactorDegree:canon.length-1,
  candidate:'238 nonleading source coefficients as known plaintext; unknown additive keystream must obey each source-selected linear factor',
  results,directFactorPad:{originalIoC:ioc(target),cases:directPads},interpretation:'all 12 natural source-factor additive-key continuations rejected; all 12 source-native plants recovered; no unknown LP2 plaintext'
},null,2));
