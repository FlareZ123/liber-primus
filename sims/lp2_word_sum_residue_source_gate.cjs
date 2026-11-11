"use strict";

/**
 * Source-gated all-secret sum-preserving word cipher necessary condition.
 *
 * Given any ciphertext word C and plaintext word P with a secret *fixed*
 * permutation sigma of 29 residues, S(C)=sigma(S(P)) where S is the
 * GP-prime sum mod 29, the residue collision count and Pearson chi-square
 * to a uniform 29-way baseline are invariant. This SFT compares the
 * original LP2 word-sum register to all contiguous 2,896-word windows
 * of four independently pinned natural-language controls, without a key,
 * dictionary matching or language model.
 *
 * Node.js 22 / CommonJS. Run from repository root:
 * node sims/lp2_word_sum_residue_source_gate.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const primes=source.prime;
const rune=new Map(source.runes.map((r,i)=>[r,i]));
const translit=new Map(source.translit.map((r,i)=>[r,i]));
const latinAlphabet="0123456789ABCDEFGHIJKLMNOPQRS";
const latinIndex=new Map([...latinAlphabet].map((r,i)=>[r,i]));
const N=2896,MOD=29,EXPECTED=N/MOD;

/** @param {number[]} codes */
function residue(codes) {
  let n=0;
  for(const index of codes) {
    assert(Number.isInteger(index)&&index>=0&&index<MOD);
    n=(n+primes[index])%MOD;
  }
  return n;
}
/** @param {string} s */
function englishGp(s) {
  // Established source-control transliteration, including long digraphs.
  const parts=s.toUpperCase().replace(/V/g,"U").replace(/K/g,"C")
    .replace(/Z/g,"S").replace(/Q/g,"C")
    .match(/TH|NG|EO|OE|AE|IA|EA|[A-Z]/g)||[];
  return parts.map(part=>{
    const index=translit.get(part);
    assert(index!==undefined,part);
    return index;
  });
}
/** @param {number[]} a */
function bins(a) {
  const h=Array(MOD).fill(0);
  for(const x of a)h[x]++;
  return h;
}
/** @param {number[]} h */
function chiSquare(h) {
  return h.reduce((total,x)=>total+(x-EXPECTED)**2/EXPECTED,0);
}
/**
 * Enumerate every contiguous source prose window with exactly N words.
 * Update the Pearson statistic by O(1) exact bin contributions.
 * @param {number[]} a
 */
function contiguousScreen(a) {
  assert(a.length>=N);
  const h=bins(a.slice(0,N));
  let score=chiSquare(h),min=score,minStart=0,below=0,max=score;
  if(score<=OBSERVED+1e-8)below++;
  for(let i=N;i<a.length;i++){
    const removed=a[i-N],added=a[i];
    if(removed!==added){
      const old=h[removed],newCount=h[added];
      score+=((old-1-EXPECTED)**2-(old-EXPECTED)**2
             +(newCount+1-EXPECTED)**2-(newCount-EXPECTED)**2)/EXPECTED;
      h[removed]--; h[added]++;
    }
    if(score<min){min=score;minStart=i-N+1;}
    if(score>max)max=score;
    if(score<=OBSERVED+1e-8)below++;
  }
  assert.equal(h.reduce((a,b)=>a+b,0),N);
  return {sourceWords:a.length,windows:a.length-N+1,
    minChiSquare:min,minAtWord:minStart,maxChiSquare:max,
    windowsNoMoreConcentratedThanLP2:below};
}

const original=parseSharedCorpus();
assert.equal(original.words.length,N);
assert.equal(original.runeCount,12956);
assert.equal(original.crossPageWords,32);
const unknown=original.words.map(w=>[...w.runes].map(r=>{
  const i=rune.get(r); assert(i!==undefined); return i;
}));
const originalSums=unknown.map(residue);
const OBSERVED=chiSquare(bins(originalSums));
assert.ok(Math.abs(OBSERVED-24.247928176795586)<1e-9);

const latin=read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/).filter(w=>/^[0-9A-S]+$/.test(w))
  .map(w=>[...w].map(x=>latinIndex.get(x)));
