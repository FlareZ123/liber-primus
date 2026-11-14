"use strict";

/**
 * Source-selected lag-eight linear feedback inverse on original LP2 ciphertext.
 *
 * Run: node sims/lp2_fibonacci_lag8_source_scalar_feedback_sft.cjs
 * Uses original 55 nonempty unsolved pages, the independently solved p57,
 * and the ten source-numbered Fibonacci pages. Node.js 22, no dependencies.
 *
 * Hypothesis: D_i = R_i + a*D_(i-8) mod 29, where D_i=C_i-C_(i-1).
 * C_0...C_8 supply the nine source-visible IV runes per page.
 * This rule is an exploratory candidate, not an authenticated Cicada cipher.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

/** @param {number} n @returns {number} */
const mod = (n) => ((n % 29) + 29) % 29;

/** @param {number[]} cipher @param {number} slope @returns {number[]} */
function decode(cipher, slope) {
  assert.ok(cipher.length >= 9);
  const step = cipher.map((c, i) => i ? mod(c - cipher[i - 1]) : 0);
  return step.slice(9).map((value, k) =>
    mod(value - slope * step[k + 1]));
}

/** @param {number[]} iv @param {number[]} plain @param {number} slope
 *  @returns {number[]} */
function encode(iv, plain, slope) {
  assert.equal(iv.length, 9);
  const cipher = iv.slice();
  const step = [0];
  for (let i = 1; i < iv.length; i++)
    step.push(mod(iv[i] - iv[i - 1]));
  for (const rune of plain) {
    const i = cipher.length;
    const nextStep = mod(rune + slope * step[i - 8]);
    step.push(nextStep);
    cipher.push(mod(cipher[i - 1] + nextStep));
  }
  return cipher;
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const c of symbols) counts[c]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {number[]} pages @param {number} slope @returns {number[]} */
function channel(pages, slope) {
  return pages.flatMap((p) => decode(corpus.pages[p].indices, slope));
}


/**
 * Key-independent concentration capacity over arbitrary page-specific scalar
 * and page-specific 29-symbol permutation secrets.
 * @param {number[]} pages @returns {{one:number,two:number,n:number,eightPhaseRelaxedOne:number,eightPhaseRelaxedTwo:number}}
 */
function allSecretCapacity(pages) {
  let one=0,two=0,n=0,eightPhaseRelaxedOne=0,eightPhaseRelaxedTwo=0;
  for(const page of pages){
    const cipher=corpus.pages[page].indices;
    const step=cipher.slice(1).map((x,i)=>mod(x-cipher[i]));
    n+=cipher.length-9;
    let largest=0,largest2=0;
    for(let a=0;a<29;a++){
      const bins=Array(29).fill(0);
      for(let i=8;i<step.length;i++)bins[mod(step[i]-a*step[i-8])]++;
      bins.sort((x,y)=>y-x);
      largest=Math.max(largest,bins[0]);
      largest2=Math.max(largest2,bins[0]+bins[1]);
    }
    one+=largest;two+=largest2;
    // A deliberately generous upper bound permitting eight different
    // slopes and even independent relabelings on each eight-phase lane.
    for(let phase=0;phase<8;phase++){
      let phaseLargest=0,phaseLargest2=0;
      for(let a=0;a<29;a++){
        const bins=Array(29).fill(0);
        for(let i=8;i<step.length;i++)
          if(i%8===phase)bins[mod(step[i]-a*step[i-8])]++;
        bins.sort((x,y)=>y-x);
        phaseLargest=Math.max(phaseLargest,bins[0]);
        phaseLargest2=Math.max(phaseLargest2,bins[0]+bins[1]);
      }
      eightPhaseRelaxedOne+=phaseLargest;
      eightPhaseRelaxedTwo+=phaseLargest2;
    }
  }
  return{one,two,n,eightPhaseRelaxedOne,eightPhaseRelaxedTwo};
}

