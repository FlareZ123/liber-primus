"use strict";
/**
 * LP2 exact duplicated two-word bookend census and length-preserving null.
 *
 * Original evidence: p27 and p55 share precisely two adjacent three-rune
 * words, the book's only repeated two-word runic phrase.
 * Test: node sims/lp2_bookend_wordpair_lengthconditional_sft.cjs
 * Node 22, zero third-party dependencies.
 */
const assert = require("node:assert/strict");
const {parseSharedCorpus,physicalLP2Page} = require("./lp2_word_pages.cjs");

const corpus = parseSharedCorpus();
const words = corpus.words;
assert.equal(words.length, 2896);
assert.equal(corpus.runeCount, 12956);

const ids = new Map();
/** @type {number[]} */
const symbols = words.map(({runes}) => {
  if (!ids.has(runes)) ids.set(runes, ids.size);
  return ids.get(runes);
});
const lengths = words.map(w => w.length);
const targetA = "ᛞᛄᚢ", targetB = "ᛒᛖᛁ";
const targetIdA = ids.get(targetA), targetIdB = ids.get(targetB);
assert.notEqual(targetIdA, undefined);
assert.notEqual(targetIdB, undefined);

/**
 * Count duplicated ordered word pairs within all positions, and separately
 * within the original exact 3+3-rune length stratum.
 * @param {number[]} arr
 * @returns {{all:number, threeThree:number, repeated:Array<[number,number,number]>}}
 */
function countPairs(arr) {
  const seenAll = new Map();
  const seenThree = new Set();
  let all = 0, threeThree = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    const key = arr[i] * 3000 + arr[i + 1];
    if (seenAll.has(key)) {
      all++;
      if (lengths[i] === 3 && lengths[i + 1] === 3) threeThree++;
    } else seenAll.set(key, i);
    if (lengths[i] === 3 && lengths[i + 1] === 3) {
      seenThree.add(key);
    }
  }
  const repeated = [];
  for (let i = 0; i < arr.length - 1; i++) {
    const key = arr[i] * 3000 + arr[i + 1];
    const previous = seenAll.get(key);
    if (previous !== i) repeated.push([previous, i, key]);
  }
  return {all, threeThree, repeated};
}
const observed = countPairs(symbols);
assert.equal(observed.all, 1);
assert.equal(observed.threeThree, 1);
assert.deepEqual(observed.repeated.map(x => x.slice(0,2)), [[1462,2894]]);
for (const index of [1462,2894]) {
  assert.equal(symbols[index],targetIdA);
  assert.equal(symbols[index+1],targetIdB);
}
assert.deepEqual(
  [physicalLP2Page(words[1462].startPage),physicalLP2Page(words[2894].startPage)],
  [27,55]
);
assert.equal(symbols.filter(x=>x===targetIdA).length,2);
assert.equal(symbols.filter(x=>x===targetIdB).length,2);

const slotsByLength = new Map();
for(let i=0;i<lengths.length;i++){
  if(!slotsByLength.has(lengths[i])) slotsByLength.set(lengths[i],[]);
  slotsByLength.get(lengths[i]).push(i);
}
const nThree = slotsByLength.get(3).length;
assert.equal(nThree,720);
const countsThree = new Map();
for (const i of slotsByLength.get(3)) {
  countsThree.set(symbols[i],(countsThree.get(symbols[i])||0)+1);
}
assert.equal(countsThree.size,704);
assert.equal([...countsThree.values()].filter(x=>x===2).length,14);
assert.equal([...countsThree.values()].filter(x=>x===3).length,1);
const sites33 = [];
for(let i=0;i<lengths.length-1;i++)
  if(lengths[i]===3 && lengths[i+1]===3) sites33.push(i);
assert.equal(sites33.length,184);
let overlapping=0;
for(let i=1;i<sites33.length;i++)
  if(sites33[i]===sites33[i-1]+1) overlapping++;
assert.equal(overlapping,36);
const disjoint=sites33.length*(sites33.length-1)/2-overlapping;
assert.equal(disjoint,16800);
const multiplicities=[...countsThree.values()];
/** @param {number} n @param {number} k */
function falling(n,k) {
  let out=1;
  for(let i=0;i<k;i++)out*=n-i;
  return out;
}
// For disjoint ordered edges, matching requires AABB (A!=B)
// or AAAA (A==B). For overlapping edges, matching requires AAA.
let matchingFour=0, matchingThree=0;
for(let i=0;i<multiplicities.length;i++){
  const a=multiplicities[i];
  matchingFour+=falling(a,4);
  matchingThree+=falling(a,3);
  for(let j=0;j<multiplicities.length;j++){
    if(j===i)continue;
    matchingFour+=falling(a,2)*falling(multiplicities[j],2);
  }
}
assert.equal(matchingFour,1064);
assert.equal(matchingThree,6);
const expectedDuplicates = disjoint*matchingFour/falling(nThree,4)
  + overlapping*matchingThree/falling(nThree,3);
assert(Math.abs(expectedDuplicates-0.0000676538434737498)<1e-15);

// Fisher-Yates preserves exact positional word-length classes and all original
// token multiplicities, including the two observed identical bookend words.
/** @param {number} initial */
function rng(initial) {
  let seed=initial>>>0;
  return ()=>{
    seed^=seed<<13; seed^=seed>>>17; seed^=seed<<5;
    return seed>>>0;
  };
}
const random=rng(0x3301d355);
const trial=symbols.slice();
const iterations=15000;
let atLeastOneAll=0,atLeastOneThree=0;
const allMultiplicity=new Map(), threeMultiplicity=new Map();
for(let rep=0;rep<iterations;rep++){
  for(const positions of slotsByLength.values()){
    for(let i=positions.length-1;i>0;i--){
      const j=random()%(i+1);
      [trial[positions[i]],trial[positions[j]]]=
        [trial[positions[j]],trial[positions[i]]];
    }
  }
  const c=countPairs(trial);
  if(c.all>=1)atLeastOneAll++;
  if(c.threeThree>=1)atLeastOneThree++;
  allMultiplicity.set(c.all,(allMultiplicity.get(c.all)||0)+1);
  threeMultiplicity.set(c.threeThree,(threeMultiplicity.get(c.threeThree)||0)+1);
}
const result={
  words:words.length,runes:corpus.runeCount,
  onlyRepeatedPhrase:targetA+" "+targetB,
  occurrenceIndices:[1462,2894],
  physicalPages:[27,55],
  p55Positions:"last two complete printed words",
  allPhraseDuplicates:observed.all,
  threeThreePhraseDuplicates:observed.threeThree,
  threeRuneTokenSlots:nThree,
  threeRuneDistinctWords:countsThree.size,
  threeRuneDuplicatedTokenTypes:14,
  threeRuneTripledTokenTypes:1,
  threeThreeAdjacentSlots:sites33.length,
  comparedOverlappingEdges:overlapping,
  comparedDisjointEdges:disjoint,
  exactConditionalExpectedDuplicateThreeThreePhrases:expectedDuplicates,
  exactConditionalUpperBoundPAtLeastOne:expectedDuplicates,
  simulations:iterations,
  simulationsAtLeastOneAll:atLeastOneAll,
  simulationsAtLeastOneThreeThree:atLeastOneThree,
  allLengthFamilyMatchedP:(atLeastOneAll+1)/(iterations+1),
  postselectedThreeThreeMonteCarloP:(atLeastOneThree+1)/(iterations+1),
  allNullHistogram:Object.fromEntries(allMultiplicity),
  threeThreeNullHistogram:Object.fromEntries(threeMultiplicity),
};
console.log(JSON.stringify(result,null,2));
