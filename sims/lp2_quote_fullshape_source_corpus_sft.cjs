"use strict";

/**
 * Complete 14-word p40/p53 quote-shape comparisons against frozen,
 * independently sourced native-Latin/English reference texts.
 *
 * This tests word-length plaintext cribs, not the runic ciphertext key.
 * Run: node sims/lp2_quote_fullshape_source_corpus_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const BASE = path.resolve(__dirname, "..", "resources");
const read = p => fs.readFileSync(path.join(BASE, p), "utf8");
const RUNIC = /[\u16A0-\u16FF]/u;
const BREAK = /[-.&$§]/u;
const DIGRAPHS = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);

/** @param {string} word @returns {number} */
function gpLength(word) {
  let n = 0;
  for (let i = 0; i < word.length; i++) {
    if (i + 1 < word.length && DIGRAPHS.has(word.slice(i,i+2))) i++;
    n++;
  }
  return n;
}

/** @param {string} raw @param {number} physicalPage
 * @param {number} runeStart @param {number} targetRunes
 * @returns {number[]}
 */
function quoteShape(raw, physicalPage, runeStart, targetRunes) {
  const pageTranscriptIndex = physicalPage < 50 ? physicalPage : physicalPage - 1;
  const source = raw.split("%")[pageTranscriptIndex];
  let sourceOffset = 0, captured = 0, current = 0;
  const shape = [];
  for (const char of source) {
    if (RUNIC.test(char)) {
      if (sourceOffset >= runeStart && captured < targetRunes) {
        current++;
        captured++;
        if (captured === targetRunes) {
          shape.push(current);
          break;
        }
      }
      sourceOffset++;
    } else if (BREAK.test(char) && captured > 0 && current > 0) {
      shape.push(current);
      current = 0;
    }
  }
  assert.equal(captured,targetRunes);
  return shape;
}

const QUOTES = [
  {page:40, runeStart:171, runes:58, shape:[5,7,2,3,4,6,4,3,3,4,4,4,5,4]},
  {page:53, runeStart:53, runes:70, shape:[5,7,2,3,4,10,3,9,7,3,7,4,3,3]}
];
const CORPORA = [
  ["Gibran, The Prophet","control/gibran_prophet_58585.txt",15733],
  ["Emerson, Essays","control/emerson_essays_2944.txt",77932],
  ["Shakespeare excerpt","control/shakespeare_first300k.txt",55407]
];

/** @param {number[]} lengths @param {number[]} shape
 * @param {string[]} words
 * @returns {{matchesFive:number,maxPrefix:number,fullMatches:number,bestExample:string}}
 */
function scan(lengths, shape, words) {
  let matchesFive=0, maxPrefix=0, fullMatches=0,bestExample="";
  for (let i=0;i<=words.length-shape.length;i++) {
    if (lengths[i]!==shape[0]) continue;
    let n=1;
    while (n<shape.length && lengths[i+n]===shape[n]) n++;
    if (n>=5) matchesFive++;
    if (n===shape.length) fullMatches++;
    if (n>maxPrefix) {
      maxPrefix=n;
      bestExample=words.slice(i,i+shape.length).join(" ");
    }
  }
  return {matchesFive,maxPrefix,fullMatches,bestExample};
}

function main(){
  const original=read("liber-primus/lp2-transcription.txt");
  assert.equal(gpLength("THE"),2);
  assert.equal(gpLength("WITHIN"),5);
  for(const q of QUOTES) {
    assert.deepEqual(quoteShape(original,q.page,q.runeStart,q.runes),q.shape);
    assert.equal(q.shape.reduce((s,n)=>s+n,0),q.runes);
  }
  const output=[];
  for(const [name,file,nWords] of CORPORA) {
    const words=read(file).toUpperCase().match(/[A-Z]+/gu)||[];
    assert.equal(words.length,nWords);
    for(const [method,fn] of [["letters",w=>w.length],["gp-digraphs",gpLength]]) {
      const lengths=words.map(fn);
      for(const q of QUOTES) {
        const report=scan(lengths,q.shape,words);
        assert.equal(report.fullMatches,0);
        output.push({source:name,mode:method,quotePage:q.page,wordCount:words.length,...report});
      }
    }
  }
  console.log(JSON.stringify({source:"Original p40/p53 quote full lengths, fixed source corpora",
    controls:output,interpretation:"No exact fourteen-word match under either explicit length codec; all other sources/orthographies remain open."},null,2));
}
if(require.main===module) main();
module.exports={quoteShape,gpLength,scan,main};
