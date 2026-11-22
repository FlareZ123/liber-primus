"use strict";
/**
 * All-secret one-back cross-WORD BASE29 ciphertext-feedback test.
 * Reversible word-integer feedback with arbitrary per-state 29-entry secret
 * low-digit lookup and full higher-position carries. Original printed words
 * and genuine cross-page continuations remain unchanged.
 *
 * Run on Windows 11/Node22:
 * node sims/lp2_base29_wordcarry_allsecret_previousword_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words, physicalLP2Page } = require("./lp2_word_pages.cjs");
const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const source = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const runeToIndex = new Map(corpus.runes.map((symbol, index) => [symbol, index]));
const parsed = parseLP2Words(source);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
/** @param {string} runes @returns {number[]} */
const ids = runes => [...runes].map(rune => {
  assert(runeToIndex.has(rune));
  return runeToIndex.get(rune);
});
const allWords = parsed.words.map(word => ({
  digits: ids(word.runes),
  page: physicalLP2Page(word.startPage)
}));
const original = allWords.flatMap(w => w.digits);
assert.deepEqual(original, corpus.pages.slice(0, 56).flatMap(p => p.indices));
const regions = [
  {name: "p16-21", first: 16, last: 21, count: 373},
  {name: "p40-53", first: 40, last: 53, count: 669}
].map(x => ({...x, words: allWords.filter(w => w.page >= x.first && w.page <= x.last)}));
for (const r of regions) assert.equal(r.words.length, r.count);
/** Sum of four highest output-rune frequencies. @param {number[]} symbols */
function top4(symbols) {
  const hist = new Uint16Array(29);
  for (const s of symbols) hist[s]++;
  return [...hist].sort((a,b) => b-a).slice(0,4).reduce((a,b) => a+b,0);
}
/**
 * Each ciphertext word emits its low GP29 digit after adding an unknown
 * fixed secret function f(previous ciphertext word low digit).
 * The previous word low digit is observed, so f may be optimized exactly.
 *
 * For a plaintext four-symbol set S, each source-state histogram's 29 shifts
 * are independent. Translation symmetry lets S include output symbol 0:
 * there are only C(28,3)=3276 remaining sets to enumerate.
 *
 * The first word receives a separate completely free IV contribution, +1.
 * All high-digit carries and keys are already granted: modulo29 reduction
 * is invariant under 29-adically compatible word-integer arithmetic.
 * @param {number[]} sourceLow
 */
function exactSecretLookupBound(sourceLow) {
  const rows = Array.from({length:29}, () => new Uint16Array(29));
  for (let i=1; i<sourceLow.length; i++) rows[sourceLow[i-1]][sourceLow[i]]++;
  let best=0, bestSet=null, combinations=0;
  for (let a=1; a<27; a++) for (let b=a+1; b<28; b++)
    for (let c=b+1; c<29; c++) {
      combinations++;
      let total=0;
      for (const row of rows) {
        let rowBest=0;
        for (let shift=0; shift<29; shift++) {
          const n=row[shift]+row[(shift+a)%29]+row[(shift+b)%29]+row[(shift+c)%29];
          if (n>rowBest) rowBest=n;
        }
        total+=rowBest;
      }
      if (total>best) {best=total;bestSet=[0,a,b,c];}
    }
  assert.equal(combinations, 3276);
  return {maxAfterFirst:best, generousMaximum:best+1, winnerSet:bestSet};
}
/**
 * Every unknown a,b and every unknown low-digit initial state for
 * P_i = C_i - a*X_(i-1) - b (mod 29), where X is previous P or C.
 * This covers both plaintext- and ciphertext-feedback affine carry.
 * @param {number[]} sourceLow
 */
