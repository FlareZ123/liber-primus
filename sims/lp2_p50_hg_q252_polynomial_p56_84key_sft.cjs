"use strict";
/**
 * Original LP2 p50 H/G quotient -> historical p56 key, all stationary
 * GF29 polynomial readout degrees 0..6, both 3x84 source geometries.
 * Single runnable test file (SFT), Node.js 22 on Windows or other platforms.
 *
 * Source: resources/liber-primus/lp2-grid-256.json
 * Known answer: original p56 ciphertext and authenticated prime/F key.
 * Every row is fixed before reading the known-key target.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} p @returns {unknown} */
function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", p), "utf8"));
}
/** @param {number} n @returns {number} */
function mod(n) { return (n % 29 + 29) % 29; }
/** @param {number} a @returns {number} */
function inverse(a) {
  assert.ok(Number.isInteger(a) && a > 0 && a < 29);
  for (let b = 1; b < 29; b++) if (mod(a * b) === 1) return b;
  throw Error("noninvertible element");
}
const bytes = readJson("resources/liber-primus/lp2-grid-256.json").bytes;
const gp = readJson("resources/liber-primus/lp2-corpus.json");
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const H = [3,26,24], G = [27,5,15], factor = Array(5).fill(0);
for (let i = 0; i < H.length; i++)
  for (let j = 0; j < G.length; j++)
    factor[i+j] = mod(factor[i+j] + H[i] * G[j]);
assert.deepEqual(factor, [23,21,11,17,12]);
const work = bytes.slice().reverse().map(mod);
const quotientAscending = Array(252).fill(0);
const topInv = inverse(factor[4]);
assert.equal(topInv, 17);
for (let i = 255; i >= 4; i--) {
  const q = mod(work[i] * topInv);
  quotientAscending[i-4] = q;
  for (let j = 0; j < 5; j++)
    work[i-4+j] = mod(work[i-4+j] - q * factor[j]);
}
assert.deepEqual(work.slice(0, 4), [0,0,0,0]);
const quotient = quotientAscending.reverse();
assert.deepEqual(quotient.slice(0, 10), [0,12,9,28,2,25,23,21,18,28]);
const primes = [];
for (let p = 2; primes.length < 84; p++) {
  let prime = true;
  for (let d = 2; d*d <= p; d++) if (p%d === 0) { prime = false; break; }
  if (prime) primes.push(p);
}
const historicalKey = primes.map(p => mod(p - 1));
let clock = 0;
const plain56 = gp.pages[56].indices.map((c,i) =>
  i === 56 ? c : mod(c - historicalKey[clock++]));
assert.equal(clock, 84);
assert.equal(plain56.map(i => gp.translit[i]).join(""),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");

/** @param {"blocks"|"triples"} geometry @param {number} i @returns {number[]} */
function dataTriple(geometry,i) {
  return geometry === "blocks"
    ? [quotient[i], quotient[i+84], quotient[i+168]]
    : [quotient[3*i], quotient[3*i+1], quotient[3*i+2]];
}
/** @param {number} degree @returns {number[][]} */
function monomials(degree) {
  const result = [];
  for (let t = 0; t <= degree; t++)
    for (let a = 0; a <= t; a++)
      for (let b = 0; b <= t-a; b++)
        result.push([a,b,t-a-b]);
  return result;
}
/** @param {number[]} abc @param {number[][]} exponents @returns {number[]} */
function evaluate(abc,exponents) {
  const powers = abc.map(n => {
    const v = [1]; for (let k = 1; k <= 6; k++) v.push(mod(v[k-1]*n)); return v;
  });
  return exponents.map(([a,b,c]) => mod(powers[0][a]*powers[1][b]*powers[2][c]));
}
/**
 * Exact GF29 augmented-matrix elimination without floating-point arithmetic.
 * @param {number[][]} inputs
 * @param {number[]} targets
 * @returns {{rank:number,augmentedRank:number,consistent:boolean}}
 */
function linearSystem(inputs,targets) {
  const width=inputs[0].length;
  const rows=inputs.map((r,i)=>[...r,targets[i]]);
  let rank=0;
  for(let col=0;col<width && rank<rows.length;col++) {
    let pivot=rank;
    while(pivot<rows.length && rows[pivot][col]===0)pivot++;
    if(pivot===rows.length)continue;
    [rows[rank],rows[pivot]]=[rows[pivot],rows[rank]];
    const scale=inverse(rows[rank][col]);
    for(let j=col;j<=width;j++)rows[rank][j]=mod(rows[rank][j]*scale);
    for(let i=rank+1;i<rows.length;i++) {
      const mult=rows[i][col];
      if(mult)for(let j=col;j<=width;j++)
        rows[i][j]=mod(rows[i][j]-mult*rows[rank][j]);
    }
    rank++;
  }
  const inconsistent=rows.slice(rank).some(row=>row[width]!==0);
  return {rank,augmentedRank:rank+(inconsistent?1:0),consistent:!inconsistent};
}

const results=[];
for(const geometry of ["blocks","triples"]) {
  for(let degree=0;degree<=6;degree++) {
    const exponents=monomials(degree);
    const inputs=Array.from({length:84},(_,i)=>evaluate(dataTriple(geometry,i),exponents));
    const result=linearSystem(inputs,historicalKey);
    const expectedRank=degree===6 && geometry==="blocks" ? 83 : exponents.length;
    const expectedConsistent=degree===6 && geometry==="triples";
    assert.equal(result.rank,expectedRank);
    assert.equal(result.consistent,expectedConsistent);
    // Positive control: one actual degree-3 polynomial fitted under the
    // untouched source triples must remain compatible at all 84 positions.
    if(degree===3) {
      const positive=Array.from({length:84},(_,i)=>{
        const [x,y,z]=dataTriple(geometry,i);
        return mod(7+5*x+11*y+13*z+3*x*y+4*y*z+2*x*x);
      });
      const planted=linearSystem(inputs,positive);
      assert.equal(planted.consistent,true);
      assert.equal(planted.rank,20);
    }
    results.push({geometry,degree,monomials:exponents.length,
      ...result});
  }
}
console.log("Source SHA256 verified, Q252 exact, p56 genuine 84-key recovered.");
console.table(results);
console.log("PASS: all 0..5 stationary polynomial mappings refuted for both layouts.");
console.log("Degree6: 3x84 blocks impossible; adjacent triples exactly interpolatable");
console.log("with 84 free coefficients and no untouched original key positions.");
