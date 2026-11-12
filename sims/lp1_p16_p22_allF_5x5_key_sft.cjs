"use strict";
/**
 * Source-frozen all-F literal clock p22 under LP1 p16 5x5/3301 square.
 * Expanded artwork parents intersect at LP1 pp15/16; p16 is a conditional key source.
 * The page22 six literal Fs leave exactly five 25-cell key cycles.
 * Tests row-major raw or arithmetic-totient cells in both additive senses.
 * No fitted keys, key phase, clock, F masks or page subset; no writes.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const fromPage = (n) => gp.pages.find((v) => v.page === n).indices;
const square = [
  434,1311,312,278,966, 204,812,934,280,1071,
  626,620,809,620,626, 1071,280,934,812,204,
  966,278,312,1311,434
];
const source = fs.readFileSync(path.join(root,
  "resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
assert.ok(source.includes("434   1311  312   278   966"));
assert.equal(square.reduce((sum, v) => sum + v, 0), 16505);
const mod = (n) => ((n % 29) + 29) % 29;
function phi(n) {
  let out = n, x = n;
  for (let d = 2; d*d <= x; d++) {
    if (x % d === 0) {
      while (x % d === 0) x /= d;
      out -= out/d;
    }
  }
  if (x > 1) out -= out/x;
  return out;
}
/** @param {number[]} a */
function ioc(a) {
  const f = Array(29).fill(0);
  a.forEach(v => f[v]++);
  return f.reduce((sum,v)=>sum+v*(v-1),0)/(a.length*(a.length-1));
}
/**
 * @param {number[]} input
 * @param {number[]} key
 * @param {number} sign
 * @returns {{out:number[],consumed:number}}
 */
function inverse(input,key,sign) {
  let k=0;
  const out=input.map(c=>c===0 ? 0 : mod(c+sign*key[(k++)%25]));
  return {out,consumed:k};
}
const p22=fromPage(22);
assert.equal(p22.length,131);
assert.equal(p22.filter(c=>c===0).length,6);
assert.equal(p22.length-p22.filter(c=>c===0).length,125);
const keys={raw:square.map(mod),phi:square.map(n=>mod(phi(n)))};
const rows=[];
for(const [name,key] of Object.entries(keys)){
  for(const sign of [-1,1]){
    const {out,consumed}=inverse(p22,key,sign);
    assert.equal(consumed,125);
    // Re-encryption uses the ciphertext's frozen literal-F mask. Decoded P=F
    // at a consuming position must still consume its key symbol.
    let j=0;
    const reencrypted=out.map((v,i)=>p22[i]===0?0:mod(v-sign*key[(j++)%25]));
    assert.equal(j,125);
    assert.deepEqual(reencrypted,p22);
    // Language GP English plant with six forced literal Fs in same locations.
    const plant=fromPage(57).filter(c=>c!==0);
    const native=Array.from({length:125},(_,i)=> {
      let v=plant[i%plant.length];
      if(mod(v+sign*key[i%25])===0) v=(v%28)+1;
      return v;
    });
    let n=0;
    const planted=p22.map(c=>c===0?0:mod(native[n]+sign*key[(n++)%25]));
    assert.equal(n,125);
    const recovered=inverse(planted,key,-sign).out.filter(c=>c!==0);
    assert.deepEqual(recovered,native);
    rows.push({name,sign,consumed,score:ioc(out),
      first90GP:out.slice(0,90).map(i=>gp.translit[i]).join("")});
  }
}
assert.equal(rows[0].score,0.03863769817968291);
assert.equal(rows[3].score,0.03746330005871991);
console.log(JSON.stringify({
  originalP22Runes:131,sourceFPositions:p22.map((x,i)=>x===0?i:null).filter(x=>x!==null),
  effectiveKeySymbols:125,keyPeriods:5,sourceObject:"LP1 p16 5x5/3301",
  originalIoC:ioc(p22),candidateInverses:rows,
  conclusion:"Exact source-fixed all-six-F-literal, five-square-clock p22 GP29 direct inverse is nonlinguistic; no plaintext or key discovered."
},null,2));
