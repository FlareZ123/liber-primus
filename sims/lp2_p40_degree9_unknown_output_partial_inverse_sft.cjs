"use strict";
/**
 * Original LP2 p40–53: recover every ciphertext-inferred partial plaintext
 * under the source degree-nine GF29 scalar recurrence and an arbitrary
 * UNKNOWN fixed 29-way output bijection, per illustrated chapter reset.
 *
 * Each equal-neighbor site is hypothesized to mark GP plaintext F; if its
 * ciphertext is v, then secret S-box[hidden LFSR scalar] = v. Solving
 * same-output recurrence equations leaves a two-dimensional seed space.
 * Invertible S-box tests retain exactly seven scalar-projective candidates.
 * This recovers 37–40% of p40–53 plaintext with *no* fitted S-box entries.
 *
 * Compare all seven candidate partial inverses with independent source-native
 * GP English on the EXACT SAME revealed-coordinate masks. No text recovered.
 *
 * Windows Node 22: node sims/lp2_p40_degree9_unknown_output_partial_inverse_sft.cjs
 * Read-only, no packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const pages = JSON.parse(read("resources/liber-primus/lp2-corpus.json")).pages;
const c = pages.filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices);
assert.equal(c.length, 3008);
const polynomial = [11,15,0,9,1,5,10,20,12,1];
const mod = value => ((value % 29) + 29) % 29;
const sites = [];
for (let i = 1; i < c.length; i++)
  if (c[i] === c[i-1]) sites.push({at:i,value:c[i]});
assert.equal(sites.length, 18);
const letters = new Set(sites.map(e=>e.value));
assert.equal(letters.size, 11);
/** @param {number[]} seed */
function recurrence(seed) {
  const result = seed.slice();
  for (let i = 9; i < c.length; i++) {
    let t = 0;
    for (let j = 0; j < 9; j++)
      t += polynomial[j] * result[i-9+j];
    result.push(mod(-t));
  }
  return result;
}
/**
 * These exact seven projective representative seeds arise from solving
 * seven independent same-label constraints, leaving free coefficients 7,8.
 * Six satisfy (free7=1,free8=2/4/9/17/20/26); seventh is (0,1).
 * Every nonzero scalar multiple yields the SAME inferred partial plaintext
 * and S-box relabeling. Full 29^2 member enumeration below proves completeness.
 */
const representatives=[
  [7,16,12,25,8,21,12,1,2],
  [20,8,15,11,25,16,6,1,4],
  [9,17,8,5,24,18,20,1,9],
  [3,14,20,7,5,27,25,1,17],
  [8,2,10,15,16,5,16,1,20],
  [18,7,19,2,9,19,27,1,26],
  [21,25,16,22,23,12,26,0,1]
];
const basis7 = recurrence(representatives[0].map((v,i) =>
  mod(v - 2 * representatives[6][i])));
const basis8 = recurrence([21,25,16,22,23,12,26,0,1]);
/** @param {number[]} key */
function mapping(key) {
  const map=new Map(),reverse=new Map();
  for (const site of sites) {
    const hidden=key[site.at];
    if (map.has(hidden) && map.get(hidden) !== site.value) return null;
    if (reverse.has(site.value) && reverse.get(site.value) !== hidden)
      return null;
    map.set(hidden,site.value);
    reverse.set(site.value,hidden);
  }
  return map.size === 11 ? map : null;
}
let feasible=0;
const signatures=new Set();
for(let x=0;x<29;x++)for(let y=0;y<29;y++) {
  const key=basis7.map((v,i)=>mod(x*v+y*basis8[i]));
  if(!mapping(key))continue;
  feasible++;
  const inv=x===0?1:Array.from({length:29},(_,i)=>i)
    .find(i=>i*x%29===1);
  const slope=x===0?"inf":String(mod(y*inv));
  signatures.add(slope);
}
assert.equal(feasible,196);
assert.deepEqual([...signatures].sort(),
  ["17","2","20","26","4","9","inf"].sort());
