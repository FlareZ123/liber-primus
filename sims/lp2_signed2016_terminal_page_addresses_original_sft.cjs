"use strict";

/**
 * An original-source-only navigation decision for signed 2016 THE followers.
 * It compares one prospective zero-based whole-word GP-index-sum page grammar
 * with the 2014 physical terminal-page inventory and a fixed seeded
 * alphabet-relabeling control. This reports a conditional screen, NOT a
 * discovery-adjusted significance test or an original LP2 decipherment.
 *
 * Windows Node.js 22, read-only CommonJS, no third-party modules.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const read = (s) => fs.readFileSync(path.join(ROOT, s), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const source = read("resources/historical/cicada2016-4gq25-outguess.asc");
const tokens = table.pages.flatMap((p) => p.tokens);
const names = corpus.translit
  .map((name, i) => ({name:name.toLowerCase(), i}))
  .sort((a,b) => b.name.length - a.name.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  let rest = word.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s");
  const arr = [];
  while (rest) {
    const entry = names.find((v) => rest.startsWith(v.name));
    assert(entry !== undefined, "unrecognized GP word segment: " + rest);
    arr.push(entry.i);
    rest = rest.slice(entry.name.length);
  }
  return arr;
}
const clean = source.slice(source.indexOf("Hello."),source.indexOf("-----BEGIN PGP SIGNATURE-----"))
 .replace(/\b7A35090F\b/g,"");
const words = clean.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g);
assert(words !== null);
assert.equal(words.length,43);
const theAt = words.map((w,i) => w.toUpperCase()==="THE"?i+1:null).filter((v) => v!==null);
assert.deepEqual(theAt,[2,8,13,18,23,29]);
const followers = theAt.map((p) => words[p].toUpperCase());
assert.deepEqual(followers,["PATH","DEVOTED","WAY","MAP","ROAD","DIRECTION"]);
const spell = followers.map(gp);
const sums = spell.map((w) => w.reduce((sum,v) => sum+v,0));
assert.deepEqual(sums,[39,102,57,56,54,98]);
assert.deepEqual(spell.slice(2,5),[[7,24,26],[19,24,13],[4,3,24,23]]);
assert.equal(corpus.pages.length,58);
assert.deepEqual([54,55,56,57].map((p) => corpus.pages[p].indices.length),[232,76,85,95]);
assert.equal(tokens[57],"1w"); // Literal one west on an 8-column grid is page/address 56.
assert.equal(57%8,1);
assert.equal(56%8,0);
const addressed = sums.map((v,i) => ({word:followers[i],gp0:v,
  inBook:v>=0&&v<58,pageRuneCount:v>=0&&v<58?corpus.pages[v].indices.length:null}));
assert.deepEqual(addressed.filter((v)=>v.inBook).map((v)=>[v.word,v.gp0]),
 [["PATH",39],["WAY",57],["MAP",56],["ROAD",54]]);
// PATH also has an in-book page address, and must be charged as a competing
// address. The selected terminal triple is therefore 3 of 4 valid addresses.

/** Mulberry32 seeded permutation stream. @param {number} seed */
function randomFactory(seed) {
  let x = seed>>>0;
  return () => {
    x = (x + 0x6D2B79F5)>>>0;
    let t = x;
    t = Math.imul(t^(t>>>15),t|1);
    t ^= t + Math.imul(t^(t>>>7),t|61);
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
const seed = 0x4ea7f137;
const random = randomFactory(seed);
const runs=1000000;
let selectedExact=0, allTriplesExact=0, allTriplesDescendingTerminal=0, allTriplesTerminal=0;
for(let sample=0;sample<runs;sample++){
  const pi = Array.from({length:29},(_,i)=>i);
  for(let j=28;j>0;j--){
    const k=Math.floor(random()*(j+1));
    [pi[j],pi[k]]=[pi[k],pi[j]];
  }
  const totals=spell.map((item)=>item.reduce((sum,v)=>sum+pi[v],0));
  if(totals[2]===57&&totals[3]===56&&totals[4]===54)selectedExact++;
  let hitExact=false,hitDescending=false,hitTerminal=false;
  for(let i=0;i+2<totals.length;i++){
    const q=totals.slice(i,i+3);
    if(q[0]===57&&q[1]===56&&q[2]===54)hitExact=true;
    if(q.every(v=>v>=54&&v<=57)){
      hitTerminal=true;
      if(q[0]>q[1]&&q[1]>q[2])hitDescending=true;
    }
  }
  if(hitExact)allTriplesExact++;
  if(hitDescending)allTriplesDescendingTerminal++;
  if(hitTerminal)allTriplesTerminal++;
}
assert.deepEqual([selectedExact,allTriplesExact,allTriplesDescendingTerminal,allTriplesTerminal],
 [8,17,67,915]);

// A distinct, broader discriminator: apply precisely the same GP0→physical
// page proposal to ALL 43 signed words, counting invalid addresses and the
// clustered terminal addresses. This avoids hiding the other source words.
const wholeWordIndices = words.map(gp);
const wholeSums = wholeWordIndices.map((item) => item.reduce((a,b) => a+b,0));
const wholeInBook = wholeSums.filter((v) => v>=0&&v<58).length;
const sourceTerminal = wholeSums.map((v,i) => ({word:words[i].toUpperCase(),page:v}))
 .filter(({page}) => page===54||page===56||page===57);
assert.equal(wholeInBook,28);
assert.deepEqual(sourceTerminal.map((v)=>v.page),[57,56,54,56,56,56,57,54]);
assert.equal(wholeSums.filter((v)=>v===55).length,0);

const broadSeed=0x37f90bca, broadRandom=randomFactory(broadSeed), broadRuns=250000;
let terminalAtLeast8=0, terminalAtLeast8AndNo55=0, anyValidTotal=0;
for(let sample=0; sample<broadRuns; sample++){
  const pi=Array.from({length:29},(_,i)=>i);
  for(let j=28;j>0;j--){
    const k=Math.floor(broadRandom()*(j+1));
    [pi[j],pi[k]]=[pi[k],pi[j]];
  }
  let terminal=0, at55=0;
  for(const word of wholeWordIndices){
    let sum=0;
    for(const index of word)sum+=pi[index];
    if(sum===54||sum===56||sum===57)terminal++;
    if(sum===55)at55++;
    if(sum>=0&&sum<58)anyValidTotal++;
  }
  if(terminal>=8){
    terminalAtLeast8++;
    if(at55===0)terminalAtLeast8AndNo55++;
  }
}
assert.equal(terminalAtLeast8,372);
assert.equal(terminalAtLeast8AndNo55,260);
assert.equal(anyValidTotal/broadRuns,24.032748);


console.log(JSON.stringify({
 source:"Cicada 2016 original clearsigned LP2 words/numbers instruction",
 observedFollowers:addressed,
 terminalSelection:["WAY→clear p57","MAP→cipher-solved p56","ROAD→unsolved p54, beginning of p54–55"],
 paragraphNumbering:"zero-based physical LP2 image indices and zero-based official GP29 rune indices",
 extraValidFollowerAddress:"PATH→p39, explicitly retained as competing mapping",
 sourceVisibleCorroboration:"p50 grid token at GP0(WAY)=57 is 1w, physically west one column→56",
 nullModel:"1m common random 29-symbol GP-index permutations, fixed six follower spellings; conditional only",
 seed, runs, selectedExact, allTriplesExact, allTriplesDescendingTerminal, allTriplesTerminal,
 empiricalSelectedExact:selectedExact/runs,
 empiricalFourTriplesExact:allTriplesExact/runs,
 empiricalFourTriplesDescendingTerminal:allTriplesDescendingTerminal/runs,
 fullMessage: {
  validPageAddresses:wholeInBook, invalidPageAddresses:words.length-wholeInBook,
  sourceTerminal, sourcePage55WordCount:0,
  broadNullSeed:broadSeed, broadNullRuns:broadRuns,
  broadNullExpectedValid: anyValidTotal/broadRuns,
  terminalAtLeast8, terminalAtLeast8AndNo55,
  pTerminalAtLeast8:terminalAtLeast8/broadRuns,
  pTerminalAtLeast8AndNo55:terminalAtLeast8AndNo55/broadRuns
 },
 verdict:"Candidate signed-source navigation across known and unsolved terminal pages; no source-selected decryption opcode and no unknown plaintext."
},null,2));
