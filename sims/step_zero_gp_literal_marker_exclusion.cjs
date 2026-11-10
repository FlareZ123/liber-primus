'use strict';

/**
 * Full 29-rune test of whether ciphertext repeat marks expose one literal
 * GP plaintext token at unchanged word positions. Under a deterministic
 * predecessor-excluding 28-step cipher, the 29th input rune could instead
 * cause a repeated published rune as a sentinel, with the 28 nonrepeated
 * GP runes encoded by their steps.
 *
 * Original source-fixed observations: 2896 GP words and 12956 runes, 86
 * adjacent ciphertext repeats (including 23 at full GP word beginnings).
 * Every candidate GP rune is tested against English GP reference words
 * sampled conditional on exactly the observed 2896 word lengths.
 *
 * Bivariate Mahalanobis distance jointly compares total marker count and
 * first-of-word marker count. The covariance is computed analytically from
 * independent length-matched source-word draws, including the author's
 * independently solved LP1/LP2 text; Monte Carlo calibrates the minimum
 * distance across all 29 possible marker labels.
 *
 * This is a necessary-condition exclusion for a PARTICULAR plaintext-
 * preserving repeat-marker model, not proof of a historical cipher or
 * a general exclusion of 29-rune homophonic/variable-length plaintext.
 *
 * node sims/step_zero_gp_literal_marker_exclusion.cjs
 * Node.js 22+ / CommonJS / deterministic, no writes.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeToId=new Map(corpus.runes.map((r,i)=>[r,i]));
const tokenToId=new Map(corpus.translit.map((t,i)=>[t,i]));
const M=29,TRIALS=1500;
const registrations=[
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt'],
  ['Solved-Cicada-LP1-and-LP2','resources/liber-primus/lp1-plaintext-reference.txt'],
];
const original=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%');
const ciphertextWords=original.split(/[-.&$§]/u)
  .map(s=>[...s].filter(c=>runeToId.has(c)).map(c=>runeToId.get(c)))
  .filter(x=>x.length);
assert.equal(ciphertextWords.length,2896);
assert.equal(ciphertextWords.flat().length,12956);
const wordLengthCounts=new Map();
let repeats=0,atStarts=0,last=-1;
for(const w of ciphertextWords){
  wordLengthCounts.set(w.length,(wordLengthCounts.get(w.length)||0)+1);
  for(let i=0;i<w.length;i++){
    if(w[i]===last){
      repeats++;
      if(i===0)atStarts++;
    }
    last=w[i];
  }
}
assert.deepEqual([repeats,atStarts],[86,23]);
const observed=[repeats,atStarts];

/**
 * Editor-normalized solved Cicada reference has comments, section headers,
 * explanatory [bracket] text and a hex digest. Keep only manuscript words,
 * excluding all editorial text and the literal deep-web hash.
 * @param {string} text
 */
function sourceBody(text){
  return text.split(/\r?\n/u)
    .filter(line=>{
      const v=line.trim();
      return !v.startsWith('#') && !v.startsWith('[')
        && !/^[0-9a-f]{25,}$/iu.test(v);
    }).join(' ');
}

