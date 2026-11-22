'use strict';

/**
 * Exact stateful simulation for a maximum-capacity lag-five S collision-rewrite
 * hypothesis. All simulated tentative runes are independently uniform in F29.
 * Keeps the original 2,896 complete LP2 word lengths; the output state runs
 * across word boundaries. Node.js 20, CommonJS, no extra dependencies.
 */
const assert=require('node:assert/strict');
const {parseSharedCorpus}=require('./lp2_word_pages.cjs');
const GP=[...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const INDEX=new Map(GP.map((v,i)=>[v,i]));
const N=29,S=15,TRIALS=10000,Q_THRESHOLD=8100;
const mod=x=>(x%N+N)%N;

/** @param {number} seed @returns {()=>number} */
function random32(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/** @param {number[][]} words */
function measure(words){
  const antecedent=new Uint32Array(N),matches=new Uint32Array(N);
  let adjacent=0,lag6=0,lag6Reverse=0,lag5Positions=0;
  const half=[{antecedent:0,matches:0},{antecedent:0,matches:0}];
  let last=-1;
  for(let wi=0;wi<words.length;wi++){
    const word=words[wi],h=half[+(wi>=1448)];
    for(let i=0;i<word.length;i++){
      const c=word[i];
      if(c===last)adjacent++;
      if(i>=5){
        const prior=word[i-5];
        antecedent[prior]++;lag5Positions++;
        if(c===prior)matches[prior]++;
        if(prior===S){h.antecedent++;if(c===S)h.matches++;}
      }
      if(i>=6){
        lag6+=+(c===mod(24-2*word[i-6]));
        lag6Reverse+=+(word[i-6]===mod(24-2*c));
      }
      last=c;
    }
  }
  const nS=antecedent[S],hS=matches[S];
  const maxima=Array.from({length:N},(_,r)=>({
    r,antecedent:antecedent[r],hits:matches[r],
    z:antecedent[r]>0?(matches[r]-antecedent[r]/N)/
      Math.sqrt(antecedent[r]*(N-1)/N**2):0
  })).sort((a,b)=>b.z-a.z);
  return {antecedentS:nS,hitsS:hS,lag5Positions,adjacent,
    lag6,lag6Reverse,half,
    maxRune:maxima[0],maxRuneSecond:maxima[1],
    sZ:(hS-nS/N)/Math.sqrt(nS*(N-1)/N**2),
    sExcessVsCollisionCap:hS-2*nS/N,
    maxRuneZ:maxima[0].z};
}

/**
 * @param {number[]} lengths
 * @param {()=>number} rand
 * @param {'T-only'|'max-S-collision'|'max-S-collision-q1'} model
 */
function simulate(lengths,rand,model){
  const out=[],maxS=model!=='T-only',q=model==='max-S-collision-q1'?10000:Q_THRESHOLD;
  let last=-1;
  for(const length of lengths){
    const word=[];
    for(let i=0;i<length;i++){
      let c=rand()%N;
      if(c===last&&rand()%10000<q){
        if(maxS&&i>=5&&word[i-5]===S&&last!==S){
          c=S;
        }else if(i>=6){
          c=mod(24-2*word[i-6]);
        }else{
          const next=rand()%(N-1);
          c=next>=last?next+1:next;
        }
      }
      word.push(c);last=c;
    }
    out.push(word);
  }
  return measure(out);
}

/** @param {number[]} values */
function summary(values){
  const sorted=values.slice().sort((a,b)=>a-b);
  const n=values.length,mean=values.reduce((s,x)=>s+x,0)/n;
  return {mean,sd:Math.sqrt(values.reduce((s,x)=>s+(x-mean)**2,0)/(n-1)),
    q025:sorted[Math.floor(.025*(n-1))],median:sorted[Math.floor(.5*(n-1))],
    q975:sorted[Math.floor(.975*(n-1))],max:sorted[n-1]};
}

/** @param {number[]} lengths @param {string} mode @param {object} actual @param {number} seed */
function campaign(lengths,mode,actual,seed){
  const rng=random32(seed),keys=['antecedentS','hitsS','adjacent','lag6','lag6Reverse',
    'sExcessVsCollisionCap','sZ','maxRuneZ'];
  const arrays=Object.fromEntries(keys.map(k=>[k,[]]));
  let hitsGE=0,adjustedGE=0,maxGE=0,secondHitsGE=0,secondAntecedentSum=0;
  for(let i=0;i<TRIALS;i++){
    const x=simulate(lengths,rng,mode);
    for(const key of keys)arrays[key].push(x[key]);
    if(x.hitsS>=actual.hitsS)hitsGE++;
    if(x.sExcessVsCollisionCap>=actual.sExcessVsCollisionCap)adjustedGE++;
    if(x.maxRuneZ>=actual.maxRuneZ)maxGE++;
    if(x.half[1].matches>=actual.half[1].matches)secondHitsGE++;
    secondAntecedentSum+=x.half[1].antecedent;
  }
  return {mode,seed,replicates:TRIALS,stats:Object.fromEntries(
    keys.map(k=>[k,summary(arrays[k])])),
    empiricalOneSided:{
      pSHitsAtLeastObserved:(hitsGE+1)/(TRIALS+1),exceedancesSHits:hitsGE,
      pSExcessAboveCollisionCap:(adjustedGE+1)/(TRIALS+1),
      exceedancesSExcess:adjustedGE,
      pAnyRuneMaxZ:(maxGE+1)/(TRIALS+1),exceedancesMaxZ:maxGE,
      pSecondHalfSHits:(secondHitsGE+1)/(TRIALS+1),
      secondHalfMeanAntecedents:secondAntecedentSum/TRIALS
    }};
}
function main(){
  const parsed=parseSharedCorpus();
  assert.equal(parsed.words.length,2896);
  assert.equal(parsed.runeCount,12956);
  const words=parsed.words.map(({runes})=>[...runes].map(c=>INDEX.get(c)));
  const actual=measure(words);
  assert.deepEqual([actual.antecedentS,actual.hitsS,actual.lag5Positions,actual.lag6,
    actual.lag6Reverse,actual.half[0].antecedent,actual.half[0].matches,
    actual.half[1].antecedent,actual.half[1].matches],
    [74,11,2105,80,44,42,4,32,7]);
  const lengths=words.map(w=>w.length);
  const campaigns=[
    campaign(lengths,'T-only',actual,0x12a33010),
    campaign(lengths,'max-S-collision',actual,0x12a33011),
    campaign(lengths,'max-S-collision-q1',actual,0x12a33012)
  ];
  const output={
    status:'conditional forward-model test; no original key or decryption',
    model:'independent uniform tentative 29-rune cipher and collision-only replacement',
    real:actual,
    derivation:'If the earlier same-word glyph is S and the previous output differs from S, a tentative uniform rune produces S either directly or through collision replacement. At most two distinct tentative input symbols can produce S, hence P(S | prior history) <= 2/29, independent of the replacement rule on other symbols.',
    parameters:{qOrdinary:Q_THRESHOLD/10000,qUpper:1,modeS:'On collision, prioritize S when the word-local position i-5 equals S; otherwise use the pre-established T(C[i-6]) or uniform different-rune early fallback. The candidate is chosen to maximize S echoes in the collision-only family.'},
    campaigns,
    caveat:'S and lag5 were selected during previous LP2 research. One-sided tails and upper bounds are conditional and descriptive; familywise calibration against the full historical hypothesis search is unavailable.'
  };
  console.log(JSON.stringify(output,null,2));
}
if(require.main===module)main();
module.exports={measure,simulate,main};
