"use strict";

/**
 * Source-locked 2013/2014 WISDOM five-by-five 1033 square as a 25-cell
 * transposition on the exact 75-rune original LP2 p55 body.
 * Sort the printed 25 cells by their original integer values, breaking the
 * genuine numeric ties in printed row-major order. Test only direct/reverse
 * ranked paths in both encode/decode directions, without fitted keys.
 *
 * SFT: node sims/lp2_p55_moth_square25_transposition_sft.cjs
 * CommonJS Node.js 22, no packages and no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const square = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
assert(square.every(row => row.reduce((s, x) => s + x, 0) === 1033));
assert.equal(square.flat().length, 25);
const numbers = square.flat();
const ascending = Array.from({length:25}, (_, i) => i)
  .sort((a,b) => numbers[a] - numbers[b] || a-b);
const descending = ascending.slice().reverse();
const original = gp.pages[55].indices;
assert.equal(original.length, 76);
const body = original.slice(1);
assert.equal(body.length, 75);
const authentic = gp.pages[57].indices;
assert.equal(authentic.length, 95);
const nativePlant = authentic.slice(0, 75);
assert.equal(nativePlant.length, body.length);

/** @param {number[]} sequence Runic characters, uninterrupted. */
function gpScore(sequence, model) {
  let sum = 0;
  for (let i=2;i<sequence.length;i++) {
    const prefix = sequence[i-2]*29 + sequence[i-1];
    sum += Math.log((model.triplet[29*prefix+sequence[i]]+0.1) /
      (model.pair[prefix]+2.9));
  }
  return sum / (sequence.length-2);
}

/** @param {string} source Plain English with Cicada's canonical GP graphemes. */
function nativeGP(source) {
  const tokens = gp.translit.map((spelling,i) => ({spelling,i}))
    .sort((a,b) => b.spelling.length-a.spelling.length);
  const result=[];
  for(let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/IO/g,"IA");
    for(let i=0;i<word.length;) {
      const token=tokens.find(t => word.startsWith(t.spelling,i));
      assert(token, "GP-native source grapheme");
      result.push(token.i);i+=token.spelling.length;
    }
  }
  return result;
}

const source = nativeGP(read("resources/control/shakespeare_first300k.txt"));
assert(source.length>200000);
const model = {pair:new Uint32Array(29*29),triplet:new Uint32Array(29**3)};
for(let i=2;i<source.length;i++) {
  const prefix=29*source[i-2]+source[i-1];
  model.pair[prefix]++;
  model.triplet[29*prefix+source[i]]++;
}

/**
 * Read a 5x5 block through fixed row-major rank order, then invert.
 * @param {number[]} input 75 GP29 runes, three successive 25-rune blocks.
 * @param {number[]} route The rank-ordered original square-cell indices.
 * @param {boolean} inverse True for reconstructing printed cell placement.
 */
function transport(input,route,inverse) {
  assert.equal(input.length,75);
  assert.equal(route.length,25);
  assert.equal(new Set(route).size,25);
  const result=[];
  for(let start=0;start<75;start+=25) {
    const block=input.slice(start,start+25),output=new Array(25);
    for(let i=0;i<25;i++) {
      if(inverse) output[route[i]]=block[i];
      else output[i]=block[route[i]];
    }
    result.push(...output);
  }
  return result;
}

const tests=[];
for(const [name,route] of [["ascending",ascending],["descending",descending]]) {
  for(const inverse of [false,true]) {
    const decoded=transport(body,route,inverse);
    assert.deepEqual(transport(decoded,route,!inverse),body);
    const plantedCipher=transport(nativePlant,route,!inverse);
    assert.deepEqual(transport(plantedCipher,route,inverse),nativePlant);
    tests.push({
      route:name,direction:inverse?"inverse":"direct",
      originalTrigramNats:gpScore(decoded,model),
      first40:decoded.slice(0,40).map(x=>gp.translit[x]).join(""),
      recoveredNativePlant:75,reconstructedOriginal:75
    });
  }
}

assert.equal(tests.length,4);
const expected=[
  -5.041220690731827,-4.715472315112022,
  -4.795691592866437,-4.749029778885676
];
for(let i=0;i<expected.length;i++)
  assert.ok(Math.abs(tests[i].originalTrigramNats-expected[i])<1e-10);
assert.ok(tests.every(x=>x.originalTrigramNats < -4.7));
const scoreNative=gpScore(nativePlant,model);
assert.ok(scoreNative > -3);
console.log(JSON.stringify({
  hypothesis:"2013/2014 source magic-square rank path across LP2 p55 moth-linked 75-rune body",
  originalP55Runes:original.length,body:body.length,
  fixedSortedPositions:ascending,sourceSquareRowSum:1033,
  originalBaselineNats:gpScore(body,model),
  authenticNativeP57PlantNats:scoreNative,
  tested:tests,
  verdict:"Four unadjusted source-square rank transpositions do not reveal GP-native prose; no key or unknown original plaintext recovered."
},null,2));
