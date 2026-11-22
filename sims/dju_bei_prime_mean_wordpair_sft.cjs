"use strict";

/** Exact word-pair, prime-mean and page-preserving source ledger. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname,"..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const {words,runeCount,crossPageWords} = parseSharedCorpus();
assert.equal(words.length,2896);
assert.equal(runeCount,12956);
assert.equal(crossPageWords,32);
const weights = new Map(corpus.runes.map((r,i) => [r,corpus.prime[i]]));
/** @param {string} runes @returns {number} */
function sum(runes) {
  return Array.from(runes).reduce((n,r)=>n+weights.get(r),0);
}
/** @param {string} runes @returns {string|null} */
function meanPrimeRune(runes) {
  const value=sum(runes)/Array.from(runes).length;
  const i=corpus.prime.indexOf(value);
  return i===-1 ? null : corpus.translit[i];
}

const pairMap=new Map();
for(let i=0;i<words.length-1;i++){
  const key=words[i].runes+"|"+words[i+1].runes;
  let at=pairMap.get(key);
  if(!at){at=[];pairMap.set(key,at);}
  at.push(i);
}
const repeated=Array.from(pairMap).filter(x=>x[1].length>1);
assert.equal(repeated.length,1);
const [key,at]=repeated[0];
assert.deepEqual(at,[1462,2894]);
assert.equal(key,"ᛞᛄᚢ|ᛒᛖᛁ");
assert.deepEqual(at.map(i=>physicalLP2Page(words[i].startPage)),[27,55]);
assert.equal(sum(words[at[0]].runes),129);
assert.equal(sum(words[at[0]+1].runes),159);
assert.equal(meanPrimeRune(words[at[0]].runes),"P");
assert.equal(meanPrimeRune(words[at[0]+1].runes),"S");
assert.equal(129+159,288);
assert.equal(288%corpus.pages.length,56);
assert.equal(Math.floor(288/corpus.pages.length),4);

let adjacent33=0;
const primeMeanPairs=new Map();
for(let i=0;i<words.length-1;i++){
  if(words[i].length!==3||words[i+1].length!==3)continue;
  adjacent33++;
  const a=meanPrimeRune(words[i].runes);
  const b=meanPrimeRune(words[i+1].runes);
  if(a!==null&&b!==null){
    const value=a+"|"+b;
    let loc=primeMeanPairs.get(value);
    if(!loc){loc=[];primeMeanPairs.set(value,loc);}
    loc.push(i);
  }
}
assert.equal(adjacent33,184);
assert.deepEqual(Array.from(primeMeanPairs),[
  ["S|H",[315]],["P|S",[1462,2894]],["P|P",[1654]]
]);

/** Number of available ordered adjacent 3-rune positions on one physical page. */
function scope(page) {
  const positions=words.flatMap((w,i)=>physicalLP2Page(w.startPage)===page&&w.length===3?[i]:[]);
  const entries=new Set(positions);
  const edges=positions.filter(i=>entries.has(i+1)).length;
  return {page,n:positions.length,edges,probability:edges/(positions.length*(positions.length-1))};
}
const p27=scope(27),p55=scope(55);
assert.deepEqual([p27.n,p27.edges,p55.n,p55.edges],[13,4,2,1]);
const exactConditional=p27.probability*p55.probability;
assert.equal(exactConditional,1/78);

/**
 * Find all non-overlapping repeated contiguous runic strings, including
 * page transitions but preserving original physical page order.
 * @param {number[]} stream
 * @param {number} width
 * @returns {{first:number,second:number}[]}
 */
function duplicatedWindows(stream,width) {
  const seen=new Map();
  const duplicates=[];
  for(let i=0;i+width<=stream.length;i++){
    const key=stream.slice(i,i+width).join(",");
    const first=seen.get(key);
    if(first===undefined)seen.set(key,i);
    else if(i-first>=width)duplicates.push({first,second:i});
  }
  return duplicates;
}

// The previously established repeated DJU BEI is exactly 28 physical
// pages apart: p27 is the end of the first 28-page half (0..27) and p55
// is the end of the second (28..55). The p27 following rune is AE.
// Crucially, the *first rune of independently solved physical p56* is
// also AE. The unique 7-symbol repetition in all 58 physical LP2 pages
// therefore crosses from unknown p55 into solved p56. There is no
// repeated 7-mer wholly inside the 56 unknown pages.
const unsolved=corpus.pages.slice(0,56).flatMap(p=>p.indices);
const full=corpus.pages.flatMap(p=>p.indices);
assert.equal(unsolved.length,12956);
assert.equal(full.length,13136);
assert.deepEqual(duplicatedWindows(unsolved,7),[]);
const crossPageSeven=duplicatedWindows(full,7);
assert.deepEqual(crossPageSeven,[{first:6555,second:12950}]);
const p27Runes=corpus.pages[27].indices;
const p55Runes=corpus.pages[55].indices;
const p56Runes=corpus.pages[56].indices;
assert.deepEqual(p27Runes.slice(28,35),[23,11,1,17,18,10,25]);
assert.deepEqual([...p55Runes.slice(70),p56Runes[0]],[23,11,1,17,18,10,25]);
assert.equal(55-27,28);

console.log(JSON.stringify({
  runes:runeCount,words:words.length,only_exact_repeated_adjacent_pair:key,
  word_indices:at,pages:[27,55],source_prime_sums:[129,159],
  gp_prime_means:[43,53],mean_gp_letters:["P","S"],
  combined_sum:288,conditional_existing_map:"p56 word4 = DEEP",
  all_adjacent_3_3_pairs:adjacent33,
  all_valid_double_prime_means:Object.fromEntries(primeMeanPairs),
  page_conditioned_length_slot_null:{p27:scope(27),p55:scope(55),joint:exactConditional,
    interpretation:"fixed page identities and exact length slots; not discovery-wide"},
  boundary_seven:{
    only_full_lp2_repeated_seven:crossPageSeven,
    none_in_unknown_pages:true,
    p27:[28,35],
    p55_last_six:[70,76],
    p56_first_rune:"AE",
    physical_page_gap:28,
    source_scope:"the seventh glyph is the first glyph on the independently solved p56; it is not a seventh unknown ciphertext rune",
  },
  result:"conditional source-word clue only; no recovered unknown plaintext/key"
},null,2));
