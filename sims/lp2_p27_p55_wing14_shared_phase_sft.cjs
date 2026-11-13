"use strict";
/**
 * Source-anchored wing-14 original-cipher SFT. Original p27's wing has
 * fourteen segmented membrane faces under the existing reproducible
 * original-JPEG rule. The book's only repeated complete six-rune word
 * pair lies at local offsets p27:28 and p55:70, both zero mod fourteen.
 * Test whether one arbitrary GP29 alphabet bijection per 14 page-local
 * phases can turn native GP English into both original pages.
 *
 * Node.js 22, CommonJS, no networking or guessed keys.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const original = [gp.pages[27].indices, gp.pages[55].indices];
assert.deepEqual(original.map(p => p.length), [234, 76]);
const echo = [23, 11, 1, 17, 18, 10];
assert.deepEqual(original[0].slice(28, 34), echo);
assert.deepEqual(original[1].slice(70, 76), echo);
assert.equal(28 % 14, 0);
assert.equal(70 % 14, 0);
/**
 * Same-page-local-phase equal-rune pair count, pooled across two pages.
 * Invariant under arbitrary fixed secret bijection at each of 14 phases.
 * @param {number[]} a
 * @param {number[]} b
 */
function score(a, b) {
  const counts = Array.from({length:14}, () => new Uint32Array(29));
  for (const page of [a,b]) page.forEach((v,i) => counts[i % 14][v]++);
  let pairs = 0, hits = 0;
  for (const row of counts) {
    const n = row.reduce((x,y) => x+y, 0);
    pairs += n*(n-1)/2;
    hits += row.reduce((x,y) => x+y*(y-1)/2, 0);
  }
  return {pairs,hits,rate:hits/pairs};
}
const actual = score(...original);
assert.deepEqual([actual.pairs,actual.hits], [3282,108]);
/** A private, invertible source-independent 14-phase cipher plant. */
function plant(x) {
  return x.map((v,i) => (11*v + 7*(i % 14) + 3) % 29);
}
const references = [
  ["Shakespeare","resources/control/shakespeare_first300k.txt",6994],
  ["Gibran","resources/control/gibran_prophet_58585.txt",2006],
  ["Emerson","resources/control/emerson_essays_2944.txt",10356]
];
const controls = [];
for (const [name,file,expectedWindows] of references) {
  const runes = encodeSourceNativeGP(fs.readFileSync(path.join(root,file),"utf8"));
  const pieces = [runes.slice(0,234),runes.slice(234,310)];
  const baseline = score(...pieces);
  const encoded = score(...pieces.map(plant));
  assert.deepEqual([encoded.pairs,encoded.hits],
    [baseline.pairs,baseline.hits], "14-phase plant");
  let min = Infinity, windows = 0;
  for (let i=0; i+310<=runes.length; i+=31) {
    const candidate=score(runes.slice(i,i+234),runes.slice(i+234,i+310));
    min=Math.min(min,candidate.rate);
    windows++;
  }
  assert.equal(windows,expectedWindows);
  assert.ok(min>actual.rate,"original below native-GP reference windows");
  controls.push({name,sourceNativeGP29Runes:runes.length,
    windows,minimumCollisionRate:min,positivePlant:true});
}
console.log(JSON.stringify({
  source:"Original p27 wing 14 cells; p27:28 and p55:70 DJU BEI",
  original:{pageLengths:[234,76],marker:echo,phaseCount:14,...actual},
  architecture:"Shared arbitrary secret GP29 bijection at each of 14 page-local phases",
  controls,sourceNativeEnglishFamilyExcluded:true,
  authenticUnknownPlaintextRecovered:false
},null,2));
