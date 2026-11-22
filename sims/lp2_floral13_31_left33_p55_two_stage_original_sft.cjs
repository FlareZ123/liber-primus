"use strict";
/**
 * Original p50 post-SHED base59 red13/31 left-route33 candidate 2-stage
 * p55 exterior33→interior43 key transport. First stage covers the source
 * five completely exterior 2-rune p55 words; second stage keys interior43.
 * Windows Node22 CJS, read-only, exact source-native positive controls.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
const text = file => fs.readFileSync(path.join(root, file), "utf8");
const grid = JSON.parse(text("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(text("resources/liber-primus/lp2-corpus.json"));
const cells = grid.pages.flatMap(x => x.tokens);
const a60 = grid.alphabet, a59 = a60.replace("f", "");
const v60 = cells.map(x => a60.indexOf(x[0]) * 60 + a60.indexOf(x[1]));
const v59 = cells.map(x => a59.indexOf(x[0]) * 59 + a59.indexOf(x[1]));
const delta = v60.map((v, i) => v - v59[i]);
const pathLeft = [110];
for (let i = 0; i < 40 && pathLeft.at(-1) !== 189; i++) {
  pathLeft.push(v59[pathLeft.at(-1)]);
}
assert.deepEqual(pathLeft.slice(-6), [112,72,161,214,247,189]);
assert.equal(pathLeft.length, 34);
const pathRight = [251];
for (let i = 0; i < 12 && pathRight.at(-1) !== 189; i++) pathRight.push(v59[pathRight.at(-1)]);
assert.deepEqual(pathRight, [251,226,72,161,214,247,189]);
const path33 = pathLeft.slice(0, -1);
assert.equal(new Set(path33).size, 33);
assert.equal(pathLeft.indexOf(72), 29);
const printed = corpus.pages[55].indices;
assert.equal(printed.length, 76);
const fragments = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(fragments.reduce((x, y) => x + y, 0), 76);
const outside = [0], inside = [], twoRunePositions = [];
let at = 1;
for (const len of fragments.slice(1)) {
  outside.push(at, at + len - 1);
  if (len === 2) twoRunePositions.push(at);
  for (let j = 1; j < len - 1; j++) inside.push(at + j);
  at += len;
}
assert.equal(at, 76);
assert.deepEqual(twoRunePositions, [5,7,21,46,62]);
assert.equal(outside.length, 33);
assert.equal(inside.length, 43);
assert.equal(new Set(outside.concat(inside)).size, 76);
const rankOutside = new Map(outside.map((v, i) => [v, i]));
const exterior = outside.map(i => printed[i]);
const interior = inside.map(i => printed[i]);

const independent = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt"
];
const lexicons = independent.map(name => {
  const result = new Set();
  for (const w of text(name).match(/[A-Za-z]+/g) || []) {
    const coded = encodeSourceNativeGP(w);
    if (coded.length === 2) result.add(coded.join(","));
  }
  assert.ok(result.has("10,9"));
  assert.ok(result.has("2,18"));
  return result;
});
const gp = stream => stream.map(x => corpus.translit[x]).join("");
const add = (x, y) => ((x + y) % 29 + 29) % 29;
function nativeStatus(shell) {
  return twoRunePositions.map(position => {
    const rank = rankOutside.get(position);
    const word = shell.slice(rank, rank + 2);
    return {pos:position, roman:gp(word), hitCount:lexicons.filter(s=>s.has(word.join(","))).length};
  });
}
/**
 * Source-rank outside cipher/key and the interior key both advance without
 * resets: 33 exterior cells and 43 interior cells in original printed order.
 */
const operations = [
  ["p50 node-address", path33],
  ["p50 base59 emitted byte", path33.map(x => v59[x])],
  ["p50 SHED delta", path33.map(x => delta[x])]
];
const p57 = corpus.pages[57].indices;
assert.equal(p57.length, 95);
let total=0,bestNative=0,bestInnerIOC=0;
function ioc(values) {
  const counts=Array(29).fill(0);
  values.forEach(x => counts[x]++);
  return counts.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
for (const [name, source] of operations) {
  const key=source.map(x=>x%29);
  for (const outsideSign of [-1,1]) {
    const shell = exterior.map((x,i)=>add(x,outsideSign*key[i]));
    const twoRune=nativeStatus(shell);
    const commonEnglish=twoRune.filter(x=>x.hitCount===4).length;
    const anyEnglish=twoRune.filter(x=>x.hitCount>0).length;
    bestNative=Math.max(bestNative,anyEnglish);
    assert.ok(anyEnglish<5, "All five source-native printed two-rune words would need renewed decoding");
    for (const insideSign of [-1,1]) {
      const recovered=interior.map((x,i)=>add(x,insideSign*shell[i%33]));
      bestInnerIOC=Math.max(bestInnerIOC,ioc(recovered));
      total++;
      // Full transport positive plant using exact p57 source runes as both
      // the exterior and interior plaintext registers, overwriting the
      // five mandatory native source words with the attested native "IN".
      const plantExterior=p57.slice(0,33);
      for (const position of twoRunePositions) {
        const j=rankOutside.get(position);
        plantExterior[j]=10; plantExterior[j+1]=9;
      }
      const plantedOuterCipher=plantExterior.map((x,i)=>add(x,-outsideSign*key[i]));
      const reconstructedOuter=plantedOuterCipher.map((x,i)=>add(x,outsideSign*key[i]));
      assert.deepEqual(reconstructedOuter,plantExterior);
      assert.ok(nativeStatus(reconstructedOuter).every(x=>x.hitCount===4));
      const plantInside=p57.slice(33,76);
      const plantedInnerCipher=plantInside.map((x,i)=>add(x,-insideSign*plantExterior[i%33]));
      const reconstructedInner=plantedInnerCipher.map((x,i)=>add(x,insideSign*reconstructedOuter[i%33]));
      assert.deepEqual(reconstructedInner,plantInside);
      // Original ciphertext forward replay: both register encryptions
      // return every one of the 76 original rune identities exactly.
      assert.deepEqual(shell.map((x,i)=>add(x,-outsideSign*key[i])),exterior);
      assert.deepEqual(recovered.map((x,i)=>add(x,-insideSign*shell[i%33])),interior);
      console.log(JSON.stringify({name,outsideSign,insideSign,
        originalTwoRuneWords:twoRune,englishAny:anyEnglish,
        englishEveryCorpus:commonEnglish,innerIoC:ioc(recovered),
        innerGP:gp(recovered),nativePlantedInside43:true}));
    }
  }
}
assert.equal(total,12);
assert.ok(bestNative<5);
assert.ok(bestInnerIOC<0.05);
console.log(JSON.stringify({pathLeft,pathRight,bestNativeOfFive:bestNative,
  maxInnerIoC:bestInnerIOC,positiveOriginalReplay:"76/76",
  positivePlantedSource:"12/12",actualUnknownPlaintext:false}));
console.log("PASS. No native-English preserved-word two-stage output or unknown LP2 plaintext.");
