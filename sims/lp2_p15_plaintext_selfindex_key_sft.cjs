"use strict";
/**
 * Source-led p15 self-indexed GP29 running-key gate.
 *
 * Hypothesis: sixteen values printed on original physical p15 index sixteen
 * unknown plaintext runes that form a repeating additive key. The sixteen
 * key equations are recovered over GF(29), with no language-model fitting.
 * All 16 phases, signs, zero-/one-based origins, and four source readings
 * are reported. Two source Fibonacci variants have no 1-based F=0 address.
 *
 * Source: canonical original p0..55 indices and established p15 4x4 spiral.
 * Run: node sims/lp2_p15_plaintext_selfindex_key_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const original = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(original.length, 12956);
const spiral = [3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
const row = [3258,3222,3152,3038,3278,3299,3298,2838,
  3288,3294,3296,2472,4516,1206,708,1820];
const fib = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const values = {
  printed_spiral: spiral,
  printed_row: row,
  derived_prime_spiral: spiral.map(x => Math.abs(3301-x)),
  derived_prime_row: row.map(x => Math.abs(3301-x)),
  distinct_fibonacci_spiral: fib,
  fibonacci_ordinal_spiral: fib.map(x => x+1),
};
assert(values.printed_spiral.every(x => x > 0 && x < original.length));
const mod = x => ((x % 29) + 29) % 29;
/**
 * Solve C[address_j] = K_j + sign*K[(address_j+phase)%16] in GF29.
 * A solution is key-blind when the coefficient matrix has rank16.
 *
 * @param {number[]} C Original or planted ciphertext
 * @param {number[]} addressValues Sixteen page-15-derived numbers
 * @param {number} base Zero/one based address convention
 * @param {number} sign +/- 1
 * @param {number} phase Key phase, 0..15
 */
function solve(C, addressValues, base, sign, phase) {
  const addresses = addressValues.map(x => x-base);
  if (addresses.some(x => x < 0 || x >= C.length))
    return {status:"invalid_address"};
  const A = addresses.map((n,j) => {
    const row = Array(17).fill(0);
    row[j]++;
    row[(n+phase)%16] += sign;
    row[16] = C[n];
    return row.map(mod);
  });
  const pivot = [];
  for (let col=0; col<16; col++) {
    const r = pivot.length;
    let k=r;
    while (k<16 && !A[k][col]) k++;
    if (k===16) continue;
    [A[k],A[r]]=[A[r],A[k]];
    let inv=1;
    while (mod(inv*A[r][col])!==1) inv++;
    A[r] = A[r].map(v => mod(v*inv));
    for (let t=0; t<16; t++) if (t!==r && A[t][col]) {
      const m=A[t][col];
      A[t]=A[t].map((v,i)=>mod(v-m*A[r][i]));
    }
    pivot.push(col);
  }
  const rank=pivot.length;
  if (!A.slice(rank).every(r => r[16]===0))
    return {status:"inconsistent",rank};
  const K=Array(16).fill(0);
  for (let r=0;r<rank;r++) K[pivot[r]]=A[r][16];
  assert(addresses.every((n,i) =>
    mod(K[i]+sign*K[(n+phase)%16])===C[n]));
  return {status:"consistent",rank,key:K,freeColumns:
    Array.from({length:16},(_,i)=>i).filter(i=>!pivot.includes(i)),
    reduced:A,pivot};
}
/** @param {number[]} symbols */
function indexOfCoincidence(symbols) {
  const counts=Array(29).fill(0);
  for (const v of symbols) counts[v]++;
  return counts.reduce((s,n)=>s+n*(n-1),0) /
    (symbols.length*(symbols.length-1));
}
/** @param {number[]} C @param {number[]} key */
function decode(C,key,sign,phase) {
  return C.map((v,i)=>mod(v-sign*key[(i+phase)%16]));
}
const cases=[];
for (const [name,addresses] of Object.entries(values)) {
  for (const base of [0,1]) for (const sign of [1,-1])
    for (let phase=0;phase<16;phase++) {
      const r=solve(original,addresses,base,sign,phase);
      const entry={name,base,sign,phase,status:r.status,
        rank:r.rank??null};
      if (r.key) {
        // Exhaust every freely chosen secret coordinate. No zero-choice
        // shortcut may falsely exclude a rank-deficient source cipher.
        const count=29**r.freeColumns.length;
        let best={ioc:-Infinity,key:null};
        for (let choice=0;choice<count;choice++) {
          const key=Array(16).fill(0);
          let z=choice;
          for (const c of r.freeColumns) {
            key[c]=z%29;z=Math.floor(z/29);
          }
          for (let t=0;t<r.rank;t++) {
            let v=r.reduced[t][16];
            for (const c of r.freeColumns) v-=r.reduced[t][c]*key[c];
            key[r.pivot[t]]=mod(v);
          }
          const P=decode(original,key,sign,phase);
          assert(addresses.every((n,i)=>P[n-base]===key[i]));
          assert(P.every((v,i)=>
            mod(v+sign*key[(i+phase)%16])===original[i]));
          const ioc=indexOfCoincidence(P);
          if (ioc>best.ioc) best={ioc,key};
        }
        entry.ioc=best.ioc;
        entry.key=best.key;
        entry.nKeySolutions=count;
      }
      cases.push(entry);
    }
}
const consistent=cases.filter(c=>c.status==="consistent")
  .sort((a,b)=>b.ioc-a.ioc);
