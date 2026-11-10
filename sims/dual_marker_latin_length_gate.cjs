'use strict';
/**
 * Word-length-conditional zero-step marker exclusion for LP2 GP29 field ciphers.
 *
 * The two-marker model reserves one unknown plaintext rune for zero ciphertext
 * differences at word start and a second unknown rune inside words. Exact
 * positional word-length bins prevent a pooled reference from masking the
 * extreme differences between short and long source words.
 *
 * Candidate first/inside GP markers are EACH unknown (29^2 models).
 * Refit the best pair in every source-matched resampling and under EVERY
 * possible true pair (841). Word dependencies are preserved by sampling whole
 * Latin Vulgate GP words conditional on actual LP2 length. Counts are not
 * Gaussianized: a Jeffreys smoothing 0.5 pseudo-observation per GP letter
 * regularizes source-absent markers before product-binomial deviances.
 *
 * Original words of length 13 and 14 are excluded: the length-12-or-less
 * population is 2,889 words, 12,861 predecessor events. This local conditional
 * result does not establish any historical plaintext language.
 *
 * Node 22 CommonJS. Run: node sims/dual_marker_latin_length_gate.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseSharedCorpus}=require('./lp2_word_pages.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const GP=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const A=29,CAP=12,BINS=8,REPS=3000,SMOOTH=0.5;
const WORDS=parseSharedCorpus().words.map(w=>
  [...w.runes].map(c=>GP.runes.indexOf(c)));
assert.equal(WORDS.length,2896);
assert.equal(WORDS.flat().length,12956);
const sourceAlpha='0123456789ABCDEFGHIJKLMNOPQRS';
const latin=read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/u).filter(s=>/^[0-9A-S]+$/u.test(s))
  .map(s=>[...s].map(c=>sourceAlpha.indexOf(c)));
assert.equal(latin.length,39835);
const GROUPS=Array.from({length:CAP+1},()=>[]);
for(const w of latin)if(w.length<=CAP)GROUPS[w.length].push(w);

const layout=[],hist=new Uint32Array(CAP+1),
  observation=Array.from({length:3},()=>new Uint16Array(BINS)),
  opportunities=Array.from({length:3},()=>new Uint16Array(BINS));
WORDS.forEach((word,index)=>{
  if(word.length>CAP)return;
  layout.push([index,word.length]);
  hist[word.length]++;
  const bin=Math.min(word.length,BINS)-1;
  for(let pos=0;pos<word.length;pos++){
    if(index===0&&pos===0)continue;
    const cat=pos===0?0:pos===word.length-1?2:1;
    opportunities[cat][bin]++;
    observation[cat][bin]+=Number(
      pos===0?WORDS[index-1].at(-1)===word[0]:
      word[pos-1]===word[pos]);
  }
});
assert.equal(layout.length,2889);
assert.deepEqual(opportunities.map(x=>[...x].reduce((s,v)=>s+v,0)),
  [2888,7167,2806]);
assert.deepEqual(observation.map(x=>[...x].reduce((s,v)=>s+v,0)),
  [23,44,19]);

const expectation=Array.from({length:3},()=>Array.from(
  {length:BINS},()=>new Float64Array(A)));
for(let len=1;len<=CAP;len++){
  if(!hist[len])continue;
  const words=GROUPS[len];
  assert.ok(words.length,'Missing Latin source length '+len);
  const counts=Array.from({length:3},()=>new Uint32Array(A));
  for(const w of words){
    counts[0][w[0]]++;
    for(let j=1;j<w.length-1;j++)counts[1][w[j]]++;
    if(w.length>1)counts[2][w.at(-1)]++;
  }
  const bin=Math.min(len,BINS)-1;
  for(let cat=0;cat<3;cat++){
    const positions=cat===0?1:cat===1?Math.max(len-2,0):Number(len>1);
    if(!positions)continue;
    const factor=hist[len]*positions/(words.length*positions+A*SMOOTH);
    for(let a=0;a<A;a++)
      expectation[cat][bin][a]+=
        factor*(counts[cat][a]+SMOOTH);
  }
}
// Manuscript's first rune has no preceding ciphertext and cannot repeat.
const initial=GROUPS[WORDS[0].length],initialCounts=new Uint32Array(A);
for(const w of initial)initialCounts[w[0]]++;
const initialBin=Math.min(WORDS[0].length,BINS)-1;
for(let a=0;a<A;a++)
  expectation[0][initialBin][a]-=
    (initialCounts[a]+SMOOTH)/(initial.length+A*SMOOTH);

function dev(n,k,mu){
  if(n===0)return 0;
  assert.ok(mu>0&&mu<n,{n,k,mu});
  return 2*((k?k*Math.log(k/mu):0)+
    (n>k?(n-k)*Math.log((n-k)/(n-mu)):0));
}
/** @param {Array<Uint16Array>} counts @param {number} rune @param {number} model @param {number} category */
function score(counts,rune,model,category){
  let t=0;
  for(let bin=0;bin<BINS;bin++)
    t+=dev(opportunities[category][bin],
      counts[bin][rune],expectation[category][bin][model]);
  return t;
}
function scorePair(counts,rune,model){
  return score(counts[1],rune,model,1)+score(counts[2],rune,model,2);
}
const f=Array.from({length:A},(_,a)=>score(observation,a,a,0));
const interior=Array.from({length:A},(_,a)=>scorePair(observation,a,a));
function ranks(){
  const first=Array.from({length:A},(_,i)=>({rune:GP.translit[i],value:f[i]}))
    .sort((a,b)=>a.value-b.value);
  const inside=Array.from({length:A},(_,i)=>({rune:GP.translit[i],value:interior[i]}))
    .sort((a,b)=>a.value-b.value);
  return {first,inside,
    best:first[0].value+inside[0].value,
    fixedGX:f[6]+interior[14]};
}
function randomGenerator(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}
function bootstrap(){
  const threshold=ranks().best,hits=new Uint16Array(A*A);
  const random=randomGenerator(0x47a24766);
  for(let trial=0;trial<REPS;trial++){
    const counts=Array.from({length:3},()=>
      Array.from({length:BINS},()=>new Uint16Array(A)));
    for(const [index,len] of layout){
      const src=GROUPS[len],word=src[Math.floor(random()*src.length)];
      const b=Math.min(len,BINS)-1;
      if(index>0)counts[0][b][word[0]]++;
      for(let j=1;j<word.length-1;j++)counts[1][b][word[j]]++;
      if(word.length>1)counts[2][b][word.at(-1)]++;
    }
    const bestFirst=new Float64Array(A),bestInside=new Float64Array(A);
    for(let candidateTrue=0;candidateTrue<A;candidateTrue++){
      let v=Infinity;
      for(let possible=0;possible<A;possible++)
        v=Math.min(v,score(counts[0],candidateTrue,possible,0));
      bestFirst[candidateTrue]=v;
      v=Infinity;
      for(let possible=0;possible<A;possible++)
        v=Math.min(v,scorePair(counts,candidateTrue,possible));
      bestInside[candidateTrue]=v;
    }
    for(let a=0;a<A;a++)for(let b=0;b<A;b++)
      if(bestFirst[a]+bestInside[b]>=threshold-1e-9)
        hits[a*A+b]++;
  }
  const worst=Math.max(...hits),winners=[];
  for(let a=0;a<A;a++)for(let b=0;b<A;b++)
    if(hits[a*A+b]===worst)winners.push(
      GP.translit[a]+'/'+GP.translit[b]);
  return {samplesPerTrueMarkerPair:REPS,truePairCount:A*A,
    largestExceedanceCount:worst,
    leastFavorableAddOneTail:(worst+1)/(REPS+1),
    maximizingPairs:winners.slice(0,12),
    prespecifiedG_X:{
      exceedances:hits[6*A+14],
      addOneTail:(hits[6*A+14]+1)/(REPS+1)}};
}
function main(){
  const ranking=ranks(),nulls=bootstrap();
  const report={
    classification:'Conditional word-length GP-Latin necessary-condition gate',
    sourceLatinWords:latin.length,
    original:{words:WORDS.length,coveredWords:layout.length,
      excludedLongWords:WORDS.length-layout.length,
      runes:12956,opportunities:opportunities.map(a=>[...a]),
      repeatsByRoleLength:observation.map(a=>[...a])},
    selection:{first:ranking.first.slice(0,8),
      inside:ranking.inside.slice(0,8),
      fullFamilyBest:ranking.best,
      previouslyPooledLatinGX:ranking.fixedGX},
    nulls,
    conclusion:'Retains exact source word-length conditioning when identifying '+
      'two zero-step marker labels. Results constrain only literal GP-Latin '+
      'word-preserving markers, not other text, transformed segmentation '+
      'or independently derived hidden-state encoders.'
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main();
module.exports={ranks,bootstrap,main};
