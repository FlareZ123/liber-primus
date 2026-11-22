"use strict";

/**
 * Source-fixed five-stream nonlinear scroll inverse for Director #2263.
 *
 * The full original p3-p7 scroll is 1145=229x5 GP runes. The five final
 * original p7 red-word GP29 ordinal products are [11,26,8,15,2]. The
 * source-inspired but UNAUTHENTICATED operation below uses five triangular
 * quadratic shears in this exact key order. It is genuinely nonlinear and
 * has an inverse for every one of 29^5 complete input blocks.
 *
 * This tests exactly one reversible hypothesis and its first-party controls;
 * no phase, secret state, source orientation or score tuning is attempted.
 *
 * Run: node sims/lp2_2263_five_scroll_nonlinear_shear_sft.cjs
 * Node 22/CommonJS, read-only, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(base, p), "utf8").replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const m = new Map(gp.runes.map((c,i) => [c,i]));
const redWords = ["ᛞᚩ", "ᛟᛏᚦᚫ", "ᚳᚹᛄ", "ᛉᛠ", "ᚷᛠᛗ"];
const key = redWords.map(w => Array.from(w, c => m.get(c))
  .reduce((product, index) => product * index % 29, 1));
assert.deepEqual(key, [11,26,8,15,2]);
assert.deepEqual(redWords.join("").split("").map(c => m.get(c)),
  gp.pages[7].indices.slice(194,208), "the original printed red words, no inferred key");

const whole = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const pageLengths = gp.pages.slice(3,8).map(p => p.indices.length);
assert.deepEqual(pageLengths, [217,261,263,196,208]);
const stream = gp.pages.slice(3,8).flatMap(p => p.indices);
assert.equal(stream.length, 5 * 229);
assert.deepEqual(whole.slice(729,1874), stream);
const mod = n => ((n % 29) + 29) % 29;

/** 
 * Nonlinear coordinate shear. One component changes per round; the reverse
 * round can always restore it from the four untouched/current components.
 * @param {number[]} input
 * @param {number[]} k
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function crypt(input, k, encrypt) {
  assert.equal(input.length % 5, 0, "only fully original five-lane blocks");
  const result = [];
  for (let i = 0; i < input.length; i += 5) {
    const state = input.slice(i, i + 5);
    const rounds = encrypt ? [0,1,2,3,4] : [4,3,2,1,0];
    for (const r of rounds) {
      const other = state[(r + 1) % 5] ** 2 + state[(r + 2) % 5];
      state[r] = mod(state[r] + (encrypt ? 1 : -1) * k[r] * other);
    }
    result.push(...state);
  }
  return result;
}
const encrypt = (runes,k=key) => crypt(runes,k,true);
const decrypt = (runes,k=key) => crypt(runes,k,false);
const plainCandidate = decrypt(stream);
assert.deepEqual(encrypt(plainCandidate), stream,
  "the complete unchanged original p3-p7 source is reproduced exactly");
assert.equal(plainCandidate.length, 1145);

// Check every possible value of each coordinate along the true inverse path.
for (let x = 0; x < 29; x++) for (let y = 0; y < 29; y++) {
  const plant = [x,y,28-x,28-y,mod(3*x+7*y)];
  assert.deepEqual(decrypt(encrypt(plant)), plant);
}
function stats(input) {
  const frequency = new Uint32Array(29);
  for (const v of input) frequency[v]++;
  const N = input.length;
  return {runes:N, ioc:frequency.reduce((s,n)=>s+n*(n-1),0)/(N*(N-1)),
    mostCommon:[...frequency].sort((a,b)=>b-a).slice(0,5)};
}
const before = stats(stream);
const after = stats(plainCandidate);
const reportPages = [];
let at=0;
for (let i=0;i<pageLengths.length;i++) {
  const n=pageLengths[i];
  reportPages.push({page:i+3,original:stats(stream.slice(at,at+n)),
    inverse:stats(plainCandidate.slice(at,at+n))});
  at+=n;
}

// Use actual preserved page-spanning printed words for output analysis.
const text = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0,55).join("")
  .replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,"");
const runeRegex = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const fullWords = text.match(runeRegex)||[];
let global=0;
const scrollWordLengths=[];
for (const w of fullWords) {
  if (global>=729 && global+w.length<=1874) scrollWordLengths.push(w.length);
  global+=w.length;
}
assert.equal(global,12956);
assert.equal(scrollWordLengths.length,255);
assert.equal(scrollWordLengths.reduce((s,n)=>s+n,0),1145);
function wordStats(input) {
  let i=0, adjacent=0, positions=0, two=0, singles=0;
  for (const n of scrollWordLengths) {
    singles+= +(n===1);
    two+= +(n===2);
    for (let j=1;j<n;j++) adjacent+= +(input[i+j]===input[i+j-1]);
    positions+=n-1;
    i+=n;
  }
  return {words:scrollWordLengths.length,singletons:singles,twoRuneWords:two,
    withinWordAdjacentEquals:adjacent,withinWordAdjacentSites:positions};
}
assert.equal(wordStats(stream).withinWordAdjacentEquals, 4);
const recoveredWords=[];
let g=0;
for(const n of scrollWordLengths) {
  recoveredWords.push(plainCandidate.slice(g,g+n).map(x=>gp.translit[x]).join(""));
  g+=n;
}
assert.equal(g,1145);
function nativeWords(s) {
  return (s.match(/[A-Za-z]+/g) || [])
    .map(word => encodeSourceNativeGP(word)).filter(w => w.length);
}
const known = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1].trim();
const p57Plain = nativeWords(known).flat();
assert.deepEqual(p57Plain, gp.pages[57].indices);
assert.equal(p57Plain.length,95);
assert.deepEqual(decrypt(encrypt(p57Plain)),p57Plain,"source-solved p57 plant");
const planted=[];
for(const [name,file] of [
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"]
]) {
  const plain = nativeWords(read(file)).flat().slice(0,1145);
  assert.equal(plain.length,1145);
  const cipher = encrypt(plain);
  assert.deepEqual(decrypt(cipher),plain,"complete native-GP source must roundtrip");
  const wrong=decrypt(cipher,key.slice().reverse());
  const wrongGlyphs=wrong.filter((x,i)=>x!==plain[i]).length;
  assert(wrongGlyphs>800,"reversed red-word order must fail native control");
  planted.push({name,native:stats(plain),encrypted:stats(cipher),
    recoveredExact:plain.length,wrongSourceMismatches:wrongGlyphs});
}
const output={
  classification:"bounded original nonlinear five-lane negative; no LP2 plaintext",
  sourceProductKey:key,scrollPages:pageLengths,scrollRows:229,sourceWordCount:255,
  model:"five row-major width-five nonlinear quadratic triangular GF29 shears",
  original:before,decoded:after,pageHoldouts:reportPages,
  originalWords:wordStats(stream),decodedWords:wordStats(plainCandidate),
  decodedOpeningWords:recoveredWords.slice(0,38).join(" "),
  solvedP57Positive95:true,syntheticPositiveGrid841:true,
  exactSourceReencryption1145:true,sourceNativePlants:planted
};
console.log(JSON.stringify(output,null,2));
