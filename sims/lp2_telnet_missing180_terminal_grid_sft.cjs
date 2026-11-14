"use strict";
/**
 * 2013 telnet missing-primes block -> 2014 LP2 terminal-grid interior.
 * Single runnable test file for the exact source-number hypothesis.
 * node sims/lp2_telnet_missing180_terminal_grid_sft.cjs
 *
 * Historical witness (2013 telnet transcript):
 * https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md
 * Output has p1..p20 (2..71), then p201..p463 (1229..3299).
 * A second transcription extends the rightmost tail to p464=3301.
 * Both independently preserve the p21..p200 omission.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const read = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", p), "utf8"));
const gp = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json").bytes;
assert.equal(grid.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(grid)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
function firstPrimes(n) {
  const found = [];
  for (let p = 2; found.length < n; p++) {
    let prime = true;
    for (let d = 2; d * d <= p; d++) {
      if (p % d === 0) { prime = false; break; }
    }
    if (prime) found.push(p);
  }
  return found;
}
const primes = firstPrimes(464);
assert.deepEqual(
  [primes[19], primes[20], primes[172], primes[199], primes[200], primes[204], primes[462], primes[463]],
  [71, 73, 1031, 1223, 1229, 1259, 3299, 3301]
);
const absent = primes.slice(20, 200);
assert.equal(absent.length, 180);
const inner = [];
const outer = [];
for (let r = 0; r < 32; r++) for (let c = 0; c < 8; c++) {
  const val = grid[8*r+c];
  ((r === 0 || r === 31 || c === 0 || c === 7) ? outer : inner).push(val);
}
assert.deepEqual([outer.length, inner.length], [76,180]);
assert.equal(gp.pages[55].indices.length,76);
assert.equal(gp.pages[56].indices.length,85);
assert.equal(gp.pages[57].indices.length,95);
const mod = x => (x%29+29)%29;
// Source-authenticated p56 prime-totient inverse, only ciphertext F at local 56 bypasses.
let keyClock = 0;
const p56Plain = gp.pages[56].indices.map((c,i) =>
  i === 56 ? c : mod(c - (primes[keyClock++]-1)));
assert.equal(keyClock,84);
assert.equal(p56Plain.map(x=>gp.translit[x]).join(""),
 "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");
const p57 = gp.pages[57].indices;
const p56Cipher = gp.pages[56].indices;
const tableRem = inner.map(v=>v%29);
const gapPhi = absent.map(p=>(p-1)%29);
function histogram(a) {
  const h=Array(29).fill(0);
  for(const v of a)h[v]++;
  return h;
}
function comparisons(values,sign) {
  const expected=values.map((p,i)=>mod(p+sign*gapPhi[i]));
  const rawMatches=expected.reduce((n,v,i)=>n+(v===tableRem[i]),0);
  const a=histogram(expected),b=histogram(tableRem);
  const mismatch=a.reduce((s,v,i)=>s+Math.abs(v-b[i]),0)/2;
  return {rawMatches,minReplacementsForAnyTablePermutation:mismatch};
}
console.log("2013 p20=71, missing p21..p200=73..1223 (180 primes), p201=1229");
console.log("Historical p57 clause prime sums 1259=p205,1031=p173,1229=p201");
console.log("LP2 p49-51 grid 32x8: 76 perimeter + 180 strict interior");
console.log("LP2 p55=76, p56=85, p57=95, solved terminal total 180");
for(const [name,values] of [
  ["p56 AUTHENTIC PLAINTEXT plus p57 CLEAR",p56Plain.concat(p57)],
  ["p56 PRINTED CIPHERTEXT plus p57 CLEAR",p56Cipher.concat(p57)]
]) {
  assert.equal(values.length,180);
  for(const sign of [-1,1]) {
    const obs=comparisons(values,sign);
    console.log(name,"sign",sign,JSON.stringify(obs));
    assert(obs.minReplacementsForAnyTablePermutation > 0,
      "A 180-of-180 exact source-key consumer would require equal histograms");
  }
}
console.log("Decision: source-number alignment only; the direct missing-prime phi GP29 layer fails all four original known-target modes.");
