"use strict";

/**
 * Exact original LP2 strict F-zero mask: minimal word-divider relocation
 * under preservation of every punctuation span's word-length multiset.
 *
 * No plaintext or cipher key is inferred. This proves only that source-native
 * F-mask lexeme support can be restored by precisely three changed dividers.
 *
 * SFT: node sims/lp2_fzero_threecut_multiset_resegmentation_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT,name),"utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text = read("resources/liber-primus/lp2-transcription.txt");
const dictionary = read("resources/control/english_wordfreq_textblob.txt");
const index = new Map(gp.runes.map((r,i) => [r,i]));
/**
 * The user-visible word cuts '-' and punctuation '.$&§' delimit only.
 * Lines and physical page breaks do not terminate words.
 * @param {string} source
 * @returns {number[][][]}
 */
function parse(source) {
  const spans = [];
  let words = [], word = [];
  const endWord=() => { if(word.length) { words.push(word);word=[]; } };
  const endSpan=() => { endWord();if(words.length){spans.push(words);words=[];} };
  for(const char of source) {
    if(index.has(char)) word.push(index.get(char));
    else if(char==="-") endWord();
    else if(".$&§".includes(char)) endSpan();
  }
  endSpan();
  return spans;
}
const spans = parse(text.split("%").slice(0,55).join("%"));
const sourceIndices = gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.deepEqual(spans.flat(2),sourceIndices);
assert.equal(sourceIndices.length,12956);
assert.equal(spans.length,175);
assert.equal(spans.flat().length,2896);
const originalHistogram=Array.from({length:14},(_,i)=>
  spans.flat().filter(w=>w.length===i+1).length);
assert.deepEqual(originalHistogram,
  [83,448,720,513,317,256,216,156,78,52,32,18,4,3]);

const tokens = gp.translit.map((t,i)=>({t,i}))
  .sort((a,b)=>b.t.length-a.t.length);
