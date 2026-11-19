"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const mod29 = (value) => ((value % 29) + 29) % 29;
const H3 = (values) => [mod29(values[0]-values[2]),mod29(values[0]+values[2]),values[1]];
/** @param {number} base @param {number} exponent */
function modPow(base, exponent) {
  let out=1,value=mod29(base),power=exponent;
  while(power>0){if(power%2===1)out=mod29(out*value);value=mod29(value*value);power=Math.floor(power/2);}
  return out;
}
const parts=transcription.split(/^\s*%\s*$/m).slice(0,55);
const pages=parts.map((text,segment)=>({page:segment>=50?segment+1:segment,words:[],offset:0}));
let current=[],startSegment=0,endSegment=0,startOffset=0;
function flushWord(){if(!current.length)return;if(startSegment===endSegment){const page=pages[startSegment];page.words.push({ordinal:page.words.length+1,start:startOffset,values:current.slice()});}current=[];}
for(let segment=0;segment<parts.length;segment+=1){for(const char of [...parts[segment]]){const value=runeIndex.get(char);if(value!==undefined){if(!current.length){startSegment=segment;startOffset=pages[segment].offset;}endSegment=segment;current.push(value);pages[segment].offset+=1;}else if(char!=="/"&&!/\s/u.test(char))flushWord();}}flushWord();
const p42=pages.find((page)=>page.page===42).words;
assert.deepEqual(p42[41].values,[11,13,11]);
assert.deepEqual(H3(p42[41].values),[0,22,13]);
assert.deepEqual(p42[42].values,[16,0,14]);
assert.deepEqual(H3(p42[42].values),[2,1,0]);
assert.equal(modPow(13,3),22);
assert.equal(modPow(22,3),5);
assert.notDeepEqual(H3(p42[42].values),[0,22,13]);
console.log("PASS: retire OPENPGP cube continuation after canonical word-carry correction");