function main() {
  const unknown = corpus.pages.slice(0, 56);
  const fibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
  const trio = [8, 13, 21];
  const all = Array.from({length: 56}, (_, i) => i).filter(
    (p) => corpus.pages[p].indices.length > 0);
  assert.equal(unknown.reduce((sum, p) => sum + p.indices.length, 0), 12956);
  assert.equal(all.length, 55);
  assert.equal(corpus.pages[50].indices.length, 0);
  assert.equal(channel(fibonacci, 0).length, 2256);
  assert.equal(channel(trio, 0).length, 773);
  assert.equal(channel(all, 0).length, 12461);
  const capacity=allSecretCapacity(fibonacci);
  assert.deepEqual(capacity,{one:177,two:316,n:2256,
    eightPhaseRelaxedOne:419,eightPhaseRelaxedTwo:685});
  assert.ok(capacity.one<195 && capacity.two<386);
  assert.ok(capacity.eightPhaseRelaxedOne>195);

  // Frozen observed values: exact unmodified input, no fitted key or phase.
  const expected = {
    0: [0.03546217231998239, 0.036349864936, 0.035315706674],
    1: [0.0347057759745876, 0.034818250675, 0.034477392901],
    8: [0.03445652686700948, 0.034104391074, 0.034464614670],
    17: [0.034522573949143744, 0.034469699509, 0.034516886909],
    24: [0.03456346023808401, 0.034493159683, 0.034473206484]
  };

  const solved = corpus.pages[57].indices;
  assert.equal(solved.length, 95);
  for (const a of Array.from({length: 29}, (_, i) => i)) {
    // Every proposed decoder is exactly reversible on every original page.
    for (const page of all) {
      const cipher = corpus.pages[page].indices;
      assert.deepEqual(encode(cipher.slice(0, 9), decode(cipher, a), a), cipher);
    }
    // Independent real-Cicada GP language, encrypted as a synthetic positive.
    for (const p of fibonacci) {
      const iv = corpus.pages[p].indices.slice(0, 9);
      const n = corpus.pages[p].indices.length - 9;
      const plain = Array.from({length: n}, (_, i) => solved[i % solved.length]);
      const encrypted = encode(iv, plain, a);
      assert.deepEqual(decode(encrypted, a), plain);
    }
    const observed = [channel(fibonacci, a), channel(trio, a), channel(all, a)];
    for (const stream of observed) assert.equal(stream.every(
      (rune) => Number.isInteger(rune) && rune >= 0 && rune <= 28), true);
    if (Object.prototype.hasOwnProperty.call(expected, a)) {
      const wanted = expected[a];
      for (let k = 0; k < 3; k++) {
        assert.ok(Math.abs(ioc(observed[k]) - wanted[k]) < 1e-11,
          "Unchanged original-channel IoC must match the frozen value");
      }
    }
  }

  const scored = Array.from({length: 29}, (_, a) => ({
    slope: a, ioc: ioc(channel(fibonacci, a))
  })).sort((a, b) => b.ioc - a.ioc);
  assert.equal(scored[0].slope, 0);
  assert.ok(scored[0].ioc < 0.036);
  const planted = fibonacci.flatMap((p) =>
    Array.from({length: corpus.pages[p].indices.length - 9},
      (_, i) => solved[i % solved.length]));
  assert.ok(ioc(planted) > 0.05,
    "Independent solved-GP positive must have language-like distribution");

  const relevant = [0, 1, 8, 17, 24].map((a) => ({
    slope: a,
    fibonacciIoc: ioc(channel(fibonacci, a)),
    tripleIoc: ioc(channel(trio, a)),
    allPagesIoc: ioc(channel(all, a))
  }));
  console.log(JSON.stringify({
    model: "D_i = R_i + slope * D_(i-8), original 9-rune page IV",
    pages: all.length,
    unknownRunes: 12956,
    originalFibonacciTail: 2256,
    sourceSlopeReadouts: relevant,
    allPageSecretCapacity: capacity,
    strongestOf29: scored[0],
    exactOriginalRoundTrips: 29 * all.length,
    solvedPageNativePositiveRoundTrips: 29 * fibonacci.length,
    solvedGpNativePlantIoc: ioc(planted),
    result: "No directly readable GP-native plaintext at any fixed scalar"
  }, null, 2));
}

if (require.main === module) main();
module.exports = {decode, encode, channel, ioc, mod, allSecretCapacity};