/** @param {string} word @returns {number[]|null} */
function gpEncode(word) {
  const src=word.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/K/g,"C")
    .replace(/Z/g,"S").replace(/Q/g,"C");
  const out=[];
  for(let at=0;at<src.length;) {
    const token=tokens.find(t=>src.startsWith(t.t,at));
    if(!token) return null;
    out.push(token.i);
    at+=token.t.length;
  }
  return out;
}
/** @type {Map<string,{word:string,weight:number}>} */
const lexicon = new Map();
for(const line of dictionary.split(/\r?\n/)) {
  const match=/^([A-Za-z']+)\s+(\d+)/.exec(line);
  if(!match)continue;
  const runes=gpEncode(match[1]);
  if(!runes || runes.length>14) continue;
  let mask=0;
  for(let i=0;i<runes.length;i++)if(runes[i]===0)mask|=1<<i;
  const key=runes.length+","+mask,weight=Number(match[2]);
  const prior=lexicon.get(key);
  if(!prior || weight>prior.weight)
    lexicon.set(key,{word:match[1].toLowerCase(),weight});
}
/**
 * Returns exact out-of-lexicon F-position masks. All noninitial transitions
 * are strict: C[i] == C[i-1] if and only if P[i] == F. The first rune of
 * each independent punctuation span is granted an arbitrary F status.
 * @param {number[]} forcedF
 * @param {number[]} lengths
 */
function invalid(forcedF,lengths) {
  let at=0;
  const failures=[];
  for(let j=0;j<lengths.length;j++) {
    const len=lengths[j];
    let mask=0;
    for(let i=0;i<len;i++)if(forcedF[at+i])mask|=1<<i;
    const valid=lexicon.has(len+","+mask) ||
      (at===0 && lexicon.has(len+","+(mask|1)));
    if(!valid) failures.push({word:j,start:at,length:len,mask});
    at+=len;
  }
  assert.equal(at,forcedF.length);
  return failures;
}
const pages=gp.pages.filter(p=>p.page<=55);
const cumulative=[];
let pageAt=0;
for(const p of pages) {
  cumulative.push({page:p.page,start:pageAt,end:pageAt+p.indices.length});
  pageAt+=p.indices.length;
}
assert.equal(pageAt,sourceIndices.length);
/** @param {number} i */
function pageContaining(i) {
  const p=cumulative.find(p=>p.start<=i&&i<p.end);
  assert.ok(p);
  return p.page;
}
let runeStart=0,changedCuts=0,sourceFailures=0;
const repairs=[];
for(let i=0;i<spans.length;i++) {
  const C=spans[i].flat(),L=spans[i].map(w=>w.length);
  const F=C.map((x,j)=>Number(j>0&&x===C[j-1]));
  const bad=invalid(F,L);
  sourceFailures+=bad.length;
  if(bad.length) {
    const alternatives=[];
    for(let j=0;j<L.length-1;j++) {
      if(L[j]===L[j+1])continue;
      const next=L.slice();
      [next[j],next[j+1]]=[next[j+1],next[j]];
      if(invalid(F,next).length)continue;
      const old=runeStart+L.slice(0,j+1).reduce((a,b)=>a+b,0);
      const shifted=old+L[j+1]-L[j];
      alternatives.push({
        leftWord:j,rightWord:j+1,
        oldLengths:[L[j],L[j+1]],newLengths:[L[j+1],L[j]],
        oldDivider:old,newDivider:shifted,sourcePage:pageContaining(old-1),
        movedBy:shifted-old,newLayout:next
      });
    }
    alternatives.sort((a,b)=>
      Math.abs(a.movedBy)-Math.abs(b.movedBy) || a.leftWord-b.leftWord);
    assert.ok(alternatives.length,
      "Each original invalid punctuation span must have adjacent repair");
    const best=alternatives[0];
    assert.equal(invalid(F,best.newLayout).length,0);
    const cuts=lengths=>{
      let p=0;
      return lengths.slice(0,-1).map(n=>{p+=n;return p;});
    };
    const oldCuts=cuts(L),newCuts=cuts(best.newLayout);
    assert.equal(oldCuts.filter((v,j)=>v!==newCuts[j]).length,1);
    changedCuts++;
    repairs.push({
      span:i,firstRune:runeStart,sourceOriginalFailures:bad,
      sourcePage:best.sourcePage,
      adjacentWordIndices:[best.leftWord,best.rightWord],
      oldLengths:best.oldLengths,newLengths:best.newLengths,
      oldDivider:best.oldDivider,newDivider:best.newDivider,
      shiftedRunes:best.movedBy,
      possibleAdjacentRepairs:alternatives.length
    });
    // The altered source segment has identical source runes and exactly
    // the original length multiset, but every F-mask now has lexeme support.
    assert.deepEqual(best.newLayout.slice().sort((a,b)=>a-b),
      L.slice().sort((a,b)=>a-b));
    assert.equal(best.newLayout.reduce((a,b)=>a+b,0),C.length);
  }
  runeStart+=C.length;
}
assert.equal(runeStart,12956);
assert.equal(sourceFailures,3);
assert.equal(changedCuts,3);
assert.deepEqual(repairs.map(x=>x.span),[82,86,100]);
assert.deepEqual(repairs.map(x=>[x.oldDivider,x.newDivider]),
  [[6225,6220],[6606,6614],[7570,7569]]);
assert.deepEqual(repairs.map(x=>x.sourcePage),[25,27,30]);
assert.deepEqual(repairs.map(x=>x.possibleAdjacentRepairs),[2,1,2]);
console.log(JSON.stringify({
  classification:"three-cut constructive F-mask feasibility, NOT plaintext",
  source:{runes:12956,words:2896,punctuationSpans:175,
    originalWordLengthHistogram:originalHistogram},
  assumption:"within-span equal ciphertext iff plaintext F, first unknown",
  lexiconFPatterns:lexicon.size,
  exactSourceUnsupportedWords:sourceFailures,
  distinctUnsupportedSpans:repairs.length,
  lowerBoundOnMovedDividers:3,
  constructiveMovedDividers:changedCuts,
  afterThreeMovesAllWordsSupportEnglishFMask:true,
  unchangedGpCiphertext:true,
  unchangedPerSpanWordLengthMultisets:true,
  repairs
},null,2));
