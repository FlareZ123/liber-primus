"use strict";
/**
 * Source-constrained differential phi(prime) inverse with literal-F bypass.
 *
 * Combining the established p56 totient key rule with the conspicuous LP2
 * ciphertext anti-doublet observation motivates one reversible experiment:
 *   D_i = C_i - C_{i-1} mod 29
 *   F(0) emits D_i=0 and does not advance the prime key clock;
 *   any other plaintext rune P_i emits D_i=P_i+(p_k-1) mod29,
 *   advancing k. The opposite sign is a wrong-rule control.
 *
 * This grants every possible literal-F assignment, rather than guessing
 * whether a ciphertext zero-difference is a bypass; the strict forward
 * cipher never encrypts a plaintext F in the normal key-consuming branch.
 * The author does not directly specify cumulative ciphertext feedback, so
 * this is a bounded new consumer of two source clues, not a claimed decoder.
 *
 * Run with Node 22: node sims/lp2_delta_primephi_strictf_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources/liber-primus/lp2-corpus.json"),
  "utf8"));
/** @param {number} x @returns {number} */
const mod = (x) => (x % 29 + 29) % 29;
/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const out = [];
  for (let candidate = 2; out.length < n; candidate++) {
    let isPrime = true;
    for (let factor = 2; factor * factor <= candidate; factor++) {
      if (candidate % factor === 0) { isPrime = false; break; }
    }
    if (isPrime) out.push(candidate);
  }
  return out;
}
const primes = firstPrimes(13000);
const shifts = primes.map((p) => (p - 1) % 29);
assert.deepEqual(primes.slice(0, 7), [2, 3, 5, 7, 11, 13, 17]);
/** @param {string} phrase @returns {number[]} */
function gp(phrase) {
  const token = corpus.translit.map((text, i) => ({ text, i }))
    .sort((a, b) => b.text.length - a.text.length);
  const result = [];
  for (const word of phrase.split(" ")) {
    for (let j = 0; j < word.length;) {
      const t = token.find((x) => word.startsWith(x.text, j));
      assert.ok(t);
      result.push(t.i);
      j += t.text.length;
    }
  }
  return result;
}
/**
 * Exact literal-F differential encryption. A fixed positive plant uses
 * solved-p56 plaintext, with its one strict-F bypass at source index 56.
 * @param {number[]} plaintext
 * @param {1|-1} sign
 * @returns {number[]}
 */
function encode(plaintext, sign) {
  let previous = 0;
  let k = 0;
  const out = [];
  for (const p of plaintext) {
    const delta = p === 0 ? 0 : mod(p + sign * shifts[k++]);
    previous = mod(previous + delta);
    out.push(previous);
  }
  return out;
}
/**
 * Exact DP: retain all accessible key clocks, merging equivalent states.
 * A normal symbol may never decode as F under the strict solved-page rule.
 * The literal-F branch is available iff observed delta is zero.
 * @param {number[]} cipher
 * @param {1|-1} sign
 * @param {number} [start=0]
 * @returns {{ complete:boolean, firstImpossible:number, finalClockCount:number,
 *              repeatCount:number, maxClockCount:number }}
 */
function invertAllLiteralFMasks(cipher, sign, start = 0) {
  let previous = 0;
  let states = new Set([start]);
  let zeroDeltas = 0;
  let maxClockCount = 1;
  for (let i = 0; i < cipher.length; i++) {
    const delta = mod(cipher[i] - previous);
    previous = cipher[i];
    if (delta === 0) zeroDeltas++;
    const next = new Set();
    for (const k of states) {
      const plain = mod(delta - sign * shifts[k]);
      if (plain !== 0) next.add(k + 1);
      if (delta === 0) next.add(k);
    }
    states = next;
    maxClockCount = Math.max(maxClockCount, states.size);
    if (states.size === 0) {
      return {complete:false,firstImpossible:i,finalClockCount:0,
        repeatCount:zeroDeltas,maxClockCount};
    }
  }
  return {complete:true,firstImpossible:-1,finalClockCount:states.size,
    repeatCount:zeroDeltas,maxClockCount};
}
const p = (n) => corpus.pages.find((x) => x.page === n).indices;
/** @type {{name:string,cipher:number[]}[]} */
const originals = [
  {name:"physical_p55_local_start",cipher:p(55)},
  {name:"final_visual_chapter_p54_to_p55",cipher:[...p(54), ...p(55)]},
  {name:"opening_visual_chapter_p0_to_p2",
    cipher:[...p(0),...p(1),...p(2)]}
];
assert.deepEqual(originals.map((o) => o.cipher.length), [76,308,729]);
const solvedWords =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const solvedPlain = gp(solvedWords);
assert.equal(solvedPlain.length, 85);
// Authentic p56 must be reproduced first with its actual plain-F bypass.
const p56 = p(56);
let cursor = 0;
const sourceReencrypt = solvedPlain.map((v) =>
  v === 0 ? 0 : mod(v + shifts[cursor++]));
assert.deepEqual(sourceReencrypt,p56);
assert.deepEqual(solvedPlain.map((v,i) => v === 0 ? i : -1)
  .filter((i) => i >= 0), [56]);
const report = {name:"source-phi additive after cumulative GP29 difference",
  cipherRule:"D_i=P_i+sign*(prime_k-1) mod29; P_i=F bypass D_i=0, k stays",
  originalLengths:originals.map((x) => [x.name,x.cipher.length]),
  knownP56DirectTotientCheck:85,
  positivePlant:{},original:{}};
for (const sign of /** @type {(1|-1)[]} */ ([1,-1])) {
  const planted = encode(solvedPlain,sign);
  const inverse = invertAllLiteralFMasks(planted,sign);
  assert.equal(inverse.complete,true,"known-text plant must survive all-key DP");
  let previous = 0,k = 0;
  const decoded = planted.map((c,i) => {
    const delta = mod(c-previous);
    previous=c;
    if(solvedPlain[i]===0){assert.equal(delta,0);return 0;}
    const v=mod(delta-sign*shifts[k++]);
    assert.notEqual(v,0);
    return v;
  });
  assert.deepEqual(decoded,solvedPlain);
  assert.deepEqual(encode(decoded,sign),planted);
  report.positivePlant[sign] = {runes:85,
    exactReencryption:true,validLiteralFState:true,
    fIndex:56,finalClockCount:inverse.finalClockCount};
  for(const x of originals) {
    const result=invertAllLiteralFMasks(x.cipher,sign);
    assert.equal(result.complete,false);
    const starts = Array.from({length:29}, (_, start) =>
      invertAllLiteralFMasks(x.cipher, sign, start));
    const survivors = starts.flatMap((v, k) => v.complete ? [k] : []);
    if (x.cipher.length > 76) assert.deepEqual(survivors, []);
    report.original[x.name+" sign"+sign] = {
      ...result, first29PrimeStartSurvivors: survivors,
      max29StartValidPrefix: Math.max(...starts.map((v) =>
        v.complete ? x.cipher.length : v.firstImpossible))
    };
  }
}
console.log(JSON.stringify(report,null,2));