assert.equal(cases.length,384);
assert.equal(consistent.length,96);
assert(Math.abs(indexOfCoincidence(original)-0.03447839786450569)<1e-12);
assert(Math.abs(consistent[0].ioc-0.03455782830085237)<1e-12);
assert.equal(consistent.reduce((s,c)=>s+c.nKeySolutions,0),264);
assert(consistent.every(c=>c.ioc<0.04));

// Positive: generate a complete synthetic manuscript under exactly the
// hypothesised self-referential plaintext-key construction and invert it.
const plainReference=corpus.pages.find(p=>p.page===57).indices;
const plantedPlain=Array.from({length:12956},
  (_,i)=>plainReference[i%plainReference.length]);
const addresses=values.derived_prime_spiral,base=1,sign=1,phase=12;
const plantKey=addresses.map(n=>plantedPlain[n-base]);
const plantedCipher=plantedPlain.map(
  (v,i)=>mod(v+sign*plantKey[(i+phase)%16]));
const inverted=solve(plantedCipher,addresses,base,sign,phase);
assert.equal(inverted.status,"consistent");
assert.equal(inverted.rank,16);
assert.deepEqual(inverted.key,plantKey);
assert.deepEqual(decode(plantedCipher,inverted.key,sign,phase),plantedPlain);

const counts=Object.fromEntries(Object.keys(values).map(name=>[
  name, cases.filter(c=>c.name===name && c.status==="consistent").length]));
console.log(JSON.stringify({
  source:"original LP2 p0-55 GP29 ciphertext and p15 spiral",
  originalRunes:original.length, originalIoC:indexOfCoincidence(original),
  tested:cases.length,consistent:consistent.length,
  testedCompatibleKeys:consistent.reduce((s,c)=>s+c.nKeySolutions,0),
  invalid:cases.filter(c=>c.status==="invalid_address").length,
  inconsistent:cases.filter(c=>c.status==="inconsistent").length,
  consistentBySource:counts,bestOriginal:consistent.slice(0,8),
  positive:{originalLength:plantedPlain.length,phase,sign,base,
    rank:inverted.rank,exactKeyRecovery:true,exactPlaintextRecovery:true},
  conclusion:"None of these exact, source-indexed 16-period GP29 inverses recovers native GP29 text. A consistent linear system alone carries no evidence of plaintext or key authenticity."
},null,2));
