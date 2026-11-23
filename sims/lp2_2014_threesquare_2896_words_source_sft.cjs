"use strict";

/**
 * LP2 whole-book 2014 OpenPuff three-magic-square word-order gate.
 * Node 22, CommonJS, standalone read-only SFT:
 * node sims/lp2_2014_threesquare_2896_words_source_sft.cjs
 *
 * Source premise: 2896 original printed words = 29*(25+49+25)+25.
 * Hypothesis: apply the historical 5x5 / 7x7 / 5x5 numeric values as
 * an ascending, stable cell-order permutation of each complete word block.
 * All 2^3 rank-read/scatter orientations are tested against native-GP
 * literary controls. No individual unknown rune is altered.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeSet = new Set(gp.runes);
const source = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");

/** @type {{runes:number[],punct:boolean}[]} */
const original = [];
/** @type {number[]} */
let pending = [];
let total = 0;
for (const char of source) {
  if (runeSet.has(char)) {
    pending.push(gp.runes.indexOf(char));
    total++;
  } else if ("-.$&§0123456789".includes(char) && pending.length) {
    original.push({runes:pending, punct:char === "."});
    pending = [];
  }
}
if (pending.length) original.push({runes:pending, punct:false});
assert.equal(total, 12956);
assert.equal(original.length, 2896);
assert.equal(original.filter(x => x.punct).length, 175);

const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/)
  .map(section => section.trim().split(/\s+/).map(Number));
assert.deepEqual(squares.map(x => x.length), [25,49,25]);
assert.deepEqual(squares.map((sq, k) => {
  const side = [5,7,5][k];
  return Array.from({length:side}, (_, row) =>
    sq.slice(row*side,(row+1)*side).reduce((a,b) => a+b,0));
}), [Array(5).fill(3301),Array(7).fill(1033),Array(5).fill(1033)]);
assert.equal(original.length, 29 * (25+49+25) + 25);

const ranks = squares.map(sq => sq.map((v,i) => ({v,i}))
  .sort((a,b) => a.v-b.v || a.i-b.i).map(x => x.i));
/**
 * Bijection of complete words; ties use the source's printed row-major order.
 * Complementing all three direction bits gives its exact inverse.
 * @template T
 * @param {T[]} items
 * @param {number} mask
 * @returns {T[]}
 */
function permuteWords(items, mask) {
  /** @type {T[]} */
  const result = [];
  let pos=0, block=0;
  while (pos < items.length) {
    const which = block%3, rank = ranks[which], length = rank.length;
    assert.ok(pos+length <= items.length, "whole square required");
    const input = items.slice(pos,pos+length);
    /** @type {T[]} */
    const output = Array(length);
    for (let i=0;i<length;i++) {
      if ((mask>>which)&1) output[rank[i]]=input[i];
      else output[i]=input[rank[i]];
    }
    result.push(...output);
    pos += length;
    block++;
  }
  assert.equal(block, 88);
  return result;
}
/** @param {{runes:number[]}[]} items @returns {number} */
function adjacencyMI(items) {
  const table=Array.from({length:10},()=>Array(10).fill(0));
  const row=Array(10).fill(0),col=Array(10).fill(0);
  const count=items.length-1;
  for(let i=1;i<items.length;i++){
    const a=Math.min(9,items[i-1].runes.length);
    const b=Math.min(9,items[i].runes.length);
    table[a][b]++;row[a]++;col[b]++;
  }
  let mi=0;
  for(let a=0;a<10;a++)for(let b=0;b<10;b++){
    const n=table[a][b];
    if(n)mi+=(n/count)*Math.log(n*count/(row[a]*col[b]));
  }
  return mi;
}
/** @param {{runes:number[]}[]} items @returns {number} */
function shortSurplus(items) {
  const p=items.filter(x=>x.runes.length<=3).length/items.length;
  let pair=0;
  for(let i=1;i<items.length;i++)
    if(items[i-1].runes.length<=3 && items[i].runes.length<=3) pair++;
  return pair/(items.length-1)-p*p;
}
const originalMetrics={mi:adjacencyMI(original),shortSurplus:shortSurplus(original)};
const results=[];
for(let mask=0;mask<8;mask++){
  const decoded=permuteWords(original,mask);
  assert.deepEqual(permuteWords(decoded,mask^7),original);
  results.push({
    mask, mi:adjacencyMI(decoded),
    shortSurplus:shortSurplus(decoded)
  });
}
assert.ok(results.every(r=>r.mi<0.018));
assert.ok(results.every(r=>r.mi<originalMetrics.mi+0.001));

