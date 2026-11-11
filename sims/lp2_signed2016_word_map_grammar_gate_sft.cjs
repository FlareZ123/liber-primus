"use strict";
/**
 * Director #357: source-locked grammar capacity test for signed-2016 map words.
 * This SFT only checks ORIGINAL numerical inputs and source-visible bounds.
 * It refuses to introduce a missing modulus, compass origin, step unit or key.
 * Reproduce: node sims/lp2_signed2016_word_map_grammar_gate_sft.cjs
 * @module lp2_signed2016_word_map_grammar_gate_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname,"..");
const SOURCE_PATH = "resources/liber-primus/lp2-transcription.txt";
const SIGNED_PATH = "resources/historical/cicada2016-4gq25-outguess.asc";
const CORPUS_PATH = "resources/liber-primus/lp2-corpus.json";
/** @param {string} f @returns {string} */
const read = f=>fs.readFileSync(path.join(ROOT,f),"utf8");
/** @param {string} s @returns {string} */
function blob(s) {
  const b=Buffer.from(s,"utf8");
  return crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
}
/**
 * @param {string} raw @param {Set<string>} runeSet
 * @returns {{runes:string,words:Array<{start:number,end:number,runes:string}>}}
 */
function parseWords(raw,runeSet) {
  const chars=[],words=[];
  let current=[],start=0;
  function flush(){
    if(!current.length)return;
    words.push({start,end:chars.length,runes:current.join("")});
    current=[];
  }
  for(const ch of raw) {
    if(runeSet.has(ch)) {
      if(!current.length)start=chars.length;
      current.push(ch);chars.push(ch);
    } else if("-.&$§".includes(ch))flush();
  }
  flush();
  return {runes:chars.join(""),words};
}
/** @param {string} s @param {string[]} alphabet @param {number[]} weights */
function primeSum(s,alphabet,weights) {
  return [...s].reduce((sum,ch)=>{
    const ix=alphabet.indexOf(ch);assert.ok(ix>=0);
    return sum+weights[ix];
  },0);
}
/** @param {string} s @param {string[]} alphabet @returns {bigint} */
function positionalBase29(s,alphabet) {
  return [...s].reduce((n,ch)=>{
    const ix=alphabet.indexOf(ch);assert.ok(ix>=0);
    return n*29n+BigInt(ix);
  },0n);
}
/**
 * @param {Array<{start:number,end:number,runes:string}>} words
 * @param {number} start @param {number} end
 */
function complete(words,start,end) {
  return words.filter(w=>w.start>=start && w.end<=end);
}
/**
 * @param {Array<{start:number,end:number,runes:string}>} words
 * @param {string[]} alphabet @param {number[]} weights
 */
function summarize(words,alphabet,weights) {
  const sums=words.map(w=>primeSum(w.runes,alphabet,weights));
  const base=words.map(w=>positionalBase29(w.runes,alphabet));
  return {
    words:words.length,
    runeCount:words.reduce((z,w)=>z+w.end-w.start,0),
    primeSums:sums,
    primeSumMin:Math.min(...sums),primeSumMax:Math.max(...sums),
    directP32CellsByPrimeSum:sums.filter(n=>n<121).length,
    directP32CellsByBase29:base.filter(n=>n<121n).length,
    directlyEightWayDirectionValues:sums.filter(n=>n<8).length,
    needAngleReductionOver359:sums.filter(n=>n>359).length,
    firstThreeBase29:base.slice(0,3).map(n=>n.toString())
  };
}
function run(){
  const src=read(SOURCE_PATH),signed=read(SIGNED_PATH);
  assert.equal(blob(src),"43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7");
  assert.ok(signed.includes(
    "Its words are the map, their \nmeaning is the road, and their numbers are the direction."));
  assert.ok(signed.includes("Verify OpenPGP 7A35090F."));
  const corpus=JSON.parse(read(CORPUS_PATH));
  const alpha=corpus.runes,primes=corpus.prime;
  assert.equal(alpha.length,29);assert.equal(primes.length,29);
  const parsed=parseWords(src,new Set(alpha));
  assert.equal(parsed.runes.length,13136);
  assert.equal(parsed.words.length,2941);
  const p32=[...parsed.runes.slice(7839,7960)];
  assert.equal(p32.length,121);
  const top=p32.slice(0,11).join("");
  const left=Array.from({length:11},(_,i)=>p32[11*i]).join("");
  assert.equal(primeSum(top,alpha,primes),563);
  assert.equal(primeSum(left,alpha,primes),569);
  const p33=complete(parsed.words,7960,8051);
  const p55=complete(parsed.words,12880,12956);
  const carry=parsed.words.find(w=>w.start<12880 && w.end>12880);
  assert.ok(carry);
  assert.deepEqual([carry.start,carry.end],[12870,12881]);
  assert.equal(primeSum(carry.runes,alpha,primes),521);
  const a=summarize(p33,alpha,primes);
  const b=summarize(p55,alpha,primes);
  assert.equal(a.words,23);assert.equal(a.runeCount,91);
  assert.deepEqual(a.primeSums,
    [130,249,124,594,358,185,137,323,63,184,390,137,109,202,
     223,534,150,123,70,42,110,171,110]);
  assert.equal(a.directP32CellsByPrimeSum,6);
  assert.equal(a.directP32CellsByBase29,0);
  assert.equal(a.directlyEightWayDirectionValues,0);
  assert.equal(a.needAngleReductionOver359,3);
  assert.equal(b.words,16);assert.equal(b.runeCount,75);
  assert.deepEqual(b.primeSums,
    [222,114,118,306,283,30,596,365,138,108,341,291,88,284,129,159]);
  assert.equal(b.directP32CellsByPrimeSum,5);
  assert.equal(b.directP32CellsByBase29,1);
  assert.equal(b.directlyEightWayDirectionValues,0);
  assert.equal(b.needAngleReductionOver359,2);
  assert.equal(carry.end-12880,1);
  const result={
    signed:"2016 authenticated words/map/meaning/road/numbers/direction message",
    sourceBlob:blob(src),
    p32:{start:7839,end:7960,cells:121,
      firstRowPrimeSum:563,firstColumnPrimeSum:569,
      rowMajorOrientation:"matches original signed image width x height"},
    p33:{start:7960,end:8051,...a},
    p55:{start:12880,end:12956,complete:b,
      pageRunes:76,carryFromPriorPage:{
        start:carry.start,end:carry.end,primeSum:521,
        runeCountOnP55:1}},
    decision:"no source-specified number-to-cell reduction, compass mapping, starting coordinate, semantics or stop rule"
  };
  console.log(JSON.stringify(result,null,2));
}
if(require.main===module)run();
module.exports={run,parseWords,primeSum,positionalBase29};
