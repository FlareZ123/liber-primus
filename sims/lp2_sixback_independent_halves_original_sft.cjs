'use strict';
/**
 * Two genuinely disjoint original-word halves, each independently selecting
 * its best invertible affine GP29 six-back map over the entire 812-map family.
 * The 29-symbol relation T(x)=27*x+24 was first noticed on the full book;
 * this split is retrospective and must not be advertised as preregistered.
 *
 * Null preserves EACH source word's exact rune multiset, length, and within-
 * word adjacent equality count. It independently shuffles words in each
 * original-length book, refits all 812 maps separately in BOTH halves, and
 * measures whether the winning-map sets intersect at all.
 *
 * Reproduce, Windows Node.js 22, read-only:
 *   node sims/lp2_sixback_independent_halves_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');
const root = path.resolve(__dirname,'..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const wordsSource = parseLP2Words(read('resources/liber-primus/lp2-transcription.txt'));
const runeIndex = new Map(gp.runes.map((g,i) => [g,i]));
const originals = wordsSource.words.map(w => ({
  c:[...w.runes].map(r => runeIndex.get(r)),
  half:w.startPage <= 26 ? 0 : 1
}));
assert.equal(originals.length,2896);
assert.equal(originals.reduce((n,w)=>n+w.c.length,0),12956);
assert.deepEqual(originals.flatMap(w => w.c),
  gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices));

const maps = [];
for(let a=1;a<29;a++)for(let b=0;b<29;b++)
  maps.push({a,b,table:Array.from({length:29},(_,x)=>(a*x+b)%29)});
assert.equal(maps.length,812);
const originalT=maps.findIndex(x=>x.a===27&&x.b===24);
assert.equal(originalT,778);

/**
 * @param {number[][]} words Exactly the same word order as originals
 * @returns {{ opportunities:number[], highest:number[], winners:number[][],
 *  commonWinners:number[] }}
 */
function score(words, excludeFixedPointH = false){
  const h=[new Int32Array(841),new Int32Array(841)];
  const opportunities=[0,0];
  words.forEach((word,wi)=>{
    const half=originals[wi].half;
    for(let j=6;j<word.length;j++){
      if (excludeFixedPointH && word[j-6] === 8) continue;
      h[half][29*word[j-6]+word[j]]++;
      opportunities[half]++;
    }
  });
  const highest=[-1,-1],winners=[[],[]];
  for(let key=0;key<maps.length;key++){
    const table=maps[key].table;
    for(let half=0;half<2;half++){
      let count=0;
      for(let x=0;x<29;x++)count+=h[half][29*x+table[x]];
      if(count>highest[half]){highest[half]=count;winners[half]=[key];}
      else if(count===highest[half])winners[half].push(key);
    }
  }
  const commonWinners=winners[0].filter(k=>winners[1].includes(k));
  return {opportunities,highest,winners,commonWinners};
}
const original=score(originals.map(x=>x.c));
const withoutH=score(originals.map(x=>x.c), true);
// An independently chosen strength test: H (GP index 8) is the unique fixed
// point of T. A repetitive fixed-point glyph alone cannot explain the shared
// full-book operator if removing all H-at-source comparisons preserves it.
assert.deepEqual(withoutH.opportunities, [624,619]);
assert.deepEqual(withoutH.highest, [39,39]);
assert.deepEqual(withoutH.winners, [[originalT],[originalT]]);

assert.deepEqual(original.opportunities,[647,643]);
assert.deepEqual(original.highest,[40,40]);
assert.deepEqual(original.winners,[[originalT],[originalT]]);
assert.deepEqual(original.commonWinners,[originalT]);

/** @param {number} initial @returns {()=>number} */
function random32(initial){
  let s=initial>>>0;
  return ()=>{
    s^=s<<13; s^=s>>>17; s^=s<<5; return s>>>0;
  };
}
const draw=random32(0x1f3ed330);
const adjacent=originals.map(({c})=>
  c.reduce((n,v,i)=>n+Number(i>0&&v===c[i-1]),0));
/** @param {number[]} a @returns {number} */
function repeatCount(a){
  let n=0;
  for(let i=1;i<a.length;i++)n+=Number(a[i]===a[i-1]);
  return n;
}
/** Uniform Fisher-Yates shuffle of word positions conditional on its exact
 * adjacent-repeat count. Short words are untouched because they have no
 * six-back comparisons. The source word itself always satisfies the
 * conditioning, so the accepted permutation space is nonempty.
 * @param {number[]} word @param {number} k @returns {number[]}
 */