const books=[
  ["Vulgate",latin],
  ["Shakespeare",read("resources/control/shakespeare_first300k.txt")
    .toUpperCase().match(/[A-Z]+/g).map(englishGp)],
  ["Gibran",read("resources/control/gibran_prophet_58585.txt")
    .toUpperCase().match(/[A-Z]+/g).map(englishGp)],
  ["Emerson",read("resources/control/emerson_essays_2944.txt")
    .toUpperCase().match(/[A-Z]+/g).map(englishGp)],
];

const results={},EXPECTED_MIN={Vulgate:527.0214088397765,
  Shakespeare:401.34806629834435,
  Gibran:886.7976519337311,
  Emerson:504.47030386741125};
for(const [name,words] of books){
  const data=words.map(residue);
  const screen=contiguousScreen(data);
  assert.equal(screen.windowsNoMoreConcentratedThanLP2,0);
  assert.ok(Math.abs(screen.minChiSquare-EXPECTED_MIN[name])<1e-7,
    name+" "+screen.minChiSquare);

  // Full-sum fingerprint tests are independent of the residue test.
  // A copy of >=4 intact consecutive original English/Latin GP word-sums
  // from these pinned corpora would be an immediately testable plaintext.
  // Current source corpus has zero matches.
  const dictionary=new Set();
  for(let i=0;i+4<=words.length;i++){
    const frame=words.slice(i,i+4).map(w=>
      w.reduce((z,v)=>z+primes[v],0)).join(",");
    dictionary.add(frame);
  }
  let hits=0;
  for(let i=0;i+4<=unknown.length;i++){
    const frame=unknown.slice(i,i+4).map(w=>
      w.reduce((z,v)=>z+primes[v],0)).join(",");
    if(dictionary.has(frame))hits++;
  }
  assert.equal(hits,0);
  results[name]={...screen,verbatimFourWordPrimeSumMatches:hits};
}

// Blind positive: hide real English word sums through an arbitrary
// nontrivial 29-way bijection, then realize every transformed residue
// as a pair of *distinct* GP29 output glyphs. The ciphertext thus has
// unrelated rune content and only two-rune words, but the sum-register
// chi-square is invariant under the hidden 29-way permutation.
const pairs=Array.from({length:MOD},(_,v)=>{
  for(let i=0;i<MOD;i++)for(let j=0;j<MOD;j++)
    if(i!==j&&(primes[i]+primes[j])%MOD===v)return [i,j];
  throw Error("No two-rune codeword for residue "+v);
});
const plantWords=books[1][1].slice(0,N);
const originalPlantResidues=plantWords.map(residue);
const hidden=r=>(7*r+11)%MOD;
const ciphertextPlant=originalPlantResidues.map(r=>pairs[hidden(r)]);
const decodedResidues=ciphertextPlant.map(w=>((residue(w)-11+MOD)*25)%MOD);
assert.deepEqual(decodedResidues,originalPlantResidues);
assert.ok(Math.abs(chiSquare(bins(ciphertextPlant.map(residue)))
             -chiSquare(bins(originalPlantResidues)))<1e-9);
assert.equal(ciphertextPlant.every(w=>w[0]!==w[1]),true);

console.log(JSON.stringify({
  interpretation:"A fixed 29-way re-encoding of plaintext word GP-prime sums would preserve the sum histogram under secret residue relabeling.",
  original:{physicalRunePages:55,runes:original.runeCount,words:N,
    crossPageWords:original.crossPageWords,sumMod29ChiSquare:OBSERVED,
    histogram:bins(originalSums)},
  df:28,
  exactSourceWindowScreens:results,
  independentPositive:{source:"Shakespeare, first 2896 GP words",
    secretResidueAffineMap:"7*r+11 mod29",
    outputWordLength:2,
    outputGlyphPairsDistinct:true,
    sumResiduesRecoveredExactly:N,
    histogramChiSquareInvariant:true},
  scope:"Finite controls only. No plaintext recovered. Rejects a shared secret fixed word-prime-sum residue relabeling of conventional English/Latin source as direct LP2 ciphertext."
},null,2));
