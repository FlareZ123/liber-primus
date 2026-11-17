"use strict";

/**
 * Source-native, original-input GP29 mirrored 58-page shared-pad gate.
 * Original physical page pairs p and 57-p (p=0..28), deliberately different
 * from the previously tested 29-page OFFSET pairing p and p+29.
 *
 * For C_A[i]=P_A[i]+K[i]+a and C_B[i]=P_B[i]+K[i]+b (mod29),
 * the equality rate after optimizing an arbitrary global per-pair Caesar
 * difference is a necessary condition for a common same-position pad.
 * The stronger source-natural zero-offset test is performed here: if a=b,
 *   C_A[i] === C_B[i] iff P_A[i] === P_B[i].
 * Every secret K[i], including independently arbitrary symbols, cancels.
 *
 * Windows Node22 SFT: node sims/lp2_reflected58_pagepair_sharedpad_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");

/** @param {string} f @returns {string} */
const read = f => fs.readFileSync(path.join(root, f), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
assert.equal(gp.pages.length, 58);
assert.equal(gp.pages.filter(p => p.page < 56)
  .reduce((s, p) => s + p.indices.length, 0), 12956);

/** @typedef {{left:number,right:number,a:number[],b:number[],n:number}} Pair */
const pairs = [];
for (let page = 2; page < 29; page++) {
  const reflected = 57 - page;
  if (page === 7) { // p50 is the source-original number-only page
    assert.equal(gp.pages[reflected].indices.length, 0);
    continue;
  }
  const a = gp.pages[page].indices;
  const b = gp.pages[reflected].indices;
  pairs.push({left:page, right:reflected, a, b,
    n:Math.min(a.length, b.length)});
}
assert.equal(pairs.length, 26);
assert.equal(pairs.reduce((s, p) => s + p.n, 0), 5402);

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {number[]} a @param {number[]} b @param {number} len
 * @returns {number}
 */
function sameAtStart(a, b, len) {
  let eq = 0;
  for (let i = 0; i < len; i++) eq += Number(a[i] === b[i]);
  return eq;
}

/** @param {Pair} pair @param {number} rotation
 * @param {boolean} backwards @returns {number}
 */
function countPair(pair, rotation, backwards) {
  let eq = 0;
  for (let i = 0; i < pair.n; i++) {
    const rightIndex = backwards ? pair.b.length - 1 - i + rotation
      : i + rotation;
    eq += Number(pair.a[i] === pair.b[
      (rightIndex + pair.b.length) % pair.b.length
    ]);
  }
  return eq;
}

/** @param {number[]} values @returns {number[]} */
function window4(values) {
  return values.slice(0, -3).map((_, index) =>
    values[index] + values[index+1] +
    values[index+2] + values[index+3]);
}

/** @param {number[]} values @param {number} original
 * @returns {{original:number,mean:number,sd:number,ge:number,tail:number}}
 */
function nullSummary(values, original) {
  const n = values.length;
  const mean = values.reduce((s, x) => s + x, 0) / n;
  const variance = values.reduce((s, x) => s + (x-mean)**2, 0)/n;
  const ge = values.filter(x => x >= original).length;
  return {original, mean, sd:Math.sqrt(variance),ge,
    tail:(ge + 1)/(n + 1)};
}

const originalPairStats = pairs.map(p => ({
  left:p.left,right:p.right,n:p.n,
  forward:countPair(p, 0, false),
  backward:countPair(p, 0, true)
}));
const observed = ["forward", "backward"].map(dir =>
  originalPairStats.map(p => p[dir]));
const nTrials = 20000;
const rng = xorshift32(0x33015729);
const directionResults = [];

for (let direction = 0; direction < 2; direction++) {
  const backwards = direction === 1;
  const totalNull = [], oneNull = [], fourNull = [];
  for (let trial = 0; trial < nTrials; trial++) {
    const counts = pairs.map(pair =>
      countPair(pair, Math.floor(rng()*pair.b.length), backwards));
    totalNull.push(counts.reduce((s, x) => s + x, 0));
    oneNull.push(Math.max(...counts));
    fourNull.push(Math.max(...window4(counts)));
  }
  const obs = observed[direction];
  directionResults.push({
    mode:backwards ? "backwards-in-pair" : "forward-in-pair",
    total:nullSummary(totalNull, obs.reduce((s, x) => s + x, 0)),
    singlePairMaximum:nullSummary(oneNull, Math.max(...obs)),
    fourPairMaximum:nullSummary(fourNull, Math.max(...window4(obs)))
  });
}
assert.equal(directionResults[0].total.original, 215);
assert.equal(directionResults[1].total.original, 193);
assert.equal(directionResults[0].total.ge, 373);
assert.equal(directionResults[1].total.ge, 6190);
assert.equal(directionResults[0].fourPairMaximum.original, 52);
assert.equal(directionResults[0].fourPairMaximum.ge, 393);

/** Genuine source-native positive encrypted using fresh nonperiodic GP29
 * pad symbols, identical at each original mirrored page-pair position.
 */
const corpora = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const planted = [];
for (const [author, file] of corpora.entries()) {
  const stream = (read(file).match(/[A-Za-z]+/g) || [])
    .flatMap(word => encodeSourceNativeGP(word));
  const local = xorshift32(0x3301a509);
  // Consume the earlier corpora' random numbers before each next author,
  // making a single reproducible source-independent 3-author experiment.
  // The random result does not affect the key-invariant proof.
  const trials = 2000;
  const totals = [];
  for (let trial = 0; trial < trials; trial++) {
    let sum = 0;
    for (const pair of pairs) {
      const aStart = Math.floor(local()*(stream.length-pair.n));
      const bStart = Math.floor(local()*(stream.length-pair.n));
      const a = stream.slice(aStart, aStart+pair.n);
      const b = stream.slice(bStart, bStart+pair.n);
      const key = Array.from({length:pair.n},
        () => Math.floor(local()*29));
      const c = a.map((x, i) => (x + key[i]) % 29);
      const d = b.map((x, i) => (x + key[i]) % 29);
      const nativeEquals = sameAtStart(a,b,pair.n);
      assert.equal(sameAtStart(c,d,pair.n),nativeEquals);
      // The recovered known plaintext must invert exactly.
      for (let i = 0; i < pair.n; i++) {
        assert.equal((c[i]-key[i]+29)%29,a[i]);
        assert.equal((d[i]-key[i]+29)%29,b[i]);
      }
      sum += nativeEquals;
    }
    totals.push(sum);
  }
  const n=totals.length;
  const mean=totals.reduce((s,x)=>s+x,0)/n;
  const varx=totals.reduce((s,x)=>s+(x-mean)**2,0)/n;
  const below=totals.filter(x=>x<=directionResults[0].total.original).length;
  assert.equal(below,0);
  planted.push({
    author,file,sourceNativeRunes:stream.length,trials,
    mean,sd:Math.sqrt(varx),minimum:Math.min(...totals),
    maximum:Math.max(...totals),
    asFewAsOriginal:below,lowerTailBound:(below+1)/(n+1)
  });
}

if (require.main === module) console.log(JSON.stringify({
  classification:"bounded negative for source-natural 58-page mirror shared pad, no plaintext",
  originalRunes:12956,reflectedPairs:pairs.length,
  originalPairPositions:pairs.reduce((s,p)=>s+p.n,0),
  sourceNaturalControls:planted,
  originalPairStats,directionResults,
  interpretation:"Both original forward and reverse mirrored page-pair coincidences are much lower than source-native common-pad encryption, despite a mild forward-vs-circular-shift enrichment. This rejects the specific common-pad native English route, not every mirrored page operation."
},null,2));