function shuffleMatched(word,k){
  if(word.length<7)return word;
  let output;
  do{
    output=word.slice();
    for(let i=output.length-1;i>0;i--){
      const j=draw()%(i+1);
      [output[i],output[j]]=[output[j],output[i]];
    }
  }while(repeatCount(output)!==k);
  return output;
}

// Mechanism-positive: when a known key map produces EVERY six-back step,
// each independent half must infer that same key from its own data alone.
const plantDraw=random32(0x23ff1397);
const positive=originals.map(({c})=>{
  const output=[];
  for(let i=0;i<c.length;i++)
    output.push(i<6?plantDraw()%29:maps[originalT].table[output[i-6]]);
  return output;
});
const positiveResult=score(positive);
assert.deepEqual(positiveResult.opportunities,[647,643]);
assert.deepEqual(positiveResult.highest,[647,643]);
assert.deepEqual(positiveResult.winners,[[originalT],[originalT]]);

const reps=5000;
let shared=0,sharedAnd40=0,first40=0,second40=0;
let sumFirst=0,sumSecond=0,minFirst=Infinity,maxFirst=-1;
let minSecond=Infinity,maxSecond=-1;
let tiesFirst=0,tiesSecond=0;
for(let rep=0;rep<reps;rep++){
  const shuffled=originals.map((w,i)=>shuffleMatched(w.c,adjacent[i]));
  const s=score(shuffled);
  const sharedKey=s.commonWinners.length>0;
  shared+=Number(sharedKey);
  sharedAnd40+=Number(sharedKey&&s.highest[0]>=40&&s.highest[1]>=40);
  first40+=Number(s.highest[0]>=40);
  second40+=Number(s.highest[1]>=40);
  tiesFirst+=Number(s.winners[0].length>1);
  tiesSecond+=Number(s.winners[1].length>1);
  sumFirst+=s.highest[0];sumSecond+=s.highest[1];
  minFirst=Math.min(minFirst,s.highest[0]);
  maxFirst=Math.max(maxFirst,s.highest[0]);
  minSecond=Math.min(minSecond,s.highest[1]);
  maxSecond=Math.max(maxSecond,s.highest[1]);
}
console.log(JSON.stringify({
  status:'Original wordwise split-half independent six-back map selection; no decrypted plaintext or key',
  original:{
    runeCount:12956,wordCount:2896,halfDefinition:
      'word begins on rune-bearing physical pages 0..26 versus 27..55',
    opportunities:original.opportunities,
    bestScore:original.highest,
    uniqueBestMaps:original.winners.map(ids=>ids.map(i=>[maps[i].a,maps[i].b])),
    excludingAllHFixedPointSourcePairs:{
      opportunities:withoutH.opportunities,
      bestScore:withoutH.highest,
      uniqueBestMaps:withoutH.winners.map(ids=>ids.map(i=>[maps[i].a,maps[i].b]))
    },
    map: 'T(x)=27x+24 mod29'
  },
  positive:{
    relation:'all six-back recurrences generated by planted 29-symbol affine T',
    independentHalfBestScores:positiveResult.highest,
    recoveredKeyBothHalves:[maps[originalT].a,maps[originalT].b]
  },
  null:{
    draws:reps,seed:'0x1f3ed330',
    preserved:'each word exact GP29 multiset, printed length, within-word adjacent equality count; page/word assignments',
    jointBestMapIntersections:shared,
    jointBestMapIntersectionAndAtLeast40PerHalf:sharedAnd40,
    firstHalfAtLeast40:first40,secondHalfAtLeast40:second40,
    firstHalfMax:{mean:sumFirst/reps,min:minFirst,max:maxFirst,tieDraws:tiesFirst},
    secondHalfMax:{mean:sumSecond/reps,min:minSecond,max:maxSecond,tieDraws:tiesSecond},
    plusOneSharedTail:(shared+1)/(reps+1),
    plusOneJointTail:(sharedAnd40+1)/(reps+1)
  },
  interpretation:'The original single best 812-map six-back operator replicates independently across the two disjoint word-position halves. The split was assessed after observing the full-manuscript operator and hence is a within-family structural replication, not a discovery-adjusted probability. No authentic plaintext recovered.'
},null,2));
