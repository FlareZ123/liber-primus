"use strict";
/**
 * SFT: authenticated 2016 words -> stable GP-prime rank -> p55's 43 interiors.
 * Run from the repository root with Node.js 22:
 *   node sims/lp2_2016_signed_prime_rank_p55_sft.cjs
 * This read-only script tests one locked rank and its exact inverse.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const asc = read("resources/historical/cicada2016-4gq25-outguess.asc");
assert.equal(Buffer.byteLength(asc, "utf8"), 1136);
assert.equal(crypto.createHash("sha256").update(asc).digest("hex"),
  "fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010");
const body = asc.slice(asc.indexOf("Hello."), asc.indexOf("-----BEGIN PGP SIGNATURE-----"));
const sourceWords = body.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(sourceWords.length, 43);
const gpTokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text @returns {number[]} */
function gpEncode(text) {
  const clean = text.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let at = 0; at < word.length;) {
      const token = gpTokens.find(t => word.startsWith(t.s, at));
      assert.ok(token, "GP transliteration must be complete");
      out.push(token.i);
      at += token.s.length;
    }
  }
  return out;
}
const sums = sourceWords.map(w => gpEncode(w)
  .reduce((sum, i) => sum + corpus.prime[i], 0));
const ranks = Array.from({length: 43}, (_, i) => i)
  .sort((a, b) => sums[a] - sums[b] || a - b);
assert.deepEqual(sums, [
  243,72,145,224,343,436,253,72,381,243,212,84,72,219,143,
  179,175,72,211,114,319,84,72,204,215,114,295,175,72,
  337,200,215,113,196,128,130,120,102,322,292,198,217,249
]);
assert.deepEqual(ranks, [
  1,7,12,17,22,28,11,21,37,32,19,25,36,34,35,
  14,2,16,27,15,33,40,30,23,18,10,24,31,41,13,
  3,0,9,42,6,39,26,20,38,29,4,8,5
]);
const transcript = read("resources/lp2-transcription.txt");
const physicalWords = transcript.split("%")[54]
  .replace(/\/\s*/g, "").match(/[\u16A0-\u16FF]+/gu) || [];
const page = corpus.pages.find(p => p.page === 55).indices;
assert.equal(page.length, 76);
assert.deepEqual(physicalWords.map(w => [...w].length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const interiorOffsets = [];
const exteriorOffsets = [];
let pos = 0;
for (const word of physicalWords) {
  const glyphs = [...word];
  for (let k = 0; k < glyphs.length; k++) {
    assert.equal(page[pos + k], corpus.runes.indexOf(glyphs[k]));
    (k === 0 || k === glyphs.length - 1 ? exteriorOffsets : interiorOffsets)
      .push(pos + k);
  }
  pos += glyphs.length;
}
assert.deepEqual([pos, interiorOffsets.length, exteriorOffsets.length], [76,43,33]);
assert.deepEqual(interiorOffsets, [
  2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,
  30,31,32,33,34,37,38,39,40,43,44,49,50,51,52,53,
  56,57,58,59,60,65,66,67,68,71,74
]);
const original = interiorOffsets.map(k => page[k]);
/**
 * @param {number[]} a
 * @param {"rank"|"unrank"} mode
 * @returns {number[]}
 */
function permute(a, mode) {
  if (mode === "rank") return ranks.map(k => a[k]);
  const inverse = Array(a.length);
  for (let i = 0; i < a.length; i++) inverse[ranks[i]] = a[i];
  return inverse;
}
const train = gpEncode(read("resources/control/shakespeare_first300k.txt").slice(0,240000));
const hold = gpEncode(read("resources/control/shakespeare_first300k.txt").slice(240000));
const n = 29, f1 = new Uint32Array(n), f2 = new Uint32Array(n*n),
  f3 = new Uint32Array(n*n*n);
for (let i = 0; i < train.length; i++) {
  f1[train[i]]++;
  if (i) f2[train[i-1]*n+train[i]]++;
  if (i > 1) f3[(train[i-2]*n+train[i-1])*n+train[i]]++;
}
/** @param {number[]} a @returns {number} */
function score(a) {
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    let p = (f1[x]+1)/(train.length+n);
    if (i) p = (f2[a[i-1]*n+x]+8*p)/(f1[a[i-1]]+8);
    if (i > 1) p = (f3[(a[i-2]*n+a[i-1])*n+x]+8*p)/
      (f2[a[i-2]*n+a[i-1]]+8);
    result += Math.log(p);
  }
  return result/a.length;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const value of a) counts[value]++;
  return counts.reduce((acc, c) => acc + c*(c-1), 0)/(a.length*(a.length-1));
}
const control = [];
for (let i = 0; i + 43 <= hold.length; i += 43)
  control.push(score(hold.slice(i,i+43)));
control.sort((a,b) => a-b);
assert.equal(control.length, 1018);
const plantPlain = corpus.pages[57].indices.slice(7,50);
assert.equal(plantPlain.length,43);
const outcomes = [];
for (const mode of ["rank", "unrank"]) {
  const undo = mode === "rank" ? "unrank" : "rank";
  const plain = permute(original,mode);
  assert.deepEqual(permute(plain,undo),original);
  const plantCipher = permute(plantPlain,undo);
  assert.deepEqual(permute(plantCipher,mode),plantPlain);
  const wrongRanks = ranks.slice().reverse();
  const wrong = mode === "rank" ?
    wrongRanks.map(k => original[k]) :
    (() => { const a = Array(43); wrongRanks.forEach((k,i) => a[k]=original[i]); return a; })();
  const aligned = page.slice();
  interiorOffsets.forEach((pageOffset,i) => {aligned[pageOffset] = plain[i];});
  assert.ok(exteriorOffsets.every(i => aligned[i] === page[i]));
  let cursor = 0;
  const fullPage = physicalWords.map(w => {
    const part = aligned.slice(cursor,cursor + [...w].length);
    cursor += part.length;
    return part.map(i => corpus.translit[i]).join("");
  }).join("-");
  const value = score(plain);
  const expected = mode === "rank" ? -6.4554753954547515 : -6.691259012967883;
  assert.ok(Math.abs(value-expected)<1e-9, "frozen regression output differs");
  outcomes.push({
    mode,
    outputIndices:plain,
    outputLatin:plain.map(i => corpus.translit[i]).join(""),
    fullPageAligned:fullPage,
    originalIoC:ioc(original),candidateIoC:ioc(plain),
    gp29LanguageScore:value,wrongReverseRankScore:score(wrong),
    controlMin:control[0],
    nativeControlsAtOrBelow:control.filter(s => s <= value).length,
    nativeControlCount:control.length,
    exactOriginalRoundTrip:true,plantedNativeRecovered:43
  });
}
console.log(JSON.stringify({
  source:"Signed Cicada 2016 43 source words and 2014 LP2 physical p55",
  sourceWords,primeSums:sums,rankOrderZeroBased:ranks,
  interiorOffsets,originalCipher:original,exteriorOffsets,
  nativePlantScore:score(plantPlain),nativeControlMedian:control[509],
  outcomes,
  decision:"Neither source-fixed rank orientation yields readable GP29; no original unknown plaintext or key identified"
},null,2));
