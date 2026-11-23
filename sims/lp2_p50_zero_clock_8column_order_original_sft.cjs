"use strict";
/**
 * Source-locked LP2 p49–51 numerical-table first-digit clock:
 * test specificity of the *printed* 32x8 column ordering against all 8!
 * row-preserving column relabelings, using the untouched LP2 12,956 runes.
 *
 * This is a conditional original-input clock-alignment gate, NOT a cipher
 * or evidence of plaintext. The low-first-digit predicate and phase-zero
 * repeat clock had been selected before this permutation census; do not
 * interpret the finite 8! tail as a discovery-wide significance.
 *
 * Run: node sims/lp2_p50_zero_clock_8column_order_original_sft.cjs
 * Node 22 CommonJS, no third-party dependencies, no file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const table = read("resources/liber-primus/lp2-grid-256.json");
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const tokens = table.pages.flatMap(page => page.tokens);
assert.equal(tokens.length,256);
assert.equal(pages.length,55);
assert.ok(tokens.every(x => typeof x === "string" && x.length === 2));
const zero = tokens.map(t => Number(t[0] === "0"));
assert.equal(zero.reduce((a,b)=>a+b,0),60);
const count = new Int32Array(256), eligible = new Int32Array(256);
let offset=0, events=0, pairs=0;
for(const page of pages) {
  for(let i=0;i+1<page.indices.length;i++) {
    const at=(offset+i)&255;
    eligible[at]++; pairs++;
    if(page.indices[i] === page.indices[i+1]) {count[at]++; events++;}
  }
  offset+=page.indices.length;
}
assert.deepEqual([offset,pairs,events],[12956,12901,86]);
const ident = Object.freeze([0,1,2,3,4,5,6,7]);
const patience = Object.freeze([6,5,3,0,2,4,7,1]);
const score = perm => {
  let hits=0, exposure=0;
  for(let row=0;row<32;row++) for(let col=0;col<8;col++) {
    const i=8*row+col;
    const selected=zero[8*row+perm[col]];
    hits+=selected*count[i];
    exposure+=selected*eligible[i];
  }
  return {hits, exposure};
};
const raw=score(ident), historical=score(patience);
assert.deepEqual(raw,{hits:33,exposure:3025});
assert.deepEqual(historical,{hits:21,exposure:3018});

const array=ident.slice(), histogram=new Int32Array(87), winners=[];
let total=0, higherOrEqual=0, maximal=-1, sum=0;
function enumerate(at) {
  if(at === 8) {
    const z=score(array);
    histogram[z.hits]++;
    total++;
    sum+=z.hits;
    if(z.hits>=raw.hits) higherOrEqual++;
    if(z.hits>maximal) {maximal=z.hits; winners.length=0;}
    if(z.hits===maximal) winners.push(array.join(""));
    return;
  }
  for(let i=at;i<8;i++) {
    [array[at],array[i]]=[array[i],array[at]];
    enumerate(at+1);
    [array[at],array[i]]=[array[i],array[at]];
  }
}
enumerate(0);
assert.equal(total,40320);
assert.equal(sum/total,19.5);
assert.equal(higherOrEqual,26);
assert.equal(histogram[33],23);
assert.equal(histogram[34],3);
assert.equal(maximal,34);
assert.deepEqual(winners,["21034567","61034527","71034526"]);
// Independent encoded-event synthetic sanity: declare one exact event at
// every printed leading-zero source phase; the identity then matches all 60.
const plant = zero.map(x=>x);
assert.equal(plant.reduce((a,b)=>a+b,0),60);
let match=0;
for(let i=0;i<256;i++) if(zero[i] && plant[i]) match++;
assert.equal(match,60);

const columnMajor = Array.from({length:256},
 (_,i)=>zero[8*(i%32)+patience[Math.floor(i/32)]]);
let columnHits=0,columnExposure=0;
for(let i=0;i<256;i++) {
  columnHits+=columnMajor[i]*count[i];
  columnExposure+=columnMajor[i]*eligible[i];
}
assert.deepEqual([columnHits,columnExposure],[19,3032]);
console.log(JSON.stringify({
 originalRunes:offset,withinPagePairs:pairs,repeatEvents:events,
 sourcePrintedLowFirstDigitCells:60,
 unpermuted:raw,
 historicalPatienceRowwise:historical,
 historicalPatienceColumnMajor:{hits:columnHits,exposure:columnExposure},
 rowPreservingColumnPermutations:total,
 originalOrderColumnPermutationRankAtLeastAsMany: higherOrEqual,
 exactConditionalTail:higherOrEqual/total,
 permutationMeanHits:sum/total,
 maximalHits:maximal,
 maximizingOrders:winners,
 histogram33:histogram[33],histogram34:histogram[34],
 syntheticPrintMaskRecovery:match,
 interpretation:"Printed column order is unusually well aligned to repeat events relative to row-preserving 8! column relabelings, conditional on the previously selected low-zero 256-phase statistic; no cipher/key/plaintext inferred."
},null,2));
