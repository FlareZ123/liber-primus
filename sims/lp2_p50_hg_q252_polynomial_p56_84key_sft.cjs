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


/**
 * General fractional rational readout k = N(x,y,z)/D(x,y,z) in GF29.
 * Both N and D have independent arbitrary coefficients of total degree <= d.
 * The source/known-key constraints N(x_i)-k_i D(x_i)=0 are homogeneous;
 * if the full matrix has column rank 2*monomials, ONLY N=D=0 works,
 * which is invalid because D must be nonzero at every source position.
 * This excludes all Möbius/affine-ratio functions without fitting any keys.
 * A degree-2 rational positive uses D=x^2+2, never zero in GF29.
 */
const rationalResults = [];
for(const geometry of ["blocks","triples"]) {
  for(let degree=0; degree<=4; degree++) {
    const exponents=monomials(degree);
    const rows=Array.from({length:84},(_,i)=>{
      const v=evaluate(dataTriple(geometry,i),exponents);
      return [...v,...v.map(x=>mod(-historicalKey[i]*x))];
    });
    const constraint=linearSystem(rows,Array(84).fill(0));
    assert.equal(constraint.rank,2*exponents.length);
    rationalResults.push({geometry,degree,
      freeNumeratorAndDenominatorCoefficients:2*exponents.length,
      exactConstraintRank:constraint.rank,
      nonzeroRationalSolution:false});
    if(degree===2) {
      const values=Array.from({length:84},(_,i)=>{
        const [x,y,z]=dataTriple(geometry,i);
        const numerator=mod(7+5*x+11*y+13*z+3*x*y+4*y*z+2*x*x);
        const denominator=mod(x*x+2);
        assert.notEqual(denominator,0);
        return mod(numerator*inverse(denominator));
      });
      const plantRows=Array.from({length:84},(_,i)=>{
        const v=evaluate(dataTriple(geometry,i),exponents);
        return [...v,...v.map(x=>mod(-values[i]*x))];
      });
      const plant=linearSystem(plantRows,Array(84).fill(0));
      assert.ok(plant.rank<2*exponents.length);
    }
  }
}
console.table(rationalResults);
console.log("PASS: no fixed three-input rational readout N/D through degree4");
console.log("can reproduce all 84 historical p56 key runes in either Q252 layout.");


/**
 * Historical positional BASE29 + TOTIENT: every three Q252 symbols are one
 * number, then φ(number) mod29 is a candidate GP key symbol. The two frozen
 * 3x84 layouts and big/little digit readings are tested directly against the
 * authentic historical 84-key p56 target and original unknown p55/p0 runes.
 * This number-theoretic consumer is independent of the polynomial/rational
 * readout tests above. No key values are fitted to plaintext.
 * @param {number} n @returns {number}
 */
