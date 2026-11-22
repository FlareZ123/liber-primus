'use strict';
/**
 * Composite original-input necessary-condition gate for reversible F29
 * zero-step ciphers with distinct plaintext markers at word starts/interiors.
 *
 * Test all 29^2 putative (start,inside) GP markers. Condition on exact LP2
 * whole-word lengths <=12, including cross-page complete words; leave seven
 * words length13/14 out because of sparse English controls. The original
 * ciphertext supplies 23 first, 44 middle, 19 terminal repeats in 12,861
 * included rune positions. The null samples full source GP words matched by
 * length, preserves within-word dependencies and reselects the best of 841
 * models on EVERY synthetic sample, for EVERY possible true marker pair.
 *
 * No key or plaintext is claimed. Node22 CommonJS, no external dependency.
 * Run: node sims/dual_marker_wordrole_gate.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseSharedCorpus}=require('./lp2_word_pages.cjs');
const ROOT=path.resolve(__dirname,'..'),A=29,CAP=12,TRIALS=3000;
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const GP=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const WORDS=parseSharedCorpus().words.map(w=>
  [...w.runes].map(c=>GP.runes.indexOf(c)));
assert.equal(WORDS.length,2896);
assert.equal(WORDS.flat().length,12956);

const layout=[],target=[0,0,0],slots=[0,0,0];
let predecessor=-1;
WORDS.forEach((word,index)=>{
  if(word.length<=CAP){
    layout.push([index,word.length]);
    for(let j=0;j<word.length;j++){
      if(index===0&&j===0)continue;
      const category=j===0?0:j===word.length-1?2:1;
      slots[category]++;
      target[category]+=Number(
        j===0?predecessor===word[0]:word[j-1]===word[j]);
    }
  }
  predecessor=word[word.length-1];
});
assert.equal(layout.length,2889);
assert.deepEqual(slots,[2888,7167,2806]);
assert.deepEqual(target,[23,44,19]);
const lens=new Uint32Array(CAP+1);
for(const [,len] of layout)lens[len]++;

const TOKENS=GP.translit.map((name,index)=>[name,index])
  .sort((a,b)=>b[0].length-a[0].length);
/** @param {string} original @param {boolean} contractIng */
function encode(original,contractIng){
  let s=original.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S');
  if(contractIng)s=s.replace(/ING/g,'NG');
  const out=[];
  for(let i=0;i<s.length;){
    const token=TOKENS.find(([part])=>s.startsWith(part,i));
    if(!token)return null;
    out.push(token[1]);i+=token[0].length;
  }
  return out;
}
/** @param {number[][]} source */
function group(source){
  const groups=Array.from({length:CAP+1},()=>[]);
  for(const w of source)if(w.length<=CAP)groups[w.length].push(w);
  for(let l=1;l<=CAP;l++)if(lens[l])assert.ok(groups[l].length,
    'missing GP source words at length '+l);
  return groups;
}
/** @param {number[][][]} groups */
function sourceExpect(groups){
  const expected=Array.from({length:3},()=>new Float64Array(A));
  for(let l=1;l<=CAP;l++){
    if(!lens[l])continue;
    const multiplier=lens[l]/groups[l].length;
    for(const w of groups[l]){
      expected[0][w[0]]+=multiplier;
      for(let j=1;j<w.length-1;j++)expected[1][w[j]]+=multiplier;
      if(l>1)expected[2][w[w.length-1]]+=multiplier;
    }
  }
  // First plaintext word has no predecessor; its first rune cannot be tested.
  const initial=groups[WORDS[0].length];
  for(const w of initial)expected[0][w[0]]-=1/initial.length;
  return expected;
}
/** Product-binomial deviance is a ranking statistic; actual p from word bootstrap. */
function dev(n,k,mu){
  if(mu<=0)return k===0?0:1e9;
  if(mu>=n)return k===n?0:1e9;
  return 2*((k>0?k*Math.log(k/mu):0)+
    (k<n?(n-k)*Math.log((n-k)/(n-mu)):0));
}
function rng(seed){
  let state=seed>>>0;
  return ()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)/4294967296;
  };
}
/**
 * The null resamples whole reference GP words conditioned on the 2,889
 * included original word lengths. For each of the 841 possible *true* pairs,
 * calculate its apparent repeat counts, then fit the best of 841 candidates.
 * This avoids fitting one marker globally, and calibrates the full search.
 *
 * @param {number[][][]} groups
 * @param {Float64Array[]} E
 * @param {number} seed
 */