/** @param {number[]} values */
function indexOfCoincidence(values) {
  const histogram=Array(29).fill(0);
  for(const x of values)histogram[x]++;
  return histogram.reduce((sum,n)=>sum+n*(n-1),0)/
    (values.length*(values.length-1));
}
/** @param {string} file */
function nativeEnglish(file) {
  const words=read(file).toUpperCase().match(/[A-Z]+/g)||[];
  return words.flatMap(encodeSourceNativeGP);
}
const sources=[
  {name:"Shakespeare",data:nativeEnglish("resources/control/shakespeare_first300k.txt")},
  {name:"Gibran",data:nativeEnglish("resources/control/gibran_prophet_58585.txt")}
];
assert(sources.every(s=>s.data.length > 3008));
for(const source of sources){
  const hist=Array(29).fill(1);
  for(const v of source.data)hist[v]++;
  const denom=hist.reduce((sum,v)=>sum+v,0);
  source.freq=hist.map(v=>v/denom);
}
/** @param {number[]} plaintext @param {number[]} freqs */
function score(plaintext,freqs) {
  return plaintext.reduce((sum,x)=>sum+Math.log(29*freqs[x]),0)/
    plaintext.length;
}
const results=[];
let minimumControlIoC=Infinity,minimumControlScore=Infinity;
for(const seed of representatives) {
  const hidden=recurrence(seed),keyMap=mapping(hidden);
  assert(keyMap);
  const revealed=[],positions=[];
  for(let i=0;i<c.length;i++){
    const mask=keyMap.get(hidden[i]);
    if(mask===undefined)continue;
    positions.push(i);
    revealed.push(mod(c[i]-mask));
  }
  assert(positions.length>=1100 && positions.length<=1220);
  const controls=[];
  for(const source of sources) {
    const sourceWindows=[];
    for(let start=0;start+c.length<=source.data.length;start+=c.length){
      const knownPlain=positions.map(i=>source.data[start+i]);
      const ioc=indexOfCoincidence(knownPlain);
      const ll=score(knownPlain,source.freq);
      minimumControlIoC=Math.min(minimumControlIoC,ioc);
      minimumControlScore=Math.min(minimumControlScore,ll);
      sourceWindows.push({ioc,ll});
    }
    controls.push({source:source.name,windows:sourceWindows.length,
      sampleMinimumIoC:Math.min(...sourceWindows.map(x=>x.ioc)),
      sampleMinimumNatsPerRune:Math.min(...sourceWindows.map(x=>x.ll)),
      originalNatsPerRune:score(revealed,source.freq)});
  }
  results.push({freeSeed:[seed[7],seed[8]],fullyConstrainedOutputClasses:11,
    revealedRunes:revealed.length,maskedIoC:indexOfCoincidence(revealed),
    controls});
}
assert.equal(results.length,7);
assert(Math.max(...results.map(x=>x.maskedIoC))<0.040);
assert(minimumControlIoC>0.050);
assert(results.every(r=>r.controls.every(z=>z.originalNatsPerRune<0)));
assert(minimumControlScore>0);
console.log(JSON.stringify({
  originalChapter:"p40–53",runes:c.length,sourceDoublets:sites.length,
  sourceVisibleMarkerClasses:letters.size,
  exactAllSecretTwoCoefficientStates:29*29,
  feasibleFullSecretPermutationSeedStates:feasible,
  distinctPartialPlaintextCandidates:results.length,
  results,minimumHeldoutEnglishControlIoC:minimumControlIoC,
  minimumHeldoutEnglishControlNatsPerRune:minimumControlScore,
  unknownPlaintextRecovered:false,
  decision:"Every source-constrained sparse original inverse remains near uniform, while same-coordinate native GP-English is strongly nonuniform"
},null,2));