function totient(n) {
  assert.ok(Number.isInteger(n) && n >= 1);
  let value=n,remaining=n;
  for(let p=2;p*p<=remaining;p++) {
    if(remaining%p===0) {
      while(remaining%p===0)remaining/=p;
      value-=value/p;
    }
  }
  if(remaining>1)value-=value/remaining;
  return value;
}
/** @param {number[]} data @returns {number} */
function coincidence(data) {
  const cnt=Array(29).fill(0);
  for(const v of data)cnt[v]++;
  return cnt.reduce((acc,v)=>acc+v*(v-1),0)/(data.length*(data.length-1));
}
const totientResults=[];
const expectedMatches=[0,3,5,4]; // blocks-big, blocks-little, triples-big, triples-little
const expectedP55Ioc=[
  0.041403508771929824,0.03859649122807018,
  0.029473684210526315,0.03368421052631579
];
const expectedP0Ioc=[
  0.03360533473721155,0.03340060249773332,
  0.034658243397385276,0.0332251177210377
];
for(const geometry of ["blocks","triples"]) {
  for(const endian of ["big","little"]) {
    const key=Array.from({length:84},(_,i)=>{
      const digits=dataTriple(geometry,i);
      if(endian==="little")digits.reverse();
      const n=digits[0]*29*29+digits[1]*29+digits[2];
      assert.ok(n>0 && n<29*29*29);
      return mod(totient(n));
    });
    const match=key.filter((v,i)=>v===historicalKey[i]).length;
    const decrypt=values=>values.map((v,i)=>mod(v-key[i%84]));
    const p55=gp.pages[55].indices, p0=gp.pages[0].indices;
    const decoded55=decrypt(p55), decoded0=decrypt(p0);
    const ref=gp.pages[57].indices.slice(0,76);
    const planted=ref.map((v,i)=>mod(v+key[i%84]));
    assert.deepEqual(decrypt(planted),ref);
    const idx=totientResults.length;
    assert.equal(match,expectedMatches[idx]);
    assert.ok(Math.abs(coincidence(decoded55)-expectedP55Ioc[idx])<1e-12);
    assert.ok(Math.abs(coincidence(decoded0)-expectedP0Ioc[idx])<1e-12);
    totientResults.push({geometry,endian,matchHistoricalKey:match,
      p55OriginalIoc:coincidence(decoded55),p0OriginalIoc:coincidence(decoded0),
      first18P55:decoded55.slice(0,18).map(i=>gp.translit[i]).join(" ")});
  }
}
console.table(totientResults);
console.log("PASS: SOURCE BASE29+TOTIENT 3-digit key masks tested on original");
console.log("p56 historical key, p55 and p0 unknown rune pages; native plant exact.");


/**
 * Exact authentic plaintext-F-transparent consumer, including all possible
 * bypass clocks, rather than treating every ciphertext F as a skipped rune.
 * P=0 is transmitted as literal ciphertext 0 without consuming K. Any
 * nonzero plaintext is emitted as (P+K)%29, consuming one K element, so if
 * a consumed candidate would be P=0 it is inadmissible. The key restarts
 * from clock0 for each separately tested original page.
 * @param {number[]} cipher
 * @param {number[]} key
 * @returns {{firstDead:number|null,remainingClocks:number[]}}
 */
function transparentFPaths(cipher,key) {
  let clocks=new Set([0]);
  for(let i=0;i<cipher.length;i++) {
    const next=new Set();
    for(const t of clocks) {
      const p=mod(cipher[i]-key[t%key.length]);
      if(p!==0)next.add(t+1);
      if(cipher[i]===0)next.add(t);
    }
    clocks=next;
    if(!clocks.size)return {firstDead:i,remainingClocks:[]};
  }
  return {firstDead:null,remainingClocks:[...clocks].sort((a,b)=>a-b)};
}
const authenticKnown=transparentFPaths(gp.pages[56].indices,historicalKey);
assert.equal(authenticKnown.firstDead,null);
assert.ok(authenticKnown.remainingClocks.includes(84));
const expectedDead55=[null,12,null,7];
const expectedDead0=[44,2,135,161];
let tapeIdx=0;
for(const geometry of ["blocks","triples"])for(const endian of ["big","little"]) {
  const key=Array.from({length:84},(_,i)=>{
    const d=dataTriple(geometry,i);
    if(endian==="little")d.reverse();
    return mod(totient(d[0]*841+d[1]*29+d[2]));
  });
  const p55=transparentFPaths(gp.pages[55].indices,key);
  const p0=transparentFPaths(gp.pages[0].indices,key);
  assert.equal(p55.firstDead,expectedDead55[tapeIdx]);
  assert.equal(p0.firstDead,expectedDead0[tapeIdx]);
  if(tapeIdx===0)assert.deepEqual(p55.remainingClocks,[73,74]);
  if(tapeIdx===2)assert.deepEqual(p55.remainingClocks,[73,76]);
  console.log("literal-F exact gate",geometry,endian,
    {p55FirstInvalidRune:p55.firstDead,p55RemainingClocks:p55.remainingClocks,
      p0FirstInvalidRune:p0.firstDead});
  tapeIdx++;
}
assert.equal(tapeIdx,4);
console.log("PASS: exact historical p56 plaintext-F skip positive plus original negative gates.");
