"use strict";
/**
 * Exact, independently colour-selected LP2 red51 twelve-word plaintext-source
 * alignment. Uses only the previously fixed historical GITenberg bibliography.
 *
 * No ciphertext rune value is used to select an English book or phrase.
 * The result is a crib candidate, never a decrypted claim without a key.
 * @module red51_source_phrase_crib
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {runeLength,englishWords} = require("./wordlength_crib_scan.js");
const {cleanGutenberg,selectBooks,fetchEdition} =
  require("./padded_wordlength_corpus.cjs");
const ROOT = path.resolve(__dirname,"..");
const SPAN = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-page53-red-span.json"),"utf8"));
const CORPUS = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const TARGET = SPAN.red_text.word_lengths;
assert.deepEqual(TARGET,[5,4,4,11,2,3,2,6,5,5,2,2]);
assert.equal(SPAN.lp2_page,53);
const sourcePage = CORPUS.pages.find(p=>p.page===53);
assert.equal(SPAN.red_text.rune_count,51);
assert.equal(sourcePage.indices.length,SPAN.page_rune_count);
assert.equal(TARGET.reduce((s,n)=>s+n,0),SPAN.red_text.rune_count);

const reverseTarget = [...TARGET].reverse();
const MODES = [["printed",TARGET],["reverse-word-order",reverseTarget]];
/**
 * @param {number[]} sourceLengths
 * @param {string[]} sourceWords
 * @returns {{best:object[], strong:object[], inspected:number}}
 */
function scan(sourceLengths,sourceWords) {
  const best=[],strong=[];
  for(const [mode,target] of MODES){
    let bestScore=-1, hits=[];
    for(let j=0;j+target.length<=sourceLengths.length;j++){
      let exact=0;
      for(let i=0;i<target.length;i++)
        if(sourceLengths[j+i]===target[i])exact++;
      if(exact>bestScore){bestScore=exact;hits=[];}
      if(exact===bestScore && hits.length<5)
        hits.push({mode,start:j,matched:exact,wordLengths:sourceLengths.slice(j,j+12),
          phrase:sourceWords.slice(j,j+12).join(" ")});
      if(exact>=10 && strong.length<300)
        strong.push({mode,start:j,matched:exact,
          wordLengths:sourceLengths.slice(j,j+12),
          phrase:sourceWords.slice(j,j+12).join(" ")});
    }
    best.push({mode,matched:bestScore,ties: hits});
  }
  return {best,strong,inspected:2*Math.max(0,sourceLengths.length-TARGET.length+1)};
}
/** @returns {object} */
function selfTest(){
  const forward=TARGET.map((n)=>"R".repeat(n));
  const backward=[...forward].reverse();
  const from=Array(14).fill("X");
  const words=from.concat(forward,from,backward,from);
  const lengths=words.map(runeLength);
  assert.deepEqual(forward.map(runeLength),TARGET);
  const r=scan(lengths,words);
  assert.equal(r.best[0].matched,12);
  assert.equal(r.best[1].matched,12);
  assert(r.strong.some(e=>e.mode==="printed"&&e.start===14));
  assert(r.strong.some(e=>e.mode==="reverse-word-order"&&e.start===40));
  return {plantWords:words.length,
    exactForwardAt:14,exactReverseAt:40,passed:true};
}
async function main(){
  const plant=selfTest();
  const books=(await selectBooks()).slice(0,Number(process.env.MAX_BOOKS||92));
  const results=[],failures=[];
  for(const [i,book] of books.entries()){
    try{
      const content=cleanGutenberg(await fetchEdition(book));
      const words=englishWords(content);
      if(words.length<300||words.length>2000000)continue;
      const found=scan(words.map(runeLength),words);
      const sha256=crypto.createHash("sha256").update(content).digest("hex");
      results.push({id:book.id,title:book.title,sha256,
        words:words.length,...found});
      for(const hit of found.strong)
        console.log("STRONG",JSON.stringify({id:book.id,title:book.title,...hit}));
    }catch(e){failures.push({id:book.id,error:String(e)});}
    if((i+1)%25===0)console.log("PROGRESS",
      JSON.stringify({seen:i+1,scanned:results.length,
        maxMatched:Math.max(...results.flatMap(r=>r.best.map(b=>b.matched)))}));
  }
  const tops=results.flatMap(r=>r.best.map(b=>({
    id:r.id,title:r.title,sha256:r.sha256,words:r.words,
    mode:b.mode,matched:b.matched,ties:b.ties})))
    .sort((a,b)=>b.matched-a.matched);
  const exact=tops.filter(r=>r.matched===12);
  const near=tops.filter(r=>r.matched>=10);
  console.log("SUMMARY",JSON.stringify({
    target:TARGET,localOffset:[128,179],sourceImage:"70.jpg",
    scope:"exact 12 complete GP word lengths in 92 preselected GITenberg literary editions, plus reverse word order; <=2 length substitutions reported",
    noCipherRuneMatchingOrFittedKey:true,
    booksSelected:books.length,booksScanned:results.length,failed:failures,
    sourceWindowsScanned:results.reduce((s,r)=>s+r.inspected,0),
    exactBookOrientationPairs:exact.length,strongBookOrientationPairs:near.length,
    exact,near,top:tops.slice(0,12),positive:plant
  }));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={TARGET,scan,selfTest,main};
