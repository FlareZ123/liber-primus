#!/usr/bin/env node
"use strict";

/**
 * Source-matched, key-INDEPENDENT pure-permutation obstruction for the proposed
 * 2014 historical 5x5/7x7/5x5 square interiors -> LP2 p55 43 word interiors.
 *
 * Running: node sims/lp2_p55_inner43_square_permutation_invariant_sft.cjs
 * No argument, fitted phase, key, or target-word guess.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");
const squares = squareText.trim().split(/\r?\n\s*\r?\n/).map(block =>
  block.trim().split(/\r?\n/).map(line =>
    line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(s => s.length), [5,7,5]);
assert.ok(squares.every(s => s.every(row => row.length === s.length)));
const innerValues = squares.flatMap(square =>
  square.slice(1,-1).flatMap(row => row.slice(1,-1)));
assert.equal(innerValues.length,43);
assert.equal(new Set(innerValues).size,23);

const words = transcription.split("%")[54].replace(/\/\s*/g,"")
  .match(/[\u16A0-\u16FF]+/gu) || [];
const lengths = words.map(w => [...w].length);
assert.deepEqual(lengths,[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const original = words.flatMap(w => [...w].slice(1,-1))
  .map(rune => corpus.runes.indexOf(rune));
assert.equal(original.length,43);
assert.ok(original.every(n => n >= 0 && n < 29));
/** @param {number[]} runes */
function collisions(runes) {
  const counts = new Uint16Array(29);
  for (const n of runes) counts[n]++;
  return Array.from(counts).reduce((s,k) => s+k*(k-1),0);
}
const fixedPairs = original.length*(original.length-1);
const originalPairs = collisions(original);
assert.equal(fixedPairs,1806);
assert.equal(originalPairs,62);
const originalIoc = originalPairs/fixedPairs;

// The historical square values can determine arbitrary permutations of the
// 43 positions, but any permutation preserves each symbol's multiplicity.
// The ordinary stable ascending-square-value key is one explicit example.
const order = innerValues.map((value,index)=>({value,index}))
  .sort((a,b)=>a.value-b.value || a.index-b.index).map(x=>x.index);
assert.equal(new Set(order).size,43);
const rankedOriginal = order.map(i=>original[i]);
assert.equal(collisions(rankedOriginal),62);
assert.equal(new Set(innerValues).size,23);

// 5+7+5 rows may LOOK like the 17 printed words, but 13 > max row width7.
// In printed order, four words also overflow specific row widths.
const widths=[...Array(5).fill(5),...Array(7).fill(7),...Array(5).fill(5)];
const overflow=lengths.flatMap((n,i)=>n>widths[i]?[{word:i+1,length:n,capacity:widths[i]}]:[]);
assert.deepEqual(overflow,[
  {word:5,length:6,capacity:5},
  {word:8,length:13,capacity:7},
  {word:13,length:7,capacity:5},
  {word:15,length:6,capacity:5}
]);
assert.equal(overflow.reduce((s,x)=>s+x.length-x.capacity,0),10);

const symbols = corpus.translit.map((token,index)=>({
  token:token.toUpperCase(),index
})).sort((a,b)=>b.token.length-a.token.length);
/** @param {string} word @returns {number[] | null} */
function encode(word) {
  const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C");
  const result=[];
  for(let at=0;at<s.length;) {
    const g=symbols.find(item=>s.startsWith(item.token,at));
    if(!g)return null;
    result.push(g.index);
    at+=g.token.length;
  }
  return result;
}

let seed=0x45001112;
/** @returns {number} */
function random32() {
  seed^=seed<<13;
  seed^=seed>>>17;
  seed^=seed<<5;
  return seed>>>0;
}
const controls=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"],
  ["LP1_reference","resources/liber-primus/lp1-plaintext-reference.txt"]
];
const results=[];
for (const [name,filename] of controls) {
  const source=read(filename);
  const ascii=(name==="LP1_reference" ?
    source.replace(/^###.*$/gm,"") : source).match(/[A-Za-z]+/g)||[];
  /** @type {number[][][]} */
  const buckets=Array.from({length:32},()=>[]);
  for (const word of ascii) {
    const encoded=encode(word);
    if(encoded && encoded.length<32) buckets[encoded.length].push(encoded);
  }
  const required=[...new Set(lengths)];
  assert.ok(required.every(n=>buckets[n].length>0));
  const draws=20000;
  let min=Infinity,atOrBelow=0,total=0;
  /** @type {number[]} */
  let last=[];
  for(let j=0;j<draws;j++) {
    const sample=[];
    for(const length of lengths) {
      const options=buckets[length];
      const word=options[random32()%options.length];
      sample.push(...word.slice(1,-1));
    }
    assert.equal(sample.length,43);
    last=sample;
    const count=collisions(sample);
    total+=count;
    if(count<=originalPairs) atOrBelow++;
    min=Math.min(min,count);
  }
  // Source-native positive plant: permuting and inverting the 43 GP symbols
  // recovers every symbol, while preserving collision count exactly.
  const plant=order.map(i=>last[i]);
  const recovered=Array(43);
  order.forEach((from,to)=>{recovered[from]=plant[to]});
  assert.deepEqual(recovered,last);
  assert.equal(collisions(plant),collisions(last));
  const result={
    source:name, draws,
    observedTargetPairs:originalPairs,
    nativeMinPairs:min,
    nativeMeanIoc:(total/draws)/fixedPairs,
    nativeAtOrBelowOriginal:atOrBelow,
    addOneTailUpperBound:1/(draws+1),
    sourceWordsByRequiredLength:required.map(n=>({len:n,count:buckets[n].length})),
    finalSeed:seed>>>0
  };
  results.push(result);
}
assert.deepEqual(results.map(r=>r.nativeMinPairs),[72,70,68,72]);
assert.ok(results.every(r=>r.nativeAtOrBelowOriginal===0));
console.log(JSON.stringify({
  classification:"key-independent conditional exclusion: every 43-interior-only permutation and one shared alphabet bijection, for ordinary GP-English",
  exactOriginalPhysicalPage:55, historicalSquareOrders:[5,7,5],
  squareInteriorCells:43,squareInteriorDistinctValues:23,
  p55WordLengths:lengths,p55InteriorCount:original.length,
  actualCollisionPairs:originalPairs,
  maximumPairDenominator:fixedPairs,
  actualIoC:originalIoc,
  invariantUnderAll43FactorialPermutations:true,
  straightSeventeenRowPlacementOverflow:overflow,
  nativeExactShapeMatchedControls:results,
  caveat:"The bound assumes the true p55 strict-word-interior plaintext has ordinary GP-English marginal frequencies. A position-dependent alphabet change, changed word boundaries, or non-English intermediate escapes it."
},null,2));
console.log("SFT PASS: original-input transposition invariant, matched positive controls.");