/** @param {string} word @param {boolean} ingAlias */
function encode(word,ingAlias){
  let x=word.toUpperCase()
    .replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
  if(ingAlias)x=x.replace(/ING/g,'NG');
  const output=[];
  for(let i=0;i<x.length;){
    const digraph=tokenToId.get(x.slice(i,i+2));
    if(digraph!==undefined){output.push(digraph);i+=2;}
    else {
      const letter=tokenToId.get(x[i]);
      assert.notEqual(letter,undefined,'unrecognized source letter');
      output.push(letter);i++;
    }
  }
  return output;
}
/** @param {number} seed */
function rng(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/**
 * @typedef {{first:number, counts:Uint8Array}} EncodedWord
 * @param {string} text
 * @param {boolean} ingAlias
 * @returns {Map<number,EncodedWord[]>}
 */
function dictionary(text,ingAlias){
  const byLength=new Map();
  for(const w of text.match(/[A-Za-z]+/g)||[]){
    const code=encode(w,ingAlias);
    if(!code.length)continue;
    const counts=new Uint8Array(M);
    for(const c of code)counts[c]++;
    if(!byLength.has(code.length))byLength.set(code.length,[]);
    byLength.get(code.length).push({first:code[0],counts});
  }
  for(const n of wordLengthCounts.keys())
    assert(byLength.has(n),'Missing literal English GP word length '+n);
  return byLength;
}

/**
 * @param {Map<number,EncodedWord[]>} dictionaryByLength
 */
function model(dictionaryByLength){
  const mean=Array.from({length:M},()=>[0,0]);
  const covariance=Array.from({length:M},()=>[0,0,0]);
  for(const [length,targetCount] of wordLengthCounts){
    const words=dictionaryByLength.get(length),n=words.length;
    const c=new Float64Array(M),cc=new Float64Array(M),f=new Float64Array(M),cf=new Float64Array(M);
    for(const word of words){
      for(let k=0;k<M;k++){
        const count=word.counts[k],first=Number(word.first===k);
        c[k]+=count;cc[k]+=count*count;f[k]+=first;cf[k]+=count*first;
      }
    }
    for(let k=0;k<M;k++){
      const avgC=c[k]/n,avgF=f[k]/n;
      mean[k][0]+=targetCount*avgC;
      mean[k][1]+=targetCount*avgF;
      covariance[k][0]+=targetCount*(cc[k]/n-avgC*avgC);
      covariance[k][1]+=targetCount*(cf[k]/n-avgC*avgF);
      covariance[k][2]+=targetCount*avgF*(1-avgF);
    }
  }
  return {mean,covariance};
}

/**
 * Exact quadratic form for the fitted two-observable normal approximation.
 * A zero-variance first-word category cannot explain 23 word starts.
 * @param {number} label
 * @param {[number,number]} point
 * @param {ReturnType<typeof model>} estimates
 */
function distance(label,point,estimates){
  const [a,b,c]=estimates.covariance[label], [n,f]=estimates.mean[label];
  const x=point[0]-n,y=point[1]-f,det=a*c-b*b;
  if(det>1e-9)return Math.max(0,(c*x*x-2*b*x*y+a*y*y)/det);
  if((c<1e-9&&Math.abs(y)>1e-6)||(a<1e-9&&Math.abs(x)>1e-6))
    return Infinity;
  if(a>1e-9)return x*x/a;
  if(c>1e-9)return y*y/c;
  return 0;
}

/**
 * Exact Poisson-binomial first-of-word tail for a fixed GP plaintext letter:
 * source-word draws are independent but each must match the manuscript's
 * source-defined rune-word length. The array tracks P(F<=23).
 * @param {Map<number,EncodedWord[]>} buckets
 * @param {number} marker
 */
function exactFirstTail(buckets,marker){
  const dp=new Float64Array(observed[1]+1);
  dp[0]=1;let mean=0;
  for(const [length,n] of wordLengthCounts){
    const bucket=buckets.get(length);
    let hits=0;for(const w of bucket)hits+=Number(w.first===marker);
    const q=hits/bucket.length;
    mean+=n*q;
    for(let i=0;i<n;i++)
      for(let j=observed[1];j>=0;j--)
        dp[j]=dp[j]*(1-q)+(j?dp[j-1]*q:0);
  }
  let below=0;
  for(let j=0;j<observed[1];j++)below+=dp[j];
  return {mean,lowerOrEqual:below+dp[observed[1]],
    upperOrEqual:Math.max(0,1-below),exact:dp[observed[1]]};
}

/** @param {number[]} total @param {number[]} initial @param {ReturnType<typeof model>} estimates */
function smallest(total,initial,estimates){
  let best={distance:Infinity, label:-1};
  for(let k=0;k<M;k++){
    const d=distance(k,[total[k],initial[k]],estimates);
    if(d<best.distance)best={label:k,distance:d};
  }
  return best;
}

/**
 * Monte Carlo samples complete word-level GP texts with the same 2896
 * length schedule, then searches all 29 possible plaintext markers.
 * @param {Map<number,EncodedWord[]>} buckets
 * @param {ReturnType<typeof model>} estimates
 * @param {number} seed
 */
function calibrate(buckets,estimates,seed){
  const random=rng(seed);
  // All labels posit the SAME observed marker count vector, regardless
  // of which hidden plaintext symbol is claimed to trigger the repeat.
  let observedMin=Infinity,observedRune=-1;
  for(let k=0;k<M;k++){
    const score=distance(k,observed,estimates);
    if(score<observedMin){observedMin=score;observedRune=k;}
  }
  const sequence=[...wordLengthCounts.entries()];
  let atLeast=0,sumMin=0,largest=0;
  const planted=Array.from({length:20},()=>null);
  for(let trial=0;trial<TRIALS;trial++){
    const total=new Int32Array(M),first=new Int32Array(M);
    for(const [length,count] of sequence){
      const bin=buckets.get(length);
      for(let j=0;j<count;j++){
        const w=bin[random()%bin.length];
        first[w.first]++;
        for(let k=0;k<M;k++)total[k]+=w.counts[k];
      }
    }
    const winner=smallest(total,first,estimates);
    atLeast+=Number(winner.distance>=observedMin);
    largest=Math.max(largest,winner.distance);
    sumMin+=winner.distance;
    if(trial<20){
      const fixedLabel=28;
      planted[trial]={n:total[fixedLabel],first:first[fixedLabel],
        distance:distance(fixedLabel,[total[fixedLabel],first[fixedLabel]],estimates)};
    }
  }
  return {
    observedMinimum:observedMin,
    bestCandidate:corpus.translit[observedRune],
    bestIndex:observedRune,
    observedExpectation:{
      total:estimates.mean[observedRune][0],
      wordFirst:estimates.mean[observedRune][1]
    },
    trials:TRIALS,seed:'0x'+seed.toString(16),
    allRuneMatchedNullMeanMinDistance:sumMin/TRIALS,
    allRuneMatchedNullLargestMinDistance:largest,
    nullAtLeastOriginal:atLeast,
    upperTailAddOne:(atLeast+1)/(TRIALS+1),
    plantedSourceEAMarker:planted.slice(0,4),
  };
}
function run(){
  const out=[];
  for(let id=0;id<registrations.length;id++){
    const [register,source]=registrations[id];
    for(const ingAlias of [false,true]){
      const text=read(source);
      const buckets=dictionary(id===3?sourceBody(text):text,ingAlias);
      const expected=model(buckets);
      const originalByLabel=Array.from({length:M},(_,label)=>{
        const d=distance(label,observed,expected);
        return {label:corpus.translit[label],index:label,
          expectedTotal:expected.mean[label][0],
          expectedWordStarts:expected.mean[label][1],distance:d};
      }).sort((a,b)=>a.distance-b.distance);
      const control=calibrate(buckets,expected,0x497e1200+(id*2+Number(ingAlias))*11579);
      out.push({register,ingAlias,referenceWords:[...buckets.values()]
        .reduce((s,words)=>s+words.length,0),
        bestCandidates:originalByLabel.slice(0,4),
        exactWordInitialTailForBest:exactFirstTail(buckets,originalByLabel[0].index),
        control});
    }
  }
  const result={
    statement:'Literal-repeat marker candidate fit across English and solved-Cicada word-length-matched GP registers',
    original:{words:ciphertextWords.length,runes:12956,observedRepeatedRunes:repeats,
      atCompleteRuneWordBeginning:atStarts,markerLocationFraction:atStarts/repeats},
    model:'One unchanged GP plaintext rune emits repeated ciphertext glyph; others emit 28 nonzero GP-step labels in a length-preserving 29-rune cipher',
    comparison:'2d total/word-initial counts matched by complete original GP word lengths, source-derived covariance',
    control:'1500 complete manuscript word-length-matched independent source draws, family minimum across 29 labels, six English + two solved Cicada/alias register models',
    sourceRegisters:out,
    caveat:'Conditional on English and editor-normalized solved-Cicada registers and unchanged word starts. Unknown plaintext syntax, null substitutions, variable length, hidden word segmentation and deliberate marker relocation are outside this exclusion.',
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={run,encode,model,distance,smallest};
