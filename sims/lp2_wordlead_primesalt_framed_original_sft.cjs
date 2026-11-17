"use strict";

/** Source-locked framed GP29 prime-salt hypothesis (original LP2).
 * Printed first rune is a one-rune nonce; each later word-rune is shifted
 * by the nonce rune's 2013 Gematria prime modulo 29. Singleton printed words
 * encode empty plaintext records. The source nonce is transmitted.
 * Run on Windows: node sims/lp2_wordlead_primesalt_framed_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const read = f => fs.readFileSync(path.join(__dirname,"..",f),"utf8");
const d = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const seg = read("resources/liber-primus/lp2-transcription.txt").split("%");
const original = seg.slice(0,55).join("%");
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const indices = new Map(d.runes.map((x,i)=>[x,i]));
const mod = x => (x%29+29)%29;
const stops = new Set(["-",".","&","$","§"]);

/** @param {string} source @returns {{words:number[][],positions:number[][]}} */
function tokenize(source) {
  const words=[],positions=[];
  let w=[],p=[];
  for(let i=0;i<source.length;i++){
    const ch=source[i];
    if(indices.has(ch)){w.push(indices.get(ch));p.push(i);}
    else if(stops.has(ch)&&w.length){words.push(w);positions.push(p);w=[];p=[];}
  }
  if(w.length){words.push(w);positions.push(p);}
  return {words,positions};
}
/** @param {number[]} word @returns {number[]} */
function decode(word){
  const salt=primes[word[0]]%29;
  return word.slice(1).map(x=>mod(x-salt));
}
/** @param {number[]} plain @param {number} nonce @returns {number[]} */
function encode(plain,nonce){
  const salt=primes[nonce]%29;
  return [nonce,...plain.map(x=>mod(x+salt))];
}
/** @param {string} originalText @param {number[][]} newWords @returns {string} */
function reprint(originalText,newWords){
  const t=tokenize(originalText);
  assert.equal(t.words.length,newWords.length);
  const out=originalText.split("");
  for(let w=0;w<newWords.length;w++){
    assert.equal(t.positions[w].length,newWords[w].length);
    for(let i=0;i<newWords[w].length;i++)
      out[t.positions[w][i]]=d.runes[newWords[w][i]];
  }
  return out.join("");
}
/** @param {number[]} values @returns {number} */
function normalizedIoc(values){
  const f=Array(29).fill(0);
  for(const x of values)f[x]++;
  return 29*f.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
const t=tokenize(original),words=t.words;
assert.equal(words.length,2896);
assert.equal(words.flat().length,12956);
assert.equal(words.filter(w=>w.length===1).length,83);
assert.equal(t.positions.filter(p=>original.slice(p[0],p.at(-1)+1).includes("%")).length,32);
const plain=words.map(decode);
const recovered=words.map((w,i)=>encode(plain[i],w[0]));
assert.deepEqual(recovered,words);
assert.equal(reprint(original,recovered),original);
const vocabulary=new Map();
for(const file of ["resources/control/shakespeare_first300k.txt",
                   "resources/control/gibran_prophet_58585.txt"]){
  for(const w of read(file).match(/[A-Za-z]+/g)||[]){
    const x=encodeSourceNativeGP(w);
    if(x.length>=1&&x.length<=13){
      if(!vocabulary.has(x.length))vocabulary.set(x.length,[]);
      vocabulary.get(x.length).push(x);
    }
  }
}
const native=words.map((w,i)=>{
  const len=w.length-1;
  if(len===0)return [];
  const pool=vocabulary.get(len);
  assert(pool&&pool.length);
  return pool[i%pool.length];
});
const ciphertext=native.map((w,i)=>encode(w,(17*i+3)%29));
assert.deepEqual(ciphertext.map(decode),native);
assert.deepEqual(tokenize(reprint(original,ciphertext)).words,ciphertext);
const clear=tokenize(seg[56]).words;
assert.deepEqual(clear.flat(),d.pages[57].indices);
const planted=clear.map((w,i)=>encode(w,(7*i+1)%29));
assert.deepEqual(planted.map(decode),clear);
let wrong=0;
for(let i=0;i<native.length;i++)
  for(let j=1;j<ciphertext[i].length;j++)
    wrong+=Number(mod(ciphertext[i][j]-ciphertext[i][0])!==native[i][j-1]);
assert(wrong>0);
const lex=new Set([...vocabulary.values()].flat().map(w=>w.join(",")));
const hits=plain.filter(w=>w.length&&lex.has(w.join(","))).length;
const longPlain=plain.filter(w=>w.length>=5);
const longHits=longPlain.filter(w=>lex.has(w.join(","))).length;
const noShift=words.filter(w=>w[0]===9);
const noShiftLong=noShift.filter(w=>w.length>=6);
const noShiftLongHits=noShiftLong.filter(w=>lex.has(w.slice(1).join(","))).length;
const nonceGroupBest = [];
for(let nonce=0;nonce<29;nonce++){
  const longCipher = words.filter(w=>w[0]===nonce&&w.length>=6);
  const exactHitsByShift = Array.from({length:29},(_,shift)=>
    longCipher.filter(word=>lex.has(word.slice(1).map(x=>mod(x-shift)).join(","))).length);
  nonceGroupBest.push({
    nonce,
    count:longCipher.length,
    maximumNativeLongMatches:Math.max(...exactHitsByShift)
  });
}
const allSecretMaxLongMatches = nonceGroupBest.reduce(
  (sum,group)=>sum+group.maximumNativeLongMatches,0);
function shape(word){
  const seen=new Map();
  return word.map(symbol=>{
    if(!seen.has(symbol))seen.set(symbol,seen.size);
    return seen.get(symbol);
  }).join(",");
}
const sourceNativeWordShapes=new Set(
  [...vocabulary.values()].flat().map(shape));
const longBodiesWithoutAnyNativeShape=longPlain.filter(
  w=>!sourceNativeWordShapes.has(shape(w)));
const nativeLongWrongShape=native.filter(
  w=>w.length>=5&&!sourceNativeWordShapes.has(shape(w))).length;
assert.equal(nativeLongWrongShape,0);
const shapeWitness=longBodiesWithoutAnyNativeShape.slice(0,6).map(
  w=>({len:w.length,GP:w.map(x=>d.translit[x]).join(""),
       pattern:shape(w)}));
const preview=plain.slice(0,30).map(w=>w.map(x=>d.translit[x]).join("")).join(" | ");
console.log(JSON.stringify({
  hypothesis:"first ciphertext rune holds per-word GP prime salt",
  originalCipherRunes:words.flat().length,
  originalWords:words.length,
  originalPageCarries:32,
  transmittedNonceRunes:words.length,
  decodedOriginalRunes:plain.flat().length,
  nonceOnlyWords:plain.filter(w=>w.length===0).length,
  originalNormalizedIoC:normalizedIoc(plain.flat()),
  nativePositiveNormalizedIoC:normalizedIoc(native.flat()),
  originalNativeVocabularyHits:hits,
  originalFivePlusRuneWordHits:longHits,
  originalFivePlusRuneWords:longPlain.length,
  firstRunePrime29TransparentWordCount:noShift.length,
  firstRunePrime29FivePlusTransparentWords:noShiftLong.length,
  firstRunePrime29FivePlusNativeMatches:noShiftLongHits,
  allSecret29NonceAdditiveBestFivePlusHits:allSecretMaxLongMatches,
  allSecretFreeSubstitutionWordPatternMisses:longBodiesWithoutAnyNativeShape.length,
  allSecretFreeSubstitutionNativeMatchedGeometryMisses:nativeLongWrongShape,
  allSecretFreeSubstitutionExactWitnesses:shapeWitness,
  allSecret29NonceAdditiveTotalFivePlusCandidates:longPlain.length,
  perNonceBestFivePlusNativeMatches:nonceGroupBest,
  originalContentWords:words.length-83,
  first30DecodedPrintedWords:preview,
  exactFullOriginalRuneAndPunctuationRoundTrip:true,
  nativeGeometryPositiveRecovery:native.flat().length,
  nativeClearP57PositiveRecovery:clear.flat().length,
  wrongNativeSaltMismatches:wrong,
  authenticUnknownPlaintextRecovered:false
},null,2));