// An independent native-GP spelling register, with previously source-attested
// ING and IO contractions; used only to check genuine prose word-order behavior.
const tokens=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} word @returns {number[]} */
function encodeGP(word){
  const clean=word.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const output=[];
  for(let i=0;i<clean.length;){
    if(clean.startsWith("ING",i)){output.push(21);i+=3;continue;}
    if(clean.startsWith("IO",i)){output.push(27);i+=2;continue;}
    const token=tokens.find(t=>clean.startsWith(t.s,i));
    assert.ok(token, "source-GP word mapping " + word);
    output.push(token.i);i+=token.s.length;
  }
  return output;
}
const sources=[
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
const nativeSummary=[];
for(const filename of sources){
  const latin=read(filename).match(/[A-Za-z]+/g)||[];
  const available=Math.floor(latin.length/original.length);
  assert.ok(available>=2);
  const metrics=[];
  for(let w=0;w<available;w++){
    const native=latin.slice(w*2896,(w+1)*2896)
      .map(word=>({runes:encodeGP(word),punct:false}));
    if(w===0){
      for(let mask=0;mask<8;mask++){
        const encoded=permuteWords(native,mask^7);
        assert.deepEqual(permuteWords(encoded,mask),native,
          "2896 complete native-GP words recovered");
      }
    }
    metrics.push(adjacencyMI(native));
  }
  nativeSummary.push({
    source:path.basename(filename), windows:available,
    min:Math.min(...metrics), max:Math.max(...metrics),
    mean:metrics.reduce((a,b)=>a+b,0)/metrics.length
  });
}
const allNativeMin=Math.min(...nativeSummary.map(x=>x.min));
assert.ok(allNativeMin>Math.max(...results.map(x=>x.mi)),
  "original square reads must remain below independent native controls");

/**
 * Distinct full-rune inverse: the three source-square numbers also define
 * one changing 28-step key per complete printed word (29 cycles plus A25).
 * An original ciphertext repeat is an exact, uniquely decodable F/GP0
 * escape. Every original glyph and every word is recovered on reencryption.
 *
 * @param {{runes:number[],punct:boolean}[]} words
 * @param {number} sign
 * @param {"book"|"word"} reset
 * @param {boolean} encrypt
 * @returns {{runes:number[],punct:boolean}[]}
 */
function rank28(words,sign,reset,encrypt){
  const result=[];let previous=0;
  for(let w=0;w<words.length;w++){
    if(reset==="word")previous=0;
    const key=squares.flat()[w%99]%28, symbols=[];
    for(const symbol of words[w].runes){
      let value;
      if(encrypt){
        value=symbol===0?previous:
          (previous+1+((symbol-1-sign*key)%28+28)%28)%29;
        previous=value;
      }else{
        const delta=(symbol-previous+29)%29;
        value=delta===0?0:
          1+((delta-1+sign*key)%28+28)%28;
        previous=symbol;
      }
      symbols.push(value);
    }
    result.push({runes:symbols,punct:words[w].punct});
  }
  return result;
}
/** @param {{runes:number[]}[]} words @returns {number} */
function gpIoC(words){
  const count=Array(29).fill(0);
  let n=0;for(const word of words)for(const x of word.runes){count[x]++;n++;}
  return count.reduce((a,x)=>a+x*(x-1),0)/(n*(n-1));
}
const firstNative=(read(sources[0]).match(/[A-Za-z]+/g)||[])
  .slice(0,2896).map(word=>({runes:encodeGP(word),punct:false}));
const rank28Results=[];
for(const sign of [-1,1])for(const reset of ["book","word"]){
  const originalPlain=rank28(original,sign,reset,false);
  assert.deepEqual(rank28(originalPlain,sign,reset,true),original,
    "full-original exact 12956-rune inverse");
  const nativeCipher=rank28(firstNative,sign,reset,true);
  assert.deepEqual(rank28(nativeCipher,sign,reset,false),firstNative,
    "full-native exact 2896-word positive");
  rank28Results.push({
    sign,reset,wholeBookGpIoC:gpIoC(originalPlain),
    originalFirst120:originalPlain.flatMap(x=>x.runes).slice(0,120)
      .map(i=>gp.translit[i]).join("")
  });
}

/**
 * First and most economical source-square rune inverse:
 * every complete printed word receives its exact historical square
 * number reduced mod29 as an additive key. No fitted phase, no new
 * secret state, no alphabet replacement. Entire 12956 runes reversible.
 * @param {{runes:number[],punct:boolean}[]} words
 * @param {number} sign
 * @returns {{runes:number[],punct:boolean}[]}
 */
function squareCaesar(words,sign){
  const keys=squares.flat(),out=[];
  for(let w=0;w<words.length;w++){
    const key=keys[w%99]%29;
    out.push({punct:words[w].punct,
      runes:words[w].runes.map(v=>(v+sign*key+29)%29)});
  }
  return out;
}
const caesarResults=[];
for(const sign of [-1,1]){
  const decoded=squareCaesar(original,sign);
  assert.deepEqual(squareCaesar(decoded,-sign),original);
  const planted=squareCaesar(firstNative,-sign);
  assert.deepEqual(squareCaesar(planted,sign),firstNative);
  caesarResults.push({
    sign,wholeBookGpIoC:gpIoC(decoded),
    originalFirst120:decoded.flatMap(x=>x.runes).slice(0,120)
      .map(i=>gp.translit[i]).join("")
  });
}

console.log(JSON.stringify({
  result:"finite original word-order inversion negative; no unknown plaintext",
  originalWords:original.length,originalRunes:total,
  authenticSquareCells:[25,49,25], fullCycles:29,trailingCells:25,
  originalMetrics,decodedDirections:results,
  sourceNativeControl:nativeSummary,
  exactSourceInverse:"8/8 original masks",
  genuineNativeWordRecovery:"24/24 2896-word plants",
  squareWordKeyRank28Results:rank28Results,
  squareWordKeyCaesarResults:caesarResults,
  squareWordKeyNativeControls:"4/4 2896-word real-GP recoveries",
  squareWordKeyOriginalReplay:"4/4 12956-rune original inverses"
},null,2));
