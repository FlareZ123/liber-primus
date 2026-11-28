"use strict";
/**
 * SOURCE-SELECTED HUMAN SOLVE ROUTE (not a confirmed Cicada mechanism).
 *
 * A natural reading of the Latin title Liber Primus may direct a solver to
 * a Latin "Book I" such as Cicero's De Officiis ("LIBER PRIMVS" in the source).
 * If the unknown LP2 printed groups preserve true plaintext word boundaries
 * and encryption only deletes/hides source runes without insertions, each
 * surviving printed word has length K <= original Latin source word length T.
 * Vanished entire source words are allowed at arbitrary positions, and the
 * unknown starting source offset is searched exhaustively. This is a
 * key-independent SUPPORT test before attempting any key fitting.
 *
 * Freeze all three exact books from the external Latin Library via derived
 * GP29-native word-lengths in resources/external/. This is a test of literal
 * Cicero source plaintext, NOT a test of Latin language generally.
 *
 * Positive control: genuinely generate a contiguous unseen 2,896-nonempty-
 * word emission from Cicero with each rune independently deleted at d=7/36,
 * then demand that the same unrestricted start/skip search recovers a plausible
 * alignment with at most the genuinely erased whole-word count.
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const latin=JSON.parse(read("resources/external/cicero-de-officiis-gp-wordlengths-v1.json"));
const raw=read("resources/transcriptions/lp2_krisyotam_2017.txt");
const runeSet=new Set(gp.runes),words=[];let current=0,nr=0;
for(const ch of raw){
 if(runeSet.has(ch)){current++;nr++;}
 else if("-.&$§0123456789".includes(ch)&&current){words.push(current);current=0;}
 if(nr===12956)break;
}
if(current)words.push(current);
assert.equal(words.length,2896);assert.equal(nr,12956);
const source=latin.books.flatMap(b=>b.lengths);
assert.equal(source.length,34199);
assert.equal(source.reduce((s,x)=>s+x,0),190231);
assert.equal(Math.max(...words),14);
const maxK=Math.max(...words,...source),n=source.length;
const next=Array.from({length:maxK+1},()=>new Int32Array(n+1));
for(let k=1;k<=maxK;k++){
 next[k][n]=-1;
 for(let i=n-1;i>=0;i--)next[k][i]=source[i]>=k?i:next[k][i+1];
}
function align(target,cutoff=Infinity){
 let best={skipped:cutoff,start:-1,end:-1,matched:0},evaluated=0;
 const maxStart=n-target.length;
 for(let start=0;start<=maxStart;start++){
  let j=start,skipped=0,matched=0;
  for(let i=0;i<target.length;i++){
   if(j>=n)break;
   const v=next[target[i]][j];
   if(v<0)break;
   skipped+=v-j;j=v+1;matched++;
   if(skipped>=best.skipped)break;
  }
  if(matched===target.length&&skipped<best.skipped){
   best={skipped,start,end:j-1,matched};evaluated++;
  }
 }
 return {...best,originalSourceWordsConsumed:best.skipped+best.matched,
   sourceMeanWithinWindow:best.start>=0?
    source.slice(best.start,best.end+1).reduce((s,x)=>s+x,0)/(best.end-best.start+1):null,
   countBestUpdates:evaluated};
}
let state=0x20163301;
function rng(){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;}
function plant(start,count=2896){
 let i=start,nonempty=[],skipped=0;
 while(nonempty.length<count){
  assert(i<n,"insufficient source words for positive");
  const T=source[i],K=Array.from({length:T},()=>rng()<29/36?1:0)
   .reduce((a,b)=>a+b,0);
  if(K)nonempty.push(K);else skipped++;
  i++;
 }
 return{start,end:i-1,wordsConsumed:i-start,skipped,target:nonempty};
}
const pos=plant(2000),positive=align(pos.target);
assert(positive.matched===2896);
assert(positive.skipped<=pos.skipped,
  "exact source alignment must have no greater min dropped words");
const original=align(words);
assert(original.matched===2896);
assert(original.skipped>=100,"original unexpectedly plausible as intact Cicero words");
const densityRatio=original.skipped/Math.max(1,original.skipped+words.length);
const sourceOriginalExpectedDeletedFrac=latin.books.map(b=>b.lengths.reduce(
 (s,T)=>s+(7/36)**T,0)/b.word_count);
const result={
 route:"Original printed groups are actual Latin Cicero De Officiis plaintext word boundaries and 7/36 deletion/36-state silent channel only shortens words",
 titleClue:"LIBER PRIMUS matches original Latin heading DE OFFICIIS LIBER PRIMVS; source not selected uniquely by Cicada",
 source:{collection:"cltk/lat_text_latin_library public Latin source",
  files:latin.books.map(b=>({book:b.book,blobSHA:b.source_sha,words:b.word_count})),
  totalLatinWords:source.length,sourceNativeGPMean:190231/source.length},
 original:{printedGroups:words.length,printedRunes:nr,
  outputNativeMean:nr/words.length,
  optimalUnrestrictedContiguousSourceSkip:original,
  minimumWholeWordDeletionFraction:densityRatio},
 planted:{trueStart:pos.start,trueEnd:pos.end,
  trueDeletedWholeWords:pos.skipped,trueInputWords:pos.wordsConsumed,
  optimalUnrestrictedContiguousSourceSkip:positive,
  exactSupportControlPassed:true},
 sourceOriginalWholeWordEraseProbabilityByBook:sourceOriginalExpectedDeletedFrac,
 negativeMeaning:"Even granting any starting offset and arbitrary whole-word deletions, this is only a necessary compatibility test, not a Latin-text decryption or cipher identification."
};
console.log(JSON.stringify(result,null,2));
