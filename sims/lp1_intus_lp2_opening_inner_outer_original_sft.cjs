"use strict";

/**
 * SFT: node sims/lp1_intus_lp2_opening_inner_outer_original_sft.cjs
 *
 * Original LP1 front matter "Chapter 1 / Intus" suggests "within".
 * Here one literal word-inside extraction is tested as a full reversible
 * split, preserving true p0->p1 and p1->p2 cross-page carries.
 * It does not purport to identify an author-specified LP2 cipher.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root=path.join(__dirname,"..");
/** @param {string} file */
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp2=read("resources/lp2-transcription.txt").split("%");
const lp1=read("resources/transcriptions/lp1_wulfic_canonical.txt").split("%");
assert.equal(lp2.length,57);
assert.equal(lp1.length,16); // Fifteen rune-bearing segments plus terminal separator

/** 
 * Match the original master grammar. Slash is a line wrap, not a word.
 * Page separators must be removed BEFORE word splitting when a word crosses.
 * @param {string} source
 * @returns {string[]}
 */
function printedWords(source) {
  return source.replace(/[\/\r\n]/gu,"").split(/[-.&$§,:!?]/u)
    .map(x=>(x.match(/[ᚠ-᛿]+/gu)||[]).join("")).filter(Boolean);
}
/** @param {string} word */
function splitWord(word) {
  const a=[...word];
  return {
    edge: a.length<2 ? a : [a[0],a[a.length-1]],
    inner: a.slice(1,-1),
    length: a.length
  };
}
/** @param {{edge:string[],inner:string[],length:number}} item */
function rejoin(item) {
  return item.length===1 ? item.edge.join("")
    : [item.edge[0],...item.inner,item.edge[1]].join("");
}
/** @param {string[]} words */
function sizes(words) {
  const parts=words.map(splitWord);
  return {
    words:words.length,
    runes:parts.reduce((n,x)=>n+x.length,0),
    edge:parts.reduce((n,x)=>n+x.edge.length,0),
    inner:parts.reduce((n,x)=>n+x.inner.length,0),
    singleton:parts.filter(x=>x.length===1).length
  };
}
const originalOpening=lp2.slice(0,3).join("");
const openingWords=printedWords(originalOpening);
const pageParts=lp2.slice(0,3).map(printedWords);
assert.deepEqual(pageParts.map(sizes).map(x=>[x.words,x.runes]),[
  [59,262],[63,266],[38,201]
]);
assert.deepEqual(sizes(openingWords), {
  words:158,runes:729,edge:311,inner:418,singleton:5
});
assert.deepEqual(pageParts[0].slice(-1),["ᚹ"]);
assert.equal(pageParts[1][0],"ᚪᛁᛗᛋᚾ");
assert.equal(pageParts[1].at(-1),"ᛚᛉᛁ");
assert.equal(pageParts[2][0],"ᛟᛗ");
assert(openingWords.includes("ᚹᚪᛁᛗᛋᚾ"));
assert(openingWords.includes("ᛚᛉᛁᛟᛗ"));
assert.deepEqual(openingWords.map(rejoinDummy),openingWords);
function rejoinDummy(w){return rejoin(splitWord(w));}

const sourceTape=openingWords.join("");
const corpusTape=corpus.pages.slice(0,3).flatMap(p=>p.indices)
  .map(i=>corpus.runes[i]).join("");
assert.equal(corpusTape.length,729);
assert.equal(sourceTape,corpusTape);
const sourceInners=openingWords.flatMap(w=>splitWord(w).inner).join("");
const sourceEdges=openingWords.flatMap(w=>splitWord(w).edge).join("");
assert.equal([...sourceEdges].length,311);
assert.equal([...sourceInners].length,418);
assert.equal(sourceEdges.length+sourceInners.length,729);

const lp1Clear=printedWords(lp1[3]);
assert.equal(lp1Clear[0],"ᛋᚩᛗᛖ"); // SOME WISDOM, actually clear GP
assert.equal(lp1Clear[1],"ᚹᛁᛋᛞᚩᛗ");
assert.deepEqual(sizes(lp1Clear),{
  words:31,runes:157,edge:62,inner:95,singleton:0
});
assert.deepEqual(lp1Clear.slice(0,2).map(w=>splitWord(w).inner.join("")),[
  "ᚩᛗ","ᛁᛋᛞᚩ"
]);
assert.deepEqual(lp1Clear.map(rejoinDummy),lp1Clear);

console.log(JSON.stringify({
  verdict:"front-matter INTUS lacks a source-selected GP29 value-changing decoder",
  source_layout:{
    original_LP1_front_matter:"00.jpg LIBER PRIMUS; 02.jpg Chapter 1 INTUS",
    original_LP2_first_page:"17.jpg physical LP2 p0",
    signed_2014_stage11_page_links:"58 original LP2 images only, no LP1 front matter"
  },
  true_cross_page_original_word_carries:[
    {p0_to_p1:"ᚹ"+"ᚪᛁᛗᛋᚾ"},
    {p1_to_p2:"ᛚᛉᛁ"+"ᛟᛗ"}
  ],
  original_lp2_opening:sizes(openingWords),
  original_lp2_individual_pages:pageParts.map(sizes),
  solved_lp1_clear_p3:sizes(lp1Clear),
  first_clear_control:"SOME WISDOM",
  clear_control_inside_only:"OM ISDO",
  opening_original_runes_replayed:729,
  available_cryptographic_opcode:false,
  original_unknown_plaintext_recovered:false
},null,2));