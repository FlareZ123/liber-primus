"use strict";

/**
 * Source-selected original GEB witness: does unsolved LP2 preserve a
 * verbatim run of author-visible printed GP word lengths from that book?
 * Unlike a running-key attack, this checks preserved word segmentation
 * even if the letter cipher is an otherwise unbreakable stream.
 * Standalone Node 22 SFT, manual execution only; original sources read-only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const https = require("node:https");

const URL = "https://raw.githubusercontent.com/kylevedder/JChains/f035cd2e9ac30de505915acb374fe119ecf5c57a/inputs/GEB.txt";
const EXPECTED_GIT_BLOB = "03c403fa3db18dd9ee966e555e4978036b5f6b56";
const EXPECTED_BYTES = 1953906;
const BASE = 37;
const RUN_MIN = 14;
const PLANT_SOURCE_WORD = 12345;
const PLANT_ORIGINAL_WORD = 1200;
const PLANT_LENGTH = 27;

/** @param {string} url @returns {Promise<Buffer>} */
function retrieve(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {timeout:45000}, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error("Expected pinned GEB HTTP 200, got " + response.statusCode));
        return;
      }
      /** @type {Buffer[]} */
      const chunks = [];
      response.on("data", x => chunks.push(x));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    }).on("error", reject);
  });
}

/**
 * Native GP29 word length including LP1-attested ING and IO single runes.
 * @param {string} sourceWord
 * @param {string[]} tokenNames
 * @returns {number}
 */
function gpLength(sourceWord, tokenNames) {
  const word = sourceWord.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  let length = 0;
  for (let i = 0; i < word.length; length++) {
    if (word.startsWith("ING",i)) { i += 3; continue; }
    if (word.startsWith("IO",i)) { i += 2; continue; }
    const token = tokenNames.find(x => word.startsWith(x,i));
    assert(token, "No native GP29 token in " + sourceWord);
    i += token.length;
  }
  return length;
}

/**
 * Exact contiguous matches using a 32-bit rolling hash with full array
 * equality validation, so hash collision cannot generate a false hit.
 * Map the source only; natural original word order is never rearranged.
 * @param {number[]} target
 * @param {number[]} source
 * @param {number} k
 * @param {number} limit
 * @returns {{originalWord:number,gebWord:number}[]}
 */
function matches(target, source, k, limit=5) {
  assert(k>=1 && k<=target.length && k<=source.length);
  let pow = 1;
  for (let i = 1; i < k; i++) pow = Math.imul(pow, BASE);
  /** @type {Map<number,number[]>} */
  const lookup = new Map();
  let hash = 0;
  for (let i = 0; i < k; i++) hash = (Math.imul(hash,BASE)+source[i])|0;
  lookup.set(hash,[0]);
  for (let i=k; i<source.length; i++) {
    hash=(Math.imul((hash-Math.imul(source[i-k],pow))|0,BASE)+source[i])|0;
    const old=lookup.get(hash);
    if (old) old.push(i-k+1);
    else lookup.set(hash,[i-k+1]);
  }
  const found=[];
  hash=0;
  for(let i=0;i<k;i++)hash=(Math.imul(hash,BASE)+target[i])|0;
  for(let originalWord=0;originalWord+k<=target.length;originalWord++){
    if(originalWord) hash=(Math.imul((hash-Math.imul(target[originalWord-1],pow))|0,BASE)
      +target[originalWord+k-1])|0;
    for(const gebWord of lookup.get(hash)||[]){
      let exact=true;
      for(let j=0;j<k;j++){
        if(target[originalWord+j]!==source[gebWord+j]){exact=false;break;}
      }
      if(exact){found.push({originalWord,gebWord});if(found.length>=limit)return found;}
    }
  }
  return found;
}

/**
 * @param {number[]} target
 * @param {number[]} source
 * @returns {{maxRun:number,locations:{originalWord:number,gebWord:number}[]}}
 */
function longest(target, source) {
  let lo=1,hi=Math.min(target.length,source.length),maxRun=0;
  while(lo<=hi){
    const k=(lo+hi)>>1;
    if(matches(target,source,k,1).length){maxRun=k;lo=k+1;}
    else hi=k-1;
  }
  return {maxRun,locations:matches(target,source,maxRun,10)};
}

async function main() {
  const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
  const transcription = fs.readFileSync("resources/liber-primus/lp2-transcription.txt","utf8");
  const runeRx = new RegExp("["+corpus.runes.join("")+"]+","gu");
  const unknown = transcription.split("%").slice(0,55).join("%")
    .replace(/\/\n/g,"").replace(/[\r\n%]/g,"");
  const words=unknown.match(runeRx)||[];
  assert.equal(words.length,2896);
  const lengths=words.map(x=>x.length);
  assert.equal(lengths.reduce((x,y)=>x+y,0),12956);
  const tokens=corpus.translit.slice().sort((a,b)=>b.length-a.length);
  const originalBytes=await retrieve(URL);
  assert.equal(originalBytes.length,EXPECTED_BYTES);
  const hash=crypto.createHash("sha1")
    .update(Buffer.concat([Buffer.from("blob "+originalBytes.length+"\0"),originalBytes]))
    .digest("hex");
  assert.equal(hash,EXPECTED_GIT_BLOB);
  const gebWords=originalBytes.toString("utf8").match(/[a-z]+/gi)||[];
  const gebLengths=gebWords.map(word=>gpLength(word,tokens));
  assert(gebLengths.length>150000);
  const one=longest(lengths,gebLengths);
  const pageStarts=[];
  let off=0;
  for(const p of corpus.pages.filter(p=>p.page<56)){pageStarts.push([p.page,off]);off+=p.indices.length;}
  assert.equal(off,12956);
  const wordStarts=[0];
  for(const n of lengths)wordStarts.push(wordStarts[wordStarts.length-1]+n);
  const enriched=one.locations.map(({originalWord,gebWord})=>{
    const atRune=wordStarts[originalWord];
    const page=pageStarts.filter(([,start])=>start<=atRune).at(-1)[0];
    return {originalWord,originalPage:page,gebWord,run:lengths.slice(originalWord,originalWord+one.maxRun)};
  });
  const plant=lengths.slice();
  plant.splice(PLANT_ORIGINAL_WORD,PLANT_LENGTH,
    ...gebLengths.slice(PLANT_SOURCE_WORD,PLANT_SOURCE_WORD+PLANT_LENGTH));
  const planted=matches(plant,gebLengths,PLANT_LENGTH,15);
  assert(planted.some(x=>x.originalWord===PLANT_ORIGINAL_WORD &&
    x.gebWord===PLANT_SOURCE_WORD),"Source-true twenty-seven-word plant must be discovered");
  const first14=matches(lengths,gebLengths,RUN_MIN,6);
  console.log(JSON.stringify({
    originalRunes:12956,originalWords:2896,sourceGEBWords:gebWords.length,
    originalGEBGitBlob:hash,sourceBytes:originalBytes.length,
    maximumVerbatimGPWordLengthRun:one.maxRun,topLocations:enriched,
    sourceTruePlant:{length:PLANT_LENGTH,originalWord:PLANT_ORIGINAL_WORD,
      gebWord:PLANT_SOURCE_WORD,passed:true},
    prespecified14WordHitCountAtLeast:first14.length,
    interpretation:"Only original printed-word lengths are matched; even a long hit needs exact unknown-rune forward decoding before plaintext attribution."
  },null,2));
}

main().catch(error=>{console.error(error);process.exitCode=1;});
