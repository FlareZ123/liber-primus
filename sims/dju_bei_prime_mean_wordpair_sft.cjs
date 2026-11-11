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

console.log(JSON.stringify({
  runes:runeCount,words:words.length,only_exact_repeated_adjacent_pair:key,
  word_indices:at,pages:[27,55],source_prime_sums:[129,159],
  gp_prime_means:[43,53],mean_gp_letters:["P","S"],
  combined_sum:288,conditional_existing_map:"p56 word4 = DEEP",
  all_adjacent_3_3_pairs:adjacent33,
  all_valid_double_prime_means:Object.fromEntries(primeMeanPairs),
  page_conditioned_length_slot_null:{p27,p55,joint:exactConditional,
    interpretation:"fixed page identities and exact length slots; not discovery-wide"},
  result:"conditional source-word clue only; no recovered unknown plaintext/key"
},null,2));
