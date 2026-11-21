"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const punctuation = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const lp1Transcription = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const lexiconText = read("resources/control/english_wordfreq_textblob.txt");
assert.equal(corpus.runes.length, 29);
const runeIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
assert.equal(runeIndex.get("ᚠ"), 0);
const wordDelimiters = new Set(["-", ".", "&", "$", "§"]);
const pageChunks = transcription.split("%");
const sourcePages = corpus.pages.filter(page => page.page < 56 && page.indices.length > 0);
assert.equal(pageChunks.length, 57);
assert.equal(sourcePages.length, 55);
const words = [];
let currentRunes = [], currentPages = [], currentPageSet = new Set();
const delimiterCounts = {};
for (let chunkIndex = 0; chunkIndex < 55; chunkIndex++) {
  const page = sourcePages[chunkIndex].page;
  const chunk = pageChunks[chunkIndex];
  const observedCount = [...chunk].filter(glyph => runeIndex.has(glyph)).length;
  assert.equal(observedCount, sourcePages[chunkIndex].indices.length, "page rune count " + page);
  for (const glyph of [...chunk]) {
    if (runeIndex.has(glyph)) {
      currentRunes.push(runeIndex.get(glyph));
      currentPages.push(page);
      currentPageSet.add(page);
    } else if (wordDelimiters.has(glyph)) {
      delimiterCounts[glyph] = (delimiterCounts[glyph] || 0) + 1;
      if (currentRunes.length) {
        words.push({runes: currentRunes, pages: currentPages, pageSet: [...currentPageSet]});
        currentRunes = [];
        currentPages = [];
        currentPageSet = new Set();
      }
    }
  }
}
if (currentRunes.length) words.push({runes: currentRunes, pages: currentPages, pageSet: [...currentPageSet]});
const runeCount = words.reduce((sum, word) => sum + word.runes.length, 0);
const carriedWords = words.filter(word => word.pageSet.length > 1).length;
assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(carriedWords, 32);
assert.deepEqual(delimiterCounts, {"-":2727, ".":175, "&":17, "$":8});
const excludedStopEventIndices = new Set([57, 58, 59, 60, 91, 125, 127]);
const confirmedStops = punctuation.events.filter(event => event.symbol === "⁘" && !excludedStopEventIndices.has(event.index));
const stopOffsets = confirmedStops.map(event => event.rune_offset).sort((a, b) => a - b);
assert.equal(confirmedStops.length, 138);
assert.equal(new Set(stopOffsets).size, 138);
const stopFieldLengths = [stopOffsets[0], ...stopOffsets.slice(1).map((offset, index) => offset - stopOffsets[index]), runeCount - stopOffsets.at(-1)];
assert.equal(stopFieldLengths.length, 139);
assert.equal(stopFieldLengths.reduce((sum, length) => sum + length, 0), runeCount);
assert.deepEqual(stopFieldLengths.slice(0, 12), [154,121,22,53,44,40,97,494,21,21,44,183]);
assert.equal(stopFieldLengths.at(-1), 359);
const mod29 = value => (value % 29 + 29) % 29;
const flatten = arrays => arrays.flat();
function decode(cipherWords) {
  let previousCipher = 0;
  return cipherWords.map(word => {
    const plain = [];
    for (let j = 0; j < word.length; j++) {
      const fiveBack = j >= 5 ? word[j - 5] : 0;
      plain.push(mod29(word[j] - previousCipher + fiveBack));
      previousCipher = word[j];
    }
    return plain;
  });
}
function encode(plainWords) {
  let previousCipher = 0;
  return plainWords.map(word => {
    const cipher = [];
    for (let j = 0; j < word.length; j++) {
      const fiveBack = j >= 5 ? cipher[j - 5] : 0;
      cipher.push(mod29(word[j] + previousCipher - fiveBack));
      previousCipher = cipher[j];
    }
    return cipher;
  });
}
function ioc(values) {
  const f = new Uint32Array(29);
  for (const value of values) f[value]++;
  const n = values.length;
  return n > 1 ? f.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1)) : 0;
}
function pageLocalAdjacent(records, valueWords) {
  let hits = 0, eligible = 0, withinHits = 0, withinN = 0, acrossHits = 0, acrossN = 0;
  let previous = null, previousPage = null, previousWord = null;
  for (let wi = 0; wi < records.length; wi++) {
    for (let j = 0; j < records[wi].runes.length; j++) {
      const value = valueWords[wi][j], page = records[wi].pages[j];
      if (previous !== null && page === previousPage) {
        eligible++;
        if (value === previous) hits++;
        if (wi === previousWord) { withinN++; if (value === previous) withinHits++; }
        else { acrossN++; if (value === previous) acrossHits++; }
      }
      previous = value;
      previousPage = page;
      previousWord = wi;
    }
  }
  return {hits, eligible, rate: hits / eligible, withinWord:{hits:withinHits,eligible:withinN}, acrossWord:{hits:acrossHits,eligible:acrossN}};
}
function lag5(records, valueWords) {
  let hits = 0, eligible = 0;
  for (let i = 0; i < records.length; i++) for (let j = 5; j < valueWords[i].length; j++) {
    eligible++;
    if (valueWords[i][j] === valueWords[i][j - 5]) hits++;
  }
  return {hits, eligible, rate: hits / eligible};
}
function simpleStats(valueWords) {
  let adjacentHits = 0, adjacentEligible = 0, lagHits = 0, lagEligible = 0, previous = null;
  for (const word of valueWords) for (let j = 0; j < word.length; j++) {
    const value = word[j];
    if (previous !== null) { adjacentEligible++; if (value === previous) adjacentHits++; }
    if (j >= 5) { lagEligible++; if (value === word[j - 5]) lagHits++; }
    previous = value;
  }
  return {adjacent:{hits:adjacentHits,eligible:adjacentEligible,rate:adjacentHits/adjacentEligible},lag5WithinWord:{hits:lagHits,eligible:lagEligible,rate:lagHits/lagEligible}};
}
const tokens = corpus.translit.map((spelling,index)=>({spelling,index})).sort((a,b)=>b.spelling.length-a.spelling.length);
function encodeNativeEnglishWord(original) {
  const word = original.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const output = [];
  for (let i=0;i<word.length;) {
    if (word.startsWith("ING",i)) { output.push(21); i+=3; }
    else if (word.startsWith("IO",i)) { output.push(27); i+=2; }
    else {
      const token = tokens.find(candidate=>word.startsWith(candidate.spelling,i));
      if (!token) return null;
      output.push(token.index); i+=token.spelling.length;
    }
  }
  return output;
}
const dictionary = new Set();
for (const line of lexiconText.split(/\r?\n/)) {
  const match = line.match(/^([a-z]+)\s+\d+$/);
  if (match) { const encoded=encodeNativeEnglishWord(match[1]); if(encoded) dictionary.add(encoded.join(",")); }
}
assert.equal(dictionary.size, 29060);
function dictionaryStats(valueWords) {
  const matches=valueWords.map(word=>dictionary.has(word.join(",")));
  let longest=0,run=0;
  for(const matched of matches){run=matched?run+1:0;longest=Math.max(longest,run);}
  const eligibleLong=valueWords.filter(word=>word.length>=3).length;
  const longHits=valueWords.filter((word,i)=>word.length>=3&&matches[i]).length;
  const hits=matches.filter(Boolean).length;
  return {words:valueWords.length,hits,rate:hits/valueWords.length,length3PlusHits:longHits,length3PlusWords:eligibleLong,longestConsecutiveDictionaryWords:longest};
}
function parseSimpleWords(text) {
  const output=[];let current=[];
  for(const glyph of [...text]){
    if(runeIndex.has(glyph))current.push(runeIndex.get(glyph));
    else if(wordDelimiters.has(glyph)&&current.length){output.push(current);current=[];}
  }
  if(current.length)output.push(current);
  return output;
}
const originalCipherWords=words.map(word=>word.runes);
const decodedWords=decode(originalCipherWords);
assert.deepEqual(encode(decodedWords),originalCipherWords);
const originalFlat=flatten(originalCipherWords),decodedFlat=flatten(decodedWords);
const originalAdjacent=pageLocalAdjacent(words,originalCipherWords),decodedAdjacent=pageLocalAdjacent(words,decodedWords);
const originalLag5=lag5(words,originalCipherWords),decodedLag5=lag5(words,decodedWords);
assert.deepEqual([originalAdjacent.hits,originalAdjacent.eligible,originalLag5.hits,originalLag5.eligible],[86,12901,104,2105]);
assert.deepEqual([decodedAdjacent.hits,decodedAdjacent.eligible,decodedLag5.hits,decodedLag5.eligible],[456,12901,69,2105]);
const recordsWithPlain=words.map((record,index)=>({record,plain:decodedWords[index]}));
function selectWords(start,end){return recordsWithPlain.filter(x=>x.record.pageSet.some(p=>p>=start&&p<=end)).map(x=>x.plain);}
function runesInRange(start,end){
  const out=[];
  for(let i=0;i<words.length;i++)for(let j=0;j<words[i].runes.length;j++)if(words[i].pages[j]>=start&&words[i].pages[j]<=end)out.push(decodedWords[i][j]);
  return out;
}
const p0Words=selectWords(0,2),p40Words=selectWords(40,53),p0Runes=runesInRange(0,2),p40Runes=runesInRange(40,53);
assert.equal(p0Words.length,158);assert.equal(p0Runes.length,729);
assert.equal(p40Words.length,669);assert.equal(p40Runes.length,3008);
const lp1Pages=lp1Transcription.split("%");
const clearWords=parseSimpleWords([3,8,9,10,11,14].map(p=>lp1Pages[p]||"").join("%"));
const clearCipher=encode(clearWords);
assert.deepEqual(flatten(decode(clearCipher)),flatten(clearWords));
assert.equal(clearWords.length,230);assert.equal(flatten(clearWords).length,1001);
const p57Words=parseSimpleWords(pageChunks[56]),p57Cipher=encode(p57Words);
assert.deepEqual(flatten(decode(p57Cipher)),flatten(p57Words));
assert.equal(p57Words.length,20);assert.equal(flatten(p57Words).length,95);
assert.deepEqual([simpleStats(clearWords).adjacent.hits,simpleStats(clearWords).adjacent.eligible,simpleStats(clearWords).lag5WithinWord.hits,simpleStats(clearWords).lag5WithinWord.eligible],[28,1000,8,158]);
assert.deepEqual([simpleStats(clearCipher).adjacent.hits,simpleStats(clearCipher).adjacent.eligible,simpleStats(clearCipher).lag5WithinWord.hits,simpleStats(clearCipher).lag5WithinWord.eligible],[16,1000,6,158]);
assert.deepEqual([simpleStats(p57Words).adjacent.hits,simpleStats(p57Words).adjacent.eligible,simpleStats(p57Words).lag5WithinWord.hits,simpleStats(p57Words).lag5WithinWord.eligible],[1,94,2,20]);
assert.deepEqual([simpleStats(p57Cipher).adjacent.hits,simpleStats(p57Cipher).adjacent.eligible,simpleStats(p57Cipher).lag5WithinWord.hits,simpleStats(p57Cipher).lag5WithinWord.eligible],[2,94,0,20]);
const result={
 status:"bounded negative; exact model retired",
 model:"C_i=P_i+C_(i-1 global)-C_(j-5 within printed word) mod29; omit five-back term for first five word runes; initial previous ciphertext F/index0; all 29 symbols including literal F processed; word clock resets at printed word boundaries; global one-back clock crosses words/stops/pages; 138 confirmed stops preserved as non-consuming punctuation; page breaks do not split 32 carried words",
 source:{words:words.length,runes:runeCount,carriedWords,delimiterCounts,confirmedFourDotStops:stopOffsets.length,stopFields:stopFieldLengths.length,stopFieldRuneSum:stopFieldLengths.reduce((a,b)=>a+b,0),first12StopFieldLengths:stopFieldLengths.slice(0,12),lastField:stopFieldLengths.at(-1)},
 original:{ioc:ioc(originalFlat),pageLocalAdjacent:originalAdjacent,lag5WithinWord:originalLag5,dictionary:dictionaryStats(originalCipherWords)},
 decoded:{ioc:ioc(decodedFlat),pageLocalAdjacent:decodedAdjacent,lag5WithinWord:decodedLag5,dictionary:dictionaryStats(decodedWords),exactReencryption:true},
 p0to2:{runes:p0Runes.length,words:p0Words.length,ioc:ioc(p0Runes),dictionary:dictionaryStats(p0Words),first25:p0Words.slice(0,25).map(w=>w.map(i=>corpus.translit[i]).join(""))},
 p40to53:{runes:p40Runes.length,words:p40Words.length,ioc:ioc(p40Runes),dictionary:dictionaryStats(p40Words),first25:p40Words.slice(0,25).map(w=>w.map(i=>corpus.translit[i]).join(""))},
 controls:{
  lp1Clear:{pages:[3,8,9,10,11,14],words:clearWords.length,runes:flatten(clearWords).length,plaintext:simpleStats(clearWords),emitted:simpleStats(clearCipher),dictionary:dictionaryStats(clearWords),roundtrip:true},
  lp2p57:{words:p57Words.length,runes:flatten(p57Words).length,plaintext:simpleStats(p57Words),emitted:simpleStats(p57Cipher),dictionary:dictionaryStats(p57Words),roundtrip:true}
 },
 decision:"Inverse remains ciphertext-like; no 200-rune readable plaintext. Exact re-encryption is consistency only. Do not widen the state table or tune coefficients."
};
console.log(JSON.stringify(result,null,2));