function exactAffineWordCarryBound(sourceLow) {
  let best={score:-1};
  for (const driver of ["cipher","plain"]) for (let a=0;a<29;a++)
    for (let b=0;b<29;b++) for (let seed=0;seed<29;seed++) {
      const counts=new Uint16Array(29);
      let prior=seed;
      for (const current of sourceLow) {
        const plain=(current-a*prior-b+841)%29;
        counts[plain]++;
        prior=driver==="cipher"?current:plain;
      }
      const score=[...counts].sort((x,y)=>y-x).slice(0,4).reduce((x,y)=>x+y,0);
      if(score>best.score)best={score,driver,a,b,seed};
    }
  return best;
}
const nativePool=new Map();
for(const part of solved.sections) {
  for(const word of part.source_text.match(/[\u16A0-\u16FF]+/gu) || []) {
    const digits=ids(word);
    if(!nativePool.has(digits.length))nativePool.set(digits.length,[]);
    nativePool.get(digits.length).push(digits);
  }
}
/** @param {number} seed */
function xorshift(seed) {
  let x=seed>>>0;
  return () => {x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
/** @param {typeof allWords} target @param {number} seed */
function nativeWords(target, seed) {
  const next=xorshift(seed);
  return target.map(w=>{
    const pool=nativePool.get(w.digits.length);
    assert(pool && pool.length);
    return pool[next()%pool.length].slice();
  });
}
/** @param {typeof allWords} target @param {number} seed */
function nativeDistribution(target, seed) {
  const next=xorshift(seed), trials=500, last=[],first=[];
  for(let k=0;k<trials;k++){
    const chosen=target.map(w=>{
      const pool=nativePool.get(w.digits.length);
      assert(pool && pool.length);
      return pool[next()%pool.length];
    });
    last.push(top4(chosen.map(w=>w[w.length-1])));
    first.push(top4(chosen.map(w=>w[0])));
  }
  return {
    last:{min:Math.min(...last),max:Math.max(...last),
      mean:last.reduce((a,b)=>a+b,0)/trials,all:last},
    first:{min:Math.min(...first),max:Math.max(...first),
      mean:first.reduce((a,b)=>a+b,0)/trials,all:first}
  };
}
const lastBounds=[145,213],firstBounds=[141,219],lastAffine=[90,142],firstAffine=[87,141];
const output=[];
for(let ri=0;ri<regions.length;ri++){
  const r=regions[ri],lowLast=r.words.map(w=>w.digits.at(-1)),lowFirst=r.words.map(w=>w.digits[0]);
  const last=exactSecretLookupBound(lowLast),first=exactSecretLookupBound(lowFirst);
  assert.equal(last.generousMaximum,lastBounds[ri]);
  assert.equal(first.generousMaximum,firstBounds[ri]);
  const affineLast=exactAffineWordCarryBound(lowLast);
  const affineFirst=exactAffineWordCarryBound(lowFirst);
  assert.equal(affineLast.score,lastAffine[ri]);
  assert.equal(affineFirst.score,firstAffine[ri]);
  const controls=nativeDistribution(r.words,0x3301a48f);
  const summary={
    region:r.name,words:r.words.length,
    native500Last:{min:controls.last.min,max:controls.last.max,mean:controls.last.mean,
      passAtOrBelowBound:controls.last.all.filter(x=>x<=last.generousMaximum).length},
    native500First:{min:controls.first.min,max:controls.first.max,mean:controls.first.mean,
      passAtOrBelowBound:controls.first.all.filter(x=>x<=first.generousMaximum).length},
    last,first,affineLast,affineFirst
  };
  assert.equal(summary.native500Last.passAtOrBelowBound,0);
  assert.equal(summary.native500First.passAtOrBelowBound,ri===0?19:0);
  output.push(summary);
}
const modulus = L => 29n**BigInt(L);
/** @param {number[]} d @param {boolean} reverse */
function fromDigits(d,reverse) {
  const src=reverse?d.slice().reverse():d;
  return src.reduce((n,v)=>29n*n+BigInt(v),0n);
}
/** @param {bigint} n @param {number} L @param {boolean} reverse */
function toDigits(n,L,reverse) {
  const d=Array(L).fill(0);
  for(let i=L-1;i>=0;i--){d[i]=Number(n%29n);n/=29n;}
  assert.equal(n,0n);
  return reverse?d.reverse():d;
}
/** @param {bigint} a @param {bigint} m */
const mod=(a,m)=>(a%m+m)%m;
/**
 * Full-word reversible cipher with high-digit carries. SOURCE key constants
 * here are an independent synthetic positive; none is proposed as original.
 * @param {number[][]} messages @param {"cipher"|"plain"} feedback
 * @param {boolean} reverse @param {boolean} decode
 */
function transform(messages,feedback,reverse,decode) {
  let previous=3301n;
  const result=[];
  for(const d of messages){
    const m=modulus(d.length), x=fromDigits(d,reverse);
    const current=decode?mod(x-7n*previous-19n,m):mod(x+7n*previous+19n,m);
    result.push(toDigits(current,d.length,reverse));
    previous=feedback==="cipher"?(decode?x:current):(decode?current:x);
  }
  return result;
}
const positive=nativeWords(regions[1].words,0x3301b5c1);
for(const feedback of ["cipher","plain"])for(const reverse of [false,true]){
  const enc=transform(positive,feedback,reverse,false);
  assert.deepEqual(transform(enc,feedback,reverse,true),positive);
}
// A true source-generated secret 29-entry nonlinear shift is admissible by
// the all-secret mathematical bound, demonstrating power against such a cipher.
const data=positive.map(w=>w.slice());
let previousCipherLow=2;
const nonlinearCipher=[];
for(const plain of data){
  const f=(previousCipherLow*previousCipherLow+3*previousCipherLow+7)%29;
  const cipher=toDigits(mod(fromDigits(plain,false)+BigInt(f),modulus(plain.length)),plain.length,false);
  nonlinearCipher.push(cipher);
  previousCipherLow=cipher.at(-1);
}
const secretBound=exactSecretLookupBound(nonlinearCipher.map(w=>w.at(-1))).generousMaximum;
assert(secretBound>=top4(data.map(w=>w.at(-1))));
console.log("PASS "+JSON.stringify({sourceRunes:original.length,sourceWords:allWords.length,
  regions:output,nonlinearNativePlant:{originalTop4:top4(data.map(w=>w.at(-1))),secretBound}}));
