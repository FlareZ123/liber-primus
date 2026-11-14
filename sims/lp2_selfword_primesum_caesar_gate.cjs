"use strict";
/**
 * Source-constrained current-word GP-prime-sum Caesar gate.
 * Node.js 22, CommonJS, no dependencies or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourceText = read("resources/liber-primus/lp2-transcription.txt");
const dictText = read("resources/control/english_wordfreq_textblob.txt");
const controlPaths = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const controlTexts = controlPaths.map(read);
const primes = gp.prime, translit = gp.translit;
const rune = new Map(gp.runes.map((r, i) => [r, i]));
assert.equal(gp.runes.length, 29);
assert.deepEqual(primes, [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109]);
const ciphertext = gp.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const parsed = [], starts = [];
let inWord = false;
for (const ch of Array.from(sourceText)) {
  if (rune.has(ch)) { if (!inWord) starts.push(parsed.length); inWord = true; parsed.push(rune.get(ch)); }
  else if ("-.$&§".includes(ch)) inWord = false;
}
assert.equal(ciphertext.length, 12956);
assert.deepEqual(parsed.slice(0, ciphertext.length), ciphertext);
const wordStarts = starts.filter((p) => p < ciphertext.length);
const words = wordStarts.map((start, i) => parsed.slice(start, wordStarts[i + 1] ?? ciphertext.length));
assert.equal(words.length, 2896);
const digraphs = ["TH","NG","EO","OE","AE","IA","EA"];
function encodeWord(word) {
  word = word.toUpperCase().replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  const out = [];
  for (let i=0;i<word.length;) {
    const token = digraphs.find((d)=>word.startsWith(d,i)) || word[i];
    const index = translit.indexOf(token);
    if (index < 0) return null;
    out.push(index); i += token.length;
  }
  return out;
}
const dictionary = new Map();
let dictionarySpellings = 0;
for (const line of dictText.split(/\r?\n/)) {
  if (!line || line.startsWith(";")) continue;
  const m = line.match(/^([a-zA-Z']+)\s+(\d+)/);
  if (!m) continue;
  const encoded = encodeWord(m[1]);
  if (!encoded) continue;
  dictionarySpellings++;
  const key = encoded.join(",");
  if (!dictionary.has(key)) dictionary.set(key,m[1].toLowerCase());
}
assert.equal(dictionary.size,29059);
const mod29 = (x)=>((x%29)+29)%29;
const primeSum = (w)=>w.reduce((s,x)=>s+primes[x],0)%29;
function encrypt(P,sign) { const k=primeSum(P); return P.map(x=>mod29(x+sign*k)); }
function decryptCandidates(C,sign) {
  const out=[];
  for(let k=0;k<29;k++) {
    const P=C.map(x=>mod29(x-sign*k));
    if(primeSum(P)===k) out.push(P.join(","));
  }
  return out;
}
function evaluate(sign) {
  const inverse=new Map();
  for(const seq of dictionary.keys()) {
    const P=seq.split(",").map(Number), C=encrypt(P,sign).join(",");
    if(!inverse.has(C)) inverse.set(C,new Set());
    inverse.get(C).add(seq);
  }
  let zero=0,unique=0,multiple=0,matched=0,candidateCount=0;
  for(const C of words) {
    const solutions=decryptCandidates(C,sign);
    if(!solutions.length) zero++; else if(solutions.length===1) unique++; else multiple++;
    const dictCandidates=inverse.get(C.join(","))||new Set();
    for(const p of dictCandidates) assert(solutions.includes(p));
    if(dictCandidates.size) matched++;
    candidateCount+=dictCandidates.size;
  }
  const controls=controlTexts.map((text,index)=>{
    const tokens=text.match(/[A-Za-z]+/g)||[];
    let eligible=0,covered=0,retained=0,uniqueExact=0,ambiguous=0;
    for(const token of tokens) {
      const P=encodeWord(token); if(!P)continue;
      eligible++;
      if(dictionary.has(P.join(",")))covered++;
      const C=encrypt(P,sign), solutions=decryptCandidates(C,sign);
      assert(solutions.includes(P.join(",")));
      retained++;
      if(solutions.length===1)uniqueExact++; else ambiguous++;
    }
    assert.equal(retained,eligible);
    return {source:controlPaths[index],tokens:tokens.length,eligible,dictionaryCovered:covered,dictionaryCoverage:covered/eligible,positivePlantRetained:retained,uniqueExact,ambiguous};
  });
  return {
    encryptionDirection:sign===1?"C = P + k (mod 29)":"C = P - k (mod 29)",
    inverseFixedPoints:{zero,unique,multiple},
    englishDictionary:{uniqueGpWords:dictionary.size,originalWordsWithCandidate:matched,originalWordsWithoutCandidate:words.length-matched,originalUniqueDictionaryCandidates:candidateCount,fractionOfOriginalWordsWithCandidate:matched/words.length},
    nativeControls:controls
  };
}
const plus=evaluate(1), minus=evaluate(-1);
assert.deepEqual(plus.inverseFixedPoints,{zero:1049,unique:1118,multiple:729});
assert.deepEqual(minus.inverseFixedPoints,{zero:1050,unique:1120,multiple:726});
assert.deepEqual([plus.englishDictionary.originalWordsWithCandidate,plus.englishDictionary.originalUniqueDictionaryCandidates],[159,183]);
assert.deepEqual([minus.englishDictionary.originalWordsWithCandidate,minus.englishDictionary.originalUniqueDictionaryCandidates],[54,60]);
console.log(JSON.stringify({source:"original LP2 p0-p55, 12,956 runes, 2,896 printed words",rule:"per printed word, key = sum of plaintext GP prime values mod 29",dictionary:{source:"TextBlob english_wordfreq_textblob.txt",uniqueGpWords:dictionary.size,sourceSpellings:dictionarySpellings},directions:{plus,minus}},null,2));