function analyze(groups,E,seed){
  const first=Array.from({length:A},(_,a)=>
    dev(slots[0],target[0],E[0][a]));
  const inside=Array.from({length:A},(_,b)=>
    dev(slots[1],target[1],E[1][b])+
    dev(slots[2],target[2],E[2][b]));
  const startRank=first.map((d,i)=>({rune:i,score:d})).
    sort((a,b)=>a.score-b.score);
  const innerRank=inside.map((d,i)=>({rune:i,score:d})).
    sort((a,b)=>a.score-b.score);
  const threshold=startRank[0].score+innerRank[0].score;
  const random=rng(seed),hits=new Uint16Array(A*A);
  for(let trial=0;trial<TRIALS;trial++){
    const F=new Uint16Array(A),M=new Uint16Array(A),Z=new Uint16Array(A);
    for(const [index,length] of layout){
      const reference=groups[length];
      const word=reference[Math.floor(random()*reference.length)];
      if(index!==0)F[word[0]]++;
      for(let j=1;j<word.length-1;j++)M[word[j]]++;
      if(word.length>1)Z[word[word.length-1]]++;
    }
    const firstFit=new Float64Array(A),insideFit=new Float64Array(A);
    for(let truth=0;truth<A;truth++){
      let best=Infinity;
      for(let possible=0;possible<A;possible++)
        best=Math.min(best,dev(slots[0],F[truth],E[0][possible]));
      firstFit[truth]=best;
      best=Infinity;
      for(let possible=0;possible<A;possible++)
        best=Math.min(best,
          dev(slots[1],M[truth],E[1][possible])+
          dev(slots[2],Z[truth],E[2][possible]));
      insideFit[truth]=best;
    }
    for(let a=0;a<A;a++)for(let b=0;b<A;b++)
      if(firstFit[a]+insideFit[b]>=threshold-1e-10)hits[a*A+b]++;
  }
  const worst=Math.max(...hits),pairs=[];
  for(let a=0;a<A;a++)for(let b=0;b<A;b++)
    if(hits[a*A+b]===worst)pairs.push(GP.translit[a]+'/'+GP.translit[b]);
  return {
    bestStart:{rune:GP.translit[startRank[0].rune],
      expected:E[0][startRank[0].rune],deviance:startRank[0].score},
    bestInside:{rune:GP.translit[innerRank[0].rune],
      middleExpected:E[1][innerRank[0].rune],
      terminalExpected:E[2][innerRank[0].rune],
      deviance:innerRank[0].score},
    fittedJointDeviance:threshold,
    null:{trialsPerTruePair:TRIALS,possibleTruePairs:A*A,
      worstHits:worst,plusOneTail:(worst+1)/(TRIALS+1),
      worstPairs:pairs.slice(0,10)}
  };
}
function latinSource(){
  const alphabet='0123456789ABCDEFGHIJKLMNOPQRS';
  return read('resources/control/latin-vulgate-gp-wholewords.txt')
    .split(/\r?\n/u).filter(s=>/^[0-9A-S]+$/u.test(s))
    .map(s=>[...s].map(c=>alphabet.indexOf(c)));
}
function main(){
  const texts=[
    ['Shakespeare','resources/control/shakespeare_first300k.txt'],
    ['Gibran','resources/control/gibran_prophet_58585.txt'],
    ['Emerson','resources/control/emerson_essays_2944.txt']
  ];
  const output=[];
  for(let i=0;i<texts.length;i++)for(const contractIng of [false,true]){
    const [name,file]=texts[i];
    const source=(read(file).match(/[A-Za-z]+/g)||[])
      .map(w=>encode(w,contractIng)).filter(Boolean);
    const groups=group(source);
    output.push({name,contractIng,referenceWords:source.length,
      ...analyze(groups,sourceExpect(groups),
        0x47a2b330+i*4096+Number(contractIng)*17)});
  }
  const latin=latinSource();
  assert.equal(latin.length,39835);
  const latinGroups=group(latin),latinResults=analyze(
    latinGroups,sourceExpect(latinGroups),0x47a2b334);
  output.push({name:'Latin Vulgate',referenceWords:latin.length,
    ...latinResults});
  const report={
    classification:'Conditional word-role GP marker source gate, not decryption',
    original:{wholeWords:WORDS.length,usedWords:layout.length,
      excludedLongWords:WORDS.length-layout.length,runicSymbols:12956,
      positions:slots,duplicateEvents:target},
    candidates:A*A,
    references:output,
    interpretation:'English GP whole-word sources disfavor a fixed pair; '+
      'Latin-GP Vulgate contains a compatible G/X pair. '+
      'This does not identify historical plaintext, marker letters, '+
      'alphabet, key or mechanism. Native-language AES inverse tested separately.'
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main();
module.exports={encode,sourceExpect,analyze,latinSource,main};
