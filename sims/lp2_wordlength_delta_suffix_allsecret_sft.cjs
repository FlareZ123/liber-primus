"use strict";
/**
 * Original-input fixed-per-word-length GP29 cumulative decoder test.
 * Node.js 22 CommonJS, standard library only; reads checked-in source files.
 *
 * Tested model: C_i = C_(i-1) + Pi_length(P_i) mod 29.
 * Pi_length is one arbitrary shared bijection for each printed GP word length.
 * For all two-rune words, delta2 = (C_1-C_0) mod 29 equals Pi_2(P_1),
 * independently of page, initial feedback, earlier rune, or other Pi_length.
 * Therefore the support and sorted histogram of delta2 are fully all-key.
 * No claim is made that this was the Cicada authors' intended operation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const readText = name => fs.readFileSync(path.join(root,name),"utf8");
const corpus = JSON.parse(readText("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(readText("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = readText("resources/liber-primus/lp2-transcription.txt");
const lextext = readText("resources/control/english_wordfreq_textblob.txt");
const GP = 29;
const glyphs = new Map(corpus.runes.map((r,i)=>[r,i]));
const tokens = corpus.translit.map((name,i)=>({name,i})).sort((a,b)=>b.name.length-a.name.length);

/** Physical page and line delimiters do not end GP words. */
function gpWords(str) {
  const out=[];
  let current=[];
  for (const ch of str) {
    if (glyphs.has(ch)) current.push(glyphs.get(ch));
    else if(ch==="%"||ch==="/"||/\s/u.test(ch)) {}
    else if(current.length) {out.push(current);current=[];}
  }
  if(current.length)out.push(current);
  return out;
}

/** A broad, explicitly normalized English spelling -> GP29 rune spelling. */
function latinToGp(original) {
  let word=original.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const seq=[];
  while(word.length>0) {
    const token=tokens.find(x=>word.startsWith(x.name));
    if(!token)return null;
    seq.push(token.i);
    word=word.slice(token.name.length);
  }
  return seq;
}

const original=gpWords(transcription.split("%").slice(0,55).join("%"));
assert.equal(original.length,2896,"All 55 unsolved rune-bearing LP2 pages, page-seam words joined");
const originalTwo=original.filter(w=>w.length===2);
assert.equal(originalTwo.length,448,"Exact original GP29 two-rune word count");
const observed=new Uint32Array(GP);
for(const w of originalTwo)observed[(w[1]-w[0]+GP)%GP]++;
assert.equal(observed.filter(n=>n>0).length,29);
assert.deepEqual([...observed],[1,13,14,15,15,17,20,17,15,18,13,15,16,10,14,9,23,18,20,12,20,11,16,20,20,16,18,21,11]);

const native=solved.sections.flatMap(s=>gpWords(s.source_text));
const nativeTwo=native.filter(w=>w.length===2);
assert.equal(nativeTwo.length,178);
const nativeSuffix=new Uint32Array(GP);
for(const w of nativeTwo)nativeSuffix[w[1]]++;
assert.equal(nativeSuffix.filter(n=>n>0).length,9);

/** Key-independent optimal finite-lexicon shortfall for every 29! secret Pi_2. */
function lowerBoundOutsideSuffixVocabulary(supportedCount) {
  assert(supportedCount>=0&&supportedCount<=GP);
  return [...observed].sort((a,b)=>a-b).slice(0,GP-supportedCount)
    .reduce((sum,n)=>sum+n,0);
}

const wordFreq = new Map();
for(const line of lextext.split(/\r?\n/)){
  const m=/^([a-z]+) (\d+)$/.exec(line);
  if(!m)continue;
  const gp=latinToGp(m[1]);
  if(!gp||gp.length!==2)continue;
  const key=gp.join(",");
  wordFreq.set(key,(wordFreq.get(key)||0)+Number(m[2]));
}
function lexProfile(minCount) {
  const endings=new Set();
  let matches=0;
  for(const [word,count] of wordFreq)if(count>=minCount){
    matches++;endings.add(Number(word.split(",")[1]));
  }
  return {
    minWordFreq:minCount,distinctTwoRuneWords:matches,
    availableSuffixGlyphs:endings.size,
    absentSuffixGlyphs:corpus.translit.filter((_,i)=>!endings.has(i)),
    unavoidableOffLexiconTwoRuneWords:lowerBoundOutsideSuffixVocabulary(endings.size)
  };
}
const lexiconAll=lexProfile(1),lexiconFrequent=lexProfile(20);
assert.equal(lexiconAll.distinctTwoRuneWords,181);
assert.equal(lexiconAll.availableSuffixGlyphs,26);
assert.deepEqual(lexiconAll.absentSuffixGlyphs,["TH","J","AE"]);
assert.equal(lexiconAll.unavoidableOffLexiconTwoRuneWords,20);
assert.equal(lexiconFrequent.availableSuffixGlyphs,18);
assert.equal(lexiconFrequent.unavoidableOffLexiconTwoRuneWords,123);

/** Reversible planted unknown-key original-count native GP29 two-rune words. */
let rng=0x3301ab12;
const random=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;};
const perm=Array.from({length:GP},(_,i)=>i);
for(let i=GP-1;i>0;i--){let j=random()%(i+1);[perm[i],perm[j]]=[perm[j],perm[i]]}
const inverse=new Array(GP);
perm.forEach((value,i)=>inverse[value]=i);
const positive=new Uint32Array(GP);
for(let i=0;i<448;i++) {
  const w=nativeTwo[random()%nativeTwo.length];
  const c0=perm[w[0]],c1=(c0+perm[w[1]])%GP;
  const d1=(c1-c0+GP)%GP;
  assert.deepEqual([inverse[c0],inverse[d1]],w);
  assert.equal((c0+perm[w[1]])%GP,c1);
  positive[d1]++;
}
assert(positive.filter(n=>n>0).length<=nativeSuffix.filter(n=>n>0).length);

console.log(JSON.stringify({
 status:"PASS",
 model:"C_i=Cprev+Pi_wordLength(P_i) mod29, Pi_L any shared 29-permutation",
 original:{pages:"0-55, excluding p50 numeric",completeWords:original.length,
  twoRuneWords:originalTwo.length,distinctSecondDeltas:observed.filter(n=>n>0).length,
  deltaCounts:[...observed]},
 positive:{source:"178 genuine solved native-GP two-rune words",plantWords:448,
   distinctPlaintextSecondRunes:nativeSuffix.filter(n=>n>0).length,
   plantedDeltaSupport:positive.filter(n=>n>0).length,exactReconstruction:true},
 lexicon:[lexiconAll,lexiconFrequent],
 interpretation:"Finite-dictionary necessary condition only. Unknown archaic, non-English, position-dependent or changed-word-boundary mechanisms remain untested."
},null,2));
