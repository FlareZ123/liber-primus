"use strict";

/**
 * P55 whole-manuscript H-sum familywise selection bound. Node 22, Windows 11.
 * Usage from the repository root:
 * node sims/lp2_p55_hsum_familywise_55page_original_sft.cjs
 *
 * For each of the 55 originally runic unknown pages, exactly preserve
 * all original printed page-local word multisets, lengths and number of
 * adjacent equal runes. Freeze H(x,y) = x+y mod29 before evaluating.
 * No network, external packages, local writes or fitted thresholds.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-corpus.json"
), "utf8"));
const text = fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-transcription.txt"
), "utf8");
const runes = new Map([...gp.runes].map((c,i)=>[c,i]));
const sourcePages = text.split("%");
assert.equal(sourcePages.length,57);
const pages = [];
for (let physical=0;physical<=55;physical++) {
  if (physical === 50) continue;
  const source = sourcePages[physical<50 ? physical : physical-1];
  const words = source.replaceAll("/", "").split("-").map(part =>
    [...part].filter(c=>runes.has(c)).map(c=>runes.get(c))
  ).filter(w=>w.length);
  assert.deepEqual(words.flat(), gp.pages[physical].indices);
  pages.push({physical, words, doubles:words.map(doublets)});
}
assert.equal(pages.length,55);

/** @param {number[]} symbols @returns {number} */
function doublets(symbols) {
  let count=0;
  for(let i=1;i<symbols.length;i++) if(symbols[i]===symbols[i-1]) count++;
  return count;
}

/**
 * H-sum outer-pair GP29 concentration. The result carries its
 * actual number of pair-sites for the exact physical printed words.
 * @param {number[][]} words
 * @returns {{n:number,ioc:number,z:number}}
 */
function score(words) {
  const hist = Array(29).fill(0);
  let n=0;
  for(const word of words) {
    for(let j=0;j<Math.floor(word.length/2);j++) {
      hist[(word[j]+word[word.length-1-j])%29]++;
      n++;
    }
  }
  assert(n>=2);
  const ioc=hist.reduce((s,k)=>s+k*(k-1),0)/(n*(n-1));
  const uniformSd=Math.sqrt(56/(841*n*(n-1)));
  return {n,ioc,z:(ioc-1/29)/uniformSd};
}

const original=pages.map(({physical,words})=>({physical,...score(words)}))
  .sort((a,b)=>b.z-a.z);
assert.equal(original[0].physical,55);
assert.equal(original[0].n,35);
assert.equal(original[0].ioc,0.058823529411764705);
assert(Math.abs(original[0].z-3.2539568672798422)<1e-10);
const originalMax=original[0].z;

let seed=0x33019998;
/** @returns {number} */
function randomInt() {
  seed^=seed<<13;
  seed^=seed>>>17;
  seed^=seed<<5;
  return seed>>>0;
}

/**
 * Fisher-Yates randomization conditioned on the exact original
 * word's adjacent doublet count. No change to word inventory or size.
 * @param {number[]} originalWord
 * @param {number} sourceDoubles
 * @returns {number[]}
 */
function shuffleWord(originalWord,sourceDoubles) {
  let result;
  do {
    result=originalWord.slice();
    for(let i=result.length-1;i>0;i--) {
      const j=randomInt()%(i+1);
      [result[i],result[j]]=[result[j],result[i]];
    }
  } while(doublets(result)!==sourceDoubles);
  return result;
}

const nTrials=5000;
let familyGE=0,p55GE=0,p55Wins=0;
const maxScores=[];
for(let trial=0;trial<nTrials;trial++) {
  let max=-Infinity,winner=-1,p55z=-Infinity;
  for(const page of pages) {
    const shuffled=page.words.map((w,j)=>shuffleWord(w,page.doubles[j]));
    const scored=score(shuffled);
    if(scored.z>max) {max=scored.z;winner=page.physical;}
    if(page.physical===55) p55z=scored.z;
  }
  if(max>=originalMax) familyGE++;
  if(p55z>=originalMax) p55GE++;
  if(winner===55) p55Wins++;
  maxScores.push(max);
}
maxScores.sort((a,b)=>a-b);
assert.equal(familyGE,1052);
assert.equal(p55GE,49);
assert.equal(p55Wins,158);
console.log(JSON.stringify({
  source:"Original 55 LP2 runic unknown pages, unchanged physical page-local word groups",
  sourceRunicUnknownPages:55,
  observedTopFive:original.slice(0,5),
  fixedOperation:"wordwise outer GP29 sum; full page maximum of exact uniform29-standardized IoC",
  conditionalNull:"within each printed word preserve glyph multiset, word length and original adjacent doublet count",
  seed:"0x33019998",
  surrogateBooks:nTrials,
  page55ScoreGE:p55GE,
  page55ConditionalP:(p55GE+1)/(nTrials+1),
  manuscriptsWithAtLeastOnePageGE:familyGE,
  familywiseP:(familyGE+1)/(nTrials+1),
  nullMedianMaxZ:maxScores[Math.floor(0.5*nTrials)],
  null75thMaxZ:maxScores[Math.floor(0.75*nTrials)],
  null95thMaxZ:maxScores[Math.floor(0.95*nTrials)],
  page55AsNullBookWinner:p55Wins,
  decision:"Page55 source-shaped H-sum IoC is a conditional candidate, but its being the highest of 55 pages is NOT unusual under manuscript-wide selection; no recovered plaintext"
},null,2));